"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

const getFileExtension = (url: string): string => {
    return url.split(".").pop()?.toLowerCase() || "";
};

const isVideo = (extension: string): boolean => {
    const videoExtensions = ["mp4", "webm", "ogg", "mov", "avi", "m4v"];
    return videoExtensions.includes(extension);
};

const VideoWithPlaceholder = ({
    src,
    className,
    style,
    placeholder,
}: {
    src: string;
    className?: string;
    style?: React.CSSProperties;
    placeholder?: string;
}) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [videoLoaded, setVideoLoaded] = useState(false);

    useEffect(() => {
        const video = videoRef.current;

        if (video) {
            const handleLoadedData = () => {
                setVideoLoaded(true);
            };

            const handleCanPlay = () => {
                setVideoLoaded(true);
            };

            video.addEventListener("loadeddata", handleLoadedData);
            video.addEventListener("canplay", handleCanPlay);
            video.load();

            if (video.readyState >= 2) {
                setVideoLoaded(true);
            }

            return () => {
                video.removeEventListener("loadeddata", handleLoadedData);
                video.removeEventListener("canplay", handleCanPlay);
            };
        }
    }, [src]);

    useEffect(() => {
        if (videoRef.current && videoLoaded) {
            videoRef.current.play();
        }
    }, [videoLoaded]);

    return (
        <>
            {placeholder ? (
                <Image
                    src={placeholder}
                    loading="eager"
                    priority
                    sizes="100vw"
                    alt="Background"
                    className={className}
                    style={{
                        ...style,
                        visibility: videoLoaded ? 'hidden' : 'visible',
                    }}
                    quality={100}
                    fill
                />
            ) : null}
            <video
                ref={videoRef}
                src={src}
                muted
                playsInline
                loop
                controls={false}
                preload="auto"
                className={className}
                style={{
                    ...style,
                    visibility: videoLoaded ? 'visible' : 'hidden',
                }}
            />
        </>
    );
};

interface BackgroundProps {
    src: string;
    placeholder?: string;
    borderRadius?: string;
}

export const Background = ({
    src,
    placeholder,
    borderRadius = "42px",
}: BackgroundProps) => {
    const extension = getFileExtension(src);
    const isVideoFile = isVideo(extension);

    const baseStyles: React.CSSProperties = {
        position: 'absolute',
        left: 0,
        top: 0,
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        borderRadius: borderRadius,
        backgroundColor: 'rgb(20, 20, 20)',
    };

    if (isVideoFile) {
        return (
            <VideoWithPlaceholder
                src={src}
                style={baseStyles}
                placeholder={placeholder}
            />
        );
    }

    return (
        <Image
            priority
            loading="eager"
            src={src}
            alt="Background"
            style={baseStyles}
            sizes="100vw"
            fill
        />
    );
};

export default Background;
