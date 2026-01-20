'use client';

import { useState, useMemo } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthStore } from '@/store';
import { ProfileSidebar } from '../components/profile-sidebar';
import { AboutSection } from '../components/about-section';
import { HorizontalProjectCard } from '../components/horizontal-project-card';
import { FollowersModal } from '../components/followers-modal';
import {
    useUserProfile,
    useUserProjects,
    useFollowUser,
    useUnfollowUser,
} from '../hooks/use-user';

export function ProfilePage() {
    const { username } = useParams({ from: '/$username' });
    const navigate = useNavigate();
    const { user: currentUser } = useAuthStore();

    // State
    const [showFollowersModal, setShowFollowersModal] = useState(false);
    const [modalTab, setModalTab] = useState<'followers' | 'following'>('followers');

    // API hooks
    const { data: profileData, isLoading: profileLoading, isError: profileError } = useUserProfile(username);
    const { data: projectsData } = useUserProjects(username);
    const followMutation = useFollowUser();
    const unfollowMutation = useUnfollowUser();

    const user = profileData?.user;
    const projects = projectsData?.projects || [];

    // Filter non-archived projects
    const activeProjects = useMemo(() =>
        projects.filter(p => !p.isArchived), [projects]
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

    return (
        <div className="min-h-screen bg-background">
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
                        <AboutSection about={user.about} name={user.name} />

                        {/* Projects Section */}
                        <section>
                            <h2 className="text-2xl font-bold mb-4">Hatched Projects</h2>

                            {activeProjects.length === 0 ? (
                                <div className="bg-card rounded-lg border p-12 text-center">
                                    <p className="text-muted-foreground">
                                        {isOwnProfile
                                            ? 'No projects yet. Create your first project!'
                                            : 'No projects yet'}
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {activeProjects.map((project) => (
                                        <HorizontalProjectCard key={project._id} project={project} />
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
