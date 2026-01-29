import { useParams, useNavigate, useSearch, useLocation } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Plus, AlertCircle, Share2 } from 'lucide-react';
import { useAuthStore } from '@/store';
import { toast } from '@/lib/toast';
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
import { generateHTML } from '@tiptap/html';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import { SeoHead } from '@/components/seo-head';
import { ShareModal } from '@/components/share-modal';

// Helper function to render description (handles both Tiptap JSON and plain HTML/text)
const renderDescription = (description: string | undefined): string => {
    if (!description) return "No description provided.";

    // Check if it looks like Tiptap JSON (starts with { and contains "type":"doc")
    if (description.trim().startsWith('{') && description.includes('"type"')) {
        try {
            const json = JSON.parse(description);
            // Generate HTML from Tiptap JSON using the same extensions
            return generateHTML(json, [StarterKit, Link]);
        } catch (e) {
            // If JSON parsing fails, return as-is
            return description;
        }
    }

    // Already HTML or plain text
    return description;
};

export function ProjectPage() {
    const { slug } = useParams({ strict: false });
    const search = useSearch({ from: '/project/$slug' });
    const navigate = useNavigate();
    const location = useLocation();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const state = location.state as any;
    const { user: currentUser, openLoginModal } = useAuthStore();

    const { data: project, isLoading, isError } = useProject(slug as string);
    const watchMutation = useWatchProject();
    const unwatchMutation = useUnwatchProject();

    const [showPostModal, setShowPostModal] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);

    // Auto-open create post modal if coming from "Hatch Project" flow
    useEffect(() => {
        if (state?.startHatching) {
            setShowPostModal(true);
        }
    }, [state]);

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
            openLoginModal();
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
        <div className="container mx-auto px-4 py-8 pb-24 lg:pb-8 max-w-7xl overflow-x-hidden">
            {/* SEO Meta Tags */}
            <SeoHead
                title={project.title}
                description={project.description?.slice(0, 160) || `Check out ${project.title} on Hatchr`}
                image={project.coverImage}
                url={`${window.location.origin}/project/${project.slug || project._id}`}
                type="article"
            />

            {/* Cover Image - Mobile: Top of page */}
            {project.coverImage && (
                <div className="lg:hidden relative h-40 -mx-4 -mt-8 mb-6 w-[calc(100%+2rem)] overflow-hidden">
                    <img
                        src={project.coverImage}
                        alt={project.title}
                        className="w-full h-full object-cover"
                    />
                    {/* Floating Share Button */}
                    <button
                        onClick={() => setShowShareModal(true)}
                        className="absolute top-3 right-3 p-2 rounded-full bg-black/30 backdrop-blur-sm hover:bg-black/50 transition-all hover:scale-105 active:scale-95 group"
                        title="Share Project"
                    >
                        <Share2 className="h-4 w-4 text-white/90 group-hover:text-white" />
                    </button>
                </div>
            )}

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
                    {/* Cover Image - Desktop: In main content area */}
                    {project.coverImage && (
                        <div className="hidden lg:block relative h-48 mb-6 w-full overflow-hidden rounded-lg">
                            <img
                                src={project.coverImage}
                                alt={project.title}
                                className="w-full h-full object-cover"
                            />
                            {/* Floating Share Button */}
                            <button
                                onClick={() => setShowShareModal(true)}
                                className="absolute top-3 right-3 p-2 rounded-full bg-black/30 backdrop-blur-sm hover:bg-black/50 transition-all hover:scale-105 active:scale-95 group"
                                title="Share Project"
                            >
                                <Share2 className="h-4 w-4 text-white/90 group-hover:text-white" />
                            </button>
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
                                    <div
                                        className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground"
                                        dangerouslySetInnerHTML={{
                                            __html: renderDescription(project.description)
                                        }}
                                    />
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
                    postCount={project.posts?.length || 0}
                />
            )}

            {/* Share Modal */}
            {project && (
                <ShareModal
                    open={showShareModal}
                    onOpenChange={setShowShareModal}
                    type="project"
                    projectData={{
                        slug: project.slug || project._id,
                        title: project.title,
                        coverImage: project.coverImage,
                        description: project.description,
                        owner: {
                            username: project.user?.username || '',
                            name: project.user?.name,
                            avatar: project.user?.avatar,
                        },
                        watchersCount: project.followers?.length || 0,
                        postsCount: project.posts?.length || 0,
                        categories: project.categories,
                    }}
                />
            )}
        </div>
    );
}
