import { useWatchedProjects } from '../hooks/use-project';
import { HorizontalProjectCard } from '@/features/profile/components/horizontal-project-card';
import { Loader2 } from 'lucide-react';

export function WatchingPage() {
    const { data: projects, isLoading } = useWatchedProjects();

    return (
        <div className="container max-w-7xl mx-auto py-8 px-4">
            <h1 className="text-2xl font-bold mb-6">Watching Projects</h1>

            {isLoading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            ) : projects && projects.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {projects.map((project) => (
                        <HorizontalProjectCard key={project._id} project={project} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 text-muted-foreground">
                    <p>You aren't watching any projects yet.</p>
                </div>
            )}
        </div>
    );
}

export default WatchingPage;
