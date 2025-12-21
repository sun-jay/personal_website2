'use client';

import React, { useState, useRef, useEffect } from 'react';

interface BackgroundProps {
  videoSrc?: string;
  className?: string;
}

const Background: React.FC<BackgroundProps> = ({
  videoSrc = '/background.mp4',
  className = '',
}) => {
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleCanPlay = () => {
      setVideoLoaded(true);
      video.play().catch(() => {
        // Autoplay might be blocked, that's okay
      });
    };

    const handleError = () => {
      setVideoError(true);
    };

    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('error', handleError);

    // Try to load the video
    video.load();

    return () => {
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('error', handleError);
    };
  }, [videoSrc]);

  const baseStyles: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    zIndex: -2,
  };

  // If no video loaded, don't render anything - let the original design show
  if (videoError || !videoSrc) {
    return null;
  }

  return (
    <>
      {/* Video background */}
      <video
        ref={videoRef}
        src={videoSrc}
        muted
        playsInline
        loop
        preload="auto"
        style={{
          ...baseStyles,
          opacity: videoLoaded ? 1 : 0,
          transition: 'opacity 0.5s ease-in-out',
        }}
        className={className}
      />

      {/* Subtle dark overlay for better text readability - only when video is loaded */}
      {videoLoaded && (
        <div
          style={{
            ...baseStyles,
            background: 'rgba(0, 0, 0, 0.2)',
            zIndex: -1,
          }}
        />
      )}
    </>
  );
};

export default Background;
