'use client';

import { Trophy, Medal, Award, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { UserAvatar } from '@/components/user-avatar';
import { useTopInnovators, useTrendingProjects } from '@/features/feed/hooks/use-sidebar';
import { Link } from '@tanstack/react-router';

export function LeaderboardPage() {
    const { data: usersData, isLoading: usersLoading, isError: usersError } = useTopInnovators(20);
    const { data: projectsData, isLoading: projectsLoading } = useTrendingProjects(10);

    const getRankIcon = (index: number) => {
        switch (index) {
            case 0: return <Trophy className="h-5 w-5 text-yellow-500" />;
            case 1: return <Medal className="h-5 w-5 text-gray-400" />;
            case 2: return <Award className="h-5 w-5 text-amber-600" />;
            default: return null;
        }
    };

    return (
        <div className="container max-w-2xl mx-auto py-6 px-4 pb-24 lg:pb-8">
            <div className="flex items-center gap-3 mb-4">
                <Trophy className="h-7 w-7 text-primary" />
                <h1 className="text-xl sm:text-2xl font-bold">Leaderboard</h1>
            </div>

            <Tabs defaultValue="innovators" className="w-full">
                <TabsList className="mb-4 w-full justify-start h-auto p-1 bg-muted/50 rounded-lg gap-1">
                    <TabsTrigger value="innovators" className="flex-1 data-[state=active]:bg-background min-h-[40px] text-sm">
                        🧑‍💻 Innovators
                    </TabsTrigger>
                    <TabsTrigger value="projects" className="flex-1 data-[state=active]:bg-background min-h-[40px] text-sm">
                        🚀 Projects
                    </TabsTrigger>
                </TabsList>

                {/* Innovators Tab */}
                <TabsContent value="innovators">
                    <Card>
                        <CardHeader className="py-3 px-4">
                            <CardTitle className="text-base">Top Innovators This Week</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-1 px-2 py-2">
                            {usersLoading ? (
                                Array.from({ length: 10 }).map((_, i) => (
                                    <div key={i} className="flex items-center gap-3 p-2 rounded-lg">
                                        <Skeleton className="h-5 w-6" />
                                        <Skeleton className="h-10 w-10 rounded-full" />
                                        <div className="flex-1 space-y-2">
                                            <Skeleton className="h-4 w-28" />
                                            <Skeleton className="h-3 w-20" />
                                        </div>
                                        <Skeleton className="h-4 w-14" />
                                    </div>
                                ))
                            ) : usersError ? (
                                <div className="text-center py-8">
                                    <Trophy className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                                    <p className="text-muted-foreground text-sm">Unable to load leaderboard</p>
                                </div>
                            ) : usersData?.users && usersData.users.length > 0 ? (
                                usersData.users.map((user, index) => (
                                    <a
                                        key={user._id}
                                        href={`/${user.username}`}
                                        className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${index < 3 ? 'bg-accent/50' : 'hover:bg-accent'}`}
                                    >
                                        <div className="w-7 flex items-center justify-center">
                                            {getRankIcon(index) || (
                                                <span className="text-base font-bold text-muted-foreground">
                                                    {index + 1}
                                                </span>
                                            )}
                                        </div>
                                        <UserAvatar
                                            src={user.avatar}
                                            name={user.name}
                                            username={user.username}
                                            size="md"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-sm truncate">{user.name}</p>
                                            <p className="text-xs text-muted-foreground truncate">@{user.username}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-primary text-sm">
                                                {user.hatchPoints?.toLocaleString() ?? 0}
                                            </p>
                                            <p className="text-[10px] text-muted-foreground">pts</p>
                                        </div>
                                    </a>
                                ))
                            ) : (
                                <div className="text-center py-8">
                                    <Trophy className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                                    <p className="text-muted-foreground text-sm">No innovators found</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Projects Tab */}
                <TabsContent value="projects">
                    <Card>
                        <CardHeader className="py-3 px-4">
                            <CardTitle className="text-base">Trending Projects</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-1 px-2 py-2">
                            {projectsLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <div key={i} className="flex items-center gap-3 p-2 rounded-lg">
                                        <Skeleton className="h-5 w-6" />
                                        <Skeleton className="h-10 w-10 rounded" />
                                        <div className="flex-1 space-y-2">
                                            <Skeleton className="h-4 w-36" />
                                            <Skeleton className="h-3 w-24" />
                                        </div>
                                    </div>
                                ))
                            ) : projectsData?.projects && projectsData.projects.length > 0 ? (
                                projectsData.projects.map((project, index) => (
                                    <Link
                                        key={project._id}
                                        to="/project/$slug"
                                        params={{ slug: project.slug || project._id }}
                                        search={{ tab: 'timeline' }}
                                        className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${index < 3 ? 'bg-accent/50' : 'hover:bg-accent'}`}
                                    >
                                        <div className="w-7 flex items-center justify-center">
                                            {getRankIcon(index) || (
                                                <span className="text-base font-bold text-muted-foreground">
                                                    {index + 1}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-muted">
                                            <FileText className="h-5 w-5 text-muted-foreground" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-sm truncate">{project.title}</p>
                                            <p className="text-xs text-muted-foreground truncate">
                                                by {project.user?.username || 'Unknown'}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-primary text-sm">
                                                {project.followers?.length || 0}
                                            </p>
                                            <p className="text-[10px] text-muted-foreground">watchers</p>
                                        </div>
                                    </Link>
                                ))
                            ) : (
                                <div className="text-center py-8">
                                    <FileText className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                                    <p className="text-muted-foreground text-sm">No projects found</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}

export default LeaderboardPage;

