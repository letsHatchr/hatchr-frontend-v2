'use client';

import { TrendingUp, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useTrendingProjects } from '../hooks/use-sidebar';

export function TrendingProjects() {
    const { data, isLoading, isError } = useTrendingProjects(5);

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    Trending Projects
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
                                <Skeleton className="h-3 w-20" />
                            </div>
                        </div>
                    ))
                ) : isError ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                        Unable to load projects
                    </p>
                ) : data?.projects && data.projects.length > 0 ? (
                    data.projects.map((project) => (
                        <a
                            key={project._id}
                            href={`/project/${project.slug || project._id}`}
                            className="flex items-center gap-3 rounded-lg p-2 hover:bg-accent transition-colors overflow-hidden"
                        >
                            {/* Project Image */}
                            {project.coverImage ? (
                                <img
                                    src={project.coverImage}
                                    alt={project.title}
                                    className="h-10 w-10 rounded-lg object-cover flex-shrink-0"
                                />
                            ) : (
                                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                    <span className="text-primary font-bold text-sm">
                                        {project.title?.charAt(0)?.toUpperCase() || 'P'}
                                    </span>
                                </div>
                            )}

                            {/* Info */}
                            <div className="flex-1 min-w-0 overflow-hidden">
                                <p className="text-sm font-medium truncate">{project.title}</p>
                                <p className="text-xs text-muted-foreground truncate">
                                    by @{project.user?.username || 'unknown'}
                                </p>
                            </div>

                            {/* Watchers */}
                            <div className="flex items-center gap-1 text-xs text-muted-foreground flex-shrink-0">
                                <Eye className="h-3 w-3" />
                                <span>{project.followers?.length ?? 0}</span>
                            </div>
                        </a>
                    ))
                ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                        No trending projects
                    </p>
                )}
            </CardContent>
        </Card>
    );
}

export default TrendingProjects;
