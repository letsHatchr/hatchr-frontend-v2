'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useInView } from 'react-intersection-observer';
import { useNotifications, useMarkAllRead, useMarkRead, useUnreadCount, useClearAll } from '../hooks/use-notifications';
import { NotificationFilters, type NotificationFilter } from '../components/notification-filters';
import { NotificationItem } from '../components/notification-item';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2, Check, Bell, Inbox, PartyPopper, BellOff, Trash2 } from 'lucide-react';
import { useAcceptInvitation, useDeclineInvitation, useMyInvitations } from '@/features/project/hooks/use-project';
import { toast } from 'sonner';
import type { Notification } from '../types';
import { cn } from '@/lib/utils';

// Date grouping helpers
function getDateGroup(date: Date): string {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const notifDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    if (notifDate >= today) return 'Today';
    if (notifDate >= yesterday) return 'Yesterday';
    if (notifDate >= weekAgo) return 'This Week';
    return 'Earlier';
}

function groupNotificationsByDate(notifications: Notification[]): Record<string, Notification[]> {
    const groups: Record<string, Notification[]> = {};
    const order = ['Today', 'Yesterday', 'This Week', 'Earlier'];

    // Initialize groups in order
    order.forEach(key => { groups[key] = []; });

    notifications.forEach(notification => {
        const group = getDateGroup(new Date(notification.createdAt));
        groups[group].push(notification);
    });

    // Remove empty groups
    order.forEach(key => {
        if (groups[key].length === 0) delete groups[key];
    });

    return groups;
}

// Filter notifications client-side based on type
function filterNotifications(notifications: Notification[], filter: NotificationFilter): Notification[] {
    switch (filter) {
        case 'unread':
            return notifications.filter(n => !n.isRead);
        case 'invites':
            return notifications.filter(n => n.type === 'PROJECT_INVITATION');
        case 'social':
            return notifications.filter(n =>
                ['LIKE_POST', 'COMMENT_POST', 'NEW_FOLLOWER', 'MENTION_POST', 'MENTION_COMMENT', 'POST_COMMENT', 'POST_UPVOTE', 'COMMENT_REPLY'].includes(n.type)
            );
        case 'projects':
            return notifications.filter(n =>
                ['PROJECT_INVITATION', 'PROJECT_JOIN', 'PROJECT_LEAVE', 'INVITATION_ACCEPTED', 'INVITATION_DECLINED'].includes(n.type)
            );
        default:
            return notifications;
    }
}

// Skeleton loader for notifications
function NotificationSkeleton() {
    return (
        <div className="p-4 rounded-xl">
            <div className="flex gap-3">
                <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
                <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-16 ml-auto" />
                    </div>
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                </div>
            </div>
        </div>
    );
}

// Empty state component
function EmptyState({ filter }: { filter: NotificationFilter }) {
    const content = useMemo(() => {
        switch (filter) {
            case 'unread':
                return {
                    icon: <PartyPopper className="h-16 w-16 text-primary/30" />,
                    title: "You're all caught up!",
                    description: "No unread notifications. Check back later for new updates."
                };
            case 'invites':
                return {
                    icon: <Inbox className="h-16 w-16 text-muted-foreground/30" />,
                    title: "No project invites",
                    description: "When someone invites you to collaborate, you'll see it here."
                };
            case 'social':
                return {
                    icon: <Bell className="h-16 w-16 text-muted-foreground/30" />,
                    title: "No social activity yet",
                    description: "Likes, comments, and follows will appear here."
                };
            case 'projects':
                return {
                    icon: <BellOff className="h-16 w-16 text-muted-foreground/30" />,
                    title: "No project updates",
                    description: "Updates about your projects will show up here."
                };
            default:
                return {
                    icon: <Bell className="h-16 w-16 text-muted-foreground/30" />,
                    title: "No notifications yet",
                    description: "When you get notifications, they'll show up here."
                };
        }
    }, [filter]);

    return (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="mb-4 animate-pulse">
                {content.icon}
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-1">
                {content.title}
            </h3>
            <p className="text-sm text-muted-foreground max-w-xs">
                {content.description}
            </p>
        </div>
    );
}

