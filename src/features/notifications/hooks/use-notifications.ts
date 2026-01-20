import { useQuery, useMutation, useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import type { NotificationsResponse } from '../types';

export const notificationKeys = {
    all: ['notifications'] as const,
    list: (filter: string) => [...notificationKeys.all, 'list', filter] as const,
    unreadCount: ['notifications', 'unread-count'] as const,
};

export function useNotifications(filter: string = 'all') {
    return useInfiniteQuery({
        queryKey: notificationKeys.list(filter),
        queryFn: async ({ pageParam = 1 }) => {
            const { data } = await api.get<NotificationsResponse>('/notifications', {
                params: {
                    page: pageParam,
                    limit: 20,
                    filter,
                },
            });
            return data;
        },
        getNextPageParam: (lastPage) => {
            if (lastPage.pagination.page < lastPage.pagination.pages) {
                return lastPage.pagination.page + 1;
            }
            return undefined;
        },
        initialPageParam: 1,
    });
}

export function useUnreadCount() {
    return useQuery({
        queryKey: notificationKeys.unreadCount,
        queryFn: async () => {
            const { data } = await api.get<{ count: number }>('/notifications/unread-count');
            return data.count;
        },
        refetchInterval: 30000, // Poll every 30 seconds
    });
}

export function useMarkRead() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (notificationId: string) => {
            const { data } = await api.patch(`/notifications/${notificationId}/read`);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: notificationKeys.all });
        },
    });
}

export function useMarkAllRead() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async () => {
            const { data } = await api.patch('/notifications/mark-all-read');
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: notificationKeys.all });
        },
    });
}
