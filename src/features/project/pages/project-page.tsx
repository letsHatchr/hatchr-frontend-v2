import { useParams, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Plus, AlertCircle } from 'lucide-react';
import { useAuthStore } from '@/store';
import { toast } from '@/lib/toast';
import {
    useProject,
    useWatchProject,
    useUnwatchProject,
} from '../hooks/use-project';
import { ProjectSidebar, ProjectTimeline } from '../components';

export function ProjectPage() {
    const { slug } = useParams({ strict: false });
    const navigate = useNavigate();
    const { user: currentUser } = useAuthStore();

    const { data: project, isLoading, isError } = useProject(slug as string);
    const watchMutation = useWatchProject();
    const unwatchMutation = useUnwatchProject();

    const [showPostModal, setShowPostModal] = useState(false);

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

    const handleAddUpdate = () => {
        // TODO: Open create post modal with projectId pre-filled
        setShowPostModal(true);
        toast.info('Create post modal coming soon');
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

            {/* Archived Banner */}
            {project.isArchived && (
                <Alert className="mb-6">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        This project is archived. Only team members can view it.
                    </AlertDescription>
                </Alert>
            )}

            {/* Layout: Sidebar + Main Content */}
            <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
                {/* Left Sidebar - Full width on mobile, fixed width on desktop */}
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

                {/* Main Content */}
                <main className="flex-1 min-w-0">
                    {/* Header with Add Update Button */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                        <h2 className="text-xl sm:text-2xl font-bold">Project Timeline</h2>
                        {isTeamMember && (
                            <Button onClick={handleAddUpdate} className="w-full sm:w-auto">
                                <Plus className="mr-2 h-4 w-4" />
                                Add Update
                            </Button>
                        )}
                    </div>

                    {/* Timeline */}
                    <ProjectTimeline
                        projectSlug={slug as string}
                        isTeamMember={isTeamMember}
                        onAddUpdate={handleAddUpdate}
                    />
                </main>
            </div>
        </div>
    );
}
