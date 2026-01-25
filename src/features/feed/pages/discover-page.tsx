'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    Newspaper,
    Sparkles,
    ExternalLink,
    Clock,
    ArrowUpRight,
    Compass,
    TrendingUp
} from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import api from '@/lib/api';

interface NewsArticle {
    _id: string;
    title: string;
    description?: string;
    source: string;
    url: string;
    category: string;
    pubDate: string;
}

interface AITool {
    id: string;
    name: string;
    tagline: string;
    url: string;
    thumbnail?: string | null;
    votes: number;
    topics?: string[];
}

interface Category {
    id: string;
    label: string;
    count: number;
}

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

async function fetchNews(category?: string): Promise<{ articles: NewsArticle[] }> {
    const url = category
        ? `/news/all?limit=20&sort=smart&category=${category}`
        : '/news/all?limit=20&sort=smart';
    const response = await api.get(url);
    return response.data;
}

async function fetchCategories(): Promise<{ categories: Category[] }> {
    const response = await api.get('/news/categories');
    return response.data;
}

async function fetchAITools(): Promise<{ data: AITool[] }> {
    const response = await api.get('/product-hunt/top-ai-tools?limit=10');
    return response.data;
}

function formatTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
}

export function DiscoverPage() {
    const [activeTab, setActiveTab] = useState<'news' | 'tools'>('news');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    // Fetch categories
    const { data: categoriesData } = useQuery({
        queryKey: ['discover-categories'],
        queryFn: fetchCategories,
        staleTime: 1000 * 60 * 30,
    });

    // Fetch news
    const { data: newsData, isLoading: newsLoading } = useQuery({
        queryKey: ['discover-news', selectedCategory],
        queryFn: () => fetchNews(selectedCategory || undefined),
        staleTime: 1000 * 60 * 5,
    });

    // Fetch AI tools
    const { data: toolsData, isLoading: toolsLoading } = useQuery({
        queryKey: ['discover-tools'],
        queryFn: fetchAITools,
        staleTime: 1000 * 60 * 30,
    });

    const categories = categoriesData?.categories || [];
    const news = newsData?.articles || [];
    const tools = toolsData?.data || [];

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Header */}
            <div className="sticky top-14 z-40 bg-background/95 backdrop-blur border-b">
                <div className="px-4 py-3">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="p-1.5 rounded-lg bg-primary/10">
                            <Compass className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold">Discover</h1>
                            <p className="text-xs text-muted-foreground">
                                Tech news & AI tools curated for you
                            </p>
                        </div>
                    </div>

                    {/* Tabs */}
                    <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'news' | 'tools')}>
                        <TabsList className="grid w-full grid-cols-2 h-10">
                            <TabsTrigger value="news" className="gap-1.5">
                                <Newspaper className="h-4 w-4" />
                                Tech News
                            </TabsTrigger>
                            <TabsTrigger value="tools" className="gap-1.5">
                                <Sparkles className="h-4 w-4" />
                                AI Tools
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>

                {/* Category Pills (only for news tab) */}
                {activeTab === 'news' && (
                    <div className="flex gap-2 overflow-x-auto px-4 pb-3 scrollbar-hide">
                        <Button
                            variant={selectedCategory === null ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setSelectedCategory(null)}
                            className="rounded-full whitespace-nowrap flex-shrink-0 h-8"
                        >
                            🔥 All
                        </Button>
                        {categories.slice(0, 8).map((cat) => (
                            <Button
                                key={cat.id}
                                variant={selectedCategory === cat.id ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setSelectedCategory(cat.id)}
                                className="rounded-full whitespace-nowrap flex-shrink-0 h-8 gap-1"
                            >
                                {categoryIcons[cat.id] || '📰'} {cat.label}
                            </Button>
                        ))}
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="px-4 py-4">
                {activeTab === 'news' ? (
                    // News Content
                    <div className="space-y-3">
                        {newsLoading ? (
                            Array.from({ length: 6 }).map((_, i) => (
                                <NewsCardSkeleton key={i} />
                            ))
                        ) : news.length > 0 ? (
                            <>
                                {news.map((article, idx) => (
                                    <NewsCard key={article._id || idx} article={article} index={idx + 1} />
                                ))}

                                {/* View More Button */}
                                <Link to="/tech-news" className="block pt-2">
                                    <Button variant="outline" className="w-full gap-2">
                                        View All Tech News
                                        <ArrowUpRight className="h-4 w-4" />
                                    </Button>
                                </Link>
                            </>
                        ) : (
                            <div className="text-center py-12">
                                <Newspaper className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                                <p className="text-muted-foreground">No news articles available</p>
                            </div>
                        )}
                    </div>
                ) : (
                    // AI Tools Content
                    <div className="space-y-3">
                        {toolsLoading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <ToolCardSkeleton key={i} />
                            ))
                        ) : tools.length > 0 ? (
                            <>
                                {/* Featured Tool */}
                                <div className="mb-4">
                                    <div className="flex items-center gap-2 mb-3">
                                        <TrendingUp className="h-4 w-4 text-primary" />
                                        <span className="text-sm font-semibold">Trending Today</span>
                                    </div>
                                    <FeaturedToolCard tool={tools[0]} />
                                </div>

                                {/* Other Tools */}
                                <div className="space-y-2">
                                    {tools.slice(1).map((tool, idx) => (
                                        <ToolCard key={tool.id || idx} tool={tool} rank={idx + 2} />
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-12">
                                <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                                <p className="text-muted-foreground">No AI tools available</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

// News Card Component
function NewsCard({ article, index }: { article: NewsArticle; index: number }) {
    const categoryLabel = article.category
        ?.split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ') || 'Tech';

    return (
        <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group block bg-card border rounded-xl p-3 hover:bg-accent/50 transition-colors"
        >
            <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-xs font-bold text-primary">{index}</span>
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors leading-snug">
                        {article.title}
                    </p>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <span className="text-[11px] font-medium text-foreground/70">{article.source}</span>
                        <Badge
                            variant="outline"
                            className="text-[9px] px-1.5 py-0 h-4 text-muted-foreground"
                        >
                            {categoryIcons[article.category] || '📰'} {categoryLabel}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground flex items-center gap-0.5 ml-auto">
                            <Clock className="h-2.5 w-2.5" />
                            {formatTimeAgo(article.pubDate)}
                        </span>
                    </div>
                </div>
            </div>
        </a>
    );
}

// Featured Tool Card (larger display for #1 tool)
function FeaturedToolCard({ tool }: { tool: AITool }) {
    return (
        <a
            href={tool.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group block bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 rounded-xl p-4 hover:from-primary/10 hover:to-primary/15 transition-all"
        >
            <div className="flex items-start gap-4">
                {tool.thumbnail ? (
                    <img
                        src={tool.thumbnail}
                        alt={tool.name}
                        className="h-16 w-16 rounded-xl object-cover flex-shrink-0"
                    />
                ) : (
                    <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center flex-shrink-0">
                        <Sparkles className="h-7 w-7 text-primary" />
                    </div>
                )}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <Badge className="bg-primary text-primary-foreground text-[10px] px-1.5">
                            #1 Trending
                        </Badge>
                    </div>
                    <h3 className="text-base font-semibold mt-1 group-hover:text-primary transition-colors">
                        {tool.name}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                        {tool.tagline}
                    </p>
                    {tool.topics && tool.topics.length > 0 && (
                        <div className="flex gap-1.5 mt-2 flex-wrap">
                            {tool.topics.slice(0, 3).map((topic, i) => (
                                <Badge
                                    key={i}
                                    variant="outline"
                                    className="text-[10px] px-2 py-0 h-5"
                                >
                                    {topic}
                                </Badge>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </a>
    );
}

// Regular Tool Card
function ToolCard({ tool, rank }: { tool: AITool; rank: number }) {
    return (
        <a
            href={tool.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-3 bg-card border rounded-xl p-3 hover:bg-accent/50 transition-colors"
        >
            <div className="flex-shrink-0 w-7 h-7 rounded-full bg-muted flex items-center justify-center">
                <span className="text-xs font-bold text-muted-foreground">#{rank}</span>
            </div>
            {tool.thumbnail ? (
                <img
                    src={tool.thumbnail}
                    alt={tool.name}
                    className="h-12 w-12 rounded-lg object-cover flex-shrink-0"
                />
            ) : (
                <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="h-5 w-5 text-primary" />
                </div>
            )}
            <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate group-hover:text-primary transition-colors">
                    {tool.name}
                </p>
                <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                    {tool.tagline}
                </p>
            </div>
            <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
        </a>
    );
}

// Skeletons
function NewsCardSkeleton() {
    return (
        <div className="bg-card border rounded-xl p-3">
            <div className="flex gap-3">
                <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
                <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <div className="flex gap-2">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-16 rounded-full" />
                    </div>
                </div>
            </div>
        </div>
    );
}

function ToolCardSkeleton() {
    return (
        <div className="bg-card border rounded-xl p-3">
            <div className="flex items-center gap-3">
                <Skeleton className="h-7 w-7 rounded-full" />
                <Skeleton className="h-12 w-12 rounded-lg" />
                <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-full" />
                </div>
            </div>
        </div>
    );
}

export default DiscoverPage;
