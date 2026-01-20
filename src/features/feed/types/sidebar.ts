// User types for sidebar components

export interface TopInnovator {
    _id: string;
    name: string;
    username: string;
    avatar?: string;
    bio?: string;
    hatchPoints: number;
    rank: number;
}

export interface TrendingProject {
    _id: string;
    title: string;
    slug: string;
    coverImage?: string;
    followers: string[];
    user: {
        _id: string;
        name: string;
        username: string;
        avatar?: string;
    };
}

export interface TopInnovatorsResponse {
    success: boolean;
    users: TopInnovator[];
}

export interface TrendingProjectsResponse {
    success: boolean;
    projects: TrendingProject[];
}
