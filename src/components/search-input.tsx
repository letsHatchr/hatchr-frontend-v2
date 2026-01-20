import { useState, useEffect, useRef } from 'react';
import { Search, X, Loader2, User, FileText, MessageSquare } from 'lucide-react';
import { Link, useNavigate } from '@tanstack/react-router';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// Utility to extract plain text from Tiptap JSON content
function extractTextFromTiptap(content: any): string {
    if (!content) return '';

    if (typeof content === 'string') {
        if (content.startsWith('{') || content.startsWith('[')) {
            try {
                content = JSON.parse(content);
            } catch {
                return content;
            }
        } else {
            return content;
        }
    }

    if (content.type === 'text') {
        return content.text || '';
    }

    if (content.content && Array.isArray(content.content)) {
        return content.content.map(extractTextFromTiptap).join(' ').trim();
    }

    return '';
}

// Simple debounce hook implementation
function useDebounceValue<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);
    return debouncedValue;
}

interface SearchResult {
    projects: Array<{
        _id: string;
        title: string;
        slug: string;
        category: string;
        user: {
            name: string;
            username: string;
            avatar: string;
        };
    }>;
    users: Array<{
        _id: string;
        name: string;
        username: string;
        avatar: string;
        bio: string;
    }>;
    posts: Array<{
        _id: string;
        title: string;
        slug: string;
        caption: string;
        type: string;
        project: {
            _id?: string;
            title: string;
            slug: string;
        };
        user: {
            username: string;
        };
    }>;
}

