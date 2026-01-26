
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import javascript from 'react-syntax-highlighter/dist/esm/languages/prism/javascript';
import typescript from 'react-syntax-highlighter/dist/esm/languages/prism/typescript';
import jsx from 'react-syntax-highlighter/dist/esm/languages/prism/jsx';
import tsx from 'react-syntax-highlighter/dist/esm/languages/prism/tsx';
import python from 'react-syntax-highlighter/dist/esm/languages/prism/python';
import json from 'react-syntax-highlighter/dist/esm/languages/prism/json';
import css from 'react-syntax-highlighter/dist/esm/languages/prism/css';
import markdown from 'react-syntax-highlighter/dist/esm/languages/prism/markdown';
import bash from 'react-syntax-highlighter/dist/esm/languages/prism/bash';
import html from 'react-syntax-highlighter/dist/esm/languages/prism/markup';
import java from 'react-syntax-highlighter/dist/esm/languages/prism/java';
import c from 'react-syntax-highlighter/dist/esm/languages/prism/c';
import cpp from 'react-syntax-highlighter/dist/esm/languages/prism/cpp';
import { useState, useEffect } from 'react';
import { Loader2, Download, ExternalLink, AlertCircle } from 'lucide-react';

// Register languages to keep bundle size small
SyntaxHighlighter.registerLanguage('javascript', javascript);
SyntaxHighlighter.registerLanguage('typescript', typescript);
SyntaxHighlighter.registerLanguage('jsx', jsx);
SyntaxHighlighter.registerLanguage('tsx', tsx);
SyntaxHighlighter.registerLanguage('python', python);
SyntaxHighlighter.registerLanguage('json', json);
SyntaxHighlighter.registerLanguage('css', css);
SyntaxHighlighter.registerLanguage('markdown', markdown);
SyntaxHighlighter.registerLanguage('bash', bash);
SyntaxHighlighter.registerLanguage('html', html);
SyntaxHighlighter.registerLanguage('java', java);
SyntaxHighlighter.registerLanguage('c', c);
SyntaxHighlighter.registerLanguage('cpp', cpp);

interface FilePreviewModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    file: {
        _id: string; // Required for backend proxy
        fileName: string;
        originalFileName: string;
        fileType: string;
        r2Key?: string;
        url?: string; // Optional direct URL if available
    } | null;
}

