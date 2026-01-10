// Profile feature types

export interface User {
    _id: string;
    name: string;
    username: string;
    email?: string;
    avatar?: string;
    bannerImage?: string;
    bio?: string;
    hatchPoints: number;
    followers: string[];
    following: string[];
    followedProjects?: Project[];
    socialLinks?: SocialLinks;
    profileTheme?: ProfileTheme;
    // New fields from wireframe
    college?: string;
    school?: string;
    interests?: string[]; // Tags like AI/ML, IoT, Robotics, Backend
    achievements?: Achievement[];
    createdAt: string;
    updatedAt: string;
}

export interface Achievement {
    _id: string;
    title: string;
    description?: string;
    icon?: string;
    earnedAt: string;
}

export interface SocialLinks {
    twitter?: string;
    linkedin?: string;
    instagram?: string;
    github?: string;
    website?: string;
    customLink?: string;
}

export interface ProfileTheme {
    preset?: string;
    colors?: ThemeColors;
}

export interface ThemeColors {
    primary: string;
    accent: string;
    light: string;
    dark: string;
}

export interface Project {
    _id: string;
    title: string;
    slug: string;
    description?: string;
    coverImage?: string;
    user: {
        _id: string;
        name: string;
        username: string;
        avatar?: string;
    };
    watchers: string[];
    likes?: number;
    comments?: number;
    postsCount?: number;
    tags?: string[];
    isArchived?: boolean;
    isKeyProject?: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface UserProfileResponse {
    success: boolean;
    user: User;
}

export interface UserProjectsResponse {
    success: boolean;
    projects: Project[];
}

export interface FollowResponse {
    success: boolean;
    following: boolean;
    followersCount: number;
    followingCount: number;
}

export interface FollowerUser {
    _id: string;
    name: string;
    username: string;
    avatar?: string;
    bio?: string;
}

export interface FollowersListResponse {
    success: boolean;
    followers: FollowerUser[];
}

export interface FollowingListResponse {
    success: boolean;
    following: FollowerUser[];
}
