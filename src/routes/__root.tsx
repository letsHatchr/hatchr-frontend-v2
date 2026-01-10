'use client';

import { createRootRoute, createRoute, Outlet } from '@tanstack/react-router';
import { Toaster } from '@/components/ui/sonner';

// Auth Pages
import {
    LoginPage,
    SignupPage,
    VerifyOtpPage,
    ForgotPasswordPage,
    ResetPasswordPage,
    GuestRoute,
} from '@/features/auth';

// Feed
import { FeedPage } from '@/features/feed';

// ProfilePage
import { ProfilePage } from '@/features/profile';

// Project
import { ProjectPage, ProjectFilesPage } from '@/features/project';

// Root layout
const rootRoute = createRootRoute({
    component: () => (
        <div className="min-h-screen bg-background text-foreground">
            <Outlet />
            <Toaster
                position="top-right"
                richColors
                closeButton
                theme="dark"
            />
        </div>
    ),
});

// Home redirects to feed
const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    component: () => <FeedPage />,
});

// Auth routes (wrapped with GuestRoute to redirect if logged in)
const loginRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/login',
    component: () => (
        <GuestRoute>
            <LoginPage />
        </GuestRoute>
    ),
});

const signupRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/signup',
    component: () => (
        <GuestRoute>
            <SignupPage />
        </GuestRoute>
    ),
});

const verifyOtpRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/verify-otp',
    component: VerifyOtpPage,
    validateSearch: (search: Record<string, unknown>) => ({
        email: search.email as string | undefined,
    }),
});

const forgotPasswordRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/forgot-password',
    component: () => (
        <GuestRoute>
            <ForgotPasswordPage />
        </GuestRoute>
    ),
});

const resetPasswordRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/reset-password',
    component: ResetPasswordPage,
    validateSearch: (search: Record<string, unknown>) => ({
        token: search.token as string | undefined,
    }),
});

// Feed route (main app view)
const feedRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/feed',
    component: FeedPage,
});

// Project routes
const projectRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/project/$slug',
    component: ProjectPage,
});

const projectFilesRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/project/$slug/files',
    component: ProjectFilesPage,
});

// Profile route (user profile with @username or just username)
const profileRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/$username',
    component: ProfilePage,
});

// Export the route tree
export const routeTree = rootRoute.addChildren([
    indexRoute,
    loginRoute,
    signupRoute,
    verifyOtpRoute,
    forgotPasswordRoute,
    resetPasswordRoute,
    feedRoute,
    projectRoute,
    projectFilesRoute,
    profileRoute,
]);
