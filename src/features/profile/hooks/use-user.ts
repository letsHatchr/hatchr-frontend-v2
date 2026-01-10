import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import type {
    UserProfileResponse,
    Project,
    FollowResponse,
    FollowersListResponse,
    FollowingListResponse,
} from '../types';

// Query keys
export const userKeys = {
    all: ['users'] as const,
    profile: (username: string) => [...userKeys.all, 'profile', username] as const,
    projects: (username: string) => [...userKeys.all, 'projects', username] as const,
    followers: (userId: string) => [...userKeys.all, 'followers', userId] as const,
    following: (userId: string) => [...userKeys.all, 'following', userId] as const,
};

// Fetch user profile by username
export function useUserProfile(username: string) {
    return useQuery({
        queryKey: userKeys.profile(username),
        queryFn: async () => {
            const response = await api.get<UserProfileResponse>(`/users/${username}`);
            return response.data;
        },
        enabled: !!username,
        staleTime: 2 * 60 * 1000, // 2 minutes
    });
}

// Fetch user's projects
export function useUserProjects(username: string) {
    return useQuery({
        queryKey: userKeys.projects(username),
        queryFn: async () => {
            // Backend returns projects as direct array, not wrapped in object
            const response = await api.get<Project[]>(`/projects/user/${username}`);
            return { success: true, projects: response.data };
        },
        enabled: !!username,
        staleTime: 2 * 60 * 1000,
    });
}

// Fetch followers list
export function useFollowers(userId: string) {
    return useQuery({
        queryKey: userKeys.followers(userId),
        queryFn: async () => {
            const response = await api.get<FollowersListResponse>(`/users/${userId}/followers`);
            return response.data;
        },
        enabled: !!userId,
    });
}

// Fetch following list
export function useFollowing(userId: string) {
    return useQuery({
        queryKey: userKeys.following(userId),
        queryFn: async () => {
            const response = await api.get<FollowingListResponse>(`/users/${userId}/following`);
            return response.data;
        },
        enabled: !!userId,
    });
}

// Follow user mutation
export function useFollowUser() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (userId: string) => {
            const response = await api.post<FollowResponse>(`/users/follow/${userId}`);
            return response.data;
        },
        onSuccess: () => {
            // Invalidate user profile to refresh follow status
            queryClient.invalidateQueries({ queryKey: userKeys.all });
        },
    });
}

// Unfollow user mutation
export function useUnfollowUser() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (userId: string) => {
            const response = await api.post<FollowResponse>(`/users/unfollow/${userId}`);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: userKeys.all });
        },
    });
}

// Toggle project as key project
export function useToggleKeyProject() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ projectId, isKey }: { projectId: string; isKey: boolean }) => {
            const endpoint = isKey ? 'mark-key' : 'unmark-key';
            const response = await api.post(`/projects/${projectId}/${endpoint}`);
            return response.data;
        },
        onSuccess: () => {
            // Invalidate projects to refresh the list
            queryClient.invalidateQueries({ queryKey: userKeys.all });
        },
    });
}
