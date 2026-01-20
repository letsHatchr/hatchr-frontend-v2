import { useNavigate, useSearch } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { Loader2, User, FileText, MessageSquare, Search } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';

// Utility to extract plain text from Tiptap JSON content
function extractTextFromTiptap(content: any): string {
    if (!content) return '';

    // If it's already a string, check if it's JSON
    if (typeof content === 'string') {
        // Try to parse as JSON if it looks like Tiptap content
        if (content.startsWith('{') || content.startsWith('[')) {
            try {
                content = JSON.parse(content);
            } catch {
                return content; // Already plain text
            }
        } else {
            return content; // Already plain text
        }
    }

    // Recursively extract text from Tiptap nodes
    if (content.type === 'text') {
        return content.text || '';
    }

    if (content.content && Array.isArray(content.content)) {
        return content.content.map(extractTextFromTiptap).join(' ').trim();
    }

    return '';
}

interface SearchResult {
    projects: Array<{
        _id: string;
        title: string;
        slug: string;
        category: string;
        description: string;
        coverImage: string;
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
        createdAt: string;
        project: {
            title: string;
            slug: string;
        };
        user: {
            name: string;
            username: string;
            avatar: string;
        };
    }>;
}

export function SearchPage() {
    // @ts-ignore
    const { q } = useSearch({ strict: false });
    const navigate = useNavigate();
    const [results, setResults] = useState<SearchResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState(q || '');

    useEffect(() => {
        const fetchResults = async () => {
            if (!q) return;
            setIsLoading(true);
            try {
                let apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
                if (apiUrl.endsWith('/api')) {
                    apiUrl = apiUrl.slice(0, -4);
                }

                const response = await fetch(`${apiUrl}/api/search?q=${encodeURIComponent(q)}`);
                if (response.ok) {
                    const data = await response.json();
                    setResults(data);
                } else {
                    // Fallback retry
                    if (!apiUrl.includes('localhost:3000')) {
                        const retryResponse = await fetch(`http://localhost:3000/api/search?q=${encodeURIComponent(q)}`);
                        if (retryResponse.ok) {
                            const data = await retryResponse.json();
                            setResults(data);
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
    }, [q]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate({ to: '/search', search: { q: searchQuery.trim() } });
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!q) {
        return (
            <div className="container mx-auto py-8 px-4 pb-24 lg:pb-8">
                <h1 className="text-2xl font-bold text-center">Search Hatchr</h1>
                <p className="text-muted-foreground mt-2 text-center">Enter a query to search for projects, users, and posts.</p>

                {/* Mobile search input */}
                <form onSubmit={handleSearch} className="mt-6 max-w-md mx-auto">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search projects, users, posts..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-20"
                            autoFocus
                        />
                        <Button
                            type="submit"
                            size="sm"
                            className="absolute right-1 top-1/2 -translate-y-1/2"
                            disabled={!searchQuery.trim()}
                        >
                            Search
                        </Button>
                    </div>
                </form>
            </div>
        );
    }

    const hasResults = results && (
        (results.users?.length ?? 0) > 0 ||
        (results.projects?.length ?? 0) > 0 ||
        (results.posts?.length ?? 0) > 0
    );

    return (
        <div className="container mx-auto py-8 max-w-5xl px-4">
            <h1 className="text-3xl font-bold mb-6">Search Results for "{q}"</h1>

            {!hasResults ? (
                <div className="text-center py-12 bg-muted/30 rounded-lg border border-dashed">
                    <p className="text-muted-foreground text-lg">No results found.</p>
                </div>
            ) : (
                <Tabs defaultValue="all" className="w-full">
                    <TabsList className="mb-8">
                        <TabsTrigger value="all">All</TabsTrigger>
                        <TabsTrigger value="projects">Projects ({results?.projects?.length || 0})</TabsTrigger>
                        <TabsTrigger value="users">Users ({results?.users?.length || 0})</TabsTrigger>
                        <TabsTrigger value="posts">Posts ({results?.posts?.length || 0})</TabsTrigger>
                    </TabsList>

                    <TabsContent value="all" className="space-y-8">
                        {/* Top Users */}
                        {results?.users && results.users.length > 0 && (
                            <section>
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-xl font-semibold flex items-center gap-2">
                                        <User className="h-5 w-5" /> People
                                    </h2>
                                    <Button variant="link" onClick={() => (document.querySelector('[data-value="users"]') as HTMLElement)?.click()}>View all</Button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {results.users.slice(0, 6).map(user => (
                                        <UserCard key={user._id} user={user} navigate={navigate} />
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Top Projects */}
                        {results?.projects && results.projects.length > 0 && (
                            <section>
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-xl font-semibold flex items-center gap-2">
                                        <FileText className="h-5 w-5" /> Projects
                                    </h2>
                                    <Button variant="link" onClick={() => (document.querySelector('[data-value="projects"]') as HTMLElement)?.click()}>View all</Button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {results.projects.slice(0, 4).map(project => (
                                        <ProjectCard key={project._id} project={project} navigate={navigate} />
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Top Posts */}
                        {results?.posts && results.posts.length > 0 && (
                            <section>
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-xl font-semibold flex items-center gap-2">
                                        <MessageSquare className="h-5 w-5" /> Posts
                                    </h2>
                                    <Button variant="link" onClick={() => (document.querySelector('[data-value="posts"]') as HTMLElement)?.click()}>View all</Button>
                                </div>
                                <div className="space-y-4">
                                    {results.posts.slice(0, 5).map(post => (
                                        <PostItem key={post._id} post={post} navigate={navigate} />
                                    ))}
                                </div>
                            </section>
                        )}
                    </TabsContent>

                    <TabsContent value="users">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {results?.users?.map(user => (
                                <UserCard key={user._id} user={user} navigate={navigate} />
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="projects">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                            {results?.projects?.map(project => (
                                <ProjectCard key={project._id} project={project} navigate={navigate} />
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="posts">
                        <div className="space-y-4 max-w-3xl mx-auto">
                            {results?.posts?.map(post => (
                                <PostItem key={post._id} post={post} navigate={navigate} />
                            ))}
                        </div>
                    </TabsContent>
                </Tabs>
            )}
        </div>
    );
}

function UserCard({ user, navigate }: { user: any, navigate: any }) {
    return (
        <Card className="hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => navigate({ to: '/$username', params: { username: user.username } })}>
            <CardContent className="p-4 flex items-center gap-4">
                <Avatar className="h-12 w-12">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback><User className="h-6 w-6" /></AvatarFallback>
                </Avatar>
                <div className="overflow-hidden">
                    <h3 className="font-semibold truncate">{user.name}</h3>
                    <p className="text-sm text-muted-foreground truncate">@{user.username}</p>
                    {user.bio && <p className="text-xs text-muted-foreground truncate mt-1">{user.bio}</p>}
                </div>
            </CardContent>
        </Card>
    );
}

function ProjectCard({ project, navigate }: { project: any, navigate: any }) {
    const projectSlug = project.slug || project._id;
    return (
        // Group class for hover effect
        <Card className="hover:border-primary/50 transition-colors cursor-pointer overflow-hidden group" onClick={() => navigate({ to: '/project/$slug', params: { slug: projectSlug } })}>
            <div className="flex h-full">
                {project.coverImage && (
                    <div className="w-1/3 min-w-[120px] bg-muted relative">
                        <img src={project.coverImage} alt={project.title} className="absolute inset-0 w-full h-full object-cover" />
                    </div>
                )}
                <div className={`p-4 flex flex-col justify-between w-full ${!project.coverImage ? 'w-full' : 'w-2/3'}`}>
                    <div>
                        <div className="flex items-start justify-between gap-2">
                            <h3 className="font-semibold text-lg leading-tight group-hover:text-primary transition-colors line-clamp-2">{project.title}</h3>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{project.description}</p>
                    </div>
                    <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
                        <Avatar className="h-4 w-4">
                            <AvatarImage src={project.user?.avatar} />
                            <AvatarFallback>U</AvatarFallback>
                        </Avatar>
                        <span className="truncate">{project.user?.username || 'Unknown'}</span>
                        {project.category && (
                            <>
                                <span>•</span>
                                <span className="px-1.5 py-0.5 rounded-full bg-muted font-medium">{project.category}</span>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </Card>
    );
}

function PostItem({ post, navigate }: { post: any, navigate: any }) {
    return (
        <Card className="hover:bg-muted/30 transition-colors cursor-pointer" onClick={() => navigate({ to: '/project/$slug', params: { slug: post.project.slug } })}>
            <CardContent className="p-4">
                <div className="flex gap-4">
                    <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span className="font-medium text-foreground">{post.project.title}</span>
                            <span>•</span>
                            <span>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
                            <span>•</span>
                            <span className="capitalize px-1.5 py-0.5 rounded-full bg-blue-500/10 text-blue-500 text-[10px]">{post.type}</span>
                        </div>
                        <h3 className="font-semibold text-base">{post.title}</h3>
                        {post.caption && <p className="text-sm text-muted-foreground line-clamp-2">{extractTextFromTiptap(post.caption)}</p>}

                        <div className="flex items-center gap-2 text-xs mt-2">
                            <Avatar className="h-4 w-4">
                                <AvatarImage src={post.user?.avatar} />
                                <AvatarFallback>U</AvatarFallback>
                            </Avatar>
                            <span className="text-muted-foreground">by {post.user?.username || 'Unknown'}</span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
