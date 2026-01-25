import React from 'react';
import { cn } from '@/lib/utils';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface EditorJsBlock {
    id?: string;
    type: string;
    data: any;
}

interface EditorJsData {
    time?: number;
    blocks: EditorJsBlock[];
    version?: string;
}

interface EditorJsRendererProps {
    content: string | EditorJsData;
    className?: string;
}

export function EditorJsRenderer({ content, className }: EditorJsRendererProps) {
    let data: EditorJsData;

    try {
        if (typeof content === 'string') {
            data = JSON.parse(content);
        } else {
            data = content;
        }

        if (!data.blocks || !Array.isArray(data.blocks)) {
            console.error('Invalid EditorJS data: blocks array missing');
            return null;
        }
    } catch (e) {
        // Fallback for plain text or invalid JSON
        if (typeof content === 'string' && !content.trim().startsWith('{')) {
            return <p className={cn("text-sm whitespace-pre-wrap", className)}>{content}</p>;
        }
        console.error('Failed to parse EditorJS content', e);
        return null;
    }

    return (
        <div className={cn("space-y-4 text-sm", className)}>
            {data.blocks.map((block) => (
                <BlockRenderer key={block.id || Math.random().toString()} block={block} />
            ))}
        </div>
    );
}

function BlockRenderer({ block }: { block: EditorJsBlock }) {
    const { type, data } = block;

    switch (type) {
        case 'paragraph':
            return (
                <p
                    className="leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: data.text }}
                />
            );

        case 'header':
            const Tag = `h${data.level || 3}` as React.ElementType;
            const sizes = {
                1: "text-2xl font-bold mt-6 mb-3",
                2: "text-xl font-bold mt-5 mb-2",
                3: "text-lg font-semibold mt-4 mb-2",
                4: "text-base font-semibold mt-3 mb-1",
                5: "text-sm font-semibold mt-2 mb-1",
                6: "text-xs font-semibold mt-2 mb-1",
            };
            return (
                <Tag
                    className={cn(sizes[data.level as keyof typeof sizes] || sizes[3])}
                    dangerouslySetInnerHTML={{ __html: data.text }}
                />
            );

        case 'list':
            const ListTag = data.style === 'ordered' ? 'ol' : 'ul';
            return (
                <ListTag className={cn("ml-4 space-y-1", data.style === 'ordered' ? "list-decimal" : "list-disc")}>
                    {data.items.map((item: string, i: number) => (
                        <li key={i} dangerouslySetInnerHTML={{ __html: item }} />
                    ))}
                </ListTag>
            );

        case 'delimiter':
            return <hr className="my-6 border-t border-border" />;

        case 'image':
            return (
                <figure className="my-4">
                    <img
                        src={data.file?.url || data.url}
                        alt={data.caption || 'Image'}
                        className="rounded-lg max-h-[500px] w-full object-contain bg-muted"
                        loading="lazy"
                    />
                    {data.caption && (
                        <figcaption className="text-center text-xs text-muted-foreground mt-2">
                            {data.caption}
                        </figcaption>
                    )}
                </figure>
            );

        case 'code':
            return (
                <div className="my-4 rounded-md overflow-hidden text-xs">
                    <SyntaxHighlighter
                        language={data.language || 'javascript'}
                        style={vscDarkPlus}
                        customStyle={{ margin: 0, padding: '1rem' }}
                        wrapLongLines
                    >
                        {data.code}
                    </SyntaxHighlighter>
                </div>
            );

        case 'quote':
            return (
                <blockquote className="border-l-4 border-primary pl-4 italic my-4 text-muted-foreground">
                    <p dangerouslySetInnerHTML={{ __html: data.text }} />
                    {data.caption && <footer className="text-xs mt-1 not-italic opacity-70">— {data.caption}</footer>}
                </blockquote>
            );

        case 'warning':
            return (
                <div className="bg-yellow-500/10 border-l-4 border-yellow-500 p-4 my-4 rounded-r">
                    <h4 className="font-bold text-yellow-500 mb-1">{data.title}</h4>
                    <p className="text-sm" dangerouslySetInnerHTML={{ __html: data.message }} />
                </div>
            );

        case 'checklist':
            return (
                <div className="space-y-2 my-4">
                    {data.items.map((item: { text: string; checked: boolean }, i: number) => (
                        <div key={i} className="flex items-start gap-2">
                            <input
                                type="checkbox"
                                checked={item.checked}
                                readOnly
                                className="mt-1 h-3 w-3 rounded border-gray-300 text-primary focus:ring-primary"
                            />
                            <span className={cn("text-sm", item.checked && "line-through text-muted-foreground")}>
                                {item.text}
                            </span>
                        </div>
                    ))}
                </div>
            );

        default:
            console.warn(`Unknown block type: ${type}`, block);
            return null;
    }
}
