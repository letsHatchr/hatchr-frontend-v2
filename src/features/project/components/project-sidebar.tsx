'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { UserAvatar } from '@/components/user-avatar';
import { Eye, FileText, Image, Film, FileCode, Archive, ChevronRight, Download, Loader2 } from 'lucide-react';
import type { Project, ProjectFile } from '../types';
import { ProjectSettingsMenu } from './project-settings-menu';
import { FilePreviewModal } from '@/components/file-preview-modal';
import { useDownloadFile } from '../hooks/use-files';
import { toast } from '@/lib/toast';

interface ProjectSidebarProps {
    project: Project;
    isOwner: boolean;
    isWatching: boolean;
    onWatchToggle: () => void;
    watchLoading?: boolean;
}

// Helper to get file icon based on file type
function getFileIcon(fileType: string) {
    if (fileType.startsWith('image/')) return <Image className="h-4 w-4 text-blue-400" />;
    if (fileType.startsWith('video/')) return <Film className="h-4 w-4 text-purple-400" />;
    if (fileType.includes('pdf')) return <FileText className="h-4 w-4 text-red-400" />;
    if (fileType.includes('zip') || fileType.includes('rar') || fileType.includes('tar'))
        return <Archive className="h-4 w-4 text-yellow-400" />;
    if (fileType.includes('javascript') || fileType.includes('typescript') ||
        fileType.includes('python') || fileType.includes('json'))
        return <FileCode className="h-4 w-4 text-green-400" />;
    return <FileText className="h-4 w-4 text-muted-foreground" />;
}

// Helper to format file size
function formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

