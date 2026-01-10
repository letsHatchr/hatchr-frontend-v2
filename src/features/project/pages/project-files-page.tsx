import { useParams, useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle } from 'lucide-react';
import { useAuthStore } from '@/store';
import {
    useProject,
    useWatchProject,
    useUnwatchProject,
} from '../hooks/use-project';
import { ProjectSidebar, FilesList } from '../components';
import { toast } from '@/lib/toast';

export function ProjectFilesPage() {
    const { slug } = useParams({ strict: false });
    const navigate = useNavigate();
    const { user: currentUser } = useAuthStore();

    const { data: project, isLoading, isError } = useProject(slug as string);
    const watchMutation = useWatchProject();
    const unwatchMutation = useUnwatchProject();

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

    // Check permissions
    const isOwner = currentUser?._id === project.user._id;
    const isTeamMember =
        isOwner ||
        project.partners?.some((p) => p.user._id === currentUser?._id);
    const isWatching = project.watchers?.includes(currentUser?._id || '');

    // Handle watch/unwatch
    const handleWatchToggle = async () => {
        if (!currentUser) {
            toast.error('Please log in to watch this project');
            return;
        }

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

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl">
            {/* Cover Image */}
            {project.coverImage && (
                <div className="relative h-64 mb-8 rounded-lg overflow-hidden">
                    <img
                        src={project.coverImage}
                        alt={project.title}
                        className="w-full h-full object-cover"
                    />
                </div>
            )}

            {/* Layout: Sidebar + Main Content */}
            <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
                {/* Same Sidebar - Full width on mobile, fixed width on desktop */}
                <div className="w-full lg:w-80 flex-shrink-0">
                    <ProjectSidebar
                        project={project}
                        isOwner={isOwner}
                        isTeamMember={isTeamMember}
                        isWatching={isWatching}
                        onWatchToggle={handleWatchToggle}
                        watchLoading={watchMutation.isPending || unwatchMutation.isPending}
                    />
                </div>

                {/* Files Content */}
                <main className="flex-1 min-w-0">
                    <div className="mb-6">
                        <h2 className="text-xl sm:text-2xl font-bold mb-2">Project Files</h2>
                        <p className="text-muted-foreground text-sm sm:text-base">
                            View and download files attached to this project
                        </p>
                    </div>

                    {/* Files List */}
                    <FilesList projectId={project._id} isTeamMember={isTeamMember} />
                </main>
            </div>
        </div>
    );
}
