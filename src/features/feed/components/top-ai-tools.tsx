'use client';

import { Sparkles, ExternalLink, ArrowUpRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

interface AITool {
    id: string;
    name: string;
    tagline: string;
    url: string;
    thumbnail?: string | null;
    votes: number;
    topics?: string[];
}

async function fetchAITools(): Promise<{ data: AITool[] }> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    try {
        const response = await api.get('/product-hunt/top-ai-tools?limit=5', {
            signal: controller.signal
        });
        clearTimeout(timeoutId);
        return response.data;
    } catch (error) {
        clearTimeout(timeoutId);
        throw error;
    }
}

export function TopAITools() {
    const { data, isLoading, isError } = useQuery({
        queryKey: ['top-ai-tools'],
        queryFn: fetchAITools,
        staleTime: 1000 * 60 * 30, // 30 minutes
        refetchOnWindowFocus: false,
        retry: 1, // Only retry once
    });

    const tools = data?.data || [];

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                    <Sparkles className="h-4 w-4 text-primary" />
                    Top AI Tools
                </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-1">
                {isLoading ? (
                    // Loading skeleton
                    Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="flex items-start gap-3 p-3 border-b last:border-b-0">
                            <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
                            <div className="flex-1 space-y-2">
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-3 w-full" />
                                <div className="flex gap-1.5 pt-1">
                                    <Skeleton className="h-5 w-16 rounded-full" />
                                    <Skeleton className="h-5 w-20 rounded-full" />
                                </div>
                            </div>
                            <Skeleton className="h-12 w-12 rounded-lg flex-shrink-0" />
                        </div>
                    ))
                ) : isError ? (
                    <div className="text-center py-4">
                        <p className="text-sm text-muted-foreground">Unable to load AI tools</p>
                        <a
                            href="https://www.producthunt.com/topics/artificial-intelligence"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-primary hover:underline mt-1 inline-block"
                        >
                            Browse on Product Hunt →
                        </a>
                    </div>
                ) : tools.length > 0 ? (
                    tools.map((tool, index) => (
                        <a
                            key={tool.id}
                            href={tool.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex items-start gap-3 rounded-lg p-3 hover:bg-accent transition-colors border-b last:border-b-0"
                        >
                            {/* Rank Badge */}
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                <span className="text-sm font-bold text-primary">#{index + 1}</span>
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0 space-y-1.5">
                                <div className="flex items-center gap-2">
                                    <p className="text-sm font-semibold truncate group-hover:text-primary transition-colors">
                                        {tool.name}
                                    </p>
                                    <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-primary flex-shrink-0" />
                                </div>

                                {/* Tagline / Description */}
                                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                                    {tool.tagline}
                                </p>

                                {/* Category Tags */}
                                {tool.topics && tool.topics.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5 pt-1">
                                        {tool.topics.slice(0, 2).map((topic, i) => (
                                            <Badge
                                                key={i}
                                                variant="outline"
                                                className="text-[10px] px-2 py-0 h-5 font-medium text-primary border-primary/30 bg-primary/5"
                                            >
                                                {topic}
                                            </Badge>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Tool Thumbnail */}
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
                        </a>
                    ))
                ) : (
                    <div className="text-center py-4">
                        <p className="text-sm text-muted-foreground">No AI tools available</p>
                        <a
                            href="https://www.producthunt.com/topics/artificial-intelligence"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-primary hover:underline mt-1 inline-block"
                        >
                            Explore on Product Hunt →
                        </a>
                    </div>
                )}

                {/* Product Hunt attribution */}
                {tools.length > 0 && (
                    <div className="pt-2 border-t mt-2">
                        <a
                            href="https://www.producthunt.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                        >
                            Powered by Product Hunt
                            <ExternalLink className="h-3 w-3" />
                        </a>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

export default TopAITools;