export function NotificationsPage() {
    const [activeFilter, setActiveFilter] = useState<NotificationFilter>('all');
    const [actionState, setActionState] = useState<Record<string, 'accepted' | 'declined'>>({});

    const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useNotifications();
    const { data: unreadCount = 0 } = useUnreadCount();
    const { mutate: markAllRead, isPending: isMarkingAll } = useMarkAllRead();
    const { mutate: markRead } = useMarkRead();
    const { mutate: clearAll, isPending: isClearing } = useClearAll();

    const { ref, inView } = useInView();

    const acceptInviteMutation = useAcceptInvitation();
    const declineInviteMutation = useDeclineInvitation();
    const { data: myInvitations } = useMyInvitations();

    const isInvitePending = useCallback((token: string) => {
        return myInvitations?.some((invite: any) => invite.token === token) ?? false;
    }, [myInvitations]);

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
        toast.success('All notifications marked as read');
    };

    const handleClearAll = () => {
        if (!window.confirm('Are you sure you want to delete ALL notifications? This cannot be undone.')) return;
        clearAll();
        toast.success('All notifications cleared');
    };

    const handleNotificationClick = (notification: Notification) => {
        if (!notification.isRead) {
            markRead(notification._id);
        }
    };

    // Get all notifications and apply filter
    const allNotifications = useMemo(() =>
        data?.pages.flatMap(page => page.notifications) ?? [],
        [data]
    );

    const filteredNotifications = useMemo(() =>
        filterNotifications(allNotifications, activeFilter),
        [allNotifications, activeFilter]
    );

    const groupedNotifications = useMemo(() =>
        groupNotificationsByDate(filteredNotifications),
        [filteredNotifications]
    );

    const hasUnread = allNotifications.some(n => !n.isRead);

    return (
        <div className="min-h-screen bg-background pb-24 lg:pb-8">
            <div className="container max-w-2xl mx-auto py-6 px-4">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
                        <p className="text-sm text-muted-foreground mt-0.5">
                            Stay updated with your activity
                        </p>
                    </div>
                    <div className="flex gap-2">
                        {hasUnread && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleMarkAllRead}
                                disabled={isMarkingAll}
                                className="gap-2"
                            >
                                {isMarkingAll ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Check className="h-4 w-4" />
                                )}
                                Mark all read
                            </Button>
                        )}
                        {allNotifications.length > 0 && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleClearAll}
                                disabled={isClearing}
                                className="gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                                {isClearing ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Trash2 className="h-4 w-4" />
                                )}
                                Clear all
                            </Button>
                        )}
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="mb-6">
                    <NotificationFilters
                        activeFilter={activeFilter}
                        onFilterChange={setActiveFilter}
                        unreadCount={unreadCount}
                    />
                </div>

                {/* Content */}
                {isLoading ? (
                    <div className="space-y-2">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <NotificationSkeleton key={i} />
                        ))}
                    </div>
                ) : filteredNotifications.length === 0 ? (
                    <EmptyState filter={activeFilter} />
                ) : (
                    <div className="space-y-6">
                        {Object.entries(groupedNotifications).map(([group, notifications]) => (
                            <div key={group}>
                                {/* Date Group Header */}
                                <div className="flex items-center gap-3 mb-3">
                                    <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                                        {group}
                                    </h2>
                                    <div className="flex-1 h-px bg-border/50" />
                                    <span className="text-xs text-muted-foreground/60">
                                        {notifications.length}
                                    </span>
                                </div>

                                {/* Notification Items */}
                                <div className="space-y-1 bg-card/30 rounded-xl border border-border/30 overflow-hidden">
                                    {notifications.map((notification, index) => (
                                        <div
                                            key={notification._id}
                                            className={cn(
                                                index !== notifications.length - 1 && "border-b border-border/20"
                                            )}
                                        >
                                            <NotificationItem
                                                notification={notification}
                                                onClick={() => handleNotificationClick(notification)}
                                                isInvitePending={
                                                    notification.type === 'PROJECT_INVITATION' &&
                                                    notification.metadata?.token &&
                                                    isInvitePending(notification.metadata.token)
                                                }
                                                onAcceptInvite={onAcceptInvite}
                                                onDeclineInvite={onDeclineInvite}
                                                isAccepting={acceptInviteMutation.isPending}
                                                isDeclining={declineInviteMutation.isPending}
                                                actionState={actionState[notification._id]}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}

                        {/* Load more trigger */}
                        <div ref={ref} className="py-4">
                            {isFetchingNextPage && (
                                <div className="flex justify-center">
                                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                </div>
                            )}
                            {!hasNextPage && filteredNotifications.length > 0 && (
                                <div className="text-center">
                                    <p className="text-sm text-muted-foreground">
                                        You've seen all notifications
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default NotificationsPage;
