import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import type { Post, PostsResponse, FeedParams } from '../types';

// Query keys
export const postKeys = {
    all: ['posts'] as const,
    feed: (params: FeedParams) => [...postKeys.all, 'feed', params] as const,
    detail: (id: string) => [...postKeys.all, 'detail', id] as const,
    project: (projectId: string) => [...postKeys.all, 'project', projectId] as const,
};

// Fetch feed posts with infinite scroll
export function useFeedPosts(params: FeedParams = {}) {
    return useInfiniteQuery({
        queryKey: postKeys.feed(params),
        queryFn: async ({ pageParam = 1 }) => {
            const response = await api.get<PostsResponse>('/posts', {
                params: {
                    page: pageParam,
                    limit: params.limit || 10,
                    sort: params.sort || 'new',
                    type: params.type || 'forYou',
                },
            });
            return response.data;
        },
        getNextPageParam: (lastPage) => {
            if (lastPage.page < lastPage.totalPages) {
                return lastPage.page + 1;
            }
            return undefined;
        },
        initialPageParam: 1,
    });
}

// Vote on a post
export function useVotePost() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ postId, voteType }: { postId: string; voteType: 'up' | 'down' }) => {
            const response = await api.post<{ success: boolean; post: Post }>(
                `/posts/${postId}/vote`,
                { voteType }
            );
            return response.data;
        },
        onMutate: async ({ postId, voteType }) => {
            // Cancel any outgoing refetches
            await queryClient.cancelQueries({ queryKey: postKeys.all });

            // Optimistic update could go here if needed
            return { postId, voteType };
        },
        onSuccess: () => {
            // Invalidate feed to refetch with updated votes
            queryClient.invalidateQueries({ queryKey: postKeys.all });
        },
    });
}

// Comment on a post
export function useCommentOnPost() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ postId, content }: { postId: string; content: string }) => {
            const response = await api.post(`/comments`, {
                postId,
                content,
            });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: postKeys.all });
        },
    });
}

// Get single post by ID
export function usePost(postId: string) {
    return useInfiniteQuery({
        queryKey: postKeys.detail(postId),
        queryFn: async () => {
            const response = await api.get<{ success: boolean; post: Post }>(`/posts/${postId}`);
            return response.data;
        },
        enabled: !!postId,
        initialPageParam: 1,
        getNextPageParam: () => undefined,
    });
}

// Get posts for a specific project
export function useProjectPosts(projectSlug: string) {
    return useInfiniteQuery({
        queryKey: postKeys.project(projectSlug),
        queryFn: async ({ pageParam = 1 }) => {
            const response = await api.get<PostsResponse>(`/projects/${projectSlug}/posts`, {
                params: { page: pageParam, limit: 10 },
            });
            return response.data;
        },
        getNextPageParam: (lastPage) => {
            if (lastPage.page < lastPage.totalPages) {
                return lastPage.page + 1;
            }
            return undefined;
        },
        initialPageParam: 1,
        enabled: !!projectSlug,
    });
}
