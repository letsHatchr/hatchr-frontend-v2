'use client';

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import {
    ArrowBigUp,
    ArrowBigDown,
    MessageCircle,
    Share2,
    MoreHorizontal,
    Bookmark,
    Flag,
    ExternalLink,
    ChevronDown,
    ChevronUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MediaCarousel } from './media-carousel';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { UserAvatar } from '@/components/user-avatar';
import { TiptapRenderer } from '@/components/editor';
import { useAuthStore } from '@/store';
import { toast } from '@/lib/toast';
import type { Post } from '../types';
import { useVotePost } from '../hooks/use-posts';

interface PostCardProps {
    post: Post;
    showProject?: boolean;
}

export function PostCard({ post, showProject = true }: PostCardProps) {
    const { user: currentUser, isAuthenticated } = useAuthStore();
    const votePost = useVotePost();

    // Fallback for missing user data
    const postUser = post.user ?? { _id: '', name: 'Unknown User', username: 'unknown', avatar: undefined };

    // Calculate vote count with fallback for missing arrays
    const upvotes = post.upvotes ?? [];
    const downvotes = post.downvotes ?? [];
    const comments = post.comments ?? [];
    const voteCount = upvotes.length - downvotes.length;
    const hasUpvoted = currentUser ? upvotes.includes(currentUser._id) : false;
    const hasDownvoted = currentUser ? downvotes.includes(currentUser._id) : false;

    // Local state for optimistic updates
    const [localVoteCount, setLocalVoteCount] = useState(voteCount);
    const [localUpvoted, setLocalUpvoted] = useState(hasUpvoted);
    const [localDownvoted, setLocalDownvoted] = useState(hasDownvoted);

    // Collapsed state - start collapsed by default
    const [isCollapsed, setIsCollapsed] = useState(true);

    const handleVote = async (voteType: 'up' | 'down') => {
        if (!isAuthenticated) {
            toast.error('Please log in', { description: 'You need to be logged in to vote.' });
            return;
        }

        // Optimistic update
        if (voteType === 'up') {
            if (localUpvoted) {
                setLocalVoteCount(prev => prev - 1);
                setLocalUpvoted(false);
            } else {
                setLocalVoteCount(prev => prev + (localDownvoted ? 2 : 1));
                setLocalUpvoted(true);
                setLocalDownvoted(false);
            }
        } else {
            if (localDownvoted) {
                setLocalVoteCount(prev => prev + 1);
                setLocalDownvoted(false);
            } else {
                setLocalVoteCount(prev => prev - (localUpvoted ? 2 : 1));
                setLocalDownvoted(true);
                setLocalUpvoted(false);
            }
        }

        try {
            await votePost.mutateAsync({ postId: post._id, voteType });
        } catch {
            // Revert on error
            setLocalVoteCount(voteCount);
            setLocalUpvoted(hasUpvoted);
            setLocalDownvoted(hasDownvoted);
            toast.error('Vote failed', { description: 'Please try again.' });
        }
    };

    const handleShare = async () => {
        const url = `${window.location.origin}/post/${post.slug || post._id}`;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: post.title,
                    url,
                });
            } catch {
                // User cancelled or error
            }
        } else {
            await navigator.clipboard.writeText(url);
            toast.success('Link copied!');
        }
    };

    const postTypeColors: Record<string, string> = {
        update: 'bg-blue-500/10 text-blue-500',
        announcement: 'bg-purple-500/10 text-purple-500',
        milestone: 'bg-green-500/10 text-green-500',
        hatching: 'bg-primary/10 text-primary',
    };

    return (
        <Card className="overflow-hidden hover:bg-accent/50 transition-colors">
            <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                    {/* Author and Meta */}
                    <div className="flex items-center gap-3">
                        <a href={`/${postUser.username}`}>
                            <UserAvatar
                                src={postUser.avatar}
                                name={postUser.name}
                                username={postUser.username}
                                size="md"
                            />
                        </a>
                        <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                                <a
                                    href={`/${postUser.username}`}
                                    className="font-medium hover:underline"
                                >
                                    {postUser.name}
                                </a>
                                <span className="text-sm text-muted-foreground">
                                    @{postUser.username}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
                                {showProject && post.project && (
                                    <>
                                        <span>•</span>
                                        <a
                                            href={`/project/${post.project.slug || post.project._id}`}
                                            className="hover:underline text-primary"
                                        >
                                            {post.project.title}
                                        </a>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Post Type Badge & Menu */}
                    <div className="flex items-center gap-2">
                        <Badge className={cn('text-xs', postTypeColors[post.type] || 'bg-muted')}>
                            {post.type}
                        </Badge>
                        <DropdownMenu>
                            <DropdownMenuTrigger className="inline-flex h-8 w-8 items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">More options</span>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                    <Bookmark className="mr-2 h-4 w-4" />
                                    Save
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={handleShare}>
                                    <ExternalLink className="mr-2 h-4 w-4" />
                                    Copy link
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive">
                                    <Flag className="mr-2 h-4 w-4" />
                                    Report
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="pb-3">
                {/* Title - clickable to expand/collapse */}
                <div
                    className="flex items-start justify-between gap-2 cursor-pointer group"
                    onClick={() => setIsCollapsed(!isCollapsed)}
                >
                    <a
                        href={`/post/${post.slug || post._id}`}
                        onClick={(e) => e.stopPropagation()} // Prevent collapse toggle when clicking link
                    >
                        <h3 className="font-semibold text-lg mb-2 hover:underline">
                            {post.title}
                        </h3>
                    </a>

                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 group-hover:bg-accent"
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsCollapsed(!isCollapsed);
                        }}
                    >
                        {isCollapsed ? (
                            <ChevronDown className="h-4 w-4" />
                        ) : (
                            <ChevronUp className="h-4 w-4" />
                        )}
                    </Button>
                </div>

                {/* Collapsible Content */}
                {!isCollapsed && (
                    <>
                        {/* Caption/Content */}
                        {post.caption && (
                            <div className="text-sm text-muted-foreground line-clamp-3">
                                {post.contentFormat === 'tiptap' ? (
                                    <TiptapRenderer content={post.caption} className="line-clamp-3" />
                                ) : (
                                    <p>{extractPlainText(post.caption)}</p>
                                )}
                            </div>
                        )}

                        {/* Media Preview */}
                        {post.media && post.media.length > 0 && (
                            <MediaCarousel media={post.media} className="mt-3" />
                        )}
                    </>
                )}
            </CardContent>

            {/* Footer only shows when expanded */}
            {!isCollapsed && (
                <CardFooter className="pt-0">
                    <div className="flex items-center gap-1 w-full">
                        {/* Vote Buttons */}
                        <div className="flex items-center gap-1 rounded-full bg-muted/50 p-1">
                            <Button
                                variant="ghost"
                                size="icon"
                                className={cn(
                                    'h-8 w-8 rounded-full',
                                    localUpvoted && 'text-green-500 bg-green-500/10'
                                )}
                                onClick={() => handleVote('up')}
                            >
                                <ArrowBigUp className={cn('h-5 w-5', localUpvoted && 'fill-current')} />
                            </Button>
                            <span className={cn(
                                'min-w-[2rem] text-center text-sm font-medium',
                                localVoteCount > 0 && 'text-green-500',
                                localVoteCount < 0 && 'text-red-500'
                            )}>
                                {localVoteCount}
                            </span>
                            <Button
                                variant="ghost"
                                size="icon"
                                className={cn(
                                    'h-8 w-8 rounded-full',
                                    localDownvoted && 'text-red-500 bg-red-500/10'
                                )}
                                onClick={() => handleVote('down')}
                            >
                                <ArrowBigDown className={cn('h-5 w-5', localDownvoted && 'fill-current')} />
                            </Button>
                        </div>

                        {/* Comments */}
                        <a href={`/post/${post.slug || post._id}`}>
                            <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
                                <MessageCircle className="h-4 w-4" />
                                <span>{comments.length}</span>
                            </Button>
                        </a>

                        {/* Share */}
                        <Button
                            variant="ghost"
                            size="sm"
                            className="gap-2 text-muted-foreground"
                            onClick={handleShare}
                        >
                            <Share2 className="h-4 w-4" />
                            <span className="hidden sm:inline">Share</span>
                        </Button>
                    </div>
                </CardFooter>
            )}
        </Card>
    );
}

// Helper to extract plain text from Editor.js content
function extractPlainText(content: string): string {
    try {
        const parsed = JSON.parse(content);
        if (parsed.blocks) {
            return parsed.blocks
                .map((block: { data?: { text?: string } }) => block.data?.text || '')
                .join(' ')
                .slice(0, 200);
        }
        return content.slice(0, 200);
    } catch {
        return content.slice(0, 200);
    }
}

export default PostCard;
