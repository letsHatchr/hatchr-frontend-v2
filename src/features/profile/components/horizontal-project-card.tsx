'use client';

import { Eye, Heart, MessageCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import type { Project } from '../types';

interface HorizontalProjectCardProps {
    project: Project;
}

export function HorizontalProjectCard({ project }: HorizontalProjectCardProps) {
    return (
        <a
            href={`/project/${project.slug || project._id}`}
            className="block group"
        >
            <Card className="overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm hover:bg-card/80 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 py-0 gap-0 min-w-0">
                <div className="flex min-w-0 overflow-hidden">
                    {/* Cover Image - Left side */}
                    <div className="relative w-52 flex-shrink-0 self-stretch">
                        {/* Posts count badge */}
                        {project.postsCount !== undefined && (
                            <div className="absolute top-2 left-2 z-10">
                                <Badge className="bg-black/60 text-white border-0 text-[10px] px-1.5 py-0.5">
                                    {project.postsCount} Posts
                                </Badge>
                            </div>
                        )}

                        {project.coverImage ? (
                            <img
                                src={project.coverImage}
                                alt={project.title}
                                className="absolute inset-0 h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                        ) : (
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-primary/20 to-primary/10 flex items-center justify-center">
                                <span className="text-4xl font-bold text-primary/50">
                                    {project.title?.charAt(0)?.toUpperCase() || 'P'}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Content - Right side */}
                    <CardContent className="flex-1 p-4 flex flex-col justify-between min-h-[140px] min-w-0 overflow-hidden" style={{ maxWidth: 'calc(100% - 13rem)' }}>
                        <div className="min-w-0 overflow-hidden">
                            <h3 className="font-semibold text-base text-foreground group-hover:text-primary transition-colors mb-1 overflow-hidden text-ellipsis whitespace-nowrap">
                                {project.title}
                            </h3>
                            {project.description && (
                                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                                    {project.description}
                                </p>
                            )}
                        </div>

                        {/* Stats row */}
                        <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                                <Eye className="h-3.5 w-3.5" />
                                <span>{project.watchers?.length || 0}</span>
                            </span>
                            <span className="flex items-center gap-1">
                                <Heart className="h-3.5 w-3.5" />
                                <span>{project.likes || 0}</span>
                            </span>
                            <span className="flex items-center gap-1">
                                <MessageCircle className="h-3.5 w-3.5" />
                                <span>{project.comments || 0}</span>
                            </span>
                        </div>
                    </CardContent>
                </div>
            </Card>
        </a>
    );
}

export default HorizontalProjectCard;
