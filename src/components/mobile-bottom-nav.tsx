'use client';

import { useRouterState } from '@tanstack/react-router';
import { Home, Search, PlusSquare, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store';
import { UserAvatar } from '@/components/user-avatar';

const navItems = [
    { href: '/feed', icon: Home, label: 'Home' },
    { href: '/search', icon: Search, label: 'Search' },
    { href: '/create', icon: PlusSquare, label: 'Post', isAction: true },
    { href: '/leaderboard', icon: Trophy, label: 'Ranks' },
];

export function MobileBottomNav() {
    const { user, isAuthenticated } = useAuthStore();
    const routerState = useRouterState();
    const currentPath = routerState.location.pathname;

    // Hide on auth pages
    const authPages = ['/login', '/signup', '/forgot-password', '/reset-password', '/verify-otp'];
    if (authPages.includes(currentPath)) {
        return null;
    }

    // Only show on mobile
    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 lg:hidden">
            <div className="flex items-center justify-around h-16 px-2 pb-safe">
                {navItems.map((item) => {
                    const isActive = currentPath === item.href ||
                        (item.href === '/feed' && (currentPath === '/' || currentPath === '/feed'));

                    // Handle Home click - scroll to top and refresh if already on feed
                    const handleClick = (e: React.MouseEvent) => {
                        if (item.href === '/feed' && isActive) {
                            e.preventDefault();
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                            window.location.reload();
                        }
                    };

                    if (item.isAction) {
                        // Center action button (Create Post)
                        return (
                            <a
                                key={item.href}
                                href={isAuthenticated ? item.href : '/login'}
                                className="flex flex-col items-center justify-center"
                            >
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                                    <item.icon className="h-5 w-5" />
                                </div>
                            </a>
                        );
                    }

                    return (
                        <a
                            key={item.href}
                            href={item.href}
                            onClick={handleClick}
                            className={cn(
                                'flex flex-col items-center justify-center gap-1 px-3 py-2 transition-colors',
                                isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                            )}
                        >
                            <item.icon className={cn('h-5 w-5', isActive && 'fill-current')} />
                            <span className="text-xs">{item.label}</span>
                        </a>
                    );
                })}

                {/* Profile */}
                <a
                    href={isAuthenticated && user ? `/${user.username}` : '/login'}
                    className={cn(
                        'flex flex-col items-center justify-center gap-1 px-3 py-2 transition-colors',
                        currentPath === `/${user?.username}` ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                    )}
                >
                    <UserAvatar
                        src={user?.avatar}
                        name={user?.name || ''}
                        username={user?.username || ''}
                        className="h-6 w-6 text-foreground"
                    />
                    <span className="text-xs">Profile</span>
                </a>
            </div>
        </nav>
    );
}

export default MobileBottomNav;
