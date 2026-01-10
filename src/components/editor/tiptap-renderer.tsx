'use client';

import { useMemo } from 'react';
import { cn } from '@/lib/utils';

interface TiptapRendererProps {
    content: string;
    className?: string;
}

interface TiptapNode {
    type: string;
    content?: TiptapNode[];
    text?: string;
    marks?: Array<{ type: string; attrs?: Record<string, unknown> }>;
    attrs?: Record<string, unknown>;
}

/**
 * Renders Tiptap JSON content to HTML
 */
export function TiptapRenderer({ content, className }: TiptapRendererProps) {
    const htmlContent = useMemo(() => {
        if (!content) return '';

        try {
            const parsed: TiptapNode = JSON.parse(content);
            return renderNode(parsed);
        } catch (e) {
            // If not valid JSON, return as plain text
            return `<p>${content}</p>`;
        }
    }, [content]);

    return (
        <div
            className={cn(
                'prose prose-sm dark:prose-invert max-w-none',
                'prose-headings:font-semibold prose-headings:text-foreground',
                'prose-p:text-foreground prose-p:leading-relaxed',
                'prose-strong:text-foreground prose-strong:font-semibold',
                'prose-code:text-primary prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded',
                'prose-blockquote:border-l-primary prose-blockquote:text-muted-foreground',
                'prose-ul:list-disc prose-ol:list-decimal',
                'prose-li:text-foreground',
                'prose-a:text-primary prose-a:underline prose-a:underline-offset-2',
                'prose-img:rounded-lg prose-img:max-w-full',
                className
            )}
            dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
    );
}

function renderNode(node: TiptapNode): string {
    if (!node) return '';

    // Text node with marks
    if (node.type === 'text') {
        let text = escapeHtml(node.text || '');

        if (node.marks) {
            node.marks.forEach(mark => {
                switch (mark.type) {
                    case 'bold':
                        text = `<strong>${text}</strong>`;
                        break;
                    case 'italic':
                        text = `<em>${text}</em>`;
                        break;
                    case 'strike':
                        text = `<s>${text}</s>`;
                        break;
                    case 'code':
                        text = `<code>${text}</code>`;
                        break;
                    case 'link':
                        const href = (mark.attrs?.href as string) || '#';
                        text = `<a href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer">${text}</a>`;
                        break;
                }
            });
        }

        return text;
    }

    // Get children content
    const children = node.content ? node.content.map(renderNode).join('') : '';

    // Handle different node types
    switch (node.type) {
        case 'doc':
            return children;

        case 'paragraph':
            return `<p>${children || '<br>'}</p>`;

        case 'heading':
            const level = (node.attrs?.level as number) || 1;
            return `<h${level}>${children}</h${level}>`;

        case 'bulletList':
            return `<ul>${children}</ul>`;

        case 'orderedList':
            return `<ol>${children}</ol>`;

        case 'listItem':
            return `<li>${children}</li>`;

        case 'blockquote':
            return `<blockquote>${children}</blockquote>`;

        case 'codeBlock':
            const language = (node.attrs?.language as string) || '';
            return `<pre><code class="language-${language}">${children}</code></pre>`;

        case 'horizontalRule':
            return '<hr>';

        case 'hardBreak':
            return '<br>';

        case 'image':
            const src = (node.attrs?.src as string) || '';
            const alt = (node.attrs?.alt as string) || '';
            return `<img src="${escapeHtml(src)}" alt="${escapeHtml(alt)}" />`;

        default:
            return children;
    }
}

function escapeHtml(text: string): string {
    const map: Record<string, string> = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;',
    };
    return text.replace(/[&<>"']/g, char => map[char]);
}

export default TiptapRenderer;
