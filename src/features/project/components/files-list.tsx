import { useState, lazy, Suspense } from 'react';
import { Download, Trash2, Loader2, AlertCircle, File, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UserAvatar } from '@/components/user-avatar';
import { useAuthStore } from '@/store';
import { toast } from '@/lib/toast';
import { useProjectFiles, useDownloadFile, useDeleteFile } from '../hooks/use-files';
import {
    getFileIcon,
    formatFileSize,
    getFileExtension,
    getFileCategory,
    getCategoryColor,
} from '../utils/file-helpers';

// Lazy load the modal to avoid loading syntax highlighter on initial page load
const FilePreviewModal = lazy(() => import('@/components/file-preview-modal').then(module => ({ default: module.FilePreviewModal })));

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

            {/* Files grid - Modern card layout */}
            <div className="p-4 space-y-3">
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
                            className="group relative bg-card rounded-xl border border-border/50 hover:border-border hover:shadow-lg transition-all duration-200 overflow-hidden"
                        >
                            <div className="p-3">
                                <div className="flex items-start gap-3">
                                    <div
                                        className="flex-shrink-0 cursor-pointer"
                                        onClick={() => setPreviewFile(file)}
                                    >
                                        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center ring-1 ring-primary/10 group-hover:ring-primary/30 transition-all">
                                            <FileIcon className="h-5 w-5 text-primary" />
                                        </div>
                                    </div>

                                    {/* File info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex-1 min-w-0">
                                                {/* File name */}
                                                <h4
                                                    className="font-medium text-sm truncate cursor-pointer hover:text-primary transition-colors"
                                                    onClick={() => setPreviewFile(file)}
                                                >
                                                    {file.originalFileName}
                                                </h4>

                                                {/* Metadata row */}
                                                <div className="flex flex-wrap items-center gap-2 mt-1">
                                                    <span className="text-xs text-muted-foreground font-medium">
                                                        {formatFileSize(file.fileSize)}
                                                    </span>
                                                    <Badge className={`${categoryColor} text-[10px] font-medium px-1.5 py-0 h-5`}>
                                                        {category}
                                                    </Badge>
                                                </div>

                                                {/* Uploader info - Compact styling */}
                                                {file.uploadedBy && (
                                                    <div className="flex items-center gap-1.5 mt-1.5">
                                                        <UserAvatar
                                                            src={file.uploadedBy.avatar}
                                                            name={file.uploadedBy.name}
                                                            username={file.uploadedBy.username}
                                                            size="xs"
                                                            className="h-4 w-4 text-[9px]"
                                                        />
                                                        <span className="text-xs text-muted-foreground truncate max-w-[150px]">
                                                            {file.uploadedBy.name}
                                                        </span>
                                                        <span className="text-[10px] text-muted-foreground/60 whitespace-nowrap">
                                                            • {formatDistanceToNow(new Date(file.createdAt), { addSuffix: true })}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Action buttons - Refined with better hover states */}
                                            <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => setPreviewFile(file)}
                                                    className="h-9 w-9 rounded-lg hover:bg-primary/10 hover:text-primary"
                                                    title="Preview"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>

                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDownload(file._id, file.originalFileName)}
                                                    disabled={isDownloading || isDeleting}
                                                    className="h-9 w-9 rounded-lg hover:bg-green-500/10 hover:text-green-500"
                                                    title="Download"
                                                >
                                                    {isDownloading ? (
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <Download className="h-4 w-4" />
                                                    )}
                                                </Button>

                                                {canDeleteFile(file) && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleDelete(file._id, file.originalFileName)}
                                                        disabled={isDeleting || isDownloading}
                                                        className="h-9 w-9 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
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

            <Suspense fallback={null}>
                {previewFile && (
                    <FilePreviewModal
                        open={!!previewFile}
                        onOpenChange={(open) => !open && setPreviewFile(null)}
                        file={previewFile}
                    />
                )}
            </Suspense>
        </Card>
    );
}

export default FilesList;
