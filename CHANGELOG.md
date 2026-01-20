# Changelog

All notable changes to the hatchr-frontend-v2 codebase will be documented in this file.

## [Unreleased] - 2026-01-12

### ✨ Features
- **Navbar Polish**:
    - Refined sizing (`h-10 w-10`) and spacing (`gap-2`) of Notification and Watching icons.
    - Replaced Shadcn `Button` with native buttons to overcome sizing constraints.
    - Added "pulse" animation to the notification badge.
- **Post Card Typography**: Implemented text truncation with native tooltip for long project names (`max-w-[250px]`) in the post metadata line.

### 🐛 Bug Fixes
- **Following Feed**: Fixed filter logic so the "Following" tab correctly fetches posts only from followed users and projects.
- **Trending Projects Watchers**:
    - Updated `TrendingProject` type logic to use `followers` array instead of non-existent `watchers` count.
    - Set `staleTime: 0` in `useTrendingProjects` hook to ensure fresh data and correct watcher counts.

### ✨ Features
- **Video Autoplay**:
    - Implemented smart autoplay for videos when they are 50% visible in the viewport.
    - Added continuous looping for all videos.
    - Enforced `muted` by default but added a convenient volume toggle.
    - Integrated logic into `MediaCarousel` with a new `AutoplayVideo` component.

#### Project Page Unification
- **Unified Views**: Merged the separate "Project Files" page into the main `ProjectPage`.
- **View Toggle**: Added a state-based toggle to switch between **Project Timeline** and **Project Files** views without page navigation.
    - Added "View Files" / "View Timeline" button to the project header.
    - Updated `ProjectSidebar` to reflect and control the current view state.

#### Global Create Post
- **Navbar Integration**: Added a global "Create Post" button to the main navigation bar.
- **Project Selection**: Updated `CreatePostModal` to allow users to select a project when creating a post from outside a specific project context.
- **New Hook**: Implemented `useMyProjects` hook to fetch the current user's available projects.

#### Profile Enhancements
- **Project Categories**: Updated `HorizontalProjectCard` to display project categories as orange badges under the title.
- **Type Definitions**: Updated `features/profile/types.ts` to include `category` and `categories` in the `Project` interface.
- **Sidebar Redesign**:
    - Increased avatar size (`w-24`) and implemented overlap with banner.
    - Switched to side-by-side (row) layout for avatar and name.
    - Left-aligned Achievements list with bullets for better readability.
- **Image Uploads**:
    - Added UI controls (Camera icon, "Change Cover" button) in Profile Settings.
    - Implemented `useUploadAvatar` and `useUploadBanner` hooks.

#### State Management
- **Navbar Synchronization**: Updated `use-user.ts` mutations (`useUserUpdate`, `useUploadAvatar`) to manually update `useAuthStore` on success, ensuring immediate UI reflection of profile changes.

#### Comment System
- **Threading**: Implemented Reddit-style nested comments with visual indentation guides.
- **Interactions**:
    - Added inline "Reply" functionality.
    - Added "Delete" button with confirmation dialog for authorized users.
    - Integrated Upvote/Downvote actions with the backend.
- **Data Handling**:
    - Implemented client-side `buildCommentTree` utility for hierarchical rendering.
    - Added proper optimistic updates (invalidation) for comment actions.

#### New Pages
- **Post Detail**: Added `/post/$slug` route and page to view single posts and full conversation threads.
- **Team Management**:
    - **Invitation Actions**: Added "Accept" and "Decline" buttons locally within the **Notifications Page** for `PROJECT_INVITATION` items.
    - **State Sync**: Implemented robust checking against `myInvitations` to ensure "Accept/Decline" buttons only appear for valid, pending invites.
    - **Feedback**: Added immediate UI feedback ("Accepted", "Declined") to notification items upon action.

### 🎨 UI/UX Improvements

#### Media Display (`MediaCarousel`)
- **Visual Stability**: Enforced a fixed height for the media container to prevent layout shifts/jumps when navigating between images of different aspect ratios.
- **"Reddit-style" Rendering**: 
    - Moved from `object-cover` (crop) to `object-contain` (fit) to ensure images are fully visible.
    - Added a cinematic blurred background (`blur-xl`) behind the main image to fill empty space aesthetically.
- **Refinement**: Removed forced 16/9 `AspectRatio` in favor of the new flexible container.

#### Timeline & Feed
- **Cleaner Timeline**: Reduced the size of the timeline indicator dots by 50% and re-aligned the connecting vertical line for a more subtle look.
- **Tighter Spacing**: Reduced the vertical gap between post titles and media content in `PostCard` for a more compact presentation.
- **Card Layout**: Adjusted `HorizontalProjectCard` layout to a fixed 40% image / 60% content split.

#### Post & Timeline Layout
- **PostCard Variants**: Split `PostCard` into `feed` (expanded, standard size) and `timeline` (compact, collapsed) variants to optimize for different contexts.
- **Timeline Styling**:
    - Added decorative arrow to the vertical timeline line.
    - Centered the timeline container with a `max-w-2xl` constraint.
    - Centered the timeline container with a `max-w-2xl` constraint.
    - Restored full-width items within the constrained container.
- **Timeline Logic**:
    - Implemented connected vertical timeline with status dots (Orange for latest, Grey for past).
    - Integrated infinite scrolling for timeline updates.

### 🐛 Bug Fixes
- **Profile Page**: Fixed duplicate navbar issues.
- **Types**: Resolved TypeScript errors related to missing project category fields in profile components.
- **Comment Data**: Fixed `PostComment` type definition (renamed `content` to `text`) to match backend response, resolving invisible comments.
- **Input Focus**: Fixed "typing backward" / focus loss bug in comment input by extracting `CommentNode` component.
- **Missing Replies**: Fixed tree building logic to robustly handle both string and object IDs for `parentComment`, ensuring deep replies display correctly.
- **Team Invitations**:
    - **Ghost Invites**: Fixed issue where "Accept/Decline" buttons persisted after the invitation was already processed by cross-referencing with the live invitations list.
    - **Project Sidebar**: Removed redundant "About" section from the left sidebar to de-clutter the UI (content remains available in the "About" tab).
    - **Syntactic Fixes**: Resolved duplicate switch cases and unused variables in `NotificationsPage`.
- **Feed**:
    - **Following Tab**: Fixed issue where the "Following" feed was displaying all posts. Now correctly calls the filtered endpoint.

### ♻️ Refactoring
- **Layout**: Consolidated file view logic into the main project layout wrapper.
