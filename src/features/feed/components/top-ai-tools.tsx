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
                        <div key={i} className="flex items-center gap-3 p-2">
                            <Skeleton className="h-10 w-10 rounded-lg" />
                            <div className="flex-1 space-y-1">
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-3 w-full" />
                            </div>
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
                    tools.map((tool) => (
                        <a
                            key={tool.id}
                            href={tool.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex items-center gap-3 rounded-lg p-2 hover:bg-accent transition-colors"
                        >
                            {/* Tool Thumbnail */}
                            {tool.thumbnail ? (
                                <img
                                    src={tool.thumbnail}
                                    alt={tool.name}
                                    className="h-10 w-10 rounded-lg object-cover flex-shrink-0"
                                />
                            ) : (
                                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center flex-shrink-0">
                                    <Sparkles className="h-5 w-5 text-primary" />
                                </div>
                            )}

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1">
                                    <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                                        {tool.name}
                                    </p>
                                    <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-primary flex-shrink-0" />
                                </div>
                                <p className="text-xs text-muted-foreground line-clamp-1">
                                    {tool.tagline}
                                </p>
                            </div>

                            {/* Votes */}
                            <Badge variant="secondary" className="flex-shrink-0 text-xs">
                                ▲ {tool.votes}
                            </Badge>
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
