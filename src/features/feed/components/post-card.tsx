'use client';

import { useState, useRef, useEffect } from 'react';
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
    Edit,
    Trash,
    Paperclip,
    Eye,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MediaCarousel } from './media-carousel';
import { FilePreviewModal } from '@/components/file-preview-modal';
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
import type { ProjectPost } from '@/features/project/types';
import { useVotePost, useDeletePost } from '../hooks/use-posts';
import { CreatePostModal } from '@/features/project/components/create-post-modal';

interface PostCardProps {
    post: Post | ProjectPost;
    showProject?: boolean;
    variant?: 'feed' | 'timeline';
}

export function PostCard({ post, showProject = true, variant = 'feed' }: PostCardProps) {
    const { user: currentUser, isAuthenticated } = useAuthStore();
    const votePost = useVotePost();
    const deletePost = useDeletePost();

    const isTimeline = variant === 'timeline';

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

    // Collapsed state - start collapsed only for timeline
    const [isCollapsed, setIsCollapsed] = useState(isTimeline);
    const [showEditModal, setShowEditModal] = useState(false);
    const [previewFile, setPreviewFile] = useState<any>(null);

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
        <Card className="overflow-hidden hover:bg-accent/50 transition-colors py-0 gap-0">
            <CardHeader className={cn(isTimeline ? "p-3 pb-0" : "p-5 pb-0")}>
                <div className="flex items-start justify-between gap-1.5">
                    {/* Author and Meta */}
                    <div className="flex items-center gap-2">
                        <a href={`/${postUser.username}`}>
                            <UserAvatar
                                src={postUser.avatar}
                                name={postUser.name}
                                username={postUser.username}
                                size={isTimeline ? "sm" : "md"}
                            />
                        </a>
                        <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                                <a
                                    href={`/${postUser.username}`}
                                    className={cn("font-medium hover:underline", isTimeline ? "" : "text-base")}
                                >
                                    {postUser.name}
                                </a>
                                <span className={cn("text-muted-foreground hidden sm:inline", isTimeline ? "text-sm" : "text-sm")}>
                                    @{postUser.username}
                                </span>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-2 text-xs text-muted-foreground">
                                <span className="whitespace-nowrap">{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
                                {showProject && post.project && (
                                    <>
                                        <span className="hidden sm:inline">•</span>
                                        <a
                                            href={`/project/${post.project.slug || post.project._id}`}
                                            className="hover:underline text-primary truncate max-w-[200px] sm:max-w-[250px] inline-block"
                                            title={post.project.title}
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
                        <Badge className={cn(isTimeline ? 'text-xs' : 'text-xs', postTypeColors[post.type] || 'bg-muted')}>
                            {post.type}
                        </Badge>
                        <DropdownMenu>
                            <DropdownMenuTrigger className="inline-flex h-10 w-10 items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                                <MoreHorizontal className="h-5 w-5" />
                                <span className="sr-only">More options</span>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                    <Bookmark className="mr-2 h-4 w-4" />
                                    Save
                                </DropdownMenuItem>
                                {currentUser?._id === post.user?._id && (
                                    <DropdownMenuItem onClick={() => setShowEditModal(true)}>
                                        <Edit className="mr-2 h-4 w-4" />
                                        Edit
                                    </DropdownMenuItem>
                                )}
                                {currentUser?._id === post.user?._id && (
                                    <DropdownMenuItem
                                        onClick={() => {
                                            if (window.confirm('Are you sure you want to delete this post?')) {
                                                deletePost.mutate(post._id);
                                            }
                                        }}
                                        className="text-destructive focus:text-destructive"
                                    >
                                        <Trash className="mr-2 h-4 w-4" />
                                        Delete
                                    </DropdownMenuItem>
                                )}
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

            <CardContent className={cn(isTimeline ? "p-3 pt-3 pb-1" : "p-5 pt-4 pb-3")}>
                {/* Title - clickable to expand/collapse ONLY in timeline */}
                <div
                    className={cn("flex flex-col gap-1 group", isTimeline && "cursor-pointer")}
                    onClick={() => isTimeline && setIsCollapsed(!isCollapsed)}
                >
                    <div className="flex items-start justify-between gap-2">
                        <a
                            href={`/post/${post.slug || post._id}`}
                            onClick={(e) => e.stopPropagation()} // Prevent collapse toggle when clicking link
                        >
                            <h3 className={cn(
                                "font-semibold hover:underline decoration-2 underline-offset-2",
                                isTimeline ? "text-lg" : "text-xl mb-2"
                            )}>
                                {post.title}
                            </h3>
                        </a>

                        {isTimeline && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 group-hover:bg-accent flex-shrink-0"
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
                        )}
                    </div>

                    {/* Preview in collapsed state (Timeline only) */}
                    {isTimeline && isCollapsed && post.caption && (
                        <p className="text-sm text-muted-foreground line-clamp-2 pr-8">
                            {extractPlainText(post.caption)}
                        </p>
                    )}
                </div>

                {/* Content - Hidden when collapsed (Timeline), always visible (Feed) */}
                {(!isTimeline || !isCollapsed) && (
                    <>
                        {/* Media Preview - Always First */}
                        {post.media && post.media.length > 0 && (
                            <MediaCarousel media={post.media} className={isTimeline ? "mt-0" : "mt-0"} />
                        )}


                        {/* Caption/Content */}
                        {post.caption && (
                            <PostContent caption={post.caption} format={post.contentFormat} />
                        )}

                        {/* Attached Files */}
                        {post.files && post.files.length > 0 && (
                            <div className="mt-3">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full justify-between group"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        // Toggle visibility logic or open modal?
                                        // User asked to show number, maybe just expand list on click
                                        const fileList = document.getElementById(`files-${post._id}`);
                                        if (fileList) {
                                            fileList.classList.toggle('hidden');
                                        }
                                    }}
                                >
                                    <span className="flex items-center gap-2">
                                        <Paperclip className="h-4 w-4" />
                                        {post.files.length} Attached File{post.files.length !== 1 ? 's' : ''}
                                    </span>
                                    <ChevronDown className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                                </Button>

                                <div id={`files-${post._id}`} className="hidden mt-2 space-y-2 overflow-hidden">
                                    {post.files.map((file: any) => (
                                        <div
                                            key={file._id}
                                            className="flex items-center gap-2 p-2 rounded-md bg-muted/50 border hover:bg-muted transition-colors overflow-hidden"
                                        >
                                            {/* File icon */}
                                            <div
                                                className="h-8 w-8 rounded bg-background flex items-center justify-center border text-muted-foreground flex-shrink-0 cursor-pointer"
                                                onClick={() => setPreviewFile(file)}
                                            >
                                                <FileIcon fileType={file.fileType} />
                                            </div>

                                            {/* File info - must shrink */}
                                            <div
                                                className="flex-1 overflow-hidden cursor-pointer"
                                                onClick={() => setPreviewFile(file)}
                                            >
                                                <p className="text-sm font-medium truncate block">{file.originalFileName || file.fileName}</p>
                                                <p className="text-xs text-muted-foreground">{(file.fileSize ? (file.fileSize / 1024).toFixed(0) : '0')} KB</p>
                                            </div>

                                            {/* Action buttons */}
                                            <div className="flex items-center flex-shrink-0 gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setPreviewFile(file);
                                                    }}
                                                    className="h-8 w-8"
                                                    title="Preview"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={async (e) => {
                                                        e.stopPropagation();
                                                        try {
                                                            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/files/${file._id}/download`);
                                                            const data = await response.json();
                                                            if (data.success && data.downloadUrl) {
                                                                window.open(data.downloadUrl, '_blank');
                                                            }
                                                        } catch (error) {
                                                            console.error('Download error:', error);
                                                        }
                                                    }}
                                                    className="h-8 w-8"
                                                    title="Download"
                                                >
                                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                    </svg>
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </CardContent>

            {/* Footer */}
            {(!isTimeline || !isCollapsed) && (
                <CardFooter className={cn(isTimeline ? "p-3 pt-1" : "p-5 pt-2")}>
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
                        <a href={`/post/${post.slug || post._id}#comments`}>
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

            <CreatePostModal
                open={showEditModal}
                onOpenChange={setShowEditModal}
                post={post}
            />

            <FilePreviewModal
                open={!!previewFile}
                onOpenChange={(open) => !open && setPreviewFile(null)}
                file={previewFile}
            />
        </Card>
    );
}

// Extracted component for content handling with expand/collapse
function PostContent({ caption, format }: { caption: string; format?: string }) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [showButton, setShowButton] = useState(false);
    const contentRef = useRef<HTMLDivElement>(null);

    // Auto-detect format if not explicitly provided
    const isTiptap = format === 'tiptap' || (typeof caption === 'string' && caption.trim().startsWith('{"type":"doc"'));

    useEffect(() => {
        if (contentRef.current) {
            // Check if content height > 80px (approx 3 lines)
            if (contentRef.current.scrollHeight > 80) {
                setShowButton(true);
            }
        }
    }, [caption]);

    return (
        <div className="mt-3 relative">
            <div
                ref={contentRef}
                className={cn(
                    "text-sm text-foreground/90 transition-all duration-300 ease-in-out relative overflow-hidden",
                    !isExpanded && showButton ? "max-h-[4.5em]" : "max-h-none"
                )}
            >
                {isTiptap ? (
                    <TiptapRenderer content={caption} />
                ) : (
                    <p className="whitespace-pre-wrap">{extractPlainText(caption)}</p>
                )}

                {/* Fade effect when collapsed */}
                {!isExpanded && showButton && (
                    <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-card to-transparent pointer-events-none" />
                )}
            </div>

            {showButton && (
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="mt-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                >
                    {isExpanded ? (
                        <>See less <ChevronUp className="w-3 h-3" /></>
                    ) : (
                        <>See more <ChevronDown className="w-3 h-3" /></>
                    )}
                </button>
            )}
        </div>
    );
}

// Helper to extract plain text from Editor.js content or JSON
// Helper to extract plain text from Editor.js content or Tiptap JSON
function extractPlainText(content: string): string {
    try {
        const parsed = JSON.parse(content);

        // Handle Editor.js blocks
        if (parsed.blocks && Array.isArray(parsed.blocks)) {
            return parsed.blocks
                .map((block: { data?: { text?: string } }) => block.data?.text || '')
                .join(' ')
                .slice(0, 300);
        }

        // Handle Tiptap JSON
        if (parsed.type === 'doc' && parsed.content) {
            return extractTiptapText(parsed)
                .slice(0, 300);
        }

        return content;
    } catch {
        return content;
    }
}

// Recursive helper for Tiptap nodes
function extractTiptapText(node: any): string {
    if (node.type === 'text') {
        return node.text || '';
    }

    if (node.content && Array.isArray(node.content)) {
        return node.content
            .map((child: any) => extractTiptapText(child))
            .join(' ');
    }

    return '';
}

function FileIcon({ fileType }: { fileType?: string }) {
    const type = fileType || '';
    if (type.includes('pdf')) return <span className="text-red-500 text-xs font-bold">PDF</span>;
    if (type.includes('zip') || type.includes('rar')) return <span className="text-yellow-500 text-xs font-bold">ZIP</span>;
    if (type.includes('image')) return <span className="text-blue-500 text-xs font-bold">IMG</span>;
    if (type.includes('video')) return <span className="text-purple-500 text-xs font-bold">VID</span>;
    if (type.includes('javascript') || type.includes('typescript') || type.includes('json') || type.includes('html') || type.includes('css')) return <span className="text-green-500 text-xs font-bold">CODE</span>;
    return <span className="text-xs font-bold">FILE</span>;
}

export default PostCard;
