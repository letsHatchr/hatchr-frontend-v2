'use client';

import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { UserAvatar } from '@/components/user-avatar';
import { useFollowers, useFollowing } from '../hooks/use-user';
import type { FollowerUser } from '../types';

interface FollowersModalProps {
    userId: string;
    initialTab?: 'followers' | 'following';
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

function UserListItem({ user }: { user: FollowerUser }) {
    return (
        <a
            href={`/${user.username}`}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors"
        >
            <UserAvatar
                src={user.avatar}
                name={user.name}
                username={user.username}
                size="sm"
            />
            <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{user.name}</p>
                <p className="text-sm text-muted-foreground truncate">@{user.username}</p>
                {user.bio && (
                    <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                        {user.bio}
                    </p>
                )}
            </div>
        </a>
    );
}

function LoadingState() {
    return (
        <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                    </div>
                </div>
            ))}
        </div>
    );
}

export function FollowersModal({
    userId,
    initialTab = 'followers',
    open,
    onOpenChange,
}: FollowersModalProps) {
    const [tab, setTab] = useState(initialTab);

    const { data: followersData, isLoading: followersLoading } = useFollowers(userId);
    const { data: followingData, isLoading: followingLoading } = useFollowing(userId);

    const followers = followersData?.followers || [];
    const following = followingData?.following || [];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md max-h-[80vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle>Connections</DialogTitle>
                </DialogHeader>

                <Tabs value={tab} onValueChange={(v) => setTab(v as 'followers' | 'following')}>
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="followers">
                            Followers ({followers.length})
                        </TabsTrigger>
                        <TabsTrigger value="following">
                            Following ({following.length})
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="followers" className="mt-4 overflow-y-auto max-h-[50vh]">
                        {followersLoading ? (
                            <LoadingState />
                        ) : followers.length > 0 ? (
                            <div className="space-y-1">
                                {followers.map((user) => (
                                    <UserListItem key={user._id} user={user} />
                                ))}
                            </div>
                        ) : (
                            <p className="text-center text-muted-foreground py-8">
                                No followers yet
                            </p>
                        )}
                    </TabsContent>

                    <TabsContent value="following" className="mt-4 overflow-y-auto max-h-[50vh]">
                        {followingLoading ? (
                            <LoadingState />
                        ) : following.length > 0 ? (
                            <div className="space-y-1">
                                {following.map((user) => (
                                    <UserListItem key={user._id} user={user} />
                                ))}
                            </div>
                        ) : (
                            <p className="text-center text-muted-foreground py-8">
                                Not following anyone yet
                            </p>
                        )}
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}

export default FollowersModal;
