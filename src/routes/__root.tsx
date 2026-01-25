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
    ProtectedRoute,
} from '@/features/auth';

// Feed
import { FeedPage, PostPage } from '@/features/feed';
import { LeaderboardPage } from '@/features/feed/pages/leaderboard-page';
import { CreatePage } from '@/features/feed/pages/create-page';

// ProfilePage
import { ProfilePage, SettingsProfilePage } from '@/features/profile';

// Project
import { ProjectPage } from '@/features/project/pages/project-page';
import { ProjectFilesPage } from '@/features/project/pages/project-files-page';
import { WatchingPage } from '@/features/project/pages/watching-page';
import { NotificationsPage } from '@/features/notifications/pages/notifications-page';
import { InvitationsPage } from '@/features/project/pages/invitations-page';


// Search
import { SearchPage } from './search';

// Root layout
import { Navbar } from '@/components/navbar';
import { MobileBottomNav } from '@/components/mobile-bottom-nav';
import { LoginPromptModal } from '@/components/login-prompt-modal';

const rootRoute = createRootRoute({
    component: () => (
        <div className="min-h-screen bg-background text-foreground">
            <Navbar />
            <Outlet />
            <MobileBottomNav />
            <LoginPromptModal />
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
        email: search.email as string | undefined,
    }),
});

// Feed route (main app view)
const feedRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/feed',
    component: FeedPage,
});

// Create route (for mobile bottom nav)
const createPageRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/create',
    component: () => (
        <ProtectedRoute>
            <CreatePage />
        </ProtectedRoute>
    ),
});

// Project routes
const projectRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/project/$slug',
    component: ProjectPage,
    validateSearch: (search: Record<string, unknown>) => ({
        tab: (search.tab as string) || 'timeline',
    }),
});

const projectFilesRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/project/$slug/files',
    component: ProjectFilesPage,
});

// Watching route
const watchingRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/watching',
    component: () => (
        <ProtectedRoute>
            <WatchingPage />
        </ProtectedRoute>
    ),
});

// Notifications route
const notificationsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/notifications',
    component: () => (
        <ProtectedRoute>
            <NotificationsPage />
        </ProtectedRoute>
    ),
});

// Invitations route
const invitationsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/invitations',
    component: () => (
        <ProtectedRoute>
            <InvitationsPage />
        </ProtectedRoute>
    ),
});

// Settings route
const settingsProfileRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/settings/profile',
    component: () => (
        <ProtectedRoute>
            <SettingsProfilePage />
        </ProtectedRoute>
    ),
});

// Search route
const searchRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/search',
    component: SearchPage,
    validateSearch: (search: Record<string, unknown>) => ({
        q: (search.q as string) || '',
    }),
});

// Leaderboard route (must come before profile catch-all)
const leaderboardRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/leaderboard',
    component: LeaderboardPage,
});

// Profile route (user profile with @username or just username)
const profileRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/$username',
    component: ProfilePage,
});

// Post route
const postRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/post/$slug',
    component: PostPage,
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
    postRoute,
    projectRoute,
    projectFilesRoute,
    settingsProfileRoute,
    watchingRoute,

    notificationsRoute,
    invitationsRoute,
    searchRoute,
    createPageRoute,  // Must come before profileRoute
    leaderboardRoute, // Must come before profileRoute
    profileRoute,
]);