export function FilePreviewModal({ open, onOpenChange, file }: FilePreviewModalProps) {
    const [content, setContent] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [downloadLoading, setDownloadLoading] = useState(false);

    const fileType = file?.fileType || '';
    const isCode = fileType.includes('javascript') ||
        fileType.includes('typescript') ||
        fileType.includes('json') ||
        fileType.includes('html') ||
        fileType.includes('css') ||
        fileType.includes('text/plain') ||
        file?.originalFileName.endsWith('.py') ||
        file?.originalFileName.endsWith('.java') ||
        file?.originalFileName.endsWith('.c') ||
        file?.originalFileName.endsWith('.cpp') ||
        file?.originalFileName.endsWith('.md');

    // Simple language detection based on extension
    const getLanguage = (fileName: string) => {
        if (fileName.endsWith('.js')) return 'javascript';
        if (fileName.endsWith('.ts') || fileName.endsWith('.tsx')) return 'typescript';
        if (fileName.endsWith('.py')) return 'python';
        if (fileName.endsWith('.html')) return 'html';
        if (fileName.endsWith('.css')) return 'css';
        if (fileName.endsWith('.json')) return 'json';
        if (fileName.endsWith('.md')) return 'markdown';
        return 'text';
    };

    // Download handler using the proper API endpoint
    const handleDownload = async () => {
        if (!file?._id) return;

        setDownloadLoading(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/files/${file._id}/download`);
            const data = await response.json();
            if (data.success && data.downloadUrl) {
                window.open(data.downloadUrl, '_blank');
            } else {
                console.error('Download failed:', data);
            }
        } catch (error) {
            console.error('Download error:', error);
        } finally {
            setDownloadLoading(false);
        }
    };

    useEffect(() => {
        if (open && file && isCode) {
            setLoading(true);
            setError(null);

            // Use backend proxy to avoid CORS and handle authentication if needed
            // We use the direct API URL which proxies the content from R2
            fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/files/${file._id}/content`)
                .then(res => {
                    if (!res.ok) throw new Error('Failed to load file content');
                    return res.json();
                })
                .then(data => {
                    if (data.success && data.content) {
                        setContent(data.content);
                    } else {
                        throw new Error(data.message || 'Failed to load content');
                    }
                })
                .catch(err => {
                    console.error(err);
                    setError(err.message || 'Failed to load file content preview.');
                    // Fallback to direct fetch if proxy fails (optional, but might face CORS)
                })
                .finally(() => setLoading(false));
        } else {
            setContent(null); // Reset content for non-code files
        }
    }, [open, file, isCode]);

    if (!file) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[95vw] w-[95vw] sm:max-w-[95vw] h-[90vh] flex flex-col p-4 sm:p-6">
                <DialogHeader className="mb-4">
                    <div className="flex items-start justify-between gap-2 pr-8">
                        <div className="flex-1 min-w-0 overflow-hidden">
                            <DialogTitle className="truncate text-base sm:text-lg">{file.originalFileName}</DialogTitle>
                            <DialogDescription className="truncate">{file.fileType}</DialogDescription>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                            <Button size="sm" variant="outline" onClick={handleDownload} disabled={downloadLoading}>
                                {downloadLoading ? (
                                    <Loader2 className="h-4 w-4 sm:mr-2 animate-spin" />
                                ) : (
                                    <Download className="h-4 w-4 sm:mr-2" />
                                )}
                                <span className="hidden sm:inline">Download</span>
                            </Button>
                        </div>
                    </div>
                </DialogHeader>

                <div className="flex-1 overflow-auto bg-muted/30 rounded-md border min-h-[300px] relative">
                    {loading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10">
                            <Loader2 className="h-8 w-8 animate-spin" />
                        </div>
                    )}

                    {isCode ? (
                        error ? (
                            <div className="flex flex-col items-center justify-center h-full gap-2 text-destructive p-4 text-center">
                                <AlertCircle className="h-8 w-8 mb-2" />
                                <p>{error}</p>
                                <Button variant="outline" size="sm" onClick={handleDownload} className="mt-2 text-foreground">
                                    <ExternalLink className="h-4 w-4 mr-2" />
                                    Download File
                                </Button>
                            </div>
                        ) : (
                            <SyntaxHighlighter
                                language={getLanguage(file.originalFileName)}
                                style={vscDarkPlus}
                                customStyle={{ margin: 0, height: '100%', fontSize: '14px' }}
                                showLineNumbers={true}
                            >
                                {content || ''}
                            </SyntaxHighlighter>
                        )
                    ) : fileType.includes('pdf') ? (
                        // For PDF and images, use presigned URL via async fetch
                        <PdfPreview fileId={file._id} />
                    ) : fileType.includes('image') ? (
                        <ImagePreview fileId={file._id} fileName={file.originalFileName} />
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full gap-4 text-muted-foreground p-8">
                            <p>Preview not available for this file type.</p>
                            <Button variant="secondary" onClick={handleDownload}>
                                Download File <Download className="ml-2 h-4 w-4" />
                            </Button>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

// Component to handle PDF preview with presigned URL
function PdfPreview({ fileId }: { fileId: string }) {
    const [url, setUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/files/${fileId}/download`)
            .then(res => res.json())
            .then(data => {
                if (data.success && data.downloadUrl) {
                    setUrl(data.downloadUrl);
                }
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [fileId]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    if (!url) {
        return (
            <div className="flex items-center justify-center h-full text-muted-foreground">
                Failed to load PDF preview
            </div>
        );
    }

    return <iframe src={url} className="w-full h-full min-h-[500px]" title="PDF Preview" />;
}

// Component to handle image preview with presigned URL
function ImagePreview({ fileId, fileName }: { fileId: string; fileName: string }) {
    const [url, setUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/files/${fileId}/download`)
            .then(res => res.json())
            .then(data => {
                if (data.success && data.downloadUrl) {
                    setUrl(data.downloadUrl);
                }
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [fileId]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    if (!url) {
        return (
            <div className="flex items-center justify-center h-full text-muted-foreground">
                Failed to load image preview
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center h-full p-4">
            <img src={url} alt={fileName} className="max-w-full max-h-full object-contain" />
        </div>
    );
}

