'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';

interface BackgroundProps {
  videoSrc?: string;
  placeholderSrc?: string;
  className?: string;
}

const Background: React.FC<BackgroundProps> = ({
  videoSrc = '/background.mp4',
  placeholderSrc = '/placeholder.jpg',
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
    zIndex: -1,
  };

  return (
    <>
      {/* Video background */}
      {!videoError && (
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
      )}

      {/* Placeholder image - shown while video loads or if video fails */}
      {(!videoLoaded || videoError) && placeholderSrc && (
        <div
          style={{
            ...baseStyles,
            opacity: videoLoaded && !videoError ? 0 : 1,
            transition: 'opacity 0.5s ease-in-out',
            background: 'rgb(245, 242, 231)',
          }}
        >
          {placeholderSrc !== '/placeholder.jpg' && (
            <Image
              src={placeholderSrc}
              alt="Background"
              fill
              priority
              style={{ objectFit: 'cover' }}
            />
          )}
        </div>
      )}

      {/* Dark overlay for better text readability */}
      <div
        style={{
          ...baseStyles,
          background: 'rgba(0, 0, 0, 0.3)',
          zIndex: -1,
        }}
      />
    </>
  );
};

export default Background;