export function SearchInput() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const debouncedQuery = useDebounceValue(query, 300);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Perform search
    useEffect(() => {
        const fetchResults = async () => {
            if (!debouncedQuery.trim()) {
                setResults(null);
                setIsOpen(false);
                return;
            }

            setIsLoading(true);
            setIsOpen(true);

            try {
                // Determine API URL - preferring localhost:3000 if dev
                // Ensure we don't double up /api if VITE_API_URL already has it
                let apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
                if (apiUrl.endsWith('/api')) {
                    apiUrl = apiUrl.slice(0, -4);
                }

                const response = await fetch(`${apiUrl}/api/search?q=${encodeURIComponent(debouncedQuery)}`);
                if (response.ok) {
                    const data = await response.json();
                    setResults(data);
                } else {
                    console.error('Search response not ok:', response.status);
                    // Fallback try localhost:3000 explicitly if VITE_API_URL failed
                    if (!apiUrl.includes('localhost:3000')) {
                        try {
                            const retryResponse = await fetch(`http://localhost:3000/api/search?q=${encodeURIComponent(debouncedQuery)}`);
                            if (retryResponse.ok) {
                                const retryData = await retryResponse.json();
                                setResults(retryData);
                            }
                        } catch (e) {
                            console.error('Retry failed', e);
                        }
                    }
                }
            } catch (error) {
                console.error('Search failed:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchResults();
    }, [debouncedQuery]);

    const handleClear = () => {
        setQuery('');
        setResults(null);
        setIsOpen(false);
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            setIsOpen(false);
            // @ts-ignore
            navigate({ to: '/search', search: { q: query } });
        }
    };

    const hasResults = (results?.users?.length ?? 0) > 0 ||
        (results?.projects?.length ?? 0) > 0 ||
        (results?.posts?.length ?? 0) > 0;

    return (
        <div className="relative w-full max-w-sm" ref={wrapperRef}>
            <form onSubmit={handleSearchSubmit} className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder="Search..."
                    className="w-full pl-9 pr-9 bg-muted/50 focus:bg-background transition-colors"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => {
                        if (query.trim()) setIsOpen(true);
                    }}
                />
                {isLoading ? (
                    <div className="absolute right-3 top-3">
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    </div>
                ) : query && (
                    <button
                        type="button"
                        onClick={handleClear}
                        className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                    >
                        <X className="h-4 w-4" />
                    </button>
                )}
            </form>

            {/* Results Dropdown */}
            {isOpen && hasResults && results && (
                <div className="absolute top-full mt-2 w-full rounded-md border bg-popover text-popover-foreground shadow-lg ring-1 ring-black ring-opacity-5 z-50 overflow-hidden animate-in fade-in-0 zoom-in-95 duration-100">
                    <div className="max-h-[80vh] overflow-y-auto py-2">
                        {/* Users Section */}
                        {results.users && results.users.length > 0 && (
                            <div className="mb-2">
                                <div className="px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    Users
                                </div>
                                {results.users.map((user) => (
                                    <Link
                                        key={user._id}
                                        to="/$username"
                                        params={{ username: user.username }}
                                        onClick={() => setIsOpen(false)}
                                        className="flex items-center gap-3 px-4 py-2 hover:bg-muted/50 transition-colors"
                                    >
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={user.avatar} />
                                            <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
                                        </Avatar>
                                        <div className="overflow-hidden">
                                            <p className="text-sm font-medium truncate">{user.name}</p>
                                            <p className="text-xs text-muted-foreground truncate">@{user.username}</p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}

                        {results.users?.length > 0 && results.projects?.length > 0 && (
                            <div className="h-px bg-border mx-2 my-1" />
                        )}

                        {/* Projects Section */}
                        {results.projects && results.projects.length > 0 && (
                            <div>
                                <div className="px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    Projects
                                </div>
                                {results.projects.map((project) => (
                                    <Link
                                        key={project._id}
                                        to="/project/$slug"
                                        params={{ slug: project.slug || project._id }}
                                        search={{ tab: 'timeline' }}
                                        onClick={() => setIsOpen(false)}
                                        className="flex items-start gap-3 px-4 py-2 hover:bg-muted/50 transition-colors"
                                    >
                                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-muted">
                                            <FileText className="h-4 w-4 text-muted-foreground" />
                                        </div>
                                        <div className="overflow-hidden">
                                            <p className="text-sm font-medium truncate">{project.title}</p>
                                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                <Avatar className="h-3 w-3">
                                                    <AvatarImage src={project.user?.avatar} />
                                                    <AvatarFallback>U</AvatarFallback>
                                                </Avatar>
                                                <span className="truncate">by {project.user?.username || 'Unknown'}</span>
                                                {project.category && (
                                                    <>
                                                        <span>•</span>
                                                        <span className="truncate">{project.category}</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}

                        {/* Posts Section */}
                        {results.posts && results.posts.length > 0 && (
                            <div>
                                <div className="px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-2 border-t pt-2">
                                    Posts
                                </div>
                                {results.posts.map((post) => (
                                    <Link
                                        key={post._id}
                                        to="/project/$slug"
                                        params={{ slug: post.project?.slug || post.project?._id || post._id }}
                                        search={{ tab: 'timeline' }}
                                        onClick={() => setIsOpen(false)}
                                        className="flex items-start gap-3 px-4 py-2 hover:bg-muted/50 transition-colors"
                                    >
                                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-muted">
                                            <MessageSquare className="h-4 w-4 text-muted-foreground" />
                                        </div>
                                        <div className="overflow-hidden">
                                            <p className="text-sm font-medium truncate">{post.title}</p>
                                            <p className="text-xs text-muted-foreground truncate">{extractTextFromTiptap(post.caption)}</p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}

                        <div className="p-2 border-t mt-1">
                            <button
                                onClick={() => {
                                    setIsOpen(false);
                                    // @ts-ignore
                                    navigate({ to: '/search', search: { q: query } });
                                }}
                                className="w-full text-center text-xs text-primary hover:underline py-1"
                            >
                                View all results for "{query}"
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isOpen && query && !isLoading && !hasResults && (
                <div className="absolute top-full mt-2 w-full rounded-md border bg-popover p-4 text-center text-sm text-muted-foreground shadow-lg z-50">
                    No results found for "{query}". <br />
                    <button
                        className="text-primary hover:underline mt-1"
                        type="button"
                        onClick={() => {
                            setIsOpen(false);
                            // @ts-ignore
                            navigate({ to: '/search', search: { q: query } });
                        }}
                    >
                        Go to search page
                    </button>
                </div>
            )}
        </div>
    );
}
