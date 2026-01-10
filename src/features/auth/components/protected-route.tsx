import { ReactNode } from 'react';
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
        // Store the attempted URL to redirect back after login
        const returnUrl = encodeURIComponent(location.pathname + location.search);
        return <Navigate to={`${redirectTo}?returnUrl=${returnUrl}`} />;
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
