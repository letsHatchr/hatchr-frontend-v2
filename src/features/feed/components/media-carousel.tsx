'use client';

import { useState, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AutoplayVideo } from './autoplay-video';

interface MediaItem {
    type: 'image' | 'video';
    url: string;
}

interface MediaCarouselProps {
    media: MediaItem[];
    className?: string;
}

export function MediaCarousel({ media, className }: MediaCarouselProps) {
    const [currentIndex, setCurrentIndex] = useState(0);

    // Touch handling for swipe
    const touchStartX = useRef<number | null>(null);
    const touchEndX = useRef<number | null>(null);
    const minSwipeDistance = 50;

    if (!media || media.length === 0) return null;

    const goToPrevious = (e?: React.MouseEvent) => {
        e?.preventDefault();
        e?.stopPropagation();
        setCurrentIndex((prev) => (prev === 0 ? media.length - 1 : prev - 1));
    };

    const goToNext = (e?: React.MouseEvent) => {
        e?.preventDefault();
        e?.stopPropagation();
        setCurrentIndex((prev) => (prev === media.length - 1 ? 0 : prev + 1));
    };

    // Touch handlers for swipe
    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.targetTouches[0].clientX;
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        touchEndX.current = e.targetTouches[0].clientX;
    };

    const handleTouchEnd = () => {
        if (!touchStartX.current || !touchEndX.current) return;

        const distance = touchStartX.current - touchEndX.current;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;

        if (isLeftSwipe && media.length > 1) {
            goToNext();
        } else if (isRightSwipe && media.length > 1) {
            goToPrevious();
        }

        // Reset
        touchStartX.current = null;
        touchEndX.current = null;
    };

    const currentMedia = media[currentIndex];
    const hasMultiple = media.length > 1;

    return (
        <div className={cn('relative group w-full overflow-hidden rounded-none sm:rounded-lg bg-neutral-900 border-0 sm:border border-border/50', className)}>
            {/* Fixed height container with touch handlers */}
            <div
                className="relative w-full h-[250px] sm:h-[400px] flex items-center justify-center touch-pan-y"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >

                {/* 1. Blurred Background Layer (Fills space) */}
                <div className="absolute inset-0 overflow-hidden">
                    {currentMedia.type === 'image' && (
                        <div
                            className="absolute inset-0 bg-center bg-cover blur-xl scale-110 opacity-50 transition-all duration-500"
                            style={{ backgroundImage: `url(${currentMedia.url})` }}
                        />
                    )}
                    {currentMedia.type === 'video' && (
                        <div className="absolute inset-0 bg-neutral-900/90" />
                    )}
                </div>

                {/* 2. Main Content Layer (Contained) */}
                <div className="relative z-10 w-full h-full flex items-center justify-center select-none">
                    {currentMedia.type === 'image' ? (
                        <img
                            src={currentMedia.url}
                            alt={`Media ${currentIndex + 1}`}
                            className="h-full w-auto max-w-full object-contain pointer-events-none"
                            loading="lazy"
                            draggable={false}
                        />
                    ) : currentMedia.type === 'video' ? (
                        <AutoplayVideo
                            key={currentMedia.url}
                            src={currentMedia.url}
                        />
                    ) : null}
                </div>
            </div>

            {/* Navigation Arrows */}
            {hasMultiple && (
                <>
                    <button
                        onClick={goToPrevious}
                        className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80 z-20"
                        aria-label="Previous media"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                        onClick={goToNext}
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80 z-20"
                        aria-label="Next media"
                    >
                        <ChevronRight className="h-5 w-5" />
                    </button>
                </>
            )}

            {/* Dots Indicator */}
            {hasMultiple && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20">
                    {media.map((_, index) => (
                        <button
                            key={index}
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setCurrentIndex(index);
                            }}
                            className={cn(
                                'h-1.5 rounded-full transition-all shadow-sm',
                                index === currentIndex
                                    ? 'w-4 bg-white'
                                    : 'w-1.5 bg-white/50 hover:bg-white/75'
                            )}
                            aria-label={`Go to media ${index + 1}`}
                        />
                    ))}
                </div>
            )}

            {/* Counter Badge */}
            {hasMultiple && (
                <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full z-20">
                    {currentIndex + 1} / {media.length}
                </div>
            )}
        </div>
    );
}

export default MediaCarousel;
