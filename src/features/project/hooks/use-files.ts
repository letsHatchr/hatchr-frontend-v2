/**
 * React Query hooks for project files
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import type { FilesResponse, FileDownloadResponse } from '../types/file-types';

export const fileKeys = {
    all: ['files'] as const,
    project: (projectId: string) => [...fileKeys.all, 'project', projectId] as const,
};

/**
 * Fetch files for a project
 */
export function useProjectFiles(projectId: string, page: number = 1) {
    return useQuery({
        queryKey: [...fileKeys.project(projectId), page],
        queryFn: async () => {
            const response = await api.get<FilesResponse>(
                `/projects/${projectId}/files`,
                { params: { page, limit: 20 } }
            );
            return response.data;
        },
        enabled: !!projectId,
    });
}

/**
 * Download a file (get presigned URL)
 */
export function useDownloadFile() {
    return useMutation({
        mutationFn: async (fileId: string) => {
            const response = await api.get<FileDownloadResponse>(
                `/files/${fileId}/download`
            );
            return response.data;
        },
        onSuccess: (data) => {
            // Trigger download
            const link = document.createElement('a');
            link.href = data.downloadUrl;
            link.target = '_blank';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        },
    });
}

/**
 * Delete a file
 */
export function useDeleteFile() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (fileId: string) => {
            const response = await api.delete(`/files/${fileId}`);
            return response.data;
        },
        onSuccess: () => {
            // Invalidate files queries
            queryClient.invalidateQueries({ queryKey: fileKeys.all });
        },
    });
}

/**
 * Upload a file to a project
 */
export function useUploadFile() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ projectId, file }: { projectId: string; file: File }) => {
            const formData = new FormData();
            formData.append('file', file);

            const response = await api.post(
                `/projects/${projectId}/files`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );
            return response.data;
        },
        onSuccess: (_, variables) => {
            // Invalidate files queries for this project
            queryClient.invalidateQueries({ queryKey: fileKeys.project(variables.projectId) });
        },
    });
}
