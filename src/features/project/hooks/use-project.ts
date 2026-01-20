import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import type { Project, ProjectPostsResponse } from '../types';

// Query keys
export const projectKeys = {
    all: ['projects'] as const,
    detail: (slug: string) => [...projectKeys.all, 'detail', slug] as const,
    posts: (slug: string) => [...projectKeys.all, 'posts', slug] as const,
    watching: ['projects', 'watching'] as const,
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
 * Create a new project
 */
export function useCreateProject() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (vars: FormData) => {
            const { data } = await api.post('/projects', vars, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: projectKeys.all });
        },
    });
}

/**
 * Update a project
 */
export function useUpdateProject() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, data }: { id: string; data: FormData }) => {
            const { data: res } = await api.put(`/projects/${id}`, data, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            return res;
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: projectKeys.all });
            queryClient.invalidateQueries({ queryKey: projectKeys.detail(variables.data.get('slug') as string) }); // Invalidate detail if slug changed (though currently id is used)
        },
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

/**
 * Fetch projects for the current user (my projects)
 */
export function useMyProjects() {
    return useQuery({
        queryKey: projectKeys.all,
        queryFn: async () => {
            const { data } = await api.get<Project[]>('/projects/my');
            return data;
        },
    });
}

/**
 * Fetch projects the user is watching
 */
export function useWatchedProjects() {
    return useQuery({
        queryKey: projectKeys.watching,
        queryFn: async () => {
            const { data } = await api.get<{ success: boolean; projects: Project[] }>('/projects/watching');
            return data.projects;
        },
    });
}


/**
 * Fetch project partners
 */
export function useProjectPartners(projectId: string) {
    return useQuery({
        queryKey: [...projectKeys.detail(projectId), 'partners'],
        queryFn: async () => {
            // Correct API endpoint for fetching partners
            const { data } = await api.get<{ success: boolean; data: any }>(`/projects/${projectId}/partners`);
            return data.data;
        },
        enabled: !!projectId,
    });
}

/**
 * Invite a partner (owner only)
 */
export function useInvitePartner() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ projectId, usernameOrEmail }: { projectId: string; usernameOrEmail: string; projectSlug?: string }) => {
            const { data } = await api.post(`/projects/${projectId}/invitations`, { usernameOrEmail });
            return data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: projectKeys.detail(variables.projectSlug || variables.projectId) });
        },
    });
}

/**
 * Remove a partner (owner only)
 */
export function useRemovePartner() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ projectId, partnerId }: { projectId: string; partnerId: string; projectSlug?: string }) => {
            const { data } = await api.delete(`/projects/${projectId}/partners/${partnerId}`);
            return data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: projectKeys.detail(variables.projectSlug || variables.projectId) });
        },
    });
}

/**
 * Leave a project
 */
export function useLeaveProject() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (projectId: string) => {
            const { data } = await api.post(`/projects/${projectId}/leave`);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: projectKeys.all });
        },
    });
}

// Withdraw invitation
export const useWithdrawInvitation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ projectId, invitationId }: { projectId: string; invitationId: string; projectSlug?: string }) => {
            const { data } = await api.delete(`/projects/${projectId}/invitations/${invitationId}`);
            return data;
        },
        onSuccess: (_data, variables) => {
            // Invalidate project details to refresh pending invitations list
            queryClient.invalidateQueries({
                queryKey: projectKeys.detail(variables.projectSlug || variables.projectId)
            });
            // Also invalidate user's invitations just in case
            queryClient.invalidateQueries({ queryKey: ['invitations', 'my'] });
        },
    });
};

/**
 * Fetch my invitations
 */
export function useMyInvitations() {
    return useQuery({
        queryKey: ['invitations', 'my'],
        queryFn: async () => {
            const { data } = await api.get<{ success: boolean; data: any[] }>('/projects/invitations/my');
            return data.data;
        },
    });
}

/**
 * Accept invitation
 */
export function useAcceptInvitation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (token: string) => {
            const { data } = await api.post(`/projects/invitations/${token}/accept`);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: projectKeys.all });
            queryClient.invalidateQueries({ queryKey: ['invitations', 'my'] });
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        },
    });
}

/**
 * Decline invitation
 */
export function useDeclineInvitation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (token: string) => {
            const { data } = await api.post(`/projects/invitations/${token}/decline`);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['invitations', 'my'] });
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        },
    });
}


