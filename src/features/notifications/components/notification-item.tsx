'use client';

import { memo, useMemo, useCallback } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { formatDistanceToNow } from 'date-fns';
import { UserAvatar } from '@/components/user-avatar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
    Heart,
    MessageCircle,
    UserPlus,
    AtSign,
    Bell,
    FolderKanban,
    UserMinus,
    CheckCircle2,
    XCircle,
    Sparkles
} from 'lucide-react';
import type { Notification } from '../types';

interface NotificationItemProps {
    notification: Notification;
    onClick: () => void;
    // For project invites
    isInvitePending?: boolean;
    onAcceptInvite?: (token: string, notificationId: string, e: React.MouseEvent) => void;
    onDeclineInvite?: (token: string, notificationId: string, e: React.MouseEvent) => void;
    isAccepting?: boolean;
    isDeclining?: boolean;
    actionState?: 'accepted' | 'declined';
}

const typeConfig: Record<Notification['type'], {
    icon: React.ReactNode;
    bgColor: string;
    iconColor: string;
    label: string;
}> = {
    'LIKE_POST': {
        icon: <Heart className="h-4 w-4 fill-current" />,
        bgColor: 'bg-red-500/10',
        iconColor: 'text-red-500',
        label: 'liked your post'
    },
    'COMMENT_POST': {
        icon: <MessageCircle className="h-4 w-4" />,
        bgColor: 'bg-blue-500/10',
        iconColor: 'text-blue-500',
        label: 'commented on your post'
    },
    'MENTION_COMMENT': {
        icon: <AtSign className="h-4 w-4" />,
        bgColor: 'bg-orange-500/10',
        iconColor: 'text-orange-500',
        label: 'mentioned you in a comment'
    },
    'NEW_FOLLOWER': {
        icon: <UserPlus className="h-4 w-4" />,
        bgColor: 'bg-green-500/10',
        iconColor: 'text-green-500',
        label: 'started following you'
    },
    'MENTION_POST': {
        icon: <AtSign className="h-4 w-4" />,
        bgColor: 'bg-orange-500/10',
        iconColor: 'text-orange-500',
        label: 'mentioned you in a post'
    },
    'PROJECT_INVITATION': {
        icon: <FolderKanban className="h-4 w-4" />,
        bgColor: 'bg-purple-500/10',
        iconColor: 'text-purple-500',
        label: 'invited you to a project'
    },
    'PROJECT_JOIN': {
        icon: <UserPlus className="h-4 w-4" />,
        bgColor: 'bg-emerald-500/10',
        iconColor: 'text-emerald-500',
        label: 'joined your project'
    },
    'PROJECT_LEAVE': {
        icon: <UserMinus className="h-4 w-4" />,
        bgColor: 'bg-amber-500/10',
        iconColor: 'text-amber-500',
        label: 'left your project'
    },
    'milestone': {
        icon: <Sparkles className="h-4 w-4" />,
        bgColor: 'bg-yellow-500/10',
        iconColor: 'text-yellow-500',
        label: 'Milestone reached'
    },
    'system': {
        icon: <Bell className="h-4 w-4" />,
        bgColor: 'bg-gray-500/10',
        iconColor: 'text-gray-500',
        label: 'System notification'
    },
    'INVITATION_ACCEPTED': {
        icon: <CheckCircle2 className="h-4 w-4" />,
        bgColor: 'bg-green-500/10',
        iconColor: 'text-green-500',
        label: 'accepted your invitation'
    },
    'INVITATION_DECLINED': {
        icon: <XCircle className="h-4 w-4" />,
        bgColor: 'bg-red-500/10',
        iconColor: 'text-red-500',
        label: 'declined your invitation'
    },
    'POST_COMMENT': {
        icon: <MessageCircle className="h-4 w-4" />,
        bgColor: 'bg-blue-500/10',
        iconColor: 'text-blue-500',
        label: 'commented on your post'
    },
    'POST_UPVOTE': {
        icon: <Heart className="h-4 w-4 fill-current" />,
        bgColor: 'bg-red-500/10',
        iconColor: 'text-red-500',
        label: 'liked your post'
    },
    'COMMENT_REPLY': {
        icon: <MessageCircle className="h-4 w-4" />,
        bgColor: 'bg-blue-500/10',
        iconColor: 'text-blue-500',
        label: 'replied to your comment'
    }
};

function getNotificationLink(notification: Notification): string {
    const { type, relatedEntity, actor } = notification;

    switch (type) {
        case 'LIKE_POST':
        case 'COMMENT_POST':
        case 'MENTION_POST':
        case 'MENTION_COMMENT':
        case 'POST_COMMENT':
        case 'POST_UPVOTE':
        case 'COMMENT_REPLY':
            return relatedEntity?.slug ? `/post/${relatedEntity.slug}` : '#';
        case 'NEW_FOLLOWER':
            return actor?.username ? `/${actor.username}` : '#';
        case 'PROJECT_INVITATION':
            return '/notifications';
        case 'PROJECT_JOIN':
        case 'PROJECT_LEAVE':
        case 'INVITATION_ACCEPTED':
        case 'INVITATION_DECLINED':
            return relatedEntity?.slug ? `/project/${relatedEntity.slug}` : '#';
        default:
            return '#';
    }
}

