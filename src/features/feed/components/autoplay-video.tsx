'use client';

import { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface AutoplayVideoProps {
    src: string;
    className?: string;
}

export function AutoplayVideo({ src, className }: AutoplayVideoProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isMuted, setIsMuted] = useState(true);

    const [hasUserInteracted, setHasUserInteracted] = useState(false);

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.defaultMuted = true;
        }
    }, []);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting && !hasUserInteracted) {
                        video.play().catch((e) => {
                            console.log('Autoplay blocked:', e);
                        });
                    } else if (!entry.isIntersecting) {
                        video.pause();
                    }
                });
            },
            { threshold: 0.5 }
        );

        observer.observe(video);

        return () => {
            observer.unobserve(video);
        };
    }, [hasUserInteracted]);

    const toggleMute = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        if (videoRef.current) {
            videoRef.current.muted = !isMuted;
            setIsMuted(!isMuted);
        }
    };

    const handlePlayPause = (e: React.MouseEvent) => {
        // Only toggle if clicking the video itself, not controls
        e.stopPropagation();

        const video = videoRef.current;
        if (!video) return;

        setHasUserInteracted(true);

        if (video.paused) {
            video.play();

        } else {
            video.pause();

        }
    };

    return (
        <div className="relative w-full h-full group" onClick={handlePlayPause}>
            <video
                ref={videoRef}
                src={src}
                className={cn("h-full w-full object-contain cursor-pointer", className)}
                loop={true}
                muted={isMuted}
                playsInline={true}
            />

            {/* Mute Toggle - Always visible on hover or when muted */}
            <Button
                variant="ghost"
                size="icon"
                className="absolute bottom-3 right-3 h-8 w-8 rounded-full bg-black/60 text-white hover:bg-black/80 z-20 transition-opacity"
                onClick={toggleMute}
            >
                {isMuted ? (
                    <VolumeX className="h-4 w-4" />
                ) : (
                    <Volume2 className="h-4 w-4" />
                )}
            </Button>
        </div>
    );
}
