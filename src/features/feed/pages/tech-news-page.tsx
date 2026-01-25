'use client';

import { useState, useRef, useCallback } from 'react';
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import {
    Newspaper,
    ExternalLink,
    ArrowLeft,
    Loader2,
    Sparkles,
    RefreshCw,
    Clock,
    ArrowUpRight
} from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import api from '@/lib/api';

interface NewsArticle {
    _id: string;
    title: string;
    description: string;
    source: string;
    url: string;
    category: string;
    pubDate: string;
    created_at: string;
}

interface Category {
    id: string;
    label: string;
    count: number;
    latestUpdate: string;
}

interface NewsResponse {
    success: boolean;
    category: string;
    articles: NewsArticle[];
    total: number;
    page: number;
    totalPages: number;
    hasMore: boolean;
    sortBy: string;
}

interface CategoriesResponse {
    success: boolean;
    categories: Category[];
    total: number;
}

type SortOption = 'smart' | 'newest' | 'oldest' | 'source';

const sortOptions: { value: SortOption; label: string }[] = [
    { value: 'smart', label: 'Smart' },
    { value: 'newest', label: 'Newest' },
    { value: 'oldest', label: 'Oldest' },
    { value: 'source', label: 'By Source' },
];

const categoryIcons: Record<string, string> = {
    'general-tech': '💻',
    'software-development': '👨‍💻',
    'cloud-devops': '☁️',
    'cybersecurity': '🔒',
    'blockchain': '⛓️',
    'mobile': '📱',
    'data-science': '📊',
    'web-development': '🌐',
    'hardware': '🖥️',
    'emerging-tech': '🚀',
    'ai-ml': '🤖',
};

async function fetchCategories(): Promise<CategoriesResponse> {
    const response = await api.get('/news/categories');
    return response.data;
}

async function fetchNews({
    pageParam = 1,
    category,
    sort
}: {
    pageParam?: number;
    category: string | null;
    sort: SortOption
}): Promise<NewsResponse> {
    const params = new URLSearchParams();
    params.set('page', pageParam.toString());
    params.set('limit', '15');
    params.set('sort', sort);
    if (category) {
        params.set('category', category);
    }
    const response = await api.get(`/news/all?${params.toString()}`);
    return response.data;
}

function formatTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function TechNewsPage() {
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [sortBy, setSortBy] = useState<SortOption>('smart');

    // Fetch categories
    const { data: categoriesData, isLoading: categoriesLoading } = useQuery({
        queryKey: ['news-categories'],
        queryFn: fetchCategories,
        staleTime: 1000 * 60 * 30, // 30 minutes
    });

    // Fetch news with infinite scroll
    const {
        data: newsData,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading: newsLoading,
        isError,
        refetch,
    } = useInfiniteQuery({
        queryKey: ['tech-news', selectedCategory, sortBy],
        queryFn: ({ pageParam }) => fetchNews({ pageParam, category: selectedCategory, sort: sortBy }),
        initialPageParam: 1,
        getNextPageParam: (lastPage) =>
            lastPage.hasMore ? lastPage.page + 1 : undefined,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });

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

    const categories = categoriesData?.categories || [];
    const allArticles = newsData?.pages.flatMap((page) => page.articles || []).filter(Boolean) ?? [];

    return (
        <div className="min-h-screen bg-background pb-20 lg:pb-0">
            {/* Header */}
            <div className="sticky top-14 z-40 bg-background/95 backdrop-blur border-b">
                <div className="max-w-5xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <Link to="/">
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <ArrowLeft className="h-4 w-4" />
                                </Button>
                            </Link>
                            <div className="flex items-center gap-2">
                                <div className="p-2 rounded-lg bg-primary/10">
                                    <Newspaper className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <h1 className="text-lg font-bold">Tech News</h1>
                                    <p className="text-xs text-muted-foreground">
                                        Curated by AI • Updated daily at 6 AM IST
                                    </p>
                                </div>
                            </div>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => refetch()}
                            className="gap-1.5"
                        >
                            <RefreshCw className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">Refresh</span>
                        </Button>
                    </div>

                    {/* Category Pills */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        <Button
                            variant={selectedCategory === null ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setSelectedCategory(null)}
                            className="rounded-full whitespace-nowrap flex-shrink-0"
                        >
                            All
                            {categoriesData?.total && (
                                <Badge variant="secondary" className="ml-1.5 text-[10px]">
                                    {categoriesData.total}
                                </Badge>
                            )}
                        </Button>
                        {categoriesLoading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <Skeleton key={i} className="h-8 w-24 rounded-full flex-shrink-0" />
                            ))
                        ) : (
                            categories.map((cat) => (
                                <Button
                                    key={cat.id}
                                    variant={selectedCategory === cat.id ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setSelectedCategory(cat.id)}
                                    className="rounded-full whitespace-nowrap flex-shrink-0 gap-1.5"
                                >
                                    <span>{categoryIcons[cat.id] || '📰'}</span>
                                    {cat.label}
                                    <Badge variant="secondary" className="ml-0.5 text-[10px]">
                                        {cat.count}
                                    </Badge>
                                </Button>
                            ))
                        )}
                    </div>

                    {/* Sort Pills */}
                    <div className="flex items-center gap-2 mt-3">
                        <span className="text-xs text-muted-foreground mr-1">Sort:</span>
                        {sortOptions.map((option) => (
                            <Button
                                key={option.value}
                                variant={sortBy === option.value ? 'secondary' : 'ghost'}
                                size="sm"
                                onClick={() => setSortBy(option.value)}
                                className={cn(
                                    'h-7 px-2.5 text-xs',
                                    sortBy === option.value && 'bg-secondary'
                                )}
                            >
                                {option.label}
                            </Button>
                        ))}
                    </div>
                </div>
            </div>

            {/* News Articles */}
            <div className="max-w-5xl mx-auto px-4 py-6">
                {newsLoading ? (
                    <div className="space-y-4">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <NewsArticleSkeleton key={i} />
                        ))}
                    </div>
                ) : isError ? (
                    <div className="text-center py-12">
                        <p className="text-muted-foreground">Failed to load news</p>
                        <Button
                            variant="outline"
                            className="mt-4"
                            onClick={() => refetch()}
                        >
                            Retry
                        </Button>
                    </div>
                ) : allArticles.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="p-4 rounded-full bg-muted/50 w-fit mx-auto mb-4">
                            <Newspaper className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <p className="text-lg font-medium">No news articles found</p>
                        <p className="text-muted-foreground mt-1">
                            {selectedCategory
                                ? 'Try selecting a different category'
                                : 'News curation runs daily at 6 AM IST'}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {allArticles.map((article, index) => (
                            <NewsArticleCard
                                key={article._id || `article-${index}`}
                                article={article}
                                index={index + 1}
                            />
                        ))}

                        {/* Load more trigger */}
                        <div ref={loadMoreRef} className="py-4">
                            {isFetchingNextPage && (
                                <div className="flex justify-center">
                                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                </div>
                            )}
                            {!hasNextPage && allArticles.length > 0 && (
                                <p className="text-center text-sm text-muted-foreground">
                                    You've reached the end!
                                </p>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Footer Attribution */}
            <div className="max-w-5xl mx-auto px-4 pb-8">
                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                    <Sparkles className="h-3 w-3" />
                    <span>Curated by AI from 40+ RSS feeds</span>
                </div>
            </div>
        </div>
    );
}

function NewsArticleCard({ article, index }: { article: NewsArticle; index: number }) {
    const categoryLabel = article.category
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

    return (
        <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group block rounded-xl border bg-card p-4 hover:bg-accent/50 transition-all hover:shadow-md"
        >
            <div className="flex gap-4">
                {/* Rank */}
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-bold text-primary">#{index}</span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold leading-snug group-hover:text-primary transition-colors line-clamp-2">
                            {article.title}
                        </h3>
                        <ArrowUpRight className="h-4 w-4 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-primary mt-1" />
                    </div>

                    {article.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                            {article.description}
                        </p>
                    )}

                    {/* Meta - Source, Category, Time */}
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                        <span className="text-xs font-medium text-foreground/80">
                            {article.source}
                        </span>
                        <span className="text-muted-foreground">•</span>
                        <Badge
                            variant="outline"
                            className="text-[10px] px-2 py-0 h-5 font-medium text-primary border-primary/30 bg-primary/5"
                        >
                            {categoryIcons[article.category] || '📰'} {categoryLabel}
                        </Badge>
                        <span className="text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatTimeAgo(article.pubDate)}
                        </span>
                        <ExternalLink className="h-3 w-3 text-muted-foreground ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                </div>
            </div>
        </a>
    );
}

function NewsArticleSkeleton() {
    return (
        <div className="rounded-xl border bg-card p-4">
            <div className="flex gap-4">
                <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
                <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <div className="flex items-center gap-2 pt-1">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-5 w-24 rounded-full" />
                        <Skeleton className="h-4 w-16" />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TechNewsPage;
