'use client';

import { Trophy, Medal, Award } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { UserAvatar } from '@/components/user-avatar';
import { useTopInnovators } from '@/features/feed/hooks/use-sidebar';

export function LeaderboardPage() {
    const { data, isLoading, isError } = useTopInnovators(20);

    const getRankIcon = (index: number) => {
        switch (index) {
            case 0: return <Trophy className="h-6 w-6 text-yellow-500" />;
            case 1: return <Medal className="h-6 w-6 text-gray-400" />;
            case 2: return <Award className="h-6 w-6 text-amber-600" />;
            default: return null;
        }
    };

    return (
        <div className="container max-w-2xl mx-auto py-8 px-4">
            <div className="flex items-center gap-3 mb-6">
                <Trophy className="h-8 w-8 text-primary" />
                <h1 className="text-2xl font-bold">Leaderboard</h1>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Top Innovators This Week</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-2">
                    {isLoading ? (
                        Array.from({ length: 10 }).map((_, i) => (
                            <div key={i} className="flex items-center gap-4 p-3 rounded-lg">
                                <Skeleton className="h-6 w-8" />
                                <Skeleton className="h-12 w-12 rounded-full" />
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="h-4 w-32" />
                                    <Skeleton className="h-3 w-24" />
                                </div>
                                <Skeleton className="h-4 w-16" />
                            </div>
                        ))
                    ) : isError ? (
                        <div className="text-center py-12">
                            <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                            <p className="text-muted-foreground">Unable to load leaderboard</p>
                        </div>
                    ) : data?.users && data.users.length > 0 ? (
                        data.users.map((user, index) => (
                            <a
                                key={user._id}
                                href={`/${user.username}`}
                                className={`flex items-center gap-4 p-3 rounded-lg transition-colors ${index < 3 ? 'bg-accent/50' : 'hover:bg-accent'
                                    }`}
                            >
                                {/* Rank */}
                                <div className="w-10 flex items-center justify-center">
                                    {getRankIcon(index) || (
                                        <span className="text-xl font-bold text-muted-foreground">
                                            {index + 1}
                                        </span>
                                    )}
                                </div>

                                {/* Avatar */}
                                <UserAvatar
                                    src={user.avatar}
                                    name={user.name}
                                    username={user.username}
                                    size="lg"
                                />

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium truncate">{user.name}</p>
                                    <p className="text-sm text-muted-foreground truncate">
                                        @{user.username}
                                    </p>
                                </div>

                                {/* Points */}
                                <div className="text-right">
                                    <p className="font-bold text-primary text-lg">
                                        {user.hatchPoints?.toLocaleString() ?? 0}
                                    </p>
                                    <p className="text-xs text-muted-foreground">points</p>
                                </div>
                            </a>
                        ))
                    ) : (
                        <div className="text-center py-12">
                            <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                            <p className="text-muted-foreground">No innovators found</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

export default LeaderboardPage;
