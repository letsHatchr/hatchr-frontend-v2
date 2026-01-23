'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

interface ReorderProjectsPayload {
    projectIds: string[];
}

export function useReorderProjects() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload: ReorderProjectsPayload) => {
            const response = await api.put('/projects/reorder', payload);
            return response.data;
        },
        onSuccess: () => {
            // Invalidate all user-related queries to refetch with new order
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
        onError: (error) => {
            console.error('Failed to reorder projects:', error);
        }
    });
}
