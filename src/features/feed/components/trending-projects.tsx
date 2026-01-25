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
                    data.projects.map((project, index) => {
                        let rankIcon;
                        if (index === 0) rankIcon = <div className="flex h-6 w-6 items-center justify-center rounded-full bg-yellow-500/10 text-yellow-600 font-bold text-xs ring-1 ring-yellow-500/20">1</div>;
                        else if (index === 1) rankIcon = <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-300/10 text-slate-400 font-bold text-xs ring-1 ring-slate-400/20">2</div>;
                        else if (index === 2) rankIcon = <div className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-700/10 text-amber-700 font-bold text-xs ring-1 ring-amber-700/20">3</div>;
                        else rankIcon = <span className="text-sm font-medium text-muted-foreground w-6 text-center">{index + 1}</span>;

                        return (
                            <a
                                key={project._id}
                                href={`/project/${project.slug || project._id}`}
                                className="group flex items-center gap-3 rounded-xl p-2 hover:bg-muted/50 transition-all overflow-hidden border border-transparent hover:border-border"
                            >
                                {/* Rank */}
                                <div className="flex-shrink-0">
                                    {rankIcon}
                                </div>

                                {/* Project Image */}
                                {project.coverImage ? (
                                    <img
                                        src={project.coverImage}
                                        alt={project.title}
                                        className="h-10 w-10 rounded-lg object-cover flex-shrink-0 border border-border/50"
                                    />
                                ) : (
                                    <div className="h-10 w-10 rounded-lg bg-primary/5 flex items-center justify-center flex-shrink-0 border border-primary/10 group-hover:border-primary/20 transition-colors">
                                        <span className="text-primary font-bold text-sm">
                                            {project.title?.charAt(0)?.toUpperCase() || 'P'}
                                        </span>
                                    </div>
                                )}

                                {/* Info */}
                                <div className="flex-1 min-w-0 overflow-hidden">
                                    <p className="text-sm font-semibold truncate group-hover:text-primary transition-colors">{project.title}</p>
                                    <p className="text-xs text-muted-foreground truncate">
                                        by @{project.user?.username || 'unknown'}
                                    </p>
                                </div>

                                {/* Watchers */}
                                <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground bg-muted/50 px-2 py-1 rounded-full flex-shrink-0">
                                    <Eye className="h-3 w-3" />
                                    <span>{project.followers?.length ?? 0}</span>
                                </div>
                            </a>
                        );
                    })
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
