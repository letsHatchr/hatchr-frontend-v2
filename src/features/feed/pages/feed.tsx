'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from '@tanstack/react-router';
import { Loader2, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PostCardSkeleton } from '@/components/loading';
import { Logo } from '@/components/logo';
import { UserAvatar } from '@/components/user-avatar';
import { useAuthStore } from '@/store';
import { PostCard } from '../components/post-card';
import { TopInnovators } from '../components/top-innovators';
import { TrendingProjects } from '../components/trending-projects';
import { MobileBottomNav } from '../components/mobile-bottom-nav';
import { useFeedPosts } from '../hooks/use-posts';
import type { FeedParams } from '../types';

type FeedTab = 'forYou' | 'following';
type SortOption = 'new' | 'rising' | 'upvotes' | 'best';

const sortOptions: { value: SortOption; label: string }[] = [
    { value: 'best', label: 'Best' },
    { value: 'new', label: 'New' },
    { value: 'rising', label: 'Rising' },
    { value: 'upvotes', label: 'Top' },
];

export function FeedPage() {
    const { user, isAuthenticated } = useAuthStore();
    const [activeTab, setActiveTab] = useState<FeedTab>('forYou');
    const [sortBy, setSortBy] = useState<SortOption>('best');

    const feedParams: FeedParams = {
        type: activeTab,
        sort: sortBy,
        limit: 10,
    };

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        isError,
    } = useFeedPosts(feedParams);

    // Infinite scroll observer
    const observerRef = useRef<IntersectionObserver | null>(null);
    const loadMoreRef = useCallback(
        (node: HTMLDivElement | null) => {
            if (isFetchingNextPage) return;
            if (observerRef.current) observerRef.current.disconnect();

            observerRef.current = new IntersectionObserver(
                (entries) => {
                    if (entries[0].isIntersecting && hasNextPage) {
                        fetchNextPage();
                    }
                },
                { threshold: 0.1 }
            );

            if (node) observerRef.current.observe(node);
        },
        [isFetchingNextPage, hasNextPage, fetchNextPage]
    );

    // Reset to top when params change
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [activeTab, sortBy]);

    const allPosts = data?.pages.flatMap((page) => page.posts) ?? [];

    return (
        <div className="min-h-screen bg-background pb-20 lg:pb-0">
            {/* Navbar */}
            <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container mx-auto flex h-14 items-center justify-between gap-4 px-4">
                    <Logo size="md" linkTo="/" />

                    {/* Desktop Actions */}
                    <div className="hidden lg:flex items-center gap-3">
                        {isAuthenticated ? (
                            <>
                                <Button variant="outline" size="sm" className="gap-2">
                                    <Plus className="h-4 w-4" />
                                    Create Post
                                </Button>
                                <Button size="sm" className="gap-2">
                                    <Plus className="h-4 w-4" />
                                    Hatch Project
                                </Button>
                            </>
                        ) : null}
                    </div>

                    {isAuthenticated && user ? (
                        <div className="flex items-center gap-3">
                            <a href={`/${user.username}`} className="hidden lg:block">
                                <UserAvatar
                                    src={user.avatar}
                                    name={user.name}
                                    username={user.username}
                                    size="sm"
                                />
                            </a>
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
            </header>

            {/* Main Layout - 3 Column on Desktop with full-width sidebars */}
            <div className="w-full px-4 py-6 lg:px-6 xl:px-8 lg:grid lg:grid-cols-[minmax(320px,1fr)_minmax(auto,600px)_minmax(320px,1fr)] lg:gap-6">
                {/* Left Sidebar - Desktop only - extends to left edge */}
                <aside className="hidden lg:flex lg:justify-end">
                    <div className="w-[320px] space-y-6 sticky top-20">
                        <TopInnovators />
                        <TrendingProjects />
                    </div>
                </aside>

                {/* Main Feed - fixed max width */}
                <main className="max-w-xl mx-auto lg:max-w-none lg:w-full">
                    {/* Tabs */}
                    <Tabs
                        value={activeTab}
                        onValueChange={(v) => setActiveTab(v as FeedTab)}
                        className="mb-4"
                    >
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="forYou">For You</TabsTrigger>
                            <TabsTrigger value="following" disabled={!isAuthenticated}>
                                Following
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>

                    {/* Sort Pills */}
                    <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
                        {sortOptions.map((option) => (
                            <Button
                                key={option.value}
                                variant={sortBy === option.value ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setSortBy(option.value)}
                                className={cn(
                                    'rounded-full whitespace-nowrap',
                                    sortBy === option.value && 'bg-primary text-primary-foreground'
                                )}
                            >
                                {option.label}
                            </Button>
                        ))}
                    </div>

                    {/* Posts List */}
                    <div className="space-y-4">
                        {isLoading ? (
                            Array.from({ length: 3 }).map((_, i) => (
                                <PostCardSkeleton key={i} />
                            ))
                        ) : isError ? (
                            <div className="text-center py-12">
                                <p className="text-muted-foreground">Failed to load posts</p>
                                <Button
                                    variant="outline"
                                    className="mt-4"
                                    onClick={() => window.location.reload()}
                                >
                                    Retry
                                </Button>
                            </div>
                        ) : allPosts.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-lg font-medium">No posts yet</p>
                                <p className="text-muted-foreground mt-1">
                                    {activeTab === 'following'
                                        ? 'Follow some builders to see their posts here!'
                                        : 'Be the first to share what you\'re building!'}
                                </p>
                            </div>
                        ) : (
                            <>
                                {allPosts.map((post) => (
                                    <PostCard key={post._id} post={post} />
                                ))}

                                {/* Load more trigger */}
                                <div ref={loadMoreRef} className="py-4">
                                    {isFetchingNextPage && (
                                        <div className="flex justify-center">
                                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                        </div>
                                    )}
                                    {!hasNextPage && allPosts.length > 0 && (
                                        <p className="text-center text-sm text-muted-foreground">
                                            You've reached the end!
                                        </p>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </main>

                {/* Right Sidebar - Desktop only - extends to right edge */}
                <aside className="hidden lg:flex lg:justify-start">
                    <div className="w-[320px] space-y-6 sticky top-20">
                        {/* Placeholder for AI News/Tools - can be added later */}
                        <div className="text-center text-sm text-muted-foreground py-12 border border-dashed rounded-lg">
                            AI News & Tools coming soon
                        </div>
                    </div>
                </aside>
            </div>

            {/* Mobile Bottom Navigation */}
            <MobileBottomNav />
        </div>
    );
}

export default FeedPage;
