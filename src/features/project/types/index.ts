export interface Project {
    _id: string;
    slug: string;
    title: string;
    description: string;
    coverImage?: string;
    category: string;
    tags: string[];
    user: {
        _id: string;
        username: string;
        name: string;
        avatar?: string;
    };
    partners: Partner[];
    watchers: string[]; // Array of user IDs - was "followers" in backend
    posts: string[]; // Array of post IDs
    files: ProjectFile[];
    isArchived: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface Partner {
    user: {
        _id: string;
        username: string;
        name: string;
        avatar?: string;
    };
    role: string;
    permissions: {
        canPost: boolean;
        canEdit: boolean;
        canDelete: boolean;
        canInvite: boolean;
        canManagePartners: boolean;
    };
    joinedAt: string;
}

export interface ProjectFile {
    _id: string;
    originalFileName: string;
    fileName: string;
    fileSize: number;
    fileType: string;
    uploadedBy: {
        _id: string;
        username: string;
        name: string;
    };
    createdAt: string;
}

export interface ProjectPost {
    _id: string;
    slug: string;
    title: string;
    caption: string;
    contentFormat?: 'editorjs' | 'tiptap';
    media: Array<{
        url: string;
        type: 'image' | 'video';
        contentType?: string;
        order: number;
    }>;
    user: {
        _id: string;
        username: string;
        name: string;
        avatar?: string;
    };
    project: {
        _id: string;
        slug: string;
        title: string;
    };
    type: 'update' | 'announcement' | 'milestone' | 'hatching';
    upvotes: string[];
    downvotes: string[];
    comments: any[];
    hasUpvoted?: boolean;
    hasDownvoted?: boolean;
    upvoteCount?: number;
    downvoteCount?: number;
    createdAt: string;
}

export interface ProjectPostsResponse {
    success: boolean;
    posts: ProjectPost[];
    pagination: {
        currentPage: number;
        hasMore: boolean;
        limit: number;
    };
}
