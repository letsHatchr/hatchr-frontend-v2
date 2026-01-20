'use client';

import { useState } from 'react';
import { Trophy, Medal, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { UserAvatar } from '@/components/user-avatar';
import { useTopInnovators } from '../hooks/use-sidebar';

export function MobileLeaderboardSheet() {
    const [open, setOpen] = useState(false);
    const { data, isLoading } = useTopInnovators(10);

    const getRankIcon = (index: number) => {
        switch (index) {
            case 0: return <Trophy className="h-5 w-5 text-yellow-500" />;
            case 1: return <Medal className="h-5 w-5 text-gray-400" />;
            case 2: return <Award className="h-5 w-5 text-amber-600" />;
            default: return null;
        }
    };

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
                render={
                    <Button
                        variant="ghost"
                        size="sm"
                        className="gap-2 lg:hidden"
                    >
                        <Trophy className="h-4 w-4" />
                        <span>Leaderboard</span>
                    </Button>
                }
            />
            <SheetContent side="bottom" className="h-[80vh] rounded-t-xl">
                <SheetHeader className="pb-4">
                    <SheetTitle className="text-center">
                        🏆 Top Innovators This Week
                    </SheetTitle>
                </SheetHeader>

                <div className="overflow-y-auto max-h-[calc(80vh-100px)]">
                    <div className="grid gap-2">
                        {isLoading ? (
                            Array.from({ length: 10 }).map((_, i) => (
                                <div key={i} className="flex items-center gap-4 p-3 rounded-lg">
                                    <Skeleton className="h-4 w-6" />
                                    <Skeleton className="h-12 w-12 rounded-full" />
                                    <div className="flex-1 space-y-2">
                                        <Skeleton className="h-4 w-32" />
                                        <Skeleton className="h-3 w-24" />
                                    </div>
                                    <Skeleton className="h-4 w-16" />
                                </div>
                            ))
                        ) : data?.users && data.users.length > 0 ? (
                            data.users.map((user, index) => (
                                <a
                                    key={user._id}
                                    href={`/${user.username}`}
                                    onClick={() => setOpen(false)}
                                    className={`flex items-center gap-4 p-3 rounded-lg transition-colors ${index < 3 ? 'bg-accent/50' : 'hover:bg-accent'
                                        }`}
                                >
                                    {/* Rank */}
                                    <div className="w-8 flex items-center justify-center">
                                        {getRankIcon(index) || (
                                            <span className="text-lg font-bold text-muted-foreground">
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
                                        {user.bio && (
                                            <p className="text-xs text-muted-foreground truncate mt-1">
                                                {user.bio}
                                            </p>
                                        )}
                                    </div>

                                    {/* Points */}
                                    <div className="text-right">
                                        <p className="font-bold text-primary">
                                            {user.hatchPoints.toLocaleString()}
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
                    </div>
                </div>
            </SheetContent>
        </Sheet >
    );
}

export default MobileLeaderboardSheet;
