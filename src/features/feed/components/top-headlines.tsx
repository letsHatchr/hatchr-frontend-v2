'use client';

import { Newspaper, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

interface Headline {
    _id: string;
    title: string;
    description?: string;
    url: string;
    source?: string;
    pubDate?: string;
}

interface HeadlinesResponse {
    articles: Headline[];
}

async function fetchHeadlines(): Promise<HeadlinesResponse> {
    const response = await api.get('/news/all?limit=5&sort=newest');
    return response.data;
}

export function TopHeadlines() {
    const { data, isLoading, isError } = useQuery({
        queryKey: ['top-headlines'],
        queryFn: fetchHeadlines,
        staleTime: 1000 * 60 * 10, // 10 minutes
        refetchOnWindowFocus: false,
    });

    const headlines = data?.articles || [];

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                    <Newspaper className="h-4 w-4 text-primary" />
                    Top Headlines
                </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2">
                {isLoading ? (
                    // Loading skeleton
                    Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="space-y-2 p-2">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-3 w-3/4" />
                        </div>
                    ))
                ) : isError ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                        Unable to load headlines
                    </p>
                ) : headlines.length > 0 ? (
                    headlines.slice(0, 5).map((headline, index) => (
                        <a
                            key={index}
                            href={headline.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group block rounded-lg p-2 hover:bg-accent transition-colors"
                        >
                            <div className="flex items-start gap-2">
                                <span className="text-xs font-bold text-primary mt-0.5 flex-shrink-0">
                                    {index + 1}.
                                </span>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                                        {headline.title}
                                    </p>
                                    {headline.source && (
                                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                            {headline.source}
                                            <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </p>
                                    )}
                                </div>
                            </div>
                        </a>
                    ))
                ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                        No headlines available
                    </p>
                )}
            </CardContent>
        </Card>
    );
}

export default TopHeadlines;
