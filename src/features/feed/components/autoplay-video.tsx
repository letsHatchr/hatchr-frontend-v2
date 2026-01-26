'use client';

import { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX, Play, Pause, Maximize, Minimize } from 'lucide-react';
import { cn } from '@/lib/utils';
import { optimizeCloudinaryUrl } from '@/lib/cloudinary';

interface AutoplayVideoProps {
    src: string;
    className?: string;
}

export function AutoplayVideo({ src, className }: AutoplayVideoProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(true);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [isHovering, setIsHovering] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.defaultMuted = true;
        }
    }, []);

    // Initial Autoplay via IntersectionObserver
    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        // Only auto-play if not manually paused by user previously (optional logic, sticking to simple autoplay for feed)
                        video.play().catch((e) => console.log('Autoplay blocked:', e));
                        setIsPlaying(true);
                    } else {
                        video.pause();
                        setIsPlaying(false);
                    }
                });
            },
            { threshold: 0.6 }
        );

        observer.observe(video);
        return () => observer.unobserve(video);
    }, []);

    // Time Update Handler
    const handleTimeUpdate = () => {
        if (videoRef.current) {
            const current = videoRef.current.currentTime;
            const total = videoRef.current.duration;
            setCurrentTime(current);
            setDuration(total || 0);
            setProgress((current / total) * 100);
        }
    };

    // Play/Pause Toggle
    const togglePlay = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        if (videoRef.current) {
            if (videoRef.current.paused) {
                videoRef.current.play();
                setIsPlaying(true);
            } else {
                videoRef.current.pause();
                setIsPlaying(false);
            }
        }
    };

    // Mute Toggle
    const toggleMute = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (videoRef.current) {
            videoRef.current.muted = !isMuted;
            setIsMuted(!isMuted);
        }
    };

    // Seek Handler
    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.stopPropagation();
        const value = Number(e.target.value);
        if (videoRef.current) {
            const time = (value / 100) * videoRef.current.duration;
            videoRef.current.currentTime = time;
            setProgress(value);
        }
    };

    // Fullscreen Toggle
    const toggleFullscreen = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!containerRef.current) return;

        if (!document.fullscreenElement) {
            containerRef.current.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable fullscreen: ${err.message}`);
            });
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    // Format time helper
    const formatTime = (time: number) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    return (
        <div
            ref={containerRef}
            className={cn("relative w-full h-full group bg-black flex items-center justify-center", className)}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            onClick={togglePlay}
        >
            <video
                ref={videoRef}
                src={optimizeCloudinaryUrl(src, { quality: 'auto:best', width: 1080 })}
                className="h-full w-full object-contain"
                loop
                muted={isMuted}
                playsInline
                onTimeUpdate={handleTimeUpdate}
                onEnded={() => setIsPlaying(false)}
            />

            {/* Center Play Button Overlay - Show when paused or hovering */}
            {(!isPlaying || isHovering) && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/10 transition-opacity duration-300 pointer-events-none">
                    <div className={cn(
                        "bg-black/50 rounded-full p-4 backdrop-blur-sm transition-all transform",
                        isPlaying ? "opacity-0 scale-90" : "opacity-100 scale-100"
                    )}>
                        {isPlaying ? (
                            <Pause className="h-8 w-8 text-white fill-white" />
                        ) : (
                            <Play className="h-8 w-8 text-white fill-white ml-1" />
                        )}
                    </div>
                </div>
            )}

            {/* Bottom Controls Bar */}
            <div className={cn(
                "absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent pt-8 pb-3 px-4 transition-opacity duration-300",
                isHovering || !isPlaying ? "opacity-100" : "opacity-0"
            )}
                onClick={(e) => e.stopPropagation()} // Prevent clicking bar from toggling play
            >
                {/* Progress Bar */}
                <div className="group/slider relative h-1 mb-3 cursor-pointer">
                    <div className="absolute top-0 w-full h-full bg-white/30 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-primary transition-all duration-100"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    {/* Invisible scrubber input */}
                    <input
                        type="range"
                        min="0"
                        max="100"
                        value={progress}
                        onChange={handleSeek}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                </div>

                {/* Controls Row */}
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        {/* Play/Pause */}
                        <button
                            onClick={togglePlay}
                            className="text-white hover:text-white/80 transition-colors"
                        >
                            {isPlaying ? <Pause className="h-5 w-5 fill-current" /> : <Play className="h-5 w-5 fill-current" />}
                        </button>

                        {/* Volume */}
                        <button
                            onClick={toggleMute}
                            className="text-white hover:text-white/80 transition-colors group/vol"
                        >
                            {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                        </button>

                        {/* Time */}
                        <div className="text-white/90 text-xs font-medium tabular-nums shadow-sm">
                            {formatTime(currentTime)} / {formatTime(duration)}
                        </div>
                    </div>

                    {/* Right Side */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={toggleFullscreen}
                            className="text-white hover:text-white/80 transition-colors"
                        >
                            {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
