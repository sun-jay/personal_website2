'use client';

import React, { useRef, useState, useEffect } from 'react';
import type { CSSProperties } from 'react';
import { animate } from 'animejs';
import { SocialIcon } from 'react-social-icons';

const AnimatedCard = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLHeadingElement>(null);
  const greentextRef = useRef<HTMLDivElement>(null);
  const backHeadingRef = useRef<HTMLHeadingElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const [cardWidth, setCardWidth] = useState(270);
  const [cardHeight, setCardHeight] = useState(413);
  const [rotation, setRotation] = useState(0);
  const [backColor, setBackColor] = useState<string>('rgb(245, 214, 179)');
  const ticking = useRef(false);

  // Add reference for contact face
  const contactFaceRef = useRef<HTMLDivElement>(null);

  /* ------------  CUSTOM DAMPED EASING  ------------ */
  const dampedOscillation = (t: number) => {
    const ti = t * t;
    const damping = 10, freq = 3;
    const raw = 1 - Math.exp(-damping * ti) * Math.cos(2 * Math.PI * freq * ti);
    const norm = 1 - Math.exp(-damping) * Math.cos(2 * Math.PI * freq);
    return raw / norm;
  };

  /* ------------  STARTUP ANIMATION  ------------ */
  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    animate(el, {
      rotateY: 360,
      translateX: [0, 0],
      translateY: [-200, 0],
      duration: 2000,
      ease: dampedOscillation as any,
      complete: () => setTimeout(() => setBackColor('#F5F2E7'), 1000)
    });
  }, []);

  /* ------------  LAYOUT ------------ */
  const containerStyle: CSSProperties = {
    height: '100vh', overflowY: 'scroll', scrollSnapType: 'y mandatory',
    scrollBehavior: 'smooth', WebkitOverflowScrolling: 'touch', position: 'relative'
  };
  const sectionStyle: CSSProperties = { height: '100vh', scrollSnapAlign: 'start' };
  const beigeStyle: CSSProperties = { ...sectionStyle, backgroundColor: '#F5F2E7' };
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
    transform: `rotateY(${rotation}deg)`, position: 'relative', borderRadius: '15px',
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
    backgroundColor: 'rgba(255, 245, 235, 0.95)',
    transform: 'rotateY(360deg)',
    color: 'black'
  };

  const floatingTextBase: CSSProperties = {
    color: 'black', fontFamily: 'Varela Round, sans-serif', fontWeight: 600,
    lineHeight: 1.1, pointerEvents: 'none', position: 'absolute', backfaceVisibility: 'hidden'
  };

  const backHeadingStyle: CSSProperties = {
    ...floatingTextBase,
    fontSize: '38px', 
    top: '-1.25%', 
    left: '30%',
    transform: 'translateX(-50%) translateZ(-80px) rotateY(180deg)', 
    textAlign: 'center', 
    opacity: 0,
    fontWeight: 700,
    textShadow: '2px 2px 4px rgba(0,0,0,0.1)'
  };

  const backContentStyle: CSSProperties = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%) translateZ(-100px) rotateY(180deg)',
    width: '85%',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    opacity: 0,
    fontFamily: 'Varela Round, sans-serif',
    backgroundColor: 'rgba(255, 245, 235, 0.95)',
    padding: '20px',
    borderRadius: '15px',
    boxShadow: '0 10px 20px rgba(0,0,0,0.08)',
    color: '#000'
  };

  const titleStyle: CSSProperties = {
    ...floatingTextBase, fontSize: '2em', top: '-1%', left: '33%',
    transform: 'translate(-50%,0) translateZ(80px)', width: '90%', textAlign: 'center', opacity: 1
  };
  const subtitleStyle: CSSProperties = {
    ...floatingTextBase, fontSize: '1.25rem', bottom: '32px', left: '70%',
    transform: 'translate(-40%,-50%) translateZ(60px)', width: '90%', textAlign: 'center', opacity: 1,
    fontStyle: 'italic'
  };
  const greentextBlockStyle: CSSProperties = {
    position: 'absolute', top: '80px', left: '50%',
    transform: 'translateX(-50%) translateZ(40px)', width: '85%',
    background: 'rgba(255, 255, 255, 0.15)', backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.3)', borderRadius: '18px',
    padding: '18px 20px', fontFamily: 'monospace', fontSize: '1.1em', color: '#444',
    boxShadow: '0 4px 30px rgba(0,0,0,0.1)', zIndex: 2, textAlign: 'left', lineHeight: 1.5, opacity: 1
  };

  const sectionHeadingStyle: CSSProperties = {
    fontSize: '18px', 
    marginBottom: '12px',
    fontWeight: 600,
    color: '#222',
    borderBottom: '2px solid rgba(0,0,0,0.1)',
    paddingBottom: '6px'
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
    gap: '8px',
    marginBottom: '20px',
    fontFamily: 'Varela Round, sans-serif'
  };

  const skillTagStyle: CSSProperties = {
    backgroundColor: 'rgba(73, 80, 246, 0.15)',
    color: '#4950F6',
    padding: '6px 14px',
    borderRadius: '15px',
    fontSize: '13px',
    fontFamily: 'Varela Round, sans-serif',
    fontWeight: 500,
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    transition: 'all 0.2s ease'
  };

  const educationStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    fontFamily: 'Varela Round, sans-serif',
    padding: '8px 0',
    color: '#000'
  };

  const uclaLogoStyle: CSSProperties = {
    width: '60px',
    height: '60px',
    objectFit: 'contain',
    filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.1))'
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
    fontWeight: 500
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
        if (titleRef.current)     animate(titleRef.current,     { opacity: frontOpacity, duration: 300, ease: dampedOscillation as any });
        if (subtitleRef.current)  animate(subtitleRef.current,  { opacity: frontOpacity, duration: 300, ease: dampedOscillation as any });
        if (greentextRef.current) animate(greentextRef.current, { opacity: frontOpacity, duration: 300, ease: dampedOscillation as any });
        
        // Animate back face elements
        if (backHeadingRef.current) animate(backHeadingRef.current, { opacity: backOpacity, duration: 300, ease: dampedOscillation as any });
        if (profileRef.current) setTimeout(() => {
          if (profileRef.current) {
            animate(profileRef.current, { opacity: backOpacity, duration: 250, ease: dampedOscillation as any });
          }
        }, 250);
        
        // Animate contact face
        if (contactFaceRef.current) animate(contactFaceRef.current, { opacity: contactOpacity, duration: 300, ease: dampedOscillation as any });
        
        ticking.current = false;
      });
      ticking.current = true;
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

  return (
    <div ref={scrollRef} style={containerStyle}>
      <div style={beigeStyle}>
        <div style={sectionOverlayStyle} data-section="0" />
      </div>
      <div style={redStyle}>
        <div style={sectionOverlayStyle} data-section="1" />
      </div>
      <div style={greenStyle}>
        <div style={sectionOverlayStyle} data-section="2" />
      </div>
      <div style={cardContainerStyle}>
        <div ref={cardRef} style={cardStyle}>
          {/* Front Face (0 degrees) */}
          <div style={frontFaceStyle} />
          <h2 ref={titleRef}    style={titleStyle}>Sunny Jayaram</h2>
          <h2 ref={subtitleRef} style={subtitleStyle}>Full Stack Developer</h2>
          <div ref={greentextRef} style={greentextBlockStyle}>
            {'> be me'}<br/>
            {'> go to community college'}<br/>
            {'> win stanford, uc berkeley, ucla, upenn\'s hackathons'}<br/>
            {'> transfer to ucla'}<br/>
            {'> ...'}
          </div>
          
          {/* Back Face (180 degrees) - Profile */}
          <div style={backFaceStyle} />
          <h2 ref={backHeadingRef} style={backHeadingStyle}>Profile</h2>
          <div ref={profileRef} style={backContentStyle}>
            <div>
              <h3 style={sectionHeadingStyle}>Education</h3>
              <div style={educationStyle}>
                <img 
                  src="/ucla-logo-png-transparent.png" 
                  alt="UCLA Logo" 
                  style={uclaLogoStyle}
                />
                <div>
                  <p style={{ fontWeight: 'bold', fontSize: '15px', marginBottom: '4px' }}>B.S. Data Science</p>
                  <p style={{ marginBottom: '3px' }}>University of California, Los Angeles</p>
                  <p style={{ marginBottom: '3px' }}>Expected Graduation: 2025</p>
                  <p>GPA: 3.86</p>
                </div>
              </div>
            </div>

            <div style={{ marginTop: '15px' }}>
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
          
          {/* Third Face (360/0 degrees) - Contact */}
          <div style={contactFaceStyle}>
            <div ref={contactFaceRef} style={{
              opacity: 0,
              transform: 'rotateY(0deg)', // Fix backwards text - was 180deg
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '30px 20px',
              boxSizing: 'border-box'
            }}>
              <div style={socialHeadingStyle}>Contact</div>
              
              <div 
                onClick={() => window.open('https://www.youtube.com/channel/UC2kIgU1hMcvb2DT9CNa5a3g', '_blank')}
                style={socialButtonStyle}
              >
                <span>YouTube</span>
                <SocialIcon style={{ height: '30px', width: '30px' }} network="youtube" bgColor="#FF0000" fgColor="#FFFFFF" />
              </div>
              
              <div 
                onClick={() => window.open('https://www.linkedin.com/in/sunny-jayaram/', '_blank')}
                style={socialButtonStyle}
              >
                <span>LinkedIn</span>
                <SocialIcon style={{ height: '30px', width: '30px' }} network="linkedin" bgColor="#0077B5" fgColor="#FFFFFF" />
              </div>
              
              <div 
                onClick={() => window.open('https://github.com/sun-jay?tab=repositories', '_blank')}
                style={socialButtonStyle}
              >
                <span>GitHub</span>
                <SocialIcon style={{ height: '30px', width: '30px' }} network="github" bgColor="#232323" fgColor="#FFFFFF" />
              </div>

              <div 
                onClick={() => window.open('https://www.instagram.com/sunny_jayaram/?hl=en', '_blank')}
                style={socialButtonStyle}
              >
                <span>Instagram</span>
                <SocialIcon style={{ height: '30px', width: '30px' }} network="instagram" bgColor="#E4405F" fgColor="#FFFFFF" />
              </div>

              <div 
                onClick={() => window.open('mailto:sunny.jyrm@gmail.com', '_blank')}
                style={socialButtonStyle}
              >
                <span>Email</span>
                <SocialIcon style={{ height: '30px', width: '30px' }} network="email" bgColor="#232323" fgColor="#FFFFFF" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnimatedCard;
