// Profile feature exports

// Types
export type {
    User,
    SocialLinks,
    ProfileTheme,
    ThemeColors,
    Project,
    UserProfileResponse,
    UserProjectsResponse,
    FollowResponse,
    FollowerUser,
    FollowersListResponse,
    FollowingListResponse,
} from './types';

// Hooks
export {
    userKeys,
    useUserProfile,
    useUserProjects,
    useFollowers,
    useFollowing,
    useFollowUser,
    useUnfollowUser,
} from './hooks/use-user';

// Components
export { ProfileHeader } from './components/profile-header';
export { ProfileStats } from './components/profile-stats';
export { SocialLinks as SocialLinksDisplay } from './components/social-links';
export { ProjectCard } from './components/project-card';
export { FollowersModal } from './components/followers-modal';

// Pages
export { ProfilePage } from './pages/profile';
export { SettingsProfilePage } from './pages/settings-profile-page';
