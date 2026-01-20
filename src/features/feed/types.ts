// Post types for the feed feature

export interface PostAuthor {
    _id: string;
    name: string;
    username: string;
    avatar?: string;
}

export interface PostProject {
    _id: string;
    title: string;
    slug: string;
    coverImage?: string;
}

export interface PostMedia {
    url: string;
    type: 'image' | 'video';
    contentType?: string;
    order?: number;
}

export interface PostComment {
    _id: string;
    text: string;
    user: PostAuthor | null;
    createdAt: string;
    replies?: PostComment[];
    isDeleted?: boolean;
}

export interface Post {
    _id: string;
    title: string;
    slug: string;
    caption: string;
    contentFormat?: 'editorjs' | 'tiptap';
    media: PostMedia[];
    project: PostProject;
    type: 'update' | 'announcement' | 'milestone' | 'hatching';
    user: PostAuthor;
    upvotes: string[];
    downvotes: string[];
    comments: PostComment[];
    files?: {
        _id: string;
        fileName: string;
        originalFileName: string;
        fileType: string;
        fileSize: number;
        r2Key: string;
        uploadedBy: string;
    }[];
    createdAt: string;
    updatedAt: string;
}

export interface PostsResponse {
    success: boolean;
    posts: Post[];
    pagination: {
        currentPage: number;
        totalPages?: number;
        totalPosts?: number;
        hasMore: boolean;
        limit: number;
    };
}

export interface FeedParams {
    page?: number;
    limit?: number;
    sort?: 'new' | 'rising' | 'upvotes' | 'best';
    type?: 'forYou' | 'following';
}
