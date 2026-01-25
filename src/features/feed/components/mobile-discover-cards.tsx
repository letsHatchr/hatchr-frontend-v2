'use client';

import { useQuery } from '@tanstack/react-query';
import { Newspaper, ArrowRight, ExternalLink, Clock } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { Skeleton } from '@/components/ui/skeleton';
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

async function fetchLatestNews(): Promise<{ articles: NewsArticle[] }> {
    const response = await api.get('/news/all?limit=5&sort=newest');
    return response.data;
}

function formatTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffHours < 24) return `${diffHours}h`;
    return `${diffDays}d`;
}

export function MobileDiscoverCards() {
    const { data: newsData, isLoading: newsLoading } = useQuery({
        queryKey: ['mobile-news-preview'],
        queryFn: fetchLatestNews,
        staleTime: 1000 * 60 * 10,
    });

    const news = newsData?.articles?.slice(0, 4) || [];

    return (
        <div className="lg:hidden border-b bg-gradient-to-b from-background to-background/50">
            {/* Tech News Section */}
            <div className="py-3">
                <div className="flex items-center justify-between px-4 mb-2">
                    <div className="flex items-center gap-2">
                        <Newspaper className="h-4 w-4 text-primary" />
                        <span className="text-sm font-semibold">Trending News</span>
                    </div>
                    <Link
                        to="/tech-news"
                        className="text-xs text-primary flex items-center gap-1 hover:underline"
                    >
                        View All <ArrowRight className="h-3 w-3" />
                    </Link>
                </div>

                <div className="flex gap-3 overflow-x-auto px-4 pb-2 scrollbar-hide snap-x snap-mandatory">
                    {newsLoading ? (
                        Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="flex-shrink-0 w-[280px] snap-start">
                                <Skeleton className="h-24 w-full rounded-xl" />
                            </div>
                        ))
                    ) : news.length > 0 ? (
                        news.map((article, idx) => (
                            <a
                                key={article._id || idx}
                                href={article.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-shrink-0 w-[280px] snap-start group"
                            >
                                <div className="bg-card border rounded-xl p-3 h-full hover:bg-accent/50 transition-colors">
                                    <div className="flex items-start gap-2">
                                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                                            <span className="text-[10px] font-bold text-primary">{idx + 1}</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors leading-snug">
                                                {article.title}
                                            </p>
                                            <div className="flex items-center gap-2 mt-1.5">
                                                <span className="text-[10px] text-muted-foreground font-medium">
                                                    {article.source}
                                                </span>
                                                <span className="text-muted-foreground/50">•</span>
                                                <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                                                    <Clock className="h-2.5 w-2.5" />
                                                    {formatTimeAgo(article.pubDate)}
                                                </span>
                                                <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity ml-auto" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </a>
                        ))
                    ) : (
                        <div className="flex-shrink-0 w-full text-center py-4">
                            <p className="text-sm text-muted-foreground">No news available</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default MobileDiscoverCards;

