'use client';

import { cn } from '@/lib/utils';
import { Link, useRouterState } from '@tanstack/react-router';

interface LogoProps {
    size?: 'sm' | 'md' | 'lg';
    showText?: boolean;
    className?: string;
    linkTo?: string;
}

const sizeConfig = {
    sm: {
        icon: 'h-8 w-8 text-xl',
        text: 'text-xl',
        gap: 'gap-1.5',
    },
    md: {
        icon: 'h-10 w-10 text-2xl',
        text: 'text-2xl',
        gap: 'gap-2',
    },
    lg: {
        icon: 'h-14 w-14 text-3xl',
        text: 'text-3xl',
        gap: 'gap-3',
    },
};

/**
 * Hatchr Logo component
 * Uses Block Berthold font for the text (will be loaded separately)
 */
export function Logo({
    size = 'md',
    showText = true,
    className,
    linkTo = '/'
}: LogoProps) {
    const config = sizeConfig[size];
    const routerState = useRouterState();
    const currentPath = routerState.location.pathname;

    // Check if we're on home/feed page
    const isOnHomePage = currentPath === '/' || currentPath === '/feed';

    const handleClick = (e: React.MouseEvent) => {
        if (isOnHomePage) {
            e.preventDefault();
            // Scroll to top smoothly
            window.scrollTo({ top: 0, behavior: 'smooth' });
            // Trigger a page refresh to get new content
            window.location.reload();
        }
    };

    const LogoContent = (
        <div className={cn('flex items-center', config.gap, className)}>
            {/* Logo Image */}
            <div
                className={cn(
                    'flex items-center justify-center rounded-xl overflow-hidden',
                    config.icon
                )}
            >
                <img
                    src="/favicon.jpg"
                    alt="Hatchr"
                    className="h-full w-full object-cover"
                />
            </div>

            {/* Text */}
            {showText && (
                <span
                    className={cn(
                        'font-bold tracking-tight text-foreground',
                        config.text
                    )}
                    style={{ fontFamily: "'Block Berthold', sans-serif" }}
                >
                    Hatchr
                </span>
            )}
        </div>
    );

    if (linkTo) {
        return (
            <Link
                to={linkTo}
                className="hover:opacity-80 transition-opacity"
                onClick={handleClick}
            >
                {LogoContent}
            </Link>
        );
    }

    return LogoContent;
}

export default Logo;
