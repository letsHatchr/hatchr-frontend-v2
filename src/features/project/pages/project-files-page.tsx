
import { useParams, useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, Upload } from 'lucide-react';
import { useAuthStore } from '@/store';
import {
    useProject,
    useWatchProject,
    useUnwatchProject,
} from '../hooks/use-project';
import { ProjectSidebar, FilesList } from '../components';
import { toast } from '@/lib/toast';
import { useRef } from 'react';
import { useUploadFile } from '../hooks/use-files';

export function ProjectFilesPage() {
    const { slug } = useParams({ strict: false });
    const navigate = useNavigate();
    const { user: currentUser } = useAuthStore();

    const { data: project, isLoading, isError } = useProject(slug as string);
    const watchMutation = useWatchProject();
    const unwatchMutation = useUnwatchProject();
    const uploadMutation = useUploadFile();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Check permissions
    const isOwner = currentUser?._id === project?.user._id;
    const isTeamMember =
        isOwner ||
        project?.partners?.some((p) => p.user._id === currentUser?._id);
    const isWatching = project?.followers?.includes(currentUser?._id || '');

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const files = Array.from(e.target.files);

            // Limit to 10 files
            if (files.length > 10) {
                toast.error("Maximum 10 files allowed");
                return;
            }

            try {
                let successCount = 0;
                const toastId = toast.loading(`Uploading ${files.length} files...`);

                for (const file of files) {
                    if (project?._id) {
                        await uploadMutation.mutateAsync({ projectId: project._id, file });
                        successCount++;
                    }
                }

                toast.dismiss(toastId);
                toast.success(`Successfully uploaded ${successCount} files`);
                if (fileInputRef.current) fileInputRef.current.value = '';

            } catch (error) {
                console.error(error);
                toast.error("Failed to upload some files");
            }
        }
    };

    const handleWatchToggle = async () => {
        if (!currentUser) {
            toast.error('Please log in to watch this project');
            return;
        }
        if (!project) return;

        try {
            if (isWatching) {
                await unwatchMutation.mutateAsync(project._id);
                toast.success('Stopped watching project');
            } else {
                await watchMutation.mutateAsync(project._id);
                toast.success('Now watching project');
            }
        } catch (error) {
            toast.error('Failed to update watch status');
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (isError || !project) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <Alert variant="destructive" className="max-w-md">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        Project not found or you don't have access to view it.
                    </AlertDescription>
                </Alert>
                <Button
                    onClick={() => navigate({ to: '/' })}
                    variant="outline"
                    className="mt-4"
                >
                    Go Home
                </Button>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl">
            {/* Layout: Sidebar + Main Content */}
            <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
                {/* Same Sidebar - Full width on mobile, fixed width on desktop */}
                <div className="w-full lg:w-80 flex-shrink-0">
                    <ProjectSidebar
                        project={project}
                        isOwner={!!isOwner}
                        isWatching={!!isWatching}
                        onWatchToggle={handleWatchToggle}
                        watchLoading={watchMutation.isPending || unwatchMutation.isPending}
                    />
                </div>

                {/* Files Content */}
                <main className="flex-1 min-w-0">
                    {/* Cover Image */}
                    {project.coverImage && (
                        <div className="relative h-48 mb-6 rounded-lg overflow-hidden">
                            <img
                                src={project.coverImage}
                                alt={project.title}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    )}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                        <div>
                            <h2 className="text-xl sm:text-2xl font-bold">Project Files</h2>
                            <p className="text-muted-foreground text-sm sm:text-base mt-1">
                                View and download files attached to this project
                            </p>
                        </div>
                    </div>

                    {isTeamMember && (
                        <div className="mb-4">
                            <Button onClick={() => fileInputRef.current?.click()} disabled={uploadMutation.isPending}>
                                {uploadMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                                Upload Files
                            </Button>
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                multiple
                                onChange={handleFileChange}
                            />
                        </div>
                    )}

                    {/* Files List */}
                    <FilesList projectId={project._id} isTeamMember={!!isTeamMember} />
                </main>
            </div>
        </div>
    );
}
