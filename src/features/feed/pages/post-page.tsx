'use client';

import { useParams } from '@tanstack/react-router';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePost } from '../hooks/use-posts';
import { PostCard } from '../components/post-card';
import { CommentSection } from '../components/comment-section';

export function PostPage() {
    const { slug } = useParams({ from: '/post/$slug' });

    // We use infinite query for post detail for consistency with other hooks,
    // but we only need the first page/item.
    const { data, isLoading, isError } = usePost(slug);

    // Extract the post object from the response structure
    // usePost returns { success: boolean, post: Post } structure directly in data?
    // Let's check usePost implementation.
    // implementation: returns response.data which is { success: boolean; post: Post }
    // but useInfiniteQuery wraps it in pages.

    // Wait, usePost in use-posts.ts uses useInfiniteQuery BUT logic is:
    // queryFn: async () => response.data
    // So data.pages[0] will be { success: boolean, post: Post }

    const post = data?.pages[0]?.post;

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (isError || !post) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
                <p className="text-muted-foreground">Post not found</p>
                <Button onClick={() => window.history.back()}>Go Back</Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background pb-20 lg:pb-0">
            <div className="w-full max-w-3xl mx-auto px-4 py-6">
                {/* Main Content */}
                <main className="space-y-6">
                    <Button variant="ghost" onClick={() => window.history.back()} className="mb-2 pl-0 hover:pl-2 transition-all">
                        ← Back to Feed
                    </Button>

                    <PostCard post={post} showProject={true} variant="feed" />

                    <div id="comments" className="bg-card rounded-lg border p-6 scroll-mt-20">
                        <CommentSection postId={post._id} comments={post.comments || []} postAuthorId={post.user?._id || ''} />
                    </div>
                </main>
            </div>
        </div>
    );
}

export default PostPage;
