import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { MessageSquare, Trash2, CornerDownRight, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { useCommentOnPost, useDeleteComment } from '../hooks/use-posts'; // Imported useDeleteComment
import type { PostComment } from '../types';

interface CommentSectionProps {
    postId: string;
    comments: PostComment[];
    postAuthorId: string; // Added postAuthorId
}

export function CommentSection({ postId, comments, postAuthorId }: CommentSectionProps) {
    const { mutate: addComment, isPending } = useCommentOnPost();
    const [content, setContent] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return;

        addComment(
            { postId, content },
            {
                onSuccess: () => setContent(''),
            }
        );
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold">Comments ({comments.reduce((acc, c) => acc + 1 + (c.replies?.length || 0), 0)})</h3>
            </div>

            {/* Main Input */}
            <div className="flex gap-4">
                <div className="shrink-0">
                    <UserAvatar />
                </div>
                <div className="flex-1 space-y-4">
                    <Textarea
                        placeholder="What are your thoughts?"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="resize-none min-h-[100px] border-muted-foreground/20 focus-visible:ring-primary/20"
                    />
                    <div className="flex justify-end">
                        <Button
                            onClick={handleSubmit}
                            disabled={!content.trim() || isPending}
                            className="rounded-full px-6"
                        >
                            {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            Post Comment
                        </Button>
                    </div>
                </div>
            </div>

            {/* Comments List */}
            <div className="space-y-6">
                {comments.map((comment) => (
                    <CommentItem
                        key={comment._id}
                        comment={comment}
                        postId={postId}
                        rootId={comment._id}
                        postAuthorId={postAuthorId}
                        isRoot={true}
                    />
                ))}
                {comments.length === 0 && (
                    <div className="text-center text-muted-foreground py-12">
                        No comments yet. Be the first to start the conversation!
                    </div>
                )}
            </div>
        </div>
    );
}

interface CommentItemProps {
    comment: PostComment;
    postId: string;
    rootId: string;
    postAuthorId: string;
    isRoot?: boolean;
}

function CommentItem({ comment, postId, rootId, postAuthorId, isRoot = false }: CommentItemProps) {
    const [isReplying, setIsReplying] = useState(false);
    const [replyContent, setReplyContent] = useState('');
    const { mutate: addComment, isPending: isReplyPending } = useCommentOnPost();
    const { mutate: deleteComment, isPending: isDeletePending } = useDeleteComment();
    const { user } = useAuthStore();

    // Handle null user (deleted user or soft-deleted comment)
    if (!comment.user) {
        return (
            <div className={cn("group animate-in fade-in slide-in-from-top-2 opacity-50", !isRoot && "mt-4")}>
                <div className="flex gap-4">
                    <Avatar className="w-10 h-10 border border-border">
                        <AvatarFallback>?</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm text-muted-foreground">[deleted]</span>
                            <span className="text-muted-foreground text-xs">•</span>
                            <span className="text-muted-foreground text-xs">
                                {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                            </span>
                        </div>
                        <p className="text-sm leading-relaxed text-muted-foreground italic">
                            {comment.isDeleted ? '[Comment deleted]' : comment.text}
                        </p>
                    </div>
                </div>
                {/* Still render nested replies even if parent user is null */}
                {isRoot && comment.replies && comment.replies.length > 0 && (
                    <div className="mt-4 pl-4 ml-5 border-l-2 border-border/40 space-y-6">
                        {comment.replies.map((reply) => (
                            <CommentItem
                                key={reply._id}
                                comment={reply}
                                postId={postId}
                                rootId={comment._id}
                                postAuthorId={postAuthorId}
                                isRoot={false}
                            />
                        ))}
                    </div>
                )}
            </div>
        );
    }

    // Permissions
    const isOwner = user?._id === postAuthorId;
    const isAuthor = user?._id === comment.user._id;
    const canDelete = isOwner || isAuthor;

    // The logic for replies: 
    // If replying to Root (isRoot=true), parent is Root ID.
    // If replying to Child (isRoot=false), parent is ALSO Root ID (passed down as rootId).
    const replyTargetId = rootId;

    const handleReply = () => {
        if (!replyContent.trim()) return;
        addComment(
            { postId, content: replyContent, parentCommentId: replyTargetId },
            {
                onSuccess: () => {
                    setReplyContent('');
                    setIsReplying(false);
                },
            }
        );
    };

    const handleDelete = () => {
        if (confirm("Are you sure you want to delete this comment?")) {
            deleteComment({ postId, commentId: comment._id });
        }
    }

    return (
        <div className={cn("group animate-in fade-in slide-in-from-top-2", !isRoot && "mt-4")}>
            <div className="flex gap-4">
                <Avatar className="w-10 h-10 border border-border">
                    <AvatarImage src={comment.user.avatar} alt={comment.user.name} />
                    <AvatarFallback>{comment.user.name?.[0]?.toUpperCase() || '?'}</AvatarFallback>
                </Avatar>

                <div className="flex-1 space-y-2">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm hover:underline cursor-pointer">
                                {comment.user.name}
                            </span>
                            <span className="text-muted-foreground text-xs">•</span>
                            <span className="text-muted-foreground text-xs">
                                {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                            </span>
                        </div>
                    </div>

                    {/* Content */}
                    <p className="text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap">
                        {comment.text}
                    </p>

                    {/* Actions */}
                    <div className="flex items-center gap-4 pt-1">
                        <button
                            onClick={() => setIsReplying(!isReplying)}
                            className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <MessageSquare className="w-3.5 h-3.5" />
                            Reply
                        </button>

                        {canDelete && (
                            <button
                                onClick={handleDelete}
                                disabled={isDeletePending}
                                className="flex items-center gap-1.5 text-xs font-medium text-red-500 hover:text-red-600 transition-colors disabled:opacity-50"
                            >
                                {isDeletePending ? (
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                    <Trash2 className="w-3.5 h-3.5" />
                                )}
                                Delete
                            </button>
                        )}
                    </div>

                    {/* Reply Input */}
                    {isReplying && (
                        <div className="pt-3 flex gap-3 animate-in fade-in zoom-in-95 duration-200">
                            <div className="shrink-0 pt-1">
                                <CornerDownRight className="w-4 h-4 text-muted-foreground/50" />
                            </div>
                            <div className="flex-1 space-y-3">
                                <Textarea
                                    autoFocus
                                    placeholder={`Reply to ${comment.user.name}...`}
                                    value={replyContent}
                                    onChange={(e) => setReplyContent(e.target.value)}
                                    className="min-h-[80px] text-sm resize-none"
                                />
                                <div className="flex justify-end gap-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setIsReplying(false)}
                                        className="h-8"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        size="sm"
                                        onClick={handleReply}
                                        disabled={!replyContent.trim() || isReplyPending}
                                        className="h-8"
                                    >
                                        {isReplyPending && <Loader2 className="w-3 h-3 animate-spin mr-2" />}
                                        Reply
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Nested Comments (Only for Root) */}
            {isRoot && comment.replies && comment.replies.length > 0 && (
                <div className="mt-4 pl-4 ml-5 border-l-2 border-border/40 space-y-6">
                    {comment.replies.map((reply) => (
                        <CommentItem
                            key={reply._id}
                            comment={reply}
                            postId={postId}
                            rootId={comment._id} // Pass the SAME root ID down
                            postAuthorId={postAuthorId}
                            isRoot={false}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

function UserAvatar() {
    const { user } = useAuthStore();

    if (!user) {
        return (
            <Avatar className="w-10 h-10">
                <AvatarFallback>?</AvatarFallback>
            </Avatar>
        )
    }

    return (
        <Avatar className="w-10 h-10 border border-border">
            <AvatarImage src={user.avatar} alt={user.name || 'User'} />
            <AvatarFallback>{user.name?.[0]?.toUpperCase() || '?'}</AvatarFallback>
        </Avatar>
    );
}
