// Profile feature types

export interface User {
    _id: string;
    name: string;
    username: string;
    email?: string;
    avatar?: string;
    bannerImage?: string;
    bio?: string;
    about?: string;
    hatchPoints: number;
    followers: string[];
    following: string[];
    followedProjects?: Project[];
    socialLinks?: SocialLinks;
    profileTheme?: ProfileTheme;
    emailNotifications?: EmailNotificationPreferences;
    // New fields from wireframe
    college?: string;
    school?: string;
    interests?: string[]; // Tags like AI/ML, IoT, Robotics, Backend
    achievements?: Achievement[];
    experience?: Experience[];
    createdAt: string;
    updatedAt: string;
}

export interface Achievement {
    _id?: string;
    title: string;
    description?: string;
    icon?: string;
    earnedAt?: string;
    link?: string;
}

export interface Experience {
    _id?: string;
    company: string;
    role: string;
    startDate: string;
    endDate?: string;
    isCurrent?: boolean;
    description?: string;
}

export interface SocialLinks {
    twitter?: string;
    linkedin?: string;
    instagram?: string;
    github?: string;
    website?: string;
    customLink?: string;
    huggingface?: string;
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

export interface EmailNotificationPreferences {
    mentions: boolean;
    watchedProjectPosts: boolean;
    collaborationInvites: boolean;
    inviteResponses: boolean;
    pointsMilestones: boolean;
    trendingProjects: boolean;
    newFollowers: boolean;
    weeklySummary: boolean;
    monthlyStats: boolean;
    sundayDigest: boolean;
}

export interface Project {
    _id: string;
    title: string;
    slug: string;
    description?: string;
    coverImage?: string;
    category?: string;
    categories?: string[];
    user: {
        _id: string;
        name: string;
        username: string;
        avatar?: string;
    };
    followers: string[];
    totalUpvotes?: number;
    totalComments?: number;
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