export function ProjectSidebar({
    project,
    isOwner,
    isWatching,
    onWatchToggle,
    watchLoading = false,
}: ProjectSidebarProps) {
    const isOnFilesPage = window.location.pathname.includes('/files');
    const projectUrl = `/project/${project.slug || project._id}`;
    const filesUrl = `${projectUrl}/files`;

    const [previewFile, setPreviewFile] = useState<any>(null);
    const downloadMutation = useDownloadFile();

    // Get up to 4 most recent files
    const recentFiles = (project.files as ProjectFile[] || []).slice(0, 4);
    const totalFiles = project.files?.length || 0;
    const hasMoreFiles = totalFiles > 4;

    const handleDownload = async (e: React.MouseEvent, fileId: string, fileName: string) => {
        e.stopPropagation(); // Prevent opening preview
        try {
            await downloadMutation.mutateAsync(fileId);
            toast.success(`Downloading ${fileName}`);
        } catch {
            toast.error('Failed to download file');
        }
    };

    return (
        <aside className="w-full space-y-5">
            {/* Project Title */}
            <div>
                <h1 className="text-2xl font-bold">{project.title}</h1>
            </div>

            {/* Team Section - Owner + Partners */}
            <div className="space-y-2">
                {/* Owner */}
                {project.user && (
                    <a
                        href={`/${project.user.username}`}
                        className="flex items-center gap-3 p-2 -mx-2 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                        <UserAvatar
                            src={project.user.avatar}
                            name={project.user.name}
                            username={project.user.username}
                            size="md"
                        />
                        <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{project.user.name || project.user.username}</p>
                            <p className="text-xs text-muted-foreground">Owner</p>
                        </div>
                    </a>
                )}

                {/* Partners - Show each individually with name and role */}
                {project.partners && project.partners.filter(p => p.user && p.user._id !== project.user?._id).length > 0 && (
                    <div className="space-y-1 pt-1 border-t border-border/50">
                        <p className="text-xs font-medium text-muted-foreground px-2 pt-2">Team Members</p>
                        {project.partners
                            .filter(partner => partner.user && partner.user._id !== project.user?._id)
                            .map((partner) => (
                                <a
                                    key={partner.user._id}
                                    href={`/${partner.user.username}`}
                                    className="flex items-center gap-3 p-2 -mx-2 rounded-lg hover:bg-muted/50 transition-colors group"
                                >
                                    <UserAvatar
                                        src={partner.user.avatar}
                                        name={partner.user.name}
                                        username={partner.user.username}
                                        size="sm"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                                            {partner.user.name || partner.user.username}
                                        </p>
                                        <p className="text-xs text-muted-foreground">{partner.role || 'Team Member'}</p>
                                    </div>
                                </a>
                            ))}
                    </div>
                )}
            </div>

            {/* Categories & Tags */}
            {((project.categories?.length ?? 0) > 0 || project.category) && (
                <div className="flex flex-wrap gap-1.5">
                    {project.categories && project.categories.length > 0 ? (
                        project.categories.map((cat) => (
                            <Badge key={cat} variant="default" className="text-xs">{cat}</Badge>
                        ))
                    ) : project.category ? (
                        <Badge variant="default" className="text-xs">{project.category}</Badge>
                    ) : null}
                </div>
            )}

            {/* Stats Row - Horizontal */}
            <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Eye className="h-4 w-4" />
                    <span className="font-medium text-foreground">{project.followers?.length || 0}</span>
                    <span>Watchers</span>
                </div>
                <span className="text-muted-foreground">•</span>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    <span className="font-medium text-foreground">{project.posts?.length || 0}</span>
                    <span>Updates</span>
                </div>
            </div>

            {/* Project Files Preview Card - Normal card with primary header */}
            <Card className="overflow-hidden">
                {/* Header bar - changed to gray per user request */}
                <div className="p-3 bg-muted/40 border-b">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-primary" />
                            <span className="font-semibold text-sm text-primary">Project Files</span>
                        </div>
                        <Badge variant="secondary" className="text-xs bg-primary/10 text-primary hover:bg-primary/20 border-0 font-bold">
                            {totalFiles}
                        </Badge>
                    </div>
                </div>

                {totalFiles > 0 ? (
                    <div className="divide-y divide-border">
                        {recentFiles.map((file) => {
                            const isDownloading = downloadMutation.isPending && downloadMutation.variables === file._id;
                            return (
                                <div
                                    key={file._id}
                                    className="group flex items-center gap-3 px-3 py-2.5 hover:bg-muted/50 transition-colors cursor-pointer"
                                    onClick={() => setPreviewFile(file)}
                                >
                                    {getFileIcon(file.fileType)}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm truncate group-hover:text-primary transition-colors">{file.originalFileName}</p>
                                        <p className="text-xs text-muted-foreground">{formatFileSize(file.fileSize)}</p>
                                    </div>

                                    {/* Action Buttons - Visible on hover */}
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7 text-muted-foreground hover:text-foreground"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setPreviewFile(file);
                                            }}
                                            title="View"
                                        >
                                            <Eye className="h-3.5 w-3.5" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7 text-muted-foreground hover:text-foreground"
                                            onClick={(e) => handleDownload(e, file._id, file.originalFileName)}
                                            disabled={isDownloading}
                                            title="Download"
                                        >
                                            {isDownloading ? (
                                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                            ) : (
                                                <Download className="h-3.5 w-3.5" />
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="px-3 py-6 text-center text-sm text-muted-foreground">
                        <FileText className="h-8 w-8 mx-auto mb-2 opacity-30" />
                        <p>No files uploaded yet</p>
                    </div>
                )}

                {/* See All Files link */}
                {!isOnFilesPage && (
                    <a
                        href={filesUrl}
                        className="flex items-center justify-center gap-1 px-3 py-3 text-sm font-medium text-primary hover:text-primary/80 hover:bg-muted/50 transition-colors border-t"
                    >
                        {hasMoreFiles ? `See All Files (${totalFiles})` : 'View Files'}
                        <ChevronRight className="h-4 w-4" />
                    </a>
                )}

                {/* Back to Timeline link when on files page */}
                {isOnFilesPage && (
                    <a
                        href={projectUrl}
                        className="flex items-center justify-center gap-1 px-3 py-3 text-sm font-medium text-primary hover:text-primary/80 hover:bg-muted/50 transition-colors border-t"
                    >
                        ← Back to Timeline
                    </a>
                )}
            </Card>

            {/* Watch Button (for non-owners) */}
            {!isOwner && (
                <Button
                    onClick={onWatchToggle}
                    disabled={watchLoading}
                    variant={isWatching ? "secondary" : "default"}
                    className={isWatching ? "w-full" : "w-full bg-primary hover:bg-primary/90 text-primary-foreground"}
                >
                    {watchLoading ? 'Loading...' : isWatching ? '✓ Watching' : 'Watch Project'}
                </Button>
            )}

            {/* Settings Menu (owners only) - Moved to bottom */}
            {isOwner && (
                <div className="pt-2 border-t border-border/50">
                    <ProjectSettingsMenu project={project} />
                </div>
            )}

            <FilePreviewModal
                open={!!previewFile}
                onOpenChange={(open) => !open && setPreviewFile(null)}
                file={previewFile}
            />
        </aside>
    );
}
