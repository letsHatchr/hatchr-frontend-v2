import axios, { AxiosError } from 'axios';
import { useAuthStore } from '@/store/auth-store';

// Create axios instance
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:7000/api',
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 30000,
});

// Request interceptor - add auth token
api.interceptors.request.use(
    (config) => {
        const token = useAuthStore.getState().token;
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error: AxiosError) => {
        return Promise.reject(error);
    }
);

// Response interceptor - handle errors
api.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        if (error.response?.status === 401) {
            // Token expired or invalid - logout user
            useAuthStore.getState().logout();
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;

// Type-safe API helpers
export const apiGet = <T>(url: string, config?: Parameters<typeof api.get>[1]) =>
    api.get<T>(url, config).then((res) => res.data);

export const apiPost = <T>(url: string, data?: unknown, config?: Parameters<typeof api.post>[2]) =>
    api.post<T>(url, data, config).then((res) => res.data);

export const apiPut = <T>(url: string, data?: unknown, config?: Parameters<typeof api.put>[2]) =>
    api.put<T>(url, data, config).then((res) => res.data);

export const apiDelete = <T>(url: string, config?: Parameters<typeof api.delete>[1]) =>
    api.delete<T>(url, config).then((res) => res.data);
