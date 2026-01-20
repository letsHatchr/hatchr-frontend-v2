'use client';

import { Eye } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { UserAvatar } from '@/components/user-avatar';
import type { Project } from '../types';

interface ProjectCardProps {
    project: Project;
    showKeyBadge?: boolean;
}

export function ProjectCard({ project, showKeyBadge = false }: ProjectCardProps) {
    return (
        <a href={`/project/${project.slug || project._id}`} className="block group">
            <Card className="overflow-hidden hover:ring-2 hover:ring-primary/50 transition-all">
                {/* Cover Image */}
                <AspectRatio ratio={16 / 9}>
                    {project.coverImage ? (
                        <img
                            src={project.coverImage}
                            alt={project.title}
                            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                    ) : (
                        <div className="h-full w-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center">
                            <span className="text-4xl font-bold text-primary/60">
                                {project.title?.charAt(0)?.toUpperCase() || 'P'}
                            </span>
                        </div>
                    )}
                </AspectRatio>

                <CardContent className="p-4">
                    {/* Title */}
                    <h3 className="font-semibold text-lg truncate group-hover:text-primary transition-colors">
                        {project.title}
                    </h3>

                    {/* Description */}
                    {project.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                            {project.description}
                        </p>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between mt-4">
                        {/* Author */}
                        <div className="flex items-center gap-2">
                            <UserAvatar
                                src={project.user?.avatar}
                                name={project.user?.name || project.user?.username}
                                username={project.user?.username}
                                size="sm"
                            />
                            <span className="text-sm text-muted-foreground truncate">
                                @{project.user?.username || 'unknown'}
                            </span>
                        </div>

                        {/* Watchers */}
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Eye className="h-4 w-4" />
                            <span>{project.followers?.length || 0}</span>
                        </div>
                    </div>

                    {/* Key Project Badge */}
                    {showKeyBadge && project.isKeyProject && (
                        <div className="mt-3">
                            <span className="inline-flex items-center px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                                ⭐ Key Project
                            </span>
                        </div>
                    )}
                </CardContent>
            </Card>
        </a>
    );
}

export default ProjectCard;
