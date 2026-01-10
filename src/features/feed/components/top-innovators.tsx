'use client';

import { Trophy } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { UserAvatar } from '@/components/user-avatar';
import { useTopInnovators } from '../hooks/use-sidebar';

export function TopInnovators() {
    const { data, isLoading, isError } = useTopInnovators(5);

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                    <Trophy className="h-4 w-4 text-primary" />
                    Top Innovators
                </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-1">
                {isLoading ? (
                    // Loading skeleton
                    Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="flex items-center gap-3 p-2">
                            <Skeleton className="h-5 w-5" />
                            <Skeleton className="h-8 w-8 rounded-full" />
                            <div className="flex-1 space-y-1">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-3 w-16" />
                            </div>
                            <Skeleton className="h-4 w-12" />
                        </div>
                    ))
                ) : isError ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                        Unable to load leaderboard
                    </p>
                ) : data?.users && data.users.length > 0 ? (
                    data.users.map((user, index) => (
                        <a
                            key={user._id}
                            href={`/${user.username}`}
                            className="flex items-center gap-3 rounded-lg p-2 hover:bg-accent transition-colors"
                        >
                            {/* Rank */}
                            <span className={`w-5 text-sm font-bold text-center ${index === 0 ? 'text-yellow-500' :
                                index === 1 ? 'text-gray-400' :
                                    index === 2 ? 'text-amber-600' :
                                        'text-muted-foreground'
                                }`}>
                                {index + 1}
                            </span>

                            {/* Avatar */}
                            <UserAvatar
                                src={user.avatar}
                                name={user.name}
                                username={user.username}
                                size="sm"
                            />

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{user.name}</p>
                                <p className="text-xs text-muted-foreground truncate">
                                    @{user.username}
                                </p>
                            </div>

                            {/* Points */}
                            <span className="text-xs font-medium text-primary">
                                {user.hatchPoints?.toLocaleString() ?? 0} pts
                            </span>
                        </a>
                    ))
                ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                        No innovators yet
                    </p>
                )}
            </CardContent>
        </Card>
    );
}

export default TopInnovators;