export const NotificationItem = memo(function NotificationItem({
    notification,
    onClick,
    isInvitePending = false,
    onAcceptInvite,
    onDeclineInvite,
    isAccepting = false,
    isDeclining = false,
    actionState,
}: NotificationItemProps) {
    const config = typeConfig[notification.type] || typeConfig['system'];
    const link = useMemo(() => getNotificationLink(notification), [notification]);
    const timeAgo = useMemo(
        () => formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true }),
        [notification.createdAt]
    );
    const navigate = useNavigate();

    const handleClick = useCallback(() => {
        onClick();
        navigate({ to: link });
    }, [link, onClick, navigate]);

    const isProjectInvite = notification.type === 'PROJECT_INVITATION';
    const hasInviteToken = notification.metadata?.token;

    return (
        <div
            role="button"
            tabIndex={0}
            onClick={handleClick}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleClick();
                }
            }}
            className="block group cursor-pointer text-left"
        >
            <div
                className={cn(
                    "relative p-4 rounded-xl transition-all duration-200",
                    "hover:bg-accent/50 hover:shadow-sm",
                    "border border-transparent",
                    !notification.isRead && [
                        "bg-gradient-to-r from-primary/5 via-primary/3 to-transparent",
                        "border-l-2 border-l-primary",
                        "shadow-sm"
                    ]
                )}
            >
                {/* Unread indicator dot */}
                {!notification.isRead && (
                    <div className="absolute top-4 right-4">
                        <span className="relative flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
                        </span>
                    </div>
                )}

                <div className="flex gap-3">
                    {/* Type Icon */}
                    <div className={cn(
                        "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center",
                        config.bgColor,
                        config.iconColor
                    )}>
                        {config.icon}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        {/* Header with avatar and time */}
                        <div className="flex items-center gap-2 mb-1.5">
                            {notification.actor ? (
                                <a
                                    href={`/${notification.actor.username}`}
                                    onClick={(e) => e.stopPropagation()}
                                    className="flex-shrink-0 hover:opacity-80 transition-opacity"
                                >
                                    <UserAvatar
                                        src={notification.actor.avatar}
                                        name={notification.actor.name}
                                        username={notification.actor.username}
                                        size="sm"
                                        className="ring-2 ring-background"
                                    />
                                </a>
                            ) : (
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                                    <span className="text-xs text-muted-foreground">?</span>
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                {notification.actor ? (
                                    <a
                                        href={`/${notification.actor.username}`}
                                        onClick={(e) => e.stopPropagation()}
                                        className="font-semibold text-sm text-foreground hover:text-primary transition-colors"
                                    >
                                        {notification.actor.name}
                                    </a>
                                ) : (
                                    <span className="font-semibold text-sm text-muted-foreground">
                                        Deleted User
                                    </span>
                                )}
                            </div>
                            <span className="text-xs text-muted-foreground flex-shrink-0">
                                {timeAgo}
                            </span>
                        </div>

                        {/* Message */}
                        <p className="text-sm text-foreground/80 leading-relaxed">
                            {notification.message}
                        </p>

                        {/* Show post title for comment/like notifications */}
                        {['COMMENT_POST', 'LIKE_POST', 'MENTION_POST', 'MENTION_COMMENT', 'POST_COMMENT', 'POST_UPVOTE', 'COMMENT_REPLY'].includes(notification.type) &&
                            notification.relatedEntity?.text && (
                                <a
                                    href={notification.relatedEntity?.slug ? `/post/${notification.relatedEntity.slug}` : '#'}
                                    onClick={(e) => e.stopPropagation()}
                                    className="mt-2 flex items-start gap-2 p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                                >
                                    <MessageCircle className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                                    <span className="text-xs text-muted-foreground line-clamp-2">
                                        {notification.relatedEntity.text}
                                    </span>
                                </a>
                            )}

                        {/* Related entity preview (if available) */}
                        {notification.relatedEntity?.image && (
                            <div className="mt-2">
                                <img
                                    src={notification.relatedEntity.image}
                                    alt=""
                                    className="h-16 w-24 object-cover rounded-lg border border-border/50"
                                />
                            </div>
                        )}

                        {/* Project Invite Actions */}
                        {isProjectInvite && hasInviteToken && isInvitePending && (
                            <div className="flex gap-2 mt-3">
                                <Button
                                    size="sm"
                                    onClick={(e) => onAcceptInvite?.(notification.metadata!.token, notification._id, e)}
                                    disabled={isAccepting || isDeclining}
                                    className="bg-green-600 hover:bg-green-700 text-white shadow-sm"
                                >
                                    {isAccepting ? (
                                        <span className="flex items-center gap-1.5">
                                            <span className="h-3 w-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Accepting...
                                        </span>
                                    ) : (
                                        <>
                                            <CheckCircle2 className="h-4 w-4 mr-1.5" />
                                            Accept
                                        </>
                                    )}
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={(e) => onDeclineInvite?.(notification.metadata!.token, notification._id, e)}
                                    disabled={isAccepting || isDeclining}
                                    className="border-red-500/30 text-red-500 hover:bg-red-500/10 hover:border-red-500/50 hover:text-red-400"
                                >
                                    {isDeclining ? (
                                        <span className="flex items-center gap-1.5">
                                            <span className="h-3 w-3 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin" />
                                            Declining...
                                        </span>
                                    ) : (
                                        <>
                                            <XCircle className="h-4 w-4 mr-1.5" />
                                            Decline
                                        </>
                                    )}
                                </Button>
                            </div>
                        )}

                        {/* Invite status after action */}
                        {isProjectInvite && hasInviteToken && !isInvitePending && (
                            <div className={cn(
                                "mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium",
                                actionState === 'accepted'
                                    ? "bg-green-500/10 text-green-600"
                                    : actionState === 'declined'
                                        ? "bg-red-500/10 text-red-600"
                                        : "bg-muted text-muted-foreground"
                            )}>
                                {actionState === 'accepted' ? (
                                    <><CheckCircle2 className="h-3.5 w-3.5" /> Accepted</>
                                ) : actionState === 'declined' ? (
                                    <><XCircle className="h-3.5 w-3.5" /> Declined</>
                                ) : (
                                    'Invitation no longer active'
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
});

export default NotificationItem;
