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
            const endpoint = params.type === 'following' ? '/posts/following' : '/posts';
            const response = await api.get<PostsResponse>(endpoint, {
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
            if (lastPage.pagination?.hasMore) {
                return lastPage.pagination.currentPage + 1;
            }
            return undefined;
        },
        initialPageParam: 1,
    });
}

// Create a new post
export function useCreatePost() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (vars: FormData) => {
            const { data } = await api.post('/posts', vars, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: postKeys.all });
        },
    });
}

// Update a post
export function useUpdatePost() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, data }: { id: string; data: FormData }) => {
            const { data: res } = await api.put(`/posts/${id}`, data, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            return res;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: postKeys.all });
        },
    });
}

// Vote on a post - Optimistic update (Reddit-style, no refetch/reorder)
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
            // Cancel any outgoing refetches to avoid overwriting optimistic update
            await queryClient.cancelQueries({ queryKey: postKeys.all });

            // Snapshot previous value for rollback
            const previousData = queryClient.getQueriesData({ queryKey: postKeys.all });

            // Optimistically update all feed caches containing this post
            queryClient.setQueriesData(
                { queryKey: postKeys.all },
                (oldData: unknown) => {
                    if (!oldData) return oldData;

                    // Handle infinite query structure (pages array)
                    if (typeof oldData === 'object' && 'pages' in (oldData as Record<string, unknown>)) {
                        const data = oldData as { pages: Array<{ posts?: Post[] }> };
                        return {
                            ...data,
                            pages: data.pages.map(page => ({
                                ...page,
                                posts: page.posts?.map(post => {
                                    if (post._id !== postId) return post;

                                    const currentlyUpvoted = post.hasUpvoted;
                                    const currentlyDownvoted = post.hasDownvoted;

                                    if (voteType === 'up') {
                                        return {
                                            ...post,
                                            hasUpvoted: !currentlyUpvoted,
                                            hasDownvoted: false,
                                            upvoteCount: currentlyUpvoted
                                                ? (post.upvoteCount || 1) - 1
                                                : (post.upvoteCount || 0) + 1,
                                            downvoteCount: currentlyDownvoted
                                                ? (post.downvoteCount || 1) - 1
                                                : post.downvoteCount || 0,
                                        };
                                    } else {
                                        return {
                                            ...post,
                                            hasDownvoted: !currentlyDownvoted,
                                            hasUpvoted: false,
                                            downvoteCount: currentlyDownvoted
                                                ? (post.downvoteCount || 1) - 1
                                                : (post.downvoteCount || 0) + 1,
                                            upvoteCount: currentlyUpvoted
                                                ? (post.upvoteCount || 1) - 1
                                                : post.upvoteCount || 0,
                                        };
                                    }
                                })
                            }))
                        };
                    }
                    return oldData;
                }
            );

            return { previousData };
        },
        onError: (_err, _vars, context) => {
            // Rollback to previous state on error
            if (context?.previousData) {
                context.previousData.forEach(([queryKey, data]) => {
                    queryClient.setQueryData(queryKey, data);
                });
            }
        },
        onSuccess: (data, { postId }) => {
            // Update only vote-related fields from server response - preserve user data!
            if (data.post) {
                queryClient.setQueriesData(
                    { queryKey: postKeys.all },
                    (oldData: unknown) => {
                        if (!oldData) return oldData;

                        if (typeof oldData === 'object' && 'pages' in (oldData as Record<string, unknown>)) {
                            const dd = oldData as { pages: Array<{ posts?: Post[] }> };
                            return {
                                ...dd,
                                pages: dd.pages.map(page => ({
                                    ...page,
                                    posts: page.posts?.map(post => {
                                        if (post._id !== postId) return post;
                                        // Only update vote-related fields, keep everything else (user, content, etc.)
                                        return {
                                            ...post,
                                            hasUpvoted: data.post.hasUpvoted,
                                            hasDownvoted: data.post.hasDownvoted,
                                            upvoteCount: data.post.upvoteCount,
                                            downvoteCount: data.post.downvoteCount,
                                            upvotes: data.post.upvotes,
                                            downvotes: data.post.downvotes,
                                        };
                                    })
                                }))
                            };
                        }
                        return oldData;
                    }
                );
            }
        },
    });
}

// Comment on a post
export function useCommentOnPost() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ postId, content, parentCommentId }: { postId: string; content: string; parentCommentId?: string }) => {
            const response = await api.post(`/posts/${postId}/comment`, {
                text: content, // Backend expects 'text', not 'content'
                parentCommentId,
            });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: postKeys.all });
        },
    });
}

// Delete a comment
export function useDeleteComment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ postId, commentId }: { postId: string; commentId: string }) => {
            const response = await api.delete(`/posts/${postId}/comments/${commentId}`);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: postKeys.all });
        },
    });
}

// Delete a post
export function useDeletePost() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (postId: string) => {
            const response = await api.delete(`/posts/${postId}`);
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
            if (lastPage.pagination?.hasMore) {
                return lastPage.pagination.currentPage + 1;
            }
            return undefined;
        },
        initialPageParam: 1,
        enabled: !!projectSlug,
    });
}
