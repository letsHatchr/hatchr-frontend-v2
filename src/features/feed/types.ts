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
    content: string;
    user: PostAuthor;
    createdAt: string;
    replies?: PostComment[];
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
    createdAt: string;
    updatedAt: string;
}

export interface PostsResponse {
    success: boolean;
    posts: Post[];
    page: number;
    totalPages: number;
    totalPosts: number;
}

export interface FeedParams {
    page?: number;
    limit?: number;
    sort?: 'new' | 'rising' | 'upvotes' | 'best';
    type?: 'forYou' | 'following';
}
