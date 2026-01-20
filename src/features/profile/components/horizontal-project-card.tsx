'use client';

import { Eye, ArrowBigUp, MessageCircle } from 'lucide-react';
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
                {/* Responsive layout: vertical on mobile, horizontal on sm+ */}
                <div className="flex flex-col sm:flex-row min-w-0 overflow-hidden">
                    {/* Cover Image - Full width on mobile, 40% on sm+ */}
                    <div className="relative w-full sm:w-[40%] aspect-video sm:aspect-auto sm:self-stretch flex-shrink-0">
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

                    {/* Content - Full width on mobile, 60% on sm+ */}
                    <CardContent className="flex-1 w-full sm:w-[60%] p-4 flex flex-col justify-between min-h-[120px] sm:min-h-[140px] min-w-0 overflow-hidden">
                        <div className="min-w-0 overflow-hidden">
                            <h3 className="font-semibold text-base text-foreground group-hover:text-primary transition-colors mb-1 line-clamp-2 sm:truncate">
                                {project.title}
                            </h3>

                            {/* Categories */}
                            <div className="flex flex-wrap gap-1 mb-2">
                                {project.categories && project.categories.length > 0 ? (
                                    project.categories.slice(0, 3).map((cat) => (
                                        <span key={cat} className="text-[10px] font-medium text-orange-500 bg-orange-500/10 px-1.5 py-0.5 rounded">
                                            {cat}
                                        </span>
                                    ))
                                ) : project.category ? (
                                    <span className="text-[10px] font-medium text-orange-500 bg-orange-500/10 px-1.5 py-0.5 rounded">
                                        {project.category}
                                    </span>
                                ) : null}
                                {project.categories && project.categories.length > 3 && (
                                    <span className="text-[10px] font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                                        +{project.categories.length - 3}
                                    </span>
                                )}
                            </div>

                            {project.description && (
                                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                                    {project.description}
                                </p>
                            )}
                        </div>

                        {/* Stats row */}
                        <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1" title="Watchers">
                                <Eye className="h-3.5 w-3.5" />
                                <span>{project.followers?.length || 0}</span>
                            </span>
                            <span className="flex items-center gap-1" title="Total Upvotes">
                                <ArrowBigUp className="h-4 w-4" />
                                <span>{project.totalUpvotes || 0}</span>
                            </span>
                            <span className="flex items-center gap-1" title="Total Comments">
                                <MessageCircle className="h-3.5 w-3.5" />
                                <span>{project.totalComments || 0}</span>
                            </span>
                        </div>
                    </CardContent>
                </div>
            </Card>
        </a>
    );
}

export default HorizontalProjectCard;
