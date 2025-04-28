'use client';

import React, { useRef, useState, useEffect } from 'react';
import type { CSSProperties } from 'react';

const AnimatedCard = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState(0);

  /* ------------  LAYOUT  ------------ */
  const containerStyle: CSSProperties = {
    height: '100vh',
    overflowY: 'scroll',
    scrollSnapType: 'y mandatory',
    scrollBehavior: 'smooth',
    WebkitOverflowScrolling: 'touch',
    position: 'relative',
  };

  const sectionStyle: CSSProperties = {
    height: '100vh',
    scrollSnapAlign: 'start',
  };
  const beigeStyle: CSSProperties = { ...sectionStyle, backgroundColor: '#F5F2E7' };
  const redStyle: CSSProperties   = { ...sectionStyle, backgroundColor: '#E63946' };
  const greenStyle: CSSProperties = { ...sectionStyle, backgroundColor: '#2A9D8F' };

  /* ------------  CARD  ------------ */
  const cardContainerStyle: CSSProperties = {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    perspective: '1200px',
    width: '270px',
    height: '413px',
    pointerEvents: 'none',
  };

  const cardStyle: CSSProperties = {
    width: '100%',
    height: '100%',
    transformStyle: 'preserve-3d',
    transition: 'transform 0.35s ease-out',
    transform: `rotateY(${rotation}deg)`,
    position: 'relative',
    borderRadius: '15px',
    boxShadow: '0 70px 63px -60px rgba(0,0,0,0.45)',
  };

  /* ------------  FACES & SHADOW  ------------ */
  const faceBase: CSSProperties = {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backfaceVisibility: 'hidden',
    overflow: 'hidden',
    borderRadius: '15px',
  };

  const frontFaceStyle: CSSProperties = {
    ...faceBase,
    backgroundColor: 'rgb(245, 214, 179)',
    // backgroundImage: 'url("https://images.unsplash.com/photo-1478358161113-b0e11994a36b?auto=format&fit=crop&w=668&q=80")',
    // backgroundSize: 'cover',
    // backgroundPosition: 'center',
    // filter: 'brightness(65%)',
  };

const shadowStyle: CSSProperties = {
  position: 'absolute',
  left: '-60px',
  top: '40px',
  width: '100%',
  height: '108%',
  backgroundImage: 'url("https://images.unsplash.com/photo-1478358161113-b0e11994a36b?auto=format&fit=crop&w=668&q=80")',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  filter: 'blur(75px) brightness(1.5)',
  zIndex: -1,
  borderRadius: '15px',
};

  const backFaceStyle: CSSProperties = {
    ...faceBase,
    backgroundColor: '#50e3c2',
    transform: 'rotateY(180deg)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  /* ------------  FLOATING TEXT  ------------ */
  const floatingTextBase: CSSProperties = {
    color: 'black',
    fontFamily: 'Varela Round, sans-serif',
    fontWeight: 600,
    lineHeight: 1.1,
    pointerEvents: 'none',
    // textShadow: '0 12px 28px rgb(255, 255, 255)',
    position: 'absolute',
  };

  const titleBase: CSSProperties = {
    ...floatingTextBase,
    fontSize: '2em',
    top: '-1%',
    left: '33%',
    transform: 'translate(-50%, 0) translateZ(80px)',
    width: '90%',
    textAlign: 'center',
  };

  const subtitleBase: CSSProperties = {
    ...floatingTextBase,
    fontSize: '1.25rem',
    bottom: '32px',
    left: '70%',
    transform: 'translate(-50%, 0) translateZ(80px)',
    width: '90%',
    textAlign: 'center',
  };

  const backTextBase: CSSProperties = {
    ...floatingTextBase,
    fontSize: '38px',
    transform: 'translateZ(-80px) rotateY(180deg)',
  };

  /* ------------  OPACITY CONTROL  ------------ */
  const frontOpacity = rotation <= 90 ? 1 : rotation >= 180 ? 0 : 1 - (rotation - 90) / 90;
  const backOpacity  = rotation <= 90 ? 0 : rotation >= 180 ? 1 : (rotation - 90) / 90;

  const titleStyle: CSSProperties = {
    ...titleBase,
    opacity: frontOpacity,
    transition: 'opacity 0.3s ease-out',
  };
  const subtitleStyle: CSSProperties = {
    ...subtitleBase,
    opacity: frontOpacity,
    transition: 'opacity 0.3s ease-out',
  };
  const backHeadingStyle: CSSProperties = {
    ...backTextBase,
    top: '20px',
    left: '-15px',
    opacity: backOpacity,
    transition: 'opacity 0.3s ease-out',
  };

  // Greentext block style
  const greentextBlockStyle: CSSProperties = {
    position: 'absolute',
    top: '80px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '85%',
    background: '#d2bfa7',
    borderRadius: '18px',
    padding: '18px 20px',
    fontFamily: 'monospace',
    fontSize: '1.1em',
    color: '#444',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    zIndex: 2,
    textAlign: 'left',
    lineHeight: 1.5,
    opacity: frontOpacity,
    transition: 'opacity 0.3s ease-out',
  };

  /* ------------  SCROLL HANDLER  ------------ */
  const handleScroll = () => {
    if (!scrollRef.current) return;
    const scrollTop = scrollRef.current.scrollTop;
    setRotation((scrollTop / window.innerHeight) * 180);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    
    el.addEventListener('scroll', handleScroll);
    return () => el.removeEventListener('scroll', handleScroll);
  }, []);

  /* ------------  RENDER  ------------ */
  return (
    <div ref={scrollRef} style={containerStyle}>
      {/* Scroll-snapping background panels */}
      <div style={beigeStyle} />
      <div style={redStyle} />
      <div style={greenStyle} />

      {/* Fixed 3D card overlay */}
      <div style={cardContainerStyle}>
        <div style={cardStyle}>
          {/* <div style={shadowStyle} /> */}
          <div style={frontFaceStyle} />
          <h2 style={titleStyle}>Sunny Jayaram</h2>
          <h2 style={subtitleStyle}>Full Stack Developer</h2>
          <div style={greentextBlockStyle}>
            {'> be me'}<br/>
            {'> go to community college'}<br/>
            {'> win stanford, uc berkeley, ucla, upenn\'s hackathons'}<br/>
            {'> transfer to ucla'}<br/>
            {'> ...'}
          </div>
          <div style={backFaceStyle} />
          <h2 style={backHeadingStyle}>About</h2>
        </div>
      </div>
    </div>
  );
};

export default AnimatedCard; 