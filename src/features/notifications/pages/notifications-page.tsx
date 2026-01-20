import { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import { useNotifications, useMarkAllRead, useMarkRead } from '../hooks/use-notifications';
import { UserAvatar } from '@/components/user-avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader2, Check, Bell, Heart, MessageCircle, UserPlus, AtSign } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Link } from '@tanstack/react-router';
import type { Notification } from '../types';
import { useAcceptInvitation, useDeclineInvitation, useMyInvitations } from '@/features/project/hooks/use-project';
import { toast } from 'sonner';

import { useState } from 'react';

export function NotificationsPage() {
    const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useNotifications();
    const [actionState, setActionState] = useState<Record<string, 'accepted' | 'declined'>>({});
    const { mutate: markAllRead, isPending: isMarkingAll } = useMarkAllRead();
    const { mutate: markRead } = useMarkRead();

    const { ref, inView } = useInView();

    const acceptInviteMutation = useAcceptInvitation();
    const declineInviteMutation = useDeclineInvitation();
    const { data: myInvitations } = useMyInvitations();

    const isInvitePending = (token: string) => {
        // Check if the invitation token exists in the myInvitations list
        // We handle potential undefined data safely
        return myInvitations?.some((invite: any) => invite.token === token) ?? false;
    };

    const onAcceptInvite = async (token: string, notificationId: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        try {
            await acceptInviteMutation.mutateAsync(token);
            toast.success('Invitation accepted!');
            setActionState(prev => ({ ...prev, [notificationId]: 'accepted' }));
            markRead(notificationId);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to accept invitation');
        }
    };

    const onDeclineInvite = async (token: string, notificationId: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!window.confirm('Are you sure you want to decline this invitation?')) return;

        try {
            await declineInviteMutation.mutateAsync(token);
            toast.success('Invitation declined');
            setActionState(prev => ({ ...prev, [notificationId]: 'declined' }));
            markRead(notificationId);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to decline invitation');
        }
    };

    // Infinite scroll
    useEffect(() => {
        if (inView && hasNextPage) {
            fetchNextPage();
        }
    }, [inView, hasNextPage, fetchNextPage]);

    const handleMarkAllRead = () => {
        markAllRead();
    };

    const handleNotificationClick = (notification: Notification) => {
        if (!notification.isRead) {
            markRead(notification._id);
        }
    };

    const getIcon = (type: Notification['type']) => {
        switch (type) {
            case 'LIKE_POST':
                return <Heart className="h-4 w-4 text-red-500 fill-red-500" />;
            case 'COMMENT_POST':
            case 'MENTION_COMMENT':
                return <MessageCircle className="h-4 w-4 text-blue-500" />;
            case 'NEW_FOLLOWER':
                return <UserPlus className="h-4 w-4 text-green-500" />;
            case 'MENTION_POST':
                return <AtSign className="h-4 w-4 text-orange-500" />;
            case 'PROJECT_INVITATION':
            case 'PROJECT_JOIN':
            case 'PROJECT_LEAVE':
                return <Bell className="h-4 w-4 text-purple-500" />;
            default:
                return <Bell className="h-4 w-4 text-gray-500" />;
        }
    };

    const getLink = (notification: Notification): string => {
        const { type, relatedEntity, actor } = notification;

        switch (type) {
            case 'LIKE_POST':
            case 'COMMENT_POST':
            case 'MENTION_POST':
            case 'MENTION_COMMENT':
                return relatedEntity?.slug ? `/post/${relatedEntity.slug}` : '#';
            case 'NEW_FOLLOWER':
                return `/${actor.username}`;
            case 'PROJECT_INVITATION':
                // Check if invite/token exists, otherwise project link
                return '/invitations/my'; // Or project link if simplified
            case 'PROJECT_JOIN':
            case 'PROJECT_LEAVE':
                // Ideally link to project if slug available, logic depends on backend data.
                // Assuming relatedEntity for project has valid slug or ID if feasible.
                return '#';
            default:
                return '#';
        }
    };

    return (
        <div className="container max-w-2xl mx-auto py-8 px-4">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">Notifications</h1>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleMarkAllRead}
                    disabled={isMarkingAll}
                >
                    <Check className="h-4 w-4 mr-2" />
                    Mark all read
                </Button>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            ) : data?.pages[0]?.notifications.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                    <Bell className="h-12 w-12 mx-auto mb-4 opacity-20" />
                    <p>No notifications yet</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {data?.pages.map((page, i) => (
                        <div key={i} className="space-y-4">
                            {page.notifications.map((notification) => (
                                <Link
                                    key={notification._id}
                                    to={getLink(notification)}
                                    onClick={() => handleNotificationClick(notification)}
                                    className="block"
                                >
                                    <Card className={`p-4 transition-colors hover:bg-accent/50 ${!notification.isRead ? 'bg-accent/10 border-l-4 border-l-primary' : ''}`}>
                                        <div className="flex gap-4">
                                            <div className="mt-1">
                                                {getIcon(notification.type)}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <UserAvatar
                                                        src={notification.actor.avatar}
                                                        name={notification.actor.name}
                                                        username={notification.actor.username}
                                                        size="sm"
                                                    />
                                                    <span className="font-semibold text-sm">{notification.actor.name}</span>
                                                    <span className="text-xs text-muted-foreground ml-auto">
                                                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-foreground/90">{notification.message}</p>

                                                {/* Start: Accept/Decline Buttons for Project Invites */}
                                                {/* Start: Accept/Decline Buttons for Project Invites */}
                                                {/* Only show buttons if the invitation is still pending in our records */}
                                                {notification.type === 'PROJECT_INVITATION' &&
                                                    notification.metadata?.token &&
                                                    isInvitePending(notification.metadata.token) && (
                                                        <div className="flex gap-2 mt-2">
                                                            <Button
                                                                size="sm"
                                                                variant="default"
                                                                onClick={(e) => onAcceptInvite(notification.metadata!.token, notification._id, e)}
                                                                disabled={acceptInviteMutation.isPending || declineInviteMutation.isPending}
                                                                className="h-7 text-xs"
                                                            >
                                                                Accept
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={(e) => onDeclineInvite(notification.metadata!.token, notification._id, e)}
                                                                disabled={acceptInviteMutation.isPending || declineInviteMutation.isPending}
                                                                className="h-7 text-xs"
                                                            >
                                                                Decline
                                                            </Button>
                                                        </div>
                                                    )}
                                                {/* Show status if not pending but was an invitation */}
                                                {notification.type === 'PROJECT_INVITATION' &&
                                                    notification.metadata?.token &&
                                                    !isInvitePending(notification.metadata.token) && (
                                                        <div className="mt-2 text-sm text-muted-foreground italic">
                                                            {(actionState[notification._id] === 'accepted') ? 'Accepted' :
                                                                (actionState[notification._id] === 'declined') ? 'Declined' :
                                                                    'Invitation no longer active'}
                                                        </div>
                                                    )}
                                                {/* End: Accept/Decline Buttons */}
                                                {/* End: Accept/Decline Buttons */}
                                            </div>
                                        </div>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    ))}
                    <div ref={ref} className="h-4" />
                    {isFetchingNextPage && (
                        <div className="flex justify-center py-4">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default NotificationsPage;
