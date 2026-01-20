import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { UserAvatar } from '@/components/user-avatar';
import { Eye, Users, FileText } from 'lucide-react';
import type { Project } from '../types';
import { ProjectSettingsMenu } from './project-settings-menu';

interface ProjectSidebarProps {
    project: Project;
    isOwner: boolean;
    isWatching: boolean;
    onWatchToggle: () => void;
    watchLoading?: boolean;
}

export function ProjectSidebar({
    project,
    isOwner,
    isWatching,
    onWatchToggle,
    watchLoading = false,
}: ProjectSidebarProps) {

    return (
        <aside className="w-full space-y-6">
            <div>
                <h1 className="text-2xl font-bold mb-2">{project.title}</h1>
                {project.user ? (
                    <a
                        href={`/${project.user.username}`}
                        className="text-sm text-muted-foreground hover:underline"
                    >
                        by @{project.user.username}
                    </a>
                ) : (
                    <span className="text-sm text-muted-foreground">by @unknown</span>
                )}
            </div>

            {/* Description */}


            {/* Navigation Buttons */}
            <div className="space-y-2">
                {window.location.pathname.includes('/files') ? (
                    <a href={`/project/${project.slug || project._id}`} className="block">
                        <Button variant="outline" className="w-full justify-start gap-2">
                            <svg
                                width="16"
                                height="16"
                                viewBox="0 0 15 15"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4"
                            >
                                <path
                                    d="M7.5 0.875L1.25 5.25V13.375C1.25 13.6069 1.34211 13.8293 1.50612 13.9933C1.67013 14.1573 1.89257 14.25 2.125 14.25H12.875C13.1074 14.25 13.3299 14.1573 13.4939 13.9933C13.6579 13.8293 13.75 13.6069 13.75 13.375V5.25L7.5 0.875ZM8.125 13H6.875V8.625H8.125V13ZM9.375 13V8.625C9.375 8.29348 9.2433 7.97554 9.00888 7.74112C8.77446 7.5067 8.45652 7.375 8.125 7.375H6.875C6.54348 7.375 6.22554 7.5067 5.99112 7.74112C5.7567 7.97554 5.625 8.29348 5.625 8.625V13H2.5V5.70625L7.5 2.20625L12.5 5.70625V13H9.375Z"
                                    fill="currentColor"
                                    fillRule="evenodd"
                                    clipRule="evenodd"
                                />
                            </svg>
                            Project Timeline
                        </Button>
                    </a>
                ) : (
                    <a href={`/project/${project.slug || project._id}/files`} className="block">
                        <Button variant="outline" className="w-full justify-start gap-2">
                            <FileText className="h-4 w-4" />
                            Project Files
                            <Badge variant="secondary" className="ml-auto text-xs">
                                {project.files?.length || 0}
                            </Badge>
                        </Button>
                    </a>
                )}
            </div>

            {/* Watch Button (for non-owners) */}
            {!isOwner && (
                <Button
                    onClick={onWatchToggle}
                    disabled={watchLoading}
                    variant={isWatching ? "secondary" : "default"}
                    className={isWatching ? "w-full" : "w-full bg-orange-500 hover:bg-orange-600 text-white"}
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
                        <span className="font-semibold">{project.followers?.length || 0}</span>
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
                {project.user ? (
                    <div className="flex items-center gap-2">
                        <UserAvatar
                            src={project.user.avatar}
                            name={project.user.name}
                            username={project.user.username}
                            size="sm"
                        />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{project.user.name || project.user.username}</p>
                            <p className="text-xs text-muted-foreground">Owner</p>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs">?</div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">Unknown</p>
                            <p className="text-xs text-muted-foreground">Owner</p>
                        </div>
                    </div>
                )}

                {/* Partners */}
                {project.partners
                    ?.filter(partner => partner.user && partner.user._id !== project.user?._id)
                    .map((partner) => (
                        <div key={partner.user._id} className="flex items-center gap-2">
                            <UserAvatar
                                src={partner.user.avatar}
                                name={partner.user.name}
                                username={partner.user.username}
                                size="sm"
                            />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{partner.user.name || partner.user.username}</p>
                                <p className="text-xs text-muted-foreground">{partner.role}</p>
                            </div>
                        </div>
                    ))}
            </div>



            {/* Categories & Tags */}
            <div className="space-y-2">
                <div className="flex flex-wrap gap-1">
                    {project.categories && project.categories.length > 0 ? (
                        project.categories.map((cat) => (
                            <Badge key={cat} variant="default">{cat}</Badge>
                        ))
                    ) : project.category ? (
                        <Badge variant="default">{project.category}</Badge>
                    ) : null}
                </div>
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
