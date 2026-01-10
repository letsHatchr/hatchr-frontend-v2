import { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, FileText, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PostCard } from '@/features/feed/components/post-card';
import { useProjectPosts } from '../hooks/use-project';

interface ProjectTimelineProps {
    projectSlug: string;
    isTeamMember: boolean;
    onAddUpdate?: () => void;
}

export function ProjectTimeline({
    projectSlug,
    isTeamMember,
    onAddUpdate,
}: ProjectTimelineProps) {
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        isError,
    } = useProjectPosts(projectSlug);

    // Intersection observer for infinite scroll
    const { ref, inView } = useInView({
        threshold: 0,
        rootMargin: '100px', // Load more when 100px from bottom
    });

    // Load more when sentinel is visible
    useEffect(() => {
        if (inView && hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

    // Flatten all pages into single array
    const posts = data?.pages.flatMap((page) => page.posts) ?? [];

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (isError) {
        return (
            <Card className="p-12 text-center">
                <p className="text-muted-foreground">Failed to load project updates</p>
            </Card>
        );
    }

    if (posts.length === 0) {
        return (
            <Card className="p-12 text-center">
                <div className="mb-4">
                    <FileText className="h-16 w-16 mx-auto text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No updates yet</h3>
                <p className="text-muted-foreground mb-4">
                    This project doesn't have any updates posted yet.
                </p>
                {isTeamMember && onAddUpdate && (
                    <Button onClick={onAddUpdate}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add First Update
                    </Button>
                )}
            </Card>
        );
    }

    return (
        <div className="space-y-0">
            {/* Timeline container with vertical line */}
            <div className="relative">
                {/* Vertical timeline line */}
                {posts.length > 1 && (
                    <div className="absolute left-4 sm:left-6 top-0 bottom-0 w-0.5 bg-border" />
                )}

                {/* Posts */}
                {posts.map((post, index) => (
                    <div key={post._id} className="relative flex gap-3 sm:gap-4 pb-6">
                        {/* Timeline dot */}
                        <div className="relative flex-shrink-0">
                            <div
                                className={cn(
                                    'h-8 w-8 sm:h-12 sm:w-12 rounded-full flex items-center justify-center z-10 relative',
                                    index === 0
                                        ? 'bg-orange-500 ring-2 sm:ring-4 ring-orange-500/20'
                                        : 'bg-muted border-2 border-border'
                                )}
                            >
                                <div
                                    className={cn(
                                        'h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full',
                                        index === 0 ? 'bg-white' : 'bg-muted-foreground'
                                    )}
                                />
                            </div>
                        </div>

                        {/* Post card */}
                        <div className="flex-1 min-w-0 -mt-1">
                            {/* Latest update badge */}
                            {index === 0 && (
                                <div className="mb-2">
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-orange-500 text-white">
                                        <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                                        Latest Update
                                    </span>
                                </div>
                            )}

                            <div
                                className={cn(
                                    'transition-all',
                                    index === 0 && 'ring-2 ring-orange-500/20 rounded-lg'
                                )}
                            >
                                <PostCard post={post} showProject={false} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Sentinel element for infinite scroll */}
            {hasNextPage && (
                <div ref={ref} className="py-4 text-center">
                    {isFetchingNextPage && (
                        <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                    )}
                </div>
            )}

            {/* End of timeline message */}
            {!hasNextPage && posts.length > 0 && (
                <p className="text-center text-sm text-muted-foreground py-4">
                    You've reached the beginning of this project
                </p>
            )}
        </div>
    );
}
