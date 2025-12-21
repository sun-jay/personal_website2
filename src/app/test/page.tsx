'use client';

import React, { useEffect, useMemo, useRef, useState } from "react";
import Papa from "papaparse";

/**
 * School Autocomplete — prefix/contains scoring with sane tie-breakers.
 * Type a few letters, use ↑/↓ to navigate, press Enter to select.
 */

const DETAILED_URL = "https://www.sunny-jay.com/us_universities_detailed.csv";

// --- Theme ---
const isDark =
  typeof window !== "undefined" &&
  typeof window.matchMedia !== "undefined" &&
  window.matchMedia("(prefers-color-scheme: dark)").matches;

const C = {
  text: isDark ? "#E5E7EB" : "#111827",
  textMuted: isDark ? "#9CA3AF" : "#6B7280",
  panel: isDark ? "#0E1116" : "#FFFFFF",
  border: isDark ? "#374151" : "#D1D5DB",
  hover: isDark ? "#111827" : "#F3F4F6",
  shadow: "0 6px 20px rgba(0,0,0,0.25)",
};

// --- Utils (only what autocomplete needs) ---
function parseEnrollment(val) {
  if (val == null) return null;
  const n = String(val).replace(/[^0-9]/g, "");
  if (!n) return null;
  const num = parseInt(n, 10);
  return Number.isFinite(num) ? num : null;
}

function getFieldInsensitive(row, candidates) {
  const keys = Object.keys(row || {});
  for (const cand of candidates) {
    const norm = cand.toLowerCase().replace(/[^a-z0-9]/g, "");
    const hit = keys.find(
      (k) => k && k.toLowerCase().replace(/[^a-z0-9]/g, "") === norm
    );
    if (hit) return row[hit];
  }
  return undefined;
}

// stopword/punctuation–resilient scoring
function scoreStartsWith(hay, q) {
  // Drop punctuation, lowercase, collapse spaces
  function norm(s) {
    return String(s || "")
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }
  // Common stopwords for school names
  const STOP = new Set(["the", "of", "at", "and", "college", "university", "state"]);
  function stripStop(s) {
    const toks = norm(s).split(" ").filter((t) => t && !STOP.has(t));
    return toks.join(" ");
  }

  const H = stripStop(hay);
  const Q = stripStop(q);
  if (!Q) return 0;

  // Strong prefix if significant text starts with query
  if (H.startsWith(Q)) return 100 - Math.min(99, Math.max(0, H.length - Q.length));

  // Weaker contains anywhere in the significant text
  if (H.includes(Q)) return 40;

  return 0;
}

// Prefer items with known size; among known sizes, larger first; then name
function sizeTieBreak(a, b) {
  const ah = a.ugEnroll != null,
    bh = b.ugEnroll != null;
  if (ah !== bh) return ah ? -1 : 1; // has size wins
  if (ah && bh && b.ugEnroll !== a.ugEnroll) return b.ugEnroll - a.ugEnroll; // larger first
  return a.name.localeCompare(b.name);
}

function buildIndex(rows) {
  return rows.map((r) => {
    const domain = (r.url || "")
      .replace(/https?:\/\//, "")
      .replace(/^www\./, "");
    const ugEnroll =
      r.ugEnroll != null
        ? r.ugEnroll
        : parseEnrollment(r["Undergraduate Enrollment"]);
    return { ...r, domain, ugEnroll };
  });
}

// --- Data hook (CSV fetch + minimal shape) ---
function useCsvSchools() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch(DETAILED_URL, { cache: "no-store" });
        if (!res.ok)
          throw new Error(`Failed to fetch dataset: ${res.status} ${res.statusText}`);
        const text = await res.text();
        const parsed = Papa.parse(text.trim(), { header: true, skipEmptyLines: true });
        const rows = (parsed.data || [])
          .map((row) => {
            const name = (getFieldInsensitive(row, ["name", "Name"]) || "").trim();
            const url = (getFieldInsensitive(row, ["url", "URL"]) || "").trim();
            const enrollRaw = getFieldInsensitive(row, [
              "Undergraduate Enrollment",
              "UndergraduateEnrollment",
              "undergraduate_enrollment",
              "Undergrad Enrollment",
              "UG Enrollment",
            ]);
            return { name, url, ugEnroll: parseEnrollment(enrollRaw) };
          })
          .filter((r) => r.name);

        if (!rows.length) throw new Error("Dataset parsed but contains 0 valid rows.");
        if (alive) setData(buildIndex(rows));
      } catch (e) {
        if (alive) setError(e instanceof Error ? e : new Error(String(e)));
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  return { schools: data, loading, error };
}

