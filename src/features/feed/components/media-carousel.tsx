'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AspectRatio } from '@/components/ui/aspect-ratio';

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

    if (!media || media.length === 0) return null;

    const goToPrevious = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setCurrentIndex((prev) => (prev === 0 ? media.length - 1 : prev - 1));
    };

    const goToNext = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setCurrentIndex((prev) => (prev === media.length - 1 ? 0 : prev + 1));
    };

    const currentMedia = media[currentIndex];
    const hasMultiple = media.length > 1;

    return (
        <div className={cn('relative group', className)}>
            <AspectRatio ratio={16 / 9} className="overflow-hidden rounded-lg bg-muted">
                {currentMedia.type === 'image' ? (
                    <img
                        src={currentMedia.url}
                        alt={`Media ${currentIndex + 1}`}
                        className="h-full w-full object-cover"
                        loading="lazy"
                    />
                ) : currentMedia.type === 'video' ? (
                    <video
                        key={currentMedia.url}
                        src={currentMedia.url}
                        className="h-full w-full object-cover"
                        controls
                    />
                ) : null}
            </AspectRatio>

            {/* Navigation Arrows */}
            {hasMultiple && (
                <>
                    <button
                        onClick={goToPrevious}
                        className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
                        aria-label="Previous media"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                        onClick={goToNext}
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
                        aria-label="Next media"
                    >
                        <ChevronRight className="h-5 w-5" />
                    </button>
                </>
            )}

            {/* Dots Indicator */}
            {hasMultiple && (
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
                    {media.map((_, index) => (
                        <button
                            key={index}
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setCurrentIndex(index);
                            }}
                            className={cn(
                                'h-1.5 rounded-full transition-all',
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
                <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                    {currentIndex + 1} / {media.length}
                </div>
            )}
        </div>
    );
}

export default MediaCarousel;
