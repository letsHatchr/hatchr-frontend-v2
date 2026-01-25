'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PostCardSkeleton } from '@/components/loading';

import { useAuthStore } from '@/store';
import { PostCard } from '../components/post-card';
import { TopInnovators } from '../components/top-innovators';
import { TrendingProjects } from '../components/trending-projects';
import { TopHeadlines } from '../components/top-headlines';
import { TopAITools } from '../components/top-ai-tools';
import { MobileDiscoverCards } from '../components/mobile-discover-cards';

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
    const { isAuthenticated } = useAuthStore();
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
            {/* Navbar removed - moved to global layout */}

            {/* Main Layout - 3 Column on Desktop with full-width sidebars */}
            <div className="w-full px-0 py-0 sm:px-4 sm:py-6 lg:px-6 xl:px-8 lg:grid lg:grid-cols-[minmax(320px,1fr)_minmax(auto,600px)_minmax(320px,1fr)] lg:gap-6">
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
                        className="mb-4 hidden sm:block"
                    >
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="forYou">For You</TabsTrigger>
                            <TabsTrigger value="following" disabled={!isAuthenticated}>
                                Following
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>

                    {/* Mobile Tabs (Simple) */}
                    <div className="flex sm:hidden border-b mb-2 items-center justify-center sticky top-0 bg-background/95 backdrop-blur z-30">
                        <div className="w-full grid grid-cols-2">
                            <button
                                onClick={() => setActiveTab('forYou')}
                                className={cn("py-3 font-medium text-sm text-center border-b-2 transition-colors", activeTab === 'forYou' ? "border-primary text-foreground" : "border-transparent text-muted-foreground")}
                            >
                                For You
                            </button>
                            <button
                                onClick={() => setActiveTab('following')}
                                disabled={!isAuthenticated}
                                className={cn("py-3 font-medium text-sm text-center border-b-2 transition-colors", activeTab === 'following' ? "border-primary text-foreground" : "border-transparent text-muted-foreground")}
                            >
                                Following
                            </button>
                        </div>
                    </div>

                    {/* Mobile Discover Cards - Swipeable News & Tools */}
                    <MobileDiscoverCards />

                    {/* Sort Pills */}
                    <div className="flex items-center gap-2 mt-3 mb-2 sm:mb-6 overflow-x-auto pb-2 px-3 sm:px-0">
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
                    <div className="space-y-0 border-t border-border/50">
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
                        <TopHeadlines />
                        <TopAITools />
                    </div>
                </aside>
            </div>

            {/* Mobile Bottom Navigation */}
            {/* Mobile Bottom Navigation removed - moved to global layout */}
        </div>
    );
}

export default FeedPage;
