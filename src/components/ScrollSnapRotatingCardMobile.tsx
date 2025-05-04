'use client';

import React, { useRef, useState, useEffect } from 'react';
import type { CSSProperties } from 'react';
import { animate } from 'animejs';
import { SocialIcon } from 'react-social-icons';

const AnimatedCard = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const titleContainerRef = useRef<HTMLDivElement>(null);
  const subtitleContainerRef = useRef<HTMLDivElement>(null);
  const greentextRef = useRef<HTMLDivElement>(null);
  const backHeadingRef = useRef<HTMLHeadingElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const [cardWidth, setCardWidth] = useState(270);
  const [cardHeight, setCardHeight] = useState(413);
  const [rotation, setRotation] = useState(0);
  const [backColor, setBackColor] = useState<string>('rgb(245, 214, 179)');
  const ticking = useRef(false);
  
  // Add state for title, subtitle and profile positions
  const [titlePos, setTitlePos] = useState({ x: 0, y: 0 });
  const [subtitlePos, setSubtitlePos] = useState({ x: 0, y: 0 });
  const [profilePos, setProfilePos] = useState({ x: 0, y: 0 });
  
  // Track if social links should be rendered at all
  const [showSocialLinks, setShowSocialLinks] = useState(false);
  const [contactLinksActive, setContactLinksActive] = useState(false);
  
  // Add state for the bouncing arrow
  const [showArrow, setShowArrow] = useState(true);

  // Add reference for contact face
  const contactFaceRef = useRef<HTMLDivElement>(null);
  
  // Add reference for the bouncing arrow
  const arrowRef = useRef<HTMLDivElement>(null);
  
  // Add initialLoad state to control startup animation
  const [initialLoad, setInitialLoad] = useState(true);

  /* ------------  CUSTOM DAMPED EASING  ------------ */
  const dampedOscillation = (t: number) => {
    const ti = t * t;
    const damping = 10, freq = 3;
    const raw = 1 - Math.exp(-damping * ti) * Math.cos(2 * Math.PI * freq * ti);
    const norm = 1 - Math.exp(-damping) * Math.cos(2 * Math.PI * freq);
    return raw / norm;
  };

  /* ------------ FLOATING ANIMATIONS ------------ */
  useEffect(() => {
    // Card animation removed for stability, but add greentext animation
    const startFloatingAnimations = () => {
      // Greentext animation
      if (greentextRef.current) {
        animate(greentextRef.current, {
          translateY: [0, -7, 0],
          rotateZ: [0, 1, 0],
          duration: 9000,
          easing: 'easeInOutCubic',
          direction: 'alternate',
          loop: true
        });
      }
    };

    // Start greentext animation
    startFloatingAnimations();
    
    // Title animation using state
    const titleAnimation = () => {
      let startTime = Date.now();
      const duration = 7000;
      
      const animateTitle = () => {
        const elapsed = Date.now() - startTime;
        const progress = (elapsed % duration) / duration;
        
        // Create circular motion
        const angle = progress * Math.PI * 2;
        const x = Math.sin(angle) * 5;
        const y = Math.cos(angle) * 8;
        
        setTitlePos({ x, y });
        requestAnimationFrame(animateTitle);
      };
      
      return requestAnimationFrame(animateTitle);
    };
    
    // Subtitle animation using state
    const subtitleAnimation = () => {
      let startTime = Date.now();
      const duration = 5000;
      
      const animateSubtitle = () => {
        const elapsed = Date.now() - startTime;
        const progress = (elapsed % duration) / duration;
        
        // Create circular motion with different phase
        const angle = progress * Math.PI * 2 + Math.PI/3; // offset
        const x = Math.sin(angle) * 6;
        const y = Math.cos(angle) * 4;
        
        setSubtitlePos({ x, y });
        requestAnimationFrame(animateSubtitle);
      };
      
      return requestAnimationFrame(animateSubtitle);
    };
    
    // Profile text animation
    const profileAnimation = () => {
      let startTime = Date.now();
      const duration = 8000;
      
      const animateProfile = () => {
        const elapsed = Date.now() - startTime;
        const progress = (elapsed % duration) / duration;
        
        // Create circular motion with unique phase and amplitude
        const angle = progress * Math.PI * 2 + Math.PI/5; // different offset
        const x = Math.sin(angle) * 7;
        const y = Math.cos(angle) * 3;
        
        setProfilePos({ x, y });
        requestAnimationFrame(animateProfile);
      };
      
      return requestAnimationFrame(animateProfile);
    };
    
    // Start only the text animations
    const titleAnimId = titleAnimation();
    const subtitleAnimId = subtitleAnimation();
    const profileAnimId = profileAnimation();
    
    // Return cleanup function
    return () => {
      // Clean up text animations
      cancelAnimationFrame(titleAnimId);
      cancelAnimationFrame(subtitleAnimId);
      cancelAnimationFrame(profileAnimId);
      
      // Reset positions
      if (greentextRef.current) animate(greentextRef.current, { translateY: 0, translateX: 0, rotateZ: 0, duration: 0 });
      
      // Reset text positions
      setTitlePos({ x: 0, y: 0 });
      setSubtitlePos({ x: 0, y: 0 });
      setProfilePos({ x: 0, y: 0 });
    };
  }, []); // Empty dependency array so it runs once on mount

  /* ------------  STARTUP ANIMATION  ------------ */
  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    
    // Small delay to ensure initial position is rendered first
    setTimeout(() => {
      animate(el, {
        rotateY: 360,
        translateX: 0,
        translateY: [0],
        duration: 2000,
        ease: dampedOscillation as any,
        complete: () => {
          setTimeout(() => {
            setBackColor('#F5F2E7');
            setInitialLoad(false);
          }, 1000);
        }
      });
    }, 50);
  }, []);

  /* ------------  LAYOUT ------------ */
  const containerStyle: CSSProperties = {
    height: '100vh', overflowY: 'scroll', scrollSnapType: 'y mandatory',
    scrollBehavior: 'smooth', WebkitOverflowScrolling: 'touch', position: 'relative'
  };
  const sectionStyle: CSSProperties = { height: '100vh', scrollSnapAlign: 'start' };
  const beigeStyle: CSSProperties = { ...sectionStyle, backgroundColor: 'rgb(245, 242, 231)' };
  const redStyle: CSSProperties   = { ...sectionStyle, backgroundColor: '#E63946' };
  const greenStyle: CSSProperties = { ...sectionStyle, backgroundColor: '#2A9D8F' };

  /* ------------  CARD & FACES & TEXT ------------ */
  const cardContainerStyle: CSSProperties = {
    position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
    perspective: '1200px', width: `${cardWidth}px`, height: `${cardHeight}px`, pointerEvents: 'none',
    transition: 'width 0.4s ease, height 0.4s ease'
  };
  
  const cardStyle: CSSProperties = {
    width: '100%', height: '100%', transformStyle: 'preserve-3d',
    transform: `${initialLoad ? 'translateY(-200px) ' : ''}rotateY(${rotation}deg)`, position: 'relative', borderRadius: '15px',
    boxShadow: '0 70px 63px -60px rgba(0,0,0,0.45)', willChange: 'transform',
  };
  
  const faceBase: CSSProperties = {
    position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden', borderRadius: '15px'
    
  };
  
  const frontFaceStyle: CSSProperties = { 
    ...faceBase, 
    backgroundColor: 'rgb(245, 214, 179)',
    transform: 'rotateY(0deg)'
    
  };
  
  const backFaceStyle: CSSProperties = {
    ...faceBase,
    backgroundColor: backColor,
    transform: 'rotateY(180deg)'
  };

  const contactFaceStyle: CSSProperties = {
    ...faceBase,
    backgroundColor: 'rgba(245, 214, 179)',
    transform: 'rotateY(360deg)',
    color: 'black'
  };

  const floatingTextBase: CSSProperties = {
    color: 'black', fontFamily: 'Varela Round, sans-serif', fontWeight: 600,
    lineHeight: 1.1, pointerEvents: 'none', position: 'absolute', backfaceVisibility: 'hidden'
  };

  const titleContainerStyle: CSSProperties = {
    ...floatingTextBase, 
    fontSize: '2em', 
    top: '-2%', 
    left: '33%',
    transform: `translate(-50%, 0) translateZ(90px) translate(${titlePos.x}px, ${titlePos.y}px)`, 
    width: '90%', 
    textAlign: 'center', 
    opacity: 1
  };
  
  const subtitleContainerStyle: CSSProperties = {
    ...floatingTextBase, 
    fontSize: '1.25rem', 
    bottom: '10%', 
    left: '65%',
    transform: `translate(-40%, -50%) translateZ(90px) translate(${subtitlePos.x}px, ${subtitlePos.y}px)`, 
    width: '90%', 
    textAlign: 'center', 
    opacity: 1,
    fontStyle: 'italic'
  };

  const backHeadingStyle: CSSProperties = {
    ...floatingTextBase,
    fontSize: '38px', 
    top: '-1.25%', 
    left: '30%',
    transform: `translateX(-50%) translateZ(-80px) rotateY(180deg) translate(${profilePos.x}px, ${profilePos.y}px)`, 
    textAlign: 'center', 
    opacity: 0,
    fontWeight: 700,
    textShadow: '2px 2px 4px rgba(0,0,0,0.1)'
  };

  const backContentStyle: CSSProperties = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%) translateZ(-50px) rotateY(180deg)',
    width: '85%',
    display: 'flex',
    flexDirection: 'column',
    // gap: '0.em',
    opacity: 0,
    fontFamily: 'Varela Round, sans-serif',
    backgroundColor: backColor,
    padding: '1.25em',
    borderRadius: '0.9em',
    backdropFilter: 'none',
    boxShadow: 'none',
    color: '#000'
  };

  const greentextBlockStyle: CSSProperties = {
    position: 'absolute', top: '5em', left: '50%',
    transform: 'translateX(-50%) translateZ(70px)', width: '85%',
    background: 'rgba(255, 255, 255, 0.15)', backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.3)', borderRadius: '1.125em',
    padding: '1.125em 1.25em', fontFamily: 'monospace', fontSize: '1.1em', color: '#444',
    boxShadow: '0 0.25em 1.875em rgba(0,0,0,0.1)', zIndex: 2, textAlign: 'left', lineHeight: 1.5, opacity: 1
  };

  const sectionHeadingStyle: CSSProperties = {
    fontSize: '1.125em', 
    marginBottom: '0.75em',
    fontWeight: 600,
    color: '#222',
    borderBottom: '2px solid rgba(0,0,0,0.1)',
    paddingBottom: '0.375em'
  };

  const aboutMeStyle: CSSProperties = {
    fontSize: '14px',
    lineHeight: '1.6',
    marginBottom: '20px',
    fontFamily: 'Varela Round, sans-serif'
  };

  const skillsStyle: CSSProperties = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5em',
    marginBottom: '1.25em',
    fontFamily: 'Varela Round, sans-serif'
  };

  const skillTagStyle: CSSProperties = {
    backgroundColor: 'rgba(73, 80, 246, 0.15)',
    color: '#4950F6',
    padding: '0.375em 0.875em',
    borderRadius: '0.9375em',
    fontSize: '0.8125em',
    fontFamily: 'Varela Round, sans-serif',
    fontWeight: 500,
    boxShadow: '0 0.125em 0.25em rgba(0,0,0,0.05)',
    transition: 'all 0.2s ease'
  };

  const educationStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.9em',
    fontFamily: 'Varela Round, sans-serif',
    padding: '0.5em 0',
    color: '#000'
  };

  const uclaLogoStyle: CSSProperties = {
    width: '5rem',
    height: '5rem',
    objectFit: 'contain',
    filter: 'drop-shadow(0 0.125em 0.1875em rgba(0,0,0,0.1))',
    margin: '0.125em'
  };

  const socialContainerStyle: CSSProperties = {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '300px',
    padding: '20px',
    backgroundColor: 'rgba(255, 245, 235, 0.95)',
    borderRadius: '15px',
    boxShadow: '0 10px 20px rgba(0,0,0,0.08)',
    opacity: 0,
    fontFamily: 'Varela Round, sans-serif',
    zIndex: 10,
    pointerEvents: 'auto'
  };

  const socialHeadingStyle: CSSProperties = {
    fontSize: '28px',
    fontWeight: 600,
    marginBottom: '20px',
    fontFamily: 'Varela Round, sans-serif',
    color: '#222',
    borderBottom: '2px solid rgba(0,0,0,0.1)',
    paddingBottom: '8px',
    width: '100%',
    textAlign: 'center'
  };

  const socialButtonStyle: CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    padding: '12px 20px',
    marginBottom: '10px',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: '12px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    cursor: 'pointer',
    transition: 'transform 0.2s ease, background-color 0.2s ease',
    fontFamily: 'Varela Round, sans-serif',
    fontWeight: 500,
    pointerEvents: 'auto'
  };

  const socialsRef = useRef<HTMLDivElement>(null);

  /* ------------  SCROLL HANDLER & ANIMATIONS ------------ */
  const handleScroll = () => {
    const container = scrollRef.current;
    if (!container || !cardRef.current) return;
    if (!ticking.current) {
      window.requestAnimationFrame(() => {
        const scrollTop = container.scrollTop;
        const sectionHeight = container.clientHeight;
        
        // Calculate rotation for full 360 degrees across all three sections
        const newRot = (scrollTop / (sectionHeight * 2)) * 360;
        
        // Opacity calculations for three faces
        // Front face (0-180): visible 0-90, fading 90-180
        const frontOpacity = newRot <= 90 ? 1 : newRot >= 180 ? 0 : 1 - (newRot - 90) / 90;
        
        // Back face (profile - 180-360): fading in 90-180, visible 180-270, fading out 270-360
        const backOpacity = 
          newRot <= 90 ? 0 : 
          newRot <= 180 ? (newRot - 90) / 90 : 
          newRot <= 270 ? 1 : 
          1 - (newRot - 270) / 90;
        
        // Contact face (third face): fading in 270-360
        const contactOpacity = newRot <= 270 ? 0 : (newRot - 270) / 90;
        
        // Only show social links when substantially rotated to contact section
        // This prevents them from interfering with scrolling when not visible
        setShowSocialLinks(newRot >= 330);
        setContactLinksActive(newRot >= 350);
        
        // Calculate expansion based on scroll position
        const expansionThreshold = sectionHeight * 0.1;
        const expansionFactor = Math.min(1, Math.max(0, (scrollTop - expansionThreshold) / (sectionHeight * 0.3)));
        
        // Calculate new card dimensions
        const targetWidth = 270 + (100 * expansionFactor);
        const targetHeight = 413 + (100 * expansionFactor);
        
        setCardWidth(targetWidth);
        setCardHeight(targetHeight);
        setRotation(newRot);
        
        animate(cardRef.current!, { rotateY: newRot, duration: 0, ease: 'linear' });
        
        // Animate front face elements
        if (titleContainerRef.current) animate(titleContainerRef.current, { opacity: frontOpacity, duration: 300, ease: dampedOscillation as any });
        if (subtitleContainerRef.current) animate(subtitleContainerRef.current, { opacity: frontOpacity, duration: 300, ease: dampedOscillation as any });
        if (greentextRef.current) animate(greentextRef.current, { opacity: frontOpacity, duration: 300, ease: dampedOscillation as any });
        
        // Animate back face elements
        if (backHeadingRef.current) animate(backHeadingRef.current, { opacity: backOpacity, duration: 300, ease: dampedOscillation as any });
        if (profileRef.current) setTimeout(() => {
          if (profileRef.current) {
            animate(profileRef.current, { opacity: backOpacity, duration: 100, ease: 'linear' });
          }
        }, 250);
        
        // Animate contact face
        if (contactFaceRef.current) animate(contactFaceRef.current, { opacity: contactOpacity, duration: 100, ease: 'linear' });
        
        // Hide arrow only when approaching the third section
        if (scrollTop > sectionHeight * 1.7) {
          setShowArrow(false);
        } else {
          setShowArrow(true);
        }
        
        ticking.current = false;
      });
      ticking.current = true;
    }
  };

  // Safe click handler that only works when links should be active
  const handleSafeClick = (url: string) => (e: React.MouseEvent) => {
    if (contactLinksActive) {
      window.open(url, '_blank');
    } else {
      // Prevent default and stop propagation to ensure the click doesn't do anything
      e.preventDefault();
      e.stopPropagation();
    }
  };

  useEffect(() => {
    const el = scrollRef.current;
    el?.addEventListener('scroll', handleScroll, { passive: true });
    return () => el?.removeEventListener('scroll', handleScroll);
  }, []);

  // Add state to track which section is currently visible
  const [currentSection, setCurrentSection] = useState(0);

  // Create a non-blocking transparent overlay for each section to better detect which section is active
  const sectionOverlayStyle: CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: 0,
    pointerEvents: 'none'
  };

  // Render social links outside the card when they should be visible
  const renderSocialLinks = () => {
    if (!showSocialLinks) return null;
    
    return (
      <div style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: contactLinksActive ? 100 : -1,
        pointerEvents: contactLinksActive ? 'auto' : 'none',
        opacity: contactLinksActive ? 1 : 0,
        transition: 'opacity 0.3s ease',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        width: '80%',
        maxWidth: '300px'
      }}>
        <button
          onClick={() => window.open('https://www.youtube.com/channel/UC2kIgU1hMcvb2DT9CNa5a3g', '_blank')}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%',
            padding: '12px 20px',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            border: 'none',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            cursor: 'pointer',
            fontFamily: 'Varela Round, sans-serif',
            fontSize: '16px',
            fontWeight: 500
          }}
        >
          <span>YouTube</span>
          <SocialIcon style={{ height: '30px', width: '30px' }} network="youtube" bgColor="#FF0000" fgColor="#FFFFFF" />
        </button>
        
        <button
          onClick={() => window.open('https://www.linkedin.com/in/sunny-jayaram/', '_blank')}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%',
            padding: '12px 20px',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            border: 'none',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            cursor: 'pointer',
            fontFamily: 'Varela Round, sans-serif',
            fontSize: '16px',
            fontWeight: 500
          }}
        >
          <span>LinkedIn</span>
          <SocialIcon style={{ height: '30px', width: '30px' }} network="linkedin" bgColor="#0077B5" fgColor="#FFFFFF" />
        </button>
        
        <button
          onClick={() => window.open('https://github.com/sun-jay?tab=repositories', '_blank')}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%',
            padding: '12px 20px',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            border: 'none',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            cursor: 'pointer',
            fontFamily: 'Varela Round, sans-serif',
            fontSize: '16px',
            fontWeight: 500
          }}
        >
          <span>GitHub</span>
          <SocialIcon style={{ height: '30px', width: '30px' }} network="github" bgColor="#232323" fgColor="#FFFFFF" />
        </button>
        
        <button
          onClick={() => window.open('https://www.instagram.com/sunny_jayaram/?hl=en', '_blank')}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%',
            padding: '12px 20px',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            border: 'none',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            cursor: 'pointer',
            fontFamily: 'Varela Round, sans-serif',
            fontSize: '16px',
            fontWeight: 500
          }}
        >
          <span>Instagram</span>
          <SocialIcon style={{ height: '30px', width: '30px' }} network="instagram" bgColor="#E4405F" fgColor="#FFFFFF" />
        </button>
      </div>
    );
  };

  // Handle arrow click to scroll to next section
  const handleArrowClick = () => {
    if (scrollRef.current) {
      const sectionHeight = scrollRef.current.clientHeight;
      const currentScroll = scrollRef.current.scrollTop;
      
      // Determine target section (first or second)
      const isFirstSection = currentScroll < sectionHeight * 0.5;
      const targetScroll = isFirstSection ? sectionHeight : sectionHeight * 2;
      
      // Use browser's built-in smooth scroll
      scrollRef.current.scrollTo({
        top: targetScroll,
        behavior: 'smooth'
      });
    }
  };

  // Arrow styling
  const arrowStyle: CSSProperties = {
    position: 'fixed',
    bottom: '3%',
    left: '50%',
    transform: 'translateX(-50%)',
    cursor: 'pointer',
    opacity: showArrow ? 1 : 0,
    transition: 'opacity 0.5s ease-out',
    zIndex: 10,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    pointerEvents: showArrow ? 'auto' : 'none',
    color: '#444'
  };

  return (
    <div ref={scrollRef} style={containerStyle}>
      <div style={beigeStyle}>
        <div style={sectionOverlayStyle} data-section="0" />
      </div>
      <div style={redStyle}>
        <div style={sectionOverlayStyle} data-section="1" />
      </div>
      <div style={beigeStyle}>
        <div style={sectionOverlayStyle} data-section="2" />
      </div>
      
      {/* Bouncing Arrow */}
      <div 
        ref={arrowRef}
        style={arrowStyle} 
        onClick={handleArrowClick}
      >
        <svg 
          width="40" 
          height="40" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <path d="M12 5v14M5 12l7 7 7-7"/>
        </svg>
      </div>
      
      <div style={cardContainerStyle}>
        <div ref={cardRef} style={cardStyle}>
          {/* Front Face (0 degrees) */}
          <div style={frontFaceStyle} />
          <div ref={titleContainerRef} style={titleContainerStyle}>Sunny Jayaram</div>
          <div ref={subtitleContainerRef} style={subtitleContainerStyle}>Full Stack Developer</div>
          <div ref={greentextRef} style={greentextBlockStyle}>
            {'>be me'}<br/>
            {'>go to community college'}<br/>
            {'>win stanford, uc berkeley, ucla, upenn\'s hackathons'}<br/>
            {'>transfer to ucla'}<br/>
            {'>...'}
          </div>
          
          {/* Back Face (180 degrees) - Profile */}
          <div style={backFaceStyle} />
          <h2 ref={backHeadingRef} style={backHeadingStyle}>Profile</h2>
          <div ref={profileRef} style={backContentStyle}>
            <div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '0.625em',
                width: '100%'
              }}>
                <img 
                  src="me.jpg" 
                  alt="Profile" 
                  style={{
                    width: 'calc(min(55%, 11.25rem))',
                    height: 'auto',
                    aspectRatio: '1/1',
                    objectFit: 'cover',
                    borderRadius: '50%',
                    boxShadow: '0 0.25em 0.75em rgba(0,0,0,0.15)',
                    border: '2px solid rgba(255,255,255,0.8)',
                    margin: '0.3125em'
                  }}
                />
              </div>
              <h3 style={sectionHeadingStyle}>Education</h3>
              <div style={educationStyle}>
                <img 
                  src="/ucla-logo-png-transparent.png" 
                  alt="UCLA Logo" 
                  style={uclaLogoStyle}
                />
                <div>
                  <p style={{ fontWeight: 'bold', fontSize: '0.9375em', marginBottom: '0.25em' }}>B.S. Data Science</p>
                  <p style={{ marginBottom: '0.1875em' }}>UCLA</p>
                  <p style={{ marginBottom: '0.1875em' }}>Expected Graduation: 2027</p>
                  {/* <p>GPA: 3.86</p> */}
                </div>
              </div>
            </div>

            <div style={{ marginTop: '0.1875em' }}>
              <h3 style={sectionHeadingStyle}>Skills</h3>
              <div style={skillsStyle}>
                <span style={skillTagStyle}>Python</span>
                <span style={skillTagStyle}>C++/CUDA</span>
                <span style={skillTagStyle}>Go</span>
                <span style={skillTagStyle}>TypeScript</span>
                <span style={skillTagStyle}>Verilog</span>
                <span style={skillTagStyle}>Swift</span>
              </div>
            </div>
          </div>
          
          {/* Third Face (360/0 degrees) - Contact - visual only, no interactive elements */}
          <div style={contactFaceStyle}>
            <div ref={contactFaceRef} style={{
              opacity: 0,
              transform: 'rotateY(0deg)',
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '30px 20px',
              boxSizing: 'border-box'
            }}>
              <div style={socialHeadingStyle}>Contact</div>
              {/* No social buttons here - they're rendered separately outside the card */}
            </div>
          </div>
        </div>
      </div>
      
      {/* Render social links outside the 3D card when they should be visible */}
      {renderSocialLinks()}
    </div>
  );
};

export default AnimatedCard;
