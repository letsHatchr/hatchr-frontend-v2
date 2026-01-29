'use client';

import { useState, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthStore } from '@/store';
import { ProfileSidebar } from '../components/profile-sidebar';
import { AboutSection } from '../components/about-section';
import { HorizontalProjectCard } from '../components/horizontal-project-card';
import { FollowersModal } from '../components/followers-modal';
import { GripVertical, Check, X } from 'lucide-react';
import { toast } from '@/lib/toast';
import {
    useUserProfile,
    useUserProjects,
    useFollowUser,
    useUnfollowUser,
} from '../hooks/use-user';
import { useReorderProjects } from '../hooks/use-reorder-projects';
import { SeoHead } from '@/components/seo-head';
import type { Project } from '../types';

export function ProfilePage() {
    const { username } = useParams({ from: '/$username' });
    const navigate = useNavigate();
    const { user: currentUser } = useAuthStore();

    // State
    const [showFollowersModal, setShowFollowersModal] = useState(false);
    const [modalTab, setModalTab] = useState<'followers' | 'following'>('followers');
    const [isReorderMode, setIsReorderMode] = useState(false);
    const [reorderedProjects, setReorderedProjects] = useState<Project[]>([]);
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

    // API hooks
    const { data: profileData, isLoading: profileLoading, isError: profileError } = useUserProfile(username);
    const { data: projectsData } = useUserProjects(username);
    const followMutation = useFollowUser();
    const unfollowMutation = useUnfollowUser();
    const reorderMutation = useReorderProjects();

    const user = profileData?.user;
    const projects = projectsData?.projects || [];

    // Filter non-archived projects
    const activeProjects = useMemo(() =>
        projects.filter((p: Project) => !p.isArchived), [projects]
    );

    // Computed values
    const isOwnProfile = currentUser && (currentUser._id === user?._id || currentUser.username === user?.username);

    const isFollowing = useMemo(() => {
        if (!currentUser || !user?.followers) return false;
        return user.followers.some(
            (follower: { _id?: string } | string) => {
                // Handle both populated objects and string IDs
                const followerId = typeof follower === 'string' ? follower : follower._id;
                return followerId === currentUser._id;
            }
        );
    }, [currentUser, user?.followers]);

    // Handlers
    const handleFollow = async () => {
        if (!user) return;

        if (isFollowing) {
            await unfollowMutation.mutateAsync(user._id);
        } else {
            await followMutation.mutateAsync(user._id);
        }
    };

    const handleEditProfile = () => {
        navigate({ to: '/settings/profile' });
    };

    const openFollowersModal = (tab: 'followers' | 'following') => {
        setModalTab(tab);
        setShowFollowersModal(true);
    };

    // Reorder handlers
    const handleStartReorder = () => {
        setReorderedProjects([...activeProjects]);
        setIsReorderMode(true);
    };

    const handleCancelReorder = () => {
        setIsReorderMode(false);
        setReorderedProjects([]);
        setDraggedIndex(null);
    };

    const handleSaveReorder = async () => {
        try {
            const projectIds = reorderedProjects.map(p => p._id);
            await reorderMutation.mutateAsync({ projectIds });
            toast.success('Project order saved!');
            setIsReorderMode(false);
            setReorderedProjects([]);
        } catch {
            toast.error('Failed to save order');
        }
    };

    const handleDragStart = (index: number) => {
        setDraggedIndex(index);
    };

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        if (draggedIndex === null || draggedIndex === index) return;

        const newOrder = [...reorderedProjects];
        const [draggedItem] = newOrder.splice(draggedIndex, 1);
        newOrder.splice(index, 0, draggedItem);
        setReorderedProjects(newOrder);
        setDraggedIndex(index);
    };

    const handleDragEnd = () => {
        setDraggedIndex(null);
    };

    // Touch handlers for mobile
    const handleMoveUp = useCallback((index: number) => {
        if (index === 0) return;
        const newOrder = [...reorderedProjects];
        [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
        setReorderedProjects(newOrder);
    }, [reorderedProjects]);

    const handleMoveDown = useCallback((index: number) => {
        if (index === reorderedProjects.length - 1) return;
        const newOrder = [...reorderedProjects];
        [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
        setReorderedProjects(newOrder);
    }, [reorderedProjects]);

    // Loading state
    if (profileLoading) {
        return (
            <div className="min-h-screen bg-background">
                <div className="max-w-6xl mx-auto px-4 py-6">
                    <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
                        <Skeleton className="h-[500px] rounded-lg" />
                        <div className="space-y-6">
                            <Skeleton className="h-32 rounded-lg" />
                            <Skeleton className="h-48 rounded-lg" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Error state
    if (profileError || !user) {
        return (
            <div className="min-h-screen bg-background">
                <div className="flex items-center justify-center" style={{ minHeight: 'calc(100vh - 56px)' }}>
                    <div className="text-center">
                        <h1 className="text-2xl font-bold mb-2">User not found</h1>
                        <p className="text-muted-foreground mb-4">
                            The user you're looking for doesn't exist.
                        </p>
                        <Button onClick={() => navigate({ to: '/' })}>Go Home</Button>
                    </div>
                </div>
            </div>
        );
    }

    const followLoading = followMutation.isPending || unfollowMutation.isPending;
    const displayProjects = isReorderMode ? reorderedProjects : activeProjects;

    return (
        <div className="min-h-screen bg-background pb-24 lg:pb-0">
            {/* SEO Meta Tags */}
            <SeoHead
                title={user.name || user.username}
                description={user.bio || `Check out ${user.name || user.username}'s profile on Hatchr`}
                image={user.avatar}
                url={`${window.location.origin}/${user.username}`}
                type="profile"
            />

            {/* Main Content */}
            <div className="max-w-6xl mx-auto px-4 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-[320px_minmax(0,1fr)] gap-6">
                    {/* Left Sidebar */}
                    <aside className="lg:sticky lg:top-20 lg:self-start">
                        <ProfileSidebar
                            user={user}
                            projectsCount={projects.length}
                            isOwnProfile={!!isOwnProfile}
                            isFollowing={isFollowing}
                            followLoading={followLoading}
                            onFollow={handleFollow}
                            onEditProfile={handleEditProfile}
                            onFollowersClick={() => openFollowersModal('followers')}
                            onFollowingClick={() => openFollowersModal('following')}
                        />
                    </aside>

                    {/* Right Content */}
                    <main className="space-y-6">
                        {/* About Section */}
                        <AboutSection about={user.about} />

                        {/* Projects Section */}
                        <section>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-2xl font-bold">Hatched Projects</h2>
                                {isOwnProfile && activeProjects.length > 1 && (
                                    <div className="flex items-center gap-2">
                                        {isReorderMode ? (
                                            <>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={handleCancelReorder}
                                                    disabled={reorderMutation.isPending}
                                                >
                                                    <X className="h-4 w-4 mr-1" />
                                                    Cancel
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    onClick={handleSaveReorder}
                                                    disabled={reorderMutation.isPending}
                                                >
                                                    <Check className="h-4 w-4 mr-1" />
                                                    {reorderMutation.isPending ? 'Saving...' : 'Save Order'}
                                                </Button>
                                            </>
                                        ) : (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={handleStartReorder}
                                            >
                                                <GripVertical className="h-4 w-4 mr-1" />
                                                Edit Order
                                            </Button>
                                        )}
                                    </div>
                                )}
                            </div>

                            {displayProjects.length === 0 ? (
                                <div className="bg-card rounded-lg border p-12 text-center">
                                    <p className="text-muted-foreground">
                                        {isOwnProfile
                                            ? 'No projects yet. Create your first project!'
                                            : 'No projects yet'}
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {displayProjects.map((project: Project, index: number) => (
                                        <div
                                            key={project._id}
                                            className={`flex items-stretch gap-2 ${isReorderMode ? 'group' : ''}`}
                                            draggable={isReorderMode}
                                            onDragStart={() => handleDragStart(index)}
                                            onDragOver={(e) => handleDragOver(e, index)}
                                            onDragEnd={handleDragEnd}
                                        >
                                            {isReorderMode && (
                                                <div className="flex flex-col items-center justify-center gap-1 pr-1">
                                                    {/* Drag handle */}
                                                    <div className="hidden sm:flex items-center justify-center w-8 h-full cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground bg-muted/50 rounded-l-lg">
                                                        <GripVertical className="h-5 w-5" />
                                                    </div>
                                                    {/* Mobile up/down buttons */}
                                                    <div className="flex sm:hidden flex-col gap-1">
                                                        <button
                                                            onClick={() => handleMoveUp(index)}
                                                            disabled={index === 0}
                                                            className="p-1 rounded bg-muted/50 hover:bg-muted disabled:opacity-30"
                                                        >
                                                            ▲
                                                        </button>
                                                        <button
                                                            onClick={() => handleMoveDown(index)}
                                                            disabled={index === displayProjects.length - 1}
                                                            className="p-1 rounded bg-muted/50 hover:bg-muted disabled:opacity-30"
                                                        >
                                                            ▼
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                            <div className="flex-1">
                                                <HorizontalProjectCard project={project} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>
                    </main>
                </div>
            </div>

            {/* Followers Modal */}
            {user && (
                <FollowersModal
                    userId={user._id}
                    initialTab={modalTab}
                    open={showFollowersModal}
                    onOpenChange={setShowFollowersModal}
                />
            )}
        </div>
    );
}

export default ProfilePage;

