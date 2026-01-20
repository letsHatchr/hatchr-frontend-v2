import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import type { TopInnovatorsResponse, TrendingProjectsResponse } from '../types/sidebar';

// Query keys
export const sidebarKeys = {
    topInnovators: ['topInnovators'] as const,
    trendingProjects: ['trendingProjects'] as const,
};

// Fetch top innovators
export function useTopInnovators(limit: number = 5) {
    return useQuery({
        queryKey: [...sidebarKeys.topInnovators, limit],
        queryFn: async () => {
            const response = await api.get<TopInnovatorsResponse>('/users/top-innovators', {
                params: { limit },
            });
            return response.data;
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
}

// Fetch trending projects
export function useTrendingProjects(limit: number = 5) {
    return useQuery({
        queryKey: [...sidebarKeys.trendingProjects, limit],
        queryFn: async () => {
            const response = await api.get<TrendingProjectsResponse>('/projects/trending', {
                params: { limit },
            });
            return response.data;
        },
        staleTime: 0, // Always fetch fresh data for trending counts
    });
}
