
'use client';

/**
 * FilesList Component
 * Display project files with download, view, and delete functionality
 */

import { useState } from 'react';
import { Download, Trash2, Loader2, AlertCircle, File, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UserAvatar } from '@/components/user-avatar';
import { useAuthStore } from '@/store';
import { toast } from '@/lib/toast';
import { useProjectFiles, useDownloadFile, useDeleteFile } from '../hooks/use-files';
import { FilePreviewModal } from '@/components/file-preview-modal';
import {
    getFileIcon,
    formatFileSize,
    getFileExtension,
    getFileCategory,
    getCategoryColor,
} from '../utils/file-helpers';

interface FilesListProps {
    projectId: string;
    isTeamMember?: boolean;
}

export function FilesList({ projectId, isTeamMember = false }: FilesListProps) {
    const [page, setPage] = useState(1);
    const [previewFile, setPreviewFile] = useState<any>(null);
    const { user: currentUser } = useAuthStore();

    const { data, isLoading, isError, refetch } = useProjectFiles(projectId, page);
    const downloadMutation = useDownloadFile();
    const deleteMutation = useDeleteFile();

    const files = data?.files ?? [];
    const pagination = data?.pagination ?? { page: 1, pages: 1, total: 0, limit: 20 };

    const handleDownload = async (fileId: string, fileName: string) => {
        try {
            await downloadMutation.mutateAsync(fileId);
            toast.success(`Downloading ${fileName}`);
        } catch {
            toast.error('Failed to download file');
        }
    };

    const handleDelete = async (fileId: string, fileName: string) => {
        if (!confirm(`Are you sure you want to delete "${fileName}"? This cannot be undone.`)) {
            return;
        }

        try {
            await deleteMutation.mutateAsync(fileId);
            toast.success('File deleted');

            // If page is now empty and not first page, go to previous page
            if (files.length === 1 && page > 1) {
                setPage(page - 1);
            } else {
                refetch();
            }
        } catch {
            toast.error('Failed to delete file');
        }
    };

    const canDeleteFile = (file: { uploadedBy?: { _id: string } }) => {
        if (!currentUser) return false;
        // User can delete if they uploaded it or are a team member
        return file.uploadedBy?._id === currentUser._id || isTeamMember;
    };

    // Loading state
    if (isLoading) {
        return (
            <Card className="p-8">
                <div className="flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    <span className="ml-3 text-muted-foreground">Loading files...</span>
                </div>
            </Card>
        );
    }

    // Error state
    if (isError) {
        return (
            <Card className="p-6 border-destructive">
                <div className="flex items-center gap-3 text-destructive">
                    <AlertCircle className="h-6 w-6 flex-shrink-0" />
                    <p>Failed to load files. Please try again.</p>
                </div>
                <Button onClick={() => refetch()} className="mt-4">
                    Try Again
                </Button>
            </Card>
        );
    }

    // Empty state
    if (files.length === 0) {
        return (
            <Card className="p-8 text-center">
                <File className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No files yet</h3>
                <p className="text-sm text-muted-foreground">
                    Files uploaded to this project will appear here
                </p>
            </Card>
        );
    }

    return (
        <Card className="overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b">
                <h3 className="text-lg font-semibold">
                    Project Files ({pagination.total})
                </h3>
            </div>

            {/* Files list */}
            <div className="divide-y">
                {files.map((file) => {
                    const extension = getFileExtension(file.originalFileName);
                    const FileIcon = getFileIcon(extension);
                    const category = getFileCategory(extension);
                    const categoryColor = getCategoryColor(category);
                    const isDeleting = deleteMutation.isPending && deleteMutation.variables === file._id;
                    const isDownloading = downloadMutation.isPending;

                    return (
                        <div
                            key={file._id}
                            className="p-4 hover:bg-accent/50 transition-colors"
                        >
                            <div className="flex items-start gap-3 sm:gap-4">
                                {/* File icon */}
                                <div className="flex-shrink-0">
                                    <div
                                        className="h-10 w-10 sm:h-12 sm:w-12 bg-primary/10 rounded-lg flex items-center justify-center cursor-pointer hover:bg-primary/20 transition-colors"
                                        onClick={() => setPreviewFile(file)}
                                    >
                                        <FileIcon className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                                    </div>
                                </div>

                                {/* File info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4">
                                        <div className="flex-1 min-w-0">
                                            <h4
                                                className="text-sm font-medium truncate mb-1 cursor-pointer hover:underline hover:text-primary"
                                                onClick={() => setPreviewFile(file)}
                                            >
                                                {file.originalFileName}
                                            </h4>

                                            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                                <span>{formatFileSize(file.fileSize)}</span>
                                                <span>•</span>
                                                <Badge className={`${categoryColor} text-[10px]`}>
                                                    {category}
                                                </Badge>
                                                <span className="hidden sm:inline">•</span>
                                                <span className="hidden sm:inline">
                                                    {formatDistanceToNow(new Date(file.createdAt), { addSuffix: true })}
                                                </span>
                                                {file.downloadCount > 0 && (
                                                    <>
                                                        <span className="hidden sm:inline">•</span>
                                                        <span className="hidden sm:inline">
                                                            {file.downloadCount} download{file.downloadCount !== 1 ? 's' : ''}
                                                        </span>
                                                    </>
                                                )}
                                            </div>

                                            {/* Uploader info */}
                                            {file.uploadedBy && (
                                                <div className="flex items-center gap-2 mt-2">
                                                    <UserAvatar
                                                        src={file.uploadedBy.avatar}
                                                        name={file.uploadedBy.name}
                                                        username={file.uploadedBy.username}
                                                        size="xs"
                                                    />
                                                    <span className="text-xs text-muted-foreground">
                                                        {file.uploadedBy.name}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Action buttons */}
                                        <div className="flex items-center gap-1 flex-shrink-0">
                                            {/* Preview button */}
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => setPreviewFile(file)}
                                                className="text-muted-foreground hover:text-foreground"
                                                title="Preview"
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Button>

                                            {/* Download button */}
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDownload(file._id, file.originalFileName)}
                                                disabled={isDownloading || isDeleting}
                                                title="Download"
                                            >
                                                {isDownloading ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <Download className="h-4 w-4" />
                                                )}
                                            </Button>

                                            {/* Delete button (if user can delete) */}
                                            {canDeleteFile(file) && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDelete(file._id, file.originalFileName)}
                                                    disabled={isDeleting || isDownloading}
                                                    className="text-destructive hover:text-destructive"
                                                    title="Delete"
                                                >
                                                    {isDeleting ? (
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <Trash2 className="h-4 w-4" />
                                                    )}
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
                <div className="p-4 border-t">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                            Page {pagination.page} of {pagination.pages}
                        </p>

                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setPage(page - 1)}
                                disabled={page === 1}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>

                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setPage(page + 1)}
                                disabled={page === pagination.pages}
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            <FilePreviewModal
                open={!!previewFile}
                onOpenChange={(open) => !open && setPreviewFile(null)}
                file={previewFile}
            />
        </Card>
    );
}

export default FilesList;
