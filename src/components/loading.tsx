import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

/**
 * Loading spinner component
 */
export function Spinner({ className, size = 'md' }: { className?: string; size?: 'sm' | 'md' | 'lg' }) {
    const sizeClasses = {
        sm: 'h-4 w-4 border-2',
        md: 'h-6 w-6 border-2',
        lg: 'h-8 w-8 border-3',
    };

    return (
        <div
            className={cn(
                'animate-spin rounded-full border-primary border-t-transparent',
                sizeClasses[size],
                className
            )}
        />
    );
}

/**
 * Full page loading state
 */
export function PageLoader() {
    return (
        <div className="flex min-h-screen items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <Spinner size="lg" />
                <p className="text-sm text-muted-foreground">Loading...</p>
            </div>
        </div>
    );
}

/**
 * Post card skeleton loader
 */
export function PostCardSkeleton() {
    return (
        <div className="rounded-xl border bg-card p-4 space-y-4">
            {/* Header */}
            <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                </div>
            </div>

            {/* Title */}
            <Skeleton className="h-5 w-3/4" />

            {/* Content */}
            <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4 pt-2">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-8 w-16" />
            </div>
        </div>
    );
}

/**
 * Project card skeleton loader
 */
export function ProjectCardSkeleton() {
    return (
        <div className="rounded-xl border bg-card overflow-hidden">
            {/* Cover Image */}
            <Skeleton className="h-[140px] w-full" />

            {/* Content */}
            <div className="p-4 space-y-3">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <div className="flex items-center gap-2 pt-2">
                    <Skeleton className="h-6 w-6 rounded-full" />
                    <Skeleton className="h-3 w-20" />
                </div>
            </div>
        </div>
    );
}

/**
 * Profile header skeleton loader
 */
export function ProfileHeaderSkeleton() {
    return (
        <div className="space-y-4">
            {/* Banner */}
            <Skeleton className="h-32 w-full rounded-xl" />

            {/* Avatar and info */}
            <div className="flex flex-col items-center -mt-16 relative z-10">
                <Skeleton className="h-24 w-24 rounded-full border-4 border-background" />
                <Skeleton className="h-6 w-32 mt-3" />
                <Skeleton className="h-4 w-24 mt-2" />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-16 rounded-lg" />
                ))}
            </div>
        </div>
    );
}

/**
 * Feed skeleton with multiple post cards
 */
export function FeedSkeleton({ count = 3 }: { count?: number }) {
    return (
        <div className="space-y-4">
            {[...Array(count)].map((_, i) => (
                <PostCardSkeleton key={i} />
            ))}
        </div>
    );
}

export default {
    Spinner,
    PageLoader,
    PostCardSkeleton,
    ProjectCardSkeleton,
    ProfileHeaderSkeleton,
    FeedSkeleton,
};
