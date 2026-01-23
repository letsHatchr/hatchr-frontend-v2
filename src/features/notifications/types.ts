export interface NotificationActor {
    _id: string;
    name: string;
    username: string;
    avatar?: string;
}

export interface NotificationEntity {
    _id: string;
    image?: string;
    text?: string;
    slug?: string;
}

export interface Notification {
    _id: string;
    recipient: string;
    type: 'LIKE_POST' | 'COMMENT_POST' | 'NEW_FOLLOWER' | 'MENTION_POST' | 'MENTION_COMMENT' | 'PROJECT_INVITATION' | 'PROJECT_JOIN' | 'PROJECT_LEAVE' | 'milestone' | 'system' | 'INVITATION_ACCEPTED' | 'INVITATION_DECLINED' | 'POST_COMMENT' | 'POST_UPVOTE' | 'COMMENT_REPLY';
    actor: NotificationActor;
    relatedEntity?: NotificationEntity;
    relatedEntityType?: 'Post' | 'Project' | 'Comment';
    message: string;
    metadata?: Record<string, any>;
    isRead: boolean;
    createdAt: string;
}

export interface NotificationsResponse {
    success: boolean;
    notifications: Notification[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
    unreadCount: number;
}
