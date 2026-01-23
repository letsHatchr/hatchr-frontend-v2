import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

export interface SearchUserResult {
    _id: string;
    username: string;
    name: string;
    avatar?: string;
    bio?: string;
}

export function useSearchUsers(query: string) {
    return useQuery({
        queryKey: ['users', 'search', query],
        queryFn: async () => {
            if (!query || query.length < 2) return [];

            // Using the existing search endpoint
            const { data } = await api.get<{ users: SearchUserResult[] }>(`/search?q=${encodeURIComponent(query)}`);
            return data.users || [];
        },
        enabled: query.length >= 2,
        staleTime: 1000 * 60, // 1 minute
    });
}
