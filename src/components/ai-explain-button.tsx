'use client';

import { useState } from 'react';
import { Sparkles, Loader2, AlertCircle, Copy, Check } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/auth-store';
import api from '@/lib/api';
import { toast } from '@/lib/toast';


interface AIExplainButtonProps {
    type: 'post' | 'project';
    id: string;
    title?: string;
    variant?: 'default' | 'ghost' | 'outline';
    size?: 'default' | 'sm' | 'icon';
    className?: string;
}

interface ExplanationResult {
    explanation: string;
    cached: boolean;
    remaining: number;
}

export function AIExplainButton({
    type,
    id,
    title,
    variant = 'ghost',
    size = 'sm',
    className
}: AIExplainButtonProps) {
    const { isAuthenticated, openLoginModal } = useAuthStore();
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [explanation, setExplanation] = useState<string | null>(null);
    const [remaining, setRemaining] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    const handleClick = async () => {
        if (!isAuthenticated) {
            openLoginModal();
            return;
        }

        setIsOpen(true);

        // If we already have an explanation, don't fetch again
        if (explanation) return;

        setIsLoading(true);
        setError(null);

        try {
            const endpoint = type === 'project'
                ? `/ai-explain/explain/project/${id}`
                : `/ai-explain/explain/post/${id}`;

            const response = await api.post<{ success: boolean } & ExplanationResult>(endpoint);

            if (response.data.success) {
                setExplanation(response.data.explanation);
                setRemaining(response.data.remaining);

                if (response.data.cached) {
                    toast.info('Using cached explanation', {
                        description: 'This explanation was generated earlier'
                    });
                }
            }
        } catch (err: unknown) {
            const error = err as { response?: { status?: number; data?: { message?: string; rateLimited?: boolean } } };

            if (error.response?.status === 429) {
                setError(error.response.data?.message || 'Daily limit exceeded. Try again tomorrow.');
            } else {
                setError(error.response?.data?.message || 'Failed to generate explanation. Please try again.');
            }

            toast.error('AI Explanation failed', {
                description: error.response?.data?.message || 'Something went wrong'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        setIsOpen(false);
    };

    const handleCopy = async () => {
        if (!explanation) return;
        try {
            await navigator.clipboard.writeText(explanation);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
            toast.success('Copied to clipboard');
        } catch {
            toast.error('Failed to copy');
        }
    };

    return (
        <>
            <Button
                variant={variant}
                size={size}
                onClick={handleClick}
                className={className}
            >
                <Sparkles className="h-4 w-4 mr-1.5" />
                <span className="hidden sm:inline">Explain with AI</span>
                <span className="sm:hidden">AI</span>
            </Button>

            <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
                <DialogContent className="max-w-2xl h-[80vh] flex flex-col p-0 gap-0 overflow-hidden">
                    {/* Fixed Header */}
                    <DialogHeader className="flex-shrink-0 p-4 pb-3 pr-12 border-b bg-card">
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-2 min-w-0">
                                <div className="p-1.5 rounded-lg bg-primary/10">
                                    <Sparkles className="h-4 w-4 text-primary" />
                                </div>
                                <DialogTitle className="text-base font-semibold truncate">
                                    AI Explanation
                                </DialogTitle>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                                {remaining !== null && (
                                    <span className="text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-full font-medium">
                                        {remaining}/5 left today
                                    </span>
                                )}
                            </div>
                        </div>
                        {title && (
                            <p className="text-sm text-muted-foreground mt-1 truncate">
                                {type === 'project' ? 'Project' : 'Post'}: {title}
                            </p>
                        )}
                    </DialogHeader>

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto p-4">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-16 gap-4">
                                <div className="relative">
                                    <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
                                    <div className="relative p-4 rounded-full bg-primary/10">
                                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                    </div>
                                </div>
                                <div className="text-center">
                                    <p className="font-medium">Analyzing {type}...</p>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        AI is reading and summarizing the content
                                    </p>
                                </div>
                            </div>
                        ) : error ? (
                            <div className="flex flex-col items-center justify-center py-16 gap-4">
                                <div className="p-4 rounded-full bg-destructive/10">
                                    <AlertCircle className="h-8 w-8 text-destructive" />
                                </div>
                                <div className="text-center max-w-md">
                                    <p className="font-medium text-destructive">Unable to generate explanation</p>
                                    <p className="text-sm text-muted-foreground mt-2">{error}</p>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleClick}
                                    className="mt-2"
                                >
                                    Try Again
                                </Button>
                            </div>
                        ) : explanation ? (
                            <div className="space-y-4">
                                {/* Explanation Content */}
                                <div
                                    className="prose prose-sm dark:prose-invert max-w-none 
                                        prose-headings:font-semibold prose-headings:text-foreground
                                        prose-h2:text-lg prose-h2:mt-6 prose-h2:mb-3
                                        prose-h3:text-base prose-h3:mt-4 prose-h3:mb-2
                                        prose-p:text-muted-foreground prose-p:leading-relaxed
                                        prose-li:text-muted-foreground
                                        prose-strong:text-foreground prose-strong:font-semibold
                                        prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
                                        prose-ul:my-2 prose-ol:my-2"
                                    dangerouslySetInnerHTML={{
                                        __html: formatMarkdown(explanation)
                                    }}
                                />
                            </div>
                        ) : null}
                    </div>

                    {/* Fixed Footer */}
                    {explanation && !isLoading && (
                        <div className="flex-shrink-0 p-3 border-t bg-muted/30 flex items-center justify-between gap-2">
                            <p className="text-xs text-muted-foreground">
                                Powered by Gemini AI
                            </p>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleCopy}
                                className="h-8 gap-1.5"
                            >
                                {copied ? (
                                    <>
                                        <Check className="h-3.5 w-3.5" />
                                        Copied
                                    </>
                                ) : (
                                    <>
                                        <Copy className="h-3.5 w-3.5" />
                                        Copy
                                    </>
                                )}
                            </Button>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}

// Enhanced markdown formatter
function formatMarkdown(text: string): string {
    return text
        // Bold
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        // Italic
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        // Headers
        .replace(/^### (.*$)/gm, '<h3>$1</h3>')
        .replace(/^## (.*$)/gm, '<h2>$1</h2>')
        .replace(/^# (.*$)/gm, '<h2>$1</h2>')
        // Bullet lists
        .replace(/^\* (.*$)/gm, '<li>$1</li>')
        .replace(/^- (.*$)/gm, '<li>$1</li>')
        // Numbered lists
        .replace(/^\d+\. (.*$)/gm, '<li>$1</li>')
        // Wrap consecutive list items
        .replace(/(<li>.*<\/li>\n?)+/g, '<ul class="list-disc ml-4 space-y-1">$&</ul>')
        // Code inline
        .replace(/`([^`]+)`/g, '<code>$1</code>')
        // Paragraphs (double newlines)
        .replace(/\n\n/g, '</p><p>')
        // Single newlines
        .replace(/\n/g, '<br />')
        // Wrap in paragraph tags
        .replace(/^(.+)$/, '<p>$1</p>');
}

export default AIExplainButton;
