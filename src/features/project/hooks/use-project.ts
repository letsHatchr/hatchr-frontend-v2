import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import type { Project, ProjectPostsResponse } from '../types';

// Query keys
export const projectKeys = {
    all: ['projects'] as const,
    detail: (slug: string) => [...projectKeys.all, 'detail', slug] as const,
    posts: (slug: string) => [...projectKeys.all, 'posts', slug] as const,
};

/**
 * Fetch single project by slug
 */
export function useProject(slug: string) {
    return useQuery({
        queryKey: projectKeys.detail(slug),
        queryFn: async () => {
            const { data } = await api.get<Project>(`/projects/${slug}`);
            return data;
        },
        enabled: !!slug,
    });
}

/**
 * Fetch project posts with infinite scroll
 */
export function useProjectPosts(projectSlug: string) {
    return useInfiniteQuery({
        queryKey: projectKeys.posts(projectSlug),
        queryFn: async ({ pageParam = 1 }) => {
            const { data } = await api.get<ProjectPostsResponse>(
                `/projects/${projectSlug}/posts`,
                {
                    params: {
                        page: pageParam,
                        limit: 10,
                    },
                }
            );
            return data;
        },
        getNextPageParam: (lastPage) => {
            return lastPage.pagination.hasMore
                ? lastPage.pagination.currentPage + 1
                : undefined;
        },
        initialPageParam: 1,
        enabled: !!projectSlug,
    });
}

/**
 * Watch/follow a project
 */
export function useWatchProject() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (projectId: string) => {
            const { data } = await api.post(`/projects/${projectId}/follow`);
            return data;
        },
        onSuccess: () => {
            // Invalidate all project queries to refetch with updated watch status
            queryClient.invalidateQueries({ queryKey: projectKeys.all });
        },
    });
}

/**
 * Unwatch/unfollow a project
 */
export function useUnwatchProject() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (projectId: string) => {
            const { data } = await api.post(`/projects/${projectId}/unfollow`);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: projectKeys.all });
        },
    });
}

/**
 * Archive a project (owner only)
 */
export function useArchiveProject() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (projectId: string) => {
            const { data } = await api.post(`/projects/${projectId}/archive`);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: projectKeys.all });
        },
    });
}

/**
 * Unarchive a project (owner only)
 */
export function useUnarchiveProject() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (projectId: string) => {
            const { data } = await api.post(`/projects/${projectId}/unarchive`);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: projectKeys.all });
        },
    });
}

/**
 * Delete a project (owner only)
 */
export function useDeleteProject() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (projectSlug: string) => {
            const { data } = await api.delete(`/projects/${projectSlug}`);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: projectKeys.all });
        },
    });
}
