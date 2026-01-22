import { useParams, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Plus, AlertCircle } from 'lucide-react';
import { useAuthStore } from '@/store';
import { toast } from '@/lib/toast';
import { useSearch } from '@tanstack/react-router';
import {
    useProject,
    useWatchProject,
    useUnwatchProject,
} from '../hooks/use-project';
import { ProjectSidebar, ProjectTimeline } from '../components';
import { CreatePostModal } from '../components/create-post-modal';
import { TeamManagement } from '../components/team-management';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';


export function ProjectPage() {
    const { slug } = useParams({ strict: false });
    const search = useSearch({ from: '/project/$slug' });
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

    // Check permissions - add null safety for project.user
    const projectUserId = project.user?._id || project.user;
    console.log('CurrentUser:', currentUser?._id, 'ProjectOwner:', projectUserId);
    const isOwner = !!(currentUser?._id && projectUserId && currentUser._id === projectUserId);
    const isTeamMember =
        isOwner ||
        project.partners?.some((p) => p.user?._id === currentUser?._id);
    const isWatching = project.followers?.includes(currentUser?._id || '');

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
        setShowPostModal(true);
    };

    return (
        <div className="container mx-auto px-4 py-8 pb-24 lg:pb-8 max-w-7xl">
            {/* Cover Image */}


            {/* Layout: Sidebar + Main Content */}
            <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
                {/* Left Sidebar - Full width on mobile, fixed width on desktop */}
                <div className="w-full lg:w-80 flex-shrink-0">
                    <ProjectSidebar
                        project={project}
                        isOwner={isOwner}
                        isWatching={isWatching}
                        onWatchToggle={handleWatchToggle}
                        watchLoading={watchMutation.isPending || unwatchMutation.isPending}
                    />
                </div>

                {/* Main Content */}
                <main className="flex-1 min-w-0">
                    {/* Cover Image */}
                    {project.coverImage && (
                        <div className="relative h-48 mb-6 w-full overflow-hidden">
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

                    <Tabs
                        value={search.tab}
                        onValueChange={(val) => navigate({ to: '/project/$slug', params: { slug: slug as string }, search: { tab: val } })}
                        className="w-full"
                    >
                        <TabsList className="mb-6 w-full justify-start h-auto p-1 bg-muted/50 rounded-lg gap-1">
                            <TabsTrigger value="timeline" className="flex-1 sm:flex-none data-[state=active]:bg-background min-h-[40px] text-sm">Timeline</TabsTrigger>
                            <TabsTrigger value="team" className="flex-1 sm:flex-none data-[state=active]:bg-background min-h-[40px] text-sm">Team</TabsTrigger>
                            <TabsTrigger value="about" className="flex-1 sm:flex-none data-[state=active]:bg-background min-h-[40px] text-sm">About</TabsTrigger>
                        </TabsList>

                        <TabsContent value="timeline">
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
                        </TabsContent>

                        <TabsContent value="team">
                            <div className="bg-card rounded-lg border p-6">
                                <TeamManagement
                                    project={project}
                                    isOwner={isOwner}
                                    currentUser={currentUser}
                                />
                            </div>
                        </TabsContent>

                        <TabsContent value="about">
                            <div className="bg-card rounded-lg border p-6 space-y-6">
                                <div>
                                    <h3 className="text-lg font-semibold mb-2">About this Project</h3>
                                    <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                                        {project.description || "No description provided."}
                                    </p>
                                </div>
                                {project.categories && project.categories.length > 0 && (
                                    <div>
                                        <h4 className="text-sm font-medium mb-2">Categories</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {project.categories.map((cat: string) => (
                                                <Badge key={cat} variant="secondary">{cat}</Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </TabsContent>
                    </Tabs>
                </main>
            </div>

            {project && (
                <CreatePostModal
                    open={showPostModal}
                    onOpenChange={setShowPostModal}
                    projectId={project._id}
                    projectSlug={slug as string}
                />
            )}
        </div>
    );
}