// --- Small UI bits ---
function ResultsList({ items, activeIndex, setActiveIndex, onPick, max = 10 }) {
  return (
    <ul
      role="listbox"
      style={{
        marginTop: 8,
        border: `1px solid ${C.border}`,
        borderRadius: 8,
        maxHeight: 280,
        overflowY: "auto",
        background: C.panel,
        boxShadow: C.shadow,
      }}
    >
      {items.slice(0, max).map((it, i) => {
        const s = it.s || it;
        return (
          <li
            key={(s.name || "") + i}
            role="option"
            aria-selected={i === activeIndex}
            onMouseEnter={() => setActiveIndex(i)}
            onMouseDown={(e) => {
              e.preventDefault();
              onPick(s);
            }}
            style={{
              padding: "10px 12px",
              background: i === activeIndex ? C.hover : C.panel,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
              borderBottom: `1px solid ${C.border}`,
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 14, color: C.text }}>{s.name}</div>
              <div style={{ color: C.textMuted, fontSize: 12 }}>
                {s.domain || s.url}
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {s.ugEnroll != null && (
                <div style={{ fontSize: 12, color: C.textMuted }}>
                  {s.ugEnroll.toLocaleString()}
                </div>
              )}
              {typeof it.score === "number" && (
                <div style={{ fontSize: 12, color: C.textMuted }}>{it.score.toFixed(0)}</div>
              )}
            </div>
          </li>
        );
      })}
      {items.length === 0 && (
        <li style={{ padding: 12, color: C.textMuted }}>No matches</li>
      )}
    </ul>
  );
}

// --- The Autocomplete component (prefix/contains only) ---
export default function SchoolAutocomplete() {
  const { schools, loading, error } = useCsvSchools();
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const [picked, setPicked] = useState(null);
  const inputRef = useRef(null);

  const matches = useMemo(() => {
    if (!q) return [];
    const scored = schools.map((s) => {
      const nameScore = scoreStartsWith(s.name, q);
      const domainScore = scoreStartsWith(s.domain || "", q);
      const score = Math.max(nameScore, domainScore);
      return { s, score };
    });

    const sorted = scored
      .filter((x) => x.score > 0)
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score; // higher score first
        return sizeTieBreak(a.s, b.s); // deterministic, large-first, known-size first
      });

    // Separate schools with and without enrollment data, preserving relative order
    const withEnrollment = sorted.filter((x) => x.s.ugEnroll != null);
    const withoutEnrollment = sorted.filter((x) => x.s.ugEnroll == null);

    return [...withEnrollment, ...withoutEnrollment].slice(0, 20);
  }, [q, schools]);

  function onSelect(s) {
    setPicked(s);
    setQ("");
    inputRef.current?.blur();
  }

  function onKeyDown(e) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, Math.max(0, matches.length - 1)));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(0, i - 1));
    } else if (e.key === "Enter") {
      if (matches.length === 1) {
        onSelect(matches[0].s);
        return;
      }
      if (matches[active]) onSelect(matches[active].s);
      else if (matches[0]) onSelect(matches[0].s);
    } else if (e.key === "Escape") {
      setQ("");
    }
  }

  if (error) throw error;

  return (
    <div style={{ maxWidth: 720, margin: "40px auto", padding: 16 }}>
      <label style={{ fontSize: 12, color: C.text }}>Your school</label>
      <input
        ref={inputRef}
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder="Start typing your school…"
        style={{
          width: "100%",
          marginTop: 6,
          padding: "10px 12px",
          border: `1px solid ${C.border}`,
          borderRadius: 8,
          fontSize: 14,
          background: C.panel,
          color: C.text,
        }}
      />

      {loading && <div style={{ marginTop: 8, color: C.textMuted }}>Loading schools…</div>}

      {!loading && q && (
        <ResultsList
          items={matches}
          activeIndex={active}
          setActiveIndex={setActive}
          onPick={onSelect}
        />
      )}

      {picked && (
        <div
          style={{
            marginTop: 16,
            padding: 12,
            border: `1px solid ${C.border}`,
            borderRadius: 8,
            background: isDark ? "#0B1220" : "#F9FAFB",
          }}
        >
          <div style={{ fontSize: 12, color: C.textMuted }}>Selected school</div>
          <div style={{ fontWeight: 700 }}>{picked.name}</div>
          {picked.url && (
            <a href={picked.url} target="_blank" rel="noreferrer" style={{ fontSize: 12 }}>
              {picked.url}
            </a>
          )}
          {picked.ugEnroll != null && (
            <div style={{ fontSize: 13, color: C.text, marginTop: 6 }}>
              Undergraduate Enrollment: {picked.ugEnroll.toLocaleString()}
            </div>
          )}
        </div>
      )}

      <div style={{ marginTop: 10, fontSize: 12, color: C.textMuted }}>
        Keyboard: type a few letters → <kbd>Enter</kbd> to pick top match. Navigate with{" "}
        <kbd>↑</kbd>/<kbd>↓</kbd>, close with <kbd>Esc</kbd>.
      </div>
    </div>
  );
}
