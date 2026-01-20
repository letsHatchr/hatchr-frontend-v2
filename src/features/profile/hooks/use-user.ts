import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store';
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

// Update user profile keys
export function useUserUpdate() {
    const queryClient = useQueryClient();
    const setUser = useAuthStore((state) => state.setUser);

    return useMutation({
        mutationFn: async ({ userId, data }: { userId: string; data: Partial<any> }) => {
            const response = await api.put(`/users/${userId}`, data);
            return response.data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: userKeys.profile(data.user?.username || '') });
            queryClient.invalidateQueries({ queryKey: userKeys.all });

            // Update auth store with fresh user data
            if (data.user) {
                setUser(data.user);
            }
        },
    });
}

// Upload Avatar
export function useUploadAvatar() {
    const queryClient = useQueryClient();
    const setUser = useAuthStore((state) => state.setUser);

    return useMutation({
        mutationFn: async (file: File) => {
            const formData = new FormData();
            formData.append('avatar', file);
            const response = await api.post('/users/avatar', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: userKeys.all });

            // Update auth store with fresh user data containing new avatar
            if (data.user) {
                setUser(data.user);
            }
        },
    });
}

// Upload Banner
export function useUploadBanner() {
    const queryClient = useQueryClient();
    const setUser = useAuthStore((state) => state.setUser);

    return useMutation({
        mutationFn: async (file: File) => {
            const formData = new FormData();
            formData.append('banner', file);
            const response = await api.post('/users/upload-banner', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: userKeys.all });

            // Update auth store with fresh user data containing new banner
            if (data.user) {
                setUser(data.user);
            }
        },
    });
}
