'use client';

import { useState } from 'react';
import { Link, useNavigate, useLocation } from '@tanstack/react-router';
import { Plus, LogOut, User, Settings, Eye, Bell, Menu, Search, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';
import { UserAvatar } from '@/components/user-avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuthStore } from '@/store';
import { CreateProjectModal } from '@/features/project/components/create-project-modal';
import { CreatePostModal } from '@/features/project/components/create-post-modal';
import { useUnreadCount } from '@/features/notifications/hooks/use-notifications';
import { SearchInput } from '@/components/search-input';


export function Navbar() {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, isAuthenticated, logout } = useAuthStore();
    const [showCreateProjectModal, setShowCreateProjectModal] = useState(false);

    const [showCreatePostModal, setShowCreatePostModal] = useState(false);
    const { data: unreadCount = 0 } = useUnreadCount();

    // Hide auth buttons on auth pages
    const isAuthPage = ['/login', '/signup', '/forgot-password', '/reset-password', '/verify-otp'].includes(location.pathname);

    const handleLogout = () => {
        logout();
        navigate({ to: '/login' });
    };

    // Hide entire navbar on auth pages to avoid double branding
    if (isAuthPage) {
        return null;
    }

    return (
        <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto flex h-14 items-center justify-between gap-4 px-4">
                <Logo size="md" linkTo="/" />

                <div className="hidden sm:flex flex-1 max-w-md mx-4 justify-center">
                    <SearchInput />
                </div>

                {/* Desktop Actions */}
                <div className="hidden lg:flex items-center gap-3">
                    {isAuthenticated ? (
                        <>
                            <Button variant="outline" size="sm" className="gap-2" onClick={() => setShowCreatePostModal(true)}>
                                <Plus className="h-4 w-4" />
                                Add Update
                            </Button>
                            <Button size="sm" className="gap-2" onClick={() => setShowCreateProjectModal(true)}>
                                <Plus className="h-4 w-4" />
                                Hatch Project
                            </Button>
                        </>
                    ) : null}
                </div>

                {isAuthenticated && user ? (
                    <div className="flex items-center gap-2">
                        <Link to="/search" search={{ q: '' }} className="lg:hidden">
                            <button className="flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-all focus:outline-none" title="Search">
                                <Search className="h-6 w-6 shrink-0" />
                            </button>
                        </Link>
                        <Link to="/notifications">
                            <button className="group relative flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-all focus:outline-none" title="Notifications">
                                <Bell className="h-6 w-6 shrink-0" />
                                {unreadCount > 0 && (
                                    <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-red-600 ring-2 ring-background animate-pulse" />
                                )}
                            </button>
                        </Link>
                        <Link to="/watching">
                            <button className="flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-all focus:outline-none" title="Watching">
                                <Eye className="h-6 w-6 shrink-0" />
                            </button>
                        </Link>
                        <DropdownMenu>
                            <DropdownMenuTrigger className="focus:outline-none ml-1">
                                <Menu className="h-6 w-6 lg:hidden" />
                                <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-500/30 hover:border-orange-500/50 hover:from-orange-500/15 hover:to-amber-500/15 transition-all cursor-pointer">
                                    <UserAvatar
                                        src={user.avatar}
                                        name={user.name}
                                        username={user.username}
                                        size="sm"
                                    />
                                    <span className="text-sm font-medium">Portfolio</span>
                                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                </div>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuGroup>
                                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <Link to="/$username" params={{ username: user.username }}>
                                        <DropdownMenuItem>
                                            <User className="mr-2 h-4 w-4" />
                                            <span>Portfolio</span>
                                        </DropdownMenuItem>
                                    </Link>
                                    <Link to="/settings/profile">
                                        <DropdownMenuItem>
                                            <Settings className="mr-2 h-4 w-4" />
                                            <span>Settings</span>
                                        </DropdownMenuItem>
                                    </Link>
                                </DropdownMenuGroup>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={handleLogout} className="text-red-500 focus:text-red-500">
                                    <LogOut className="mr-2 h-4 w-4" />
                                    <span>Log out</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                ) : (
                    <div className="flex items-center gap-2">
                        <Link to="/login">
                            <Button variant="ghost" size="sm">
                                Log in
                            </Button>
                        </Link>
                        <Link to="/signup">
                            <Button size="sm">Sign up</Button>
                        </Link>
                    </div>
                )}
            </div>

            <CreateProjectModal
                open={showCreateProjectModal}
                onOpenChange={setShowCreateProjectModal}
            />
            <CreatePostModal
                open={showCreatePostModal}
                onOpenChange={setShowCreatePostModal}
                projectId=""
            />
        </header >
    );
}
