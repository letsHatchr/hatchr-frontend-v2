import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { UserAvatar } from '@/components/user-avatar';
import { TiptapRenderer } from '@/components/editor';
import { Eye, Users, FileText } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import type { Project } from '../types';
import { ProjectSettingsMenu } from './project-settings-menu';

interface ProjectSidebarProps {
    project: Project;
    isOwner: boolean;
    isTeamMember: boolean;
    isWatching: boolean;
    onWatchToggle: () => void;
    watchLoading?: boolean;
}

export function ProjectSidebar({
    project,
    isOwner,
    isTeamMember,
    isWatching,
    onWatchToggle,
    watchLoading = false,
}: ProjectSidebarProps) {
    const navigate = useNavigate();

    return (
        <aside className="w-full space-y-6">
            {/* Project Header */}
            <div>
                <h1 className="text-2xl font-bold mb-2">{project.title}</h1>
                <a
                    href={`/${project.user.username}`}
                    className="text-sm text-muted-foreground hover:underline"
                >
                    by @{project.user.username}
                </a>
            </div>

            {/* Description */}
            {project.description && (
                <div className="prose prose-sm dark:prose-invert max-w-none">
                    <TiptapRenderer content={project.description} />
                </div>
            )}

            {/* Watch Button (for non-owners) */}
            {!isOwner && (
                <Button
                    onClick={onWatchToggle}
                    disabled={watchLoading}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                >
                    {watchLoading ? 'Loading...' : isWatching ? 'Watching' : 'Watch'}
                </Button>
            )}

            {/* Settings Menu (owners only) */}
            {isOwner && <ProjectSettingsMenu project={project} />}

            {/* Stats */}
            <Card className="p-4">
                <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Eye className="h-4 w-4" />
                            <span>Watchers</span>
                        </div>
                        <span className="font-semibold">{project.watchers?.length || 0}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <FileText className="h-4 w-4" />
                            <span>Updates</span>
                        </div>
                        <span className="font-semibold">{project.posts?.length || 0}</span>
                    </div>
                </div>
            </Card>

            {/* Team Section */}
            <div className="space-y-3">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Team
                </h3>

                {/* Owner */}
                <div className="flex items-center gap-2">
                    <UserAvatar
                        src={project.user.avatar}
                        name={project.user.name}
                        username={project.user.username}
                        size="sm"
                    />
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{project.user.name}</p>
                        <p className="text-xs text-muted-foreground">Owner</p>
                    </div>
                </div>

                {/* Partners */}
                {project.partners?.map((partner) => (
                    <div key={partner.user._id} className="flex items-center gap-2">
                        <UserAvatar
                            src={partner.user.avatar}
                            name={partner.user.name}
                            username={partner.user.username}
                            size="sm"
                        />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{partner.user.name}</p>
                            <p className="text-xs text-muted-foreground">{partner.role}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* View Files Button */}
            <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate({ to: `/project/${project.slug || project._id}/files` })}
            >
                📁 View Files
            </Button>

            {/* Category & Tags */}
            <div className="space-y-2">
                {project.category && (
                    <div>
                        <Badge variant="default">{project.category}</Badge>
                    </div>
                )}
                {project.tags && project.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                        {project.tags.map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                            </Badge>
                        ))}
                    </div>
                )}
            </div>
        </aside>
    );
}
