import type { ReactNode } from 'react';
import { Navigate, useLocation } from '@tanstack/react-router';
import { useAuthStore } from '@/store';
import { PageLoader } from '@/components/loading';

interface ProtectedRouteProps {
    children: ReactNode;
    redirectTo?: string;
}

/**
 * Protected Route wrapper component
 * Redirects unauthenticated users to login page
 */
export function ProtectedRoute({ children, redirectTo = '/login' }: ProtectedRouteProps) {
    const { isAuthenticated, isLoading } = useAuthStore();
    const location = useLocation();

    // Show loading state while checking auth
    if (isLoading) {
        return <PageLoader />;
    }

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
        // Don't store auth pages as returnUrl to prevent redirect loops
        const authPages = ['/login', '/signup', '/forgot-password', '/reset-password', '/verify-otp'];

        // Only create returnUrl if not already on an auth page
        if (!authPages.includes(location.pathname)) {
            // TanStack Router location.search is an object, need to serialize it
            const searchObj = typeof location.search === 'object' && location.search !== null
                ? location.search as Record<string, string>
                : {};

            // Remove any existing returnUrl from search to prevent nesting
            const { returnUrl: existingReturnUrl, ...cleanSearch } = searchObj;

            // Use existing returnUrl if present, otherwise build from current path
            let targetReturnUrl: string;
            if (existingReturnUrl && !authPages.some(p => existingReturnUrl.startsWith(p))) {
                targetReturnUrl = existingReturnUrl;
            } else {
                const searchString = new URLSearchParams(cleanSearch).toString();
                targetReturnUrl = searchString ? `${location.pathname}?${searchString}` : location.pathname;
            }

            // Use window.location for more reliable redirect with query params
            if (typeof window !== 'undefined') {
                window.location.href = `${redirectTo}?returnUrl=${encodeURIComponent(targetReturnUrl)}`;
                return <PageLoader />;
            }
        }

        // If already on auth page, just redirect to login without returnUrl
        return <Navigate to={redirectTo as any} />;
    }

    return <>{children}</>;
}

/**
 * Guest Route wrapper - redirects authenticated users away from auth pages
 */
export function GuestRoute({ children, redirectTo = '/feed' }: ProtectedRouteProps) {
    const { isAuthenticated, isLoading } = useAuthStore();

    // Show loading state while checking auth
    if (isLoading) {
        return <PageLoader />;
    }

    // Redirect to feed if already authenticated
    if (isAuthenticated) {
        return <Navigate to={redirectTo} />;
    }

    return <>{children}</>;
}

export default ProtectedRoute;
