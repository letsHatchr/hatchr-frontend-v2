'use client';

import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { FileText, FolderPlus, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/store';
import { CreateProjectModal } from '@/features/project/components/create-project-modal';
import { CreatePostModal } from '@/features/project/components/create-post-modal';

export function CreatePage() {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuthStore();
    const [showProjectModal, setShowProjectModal] = useState(false);
    const [showPostModal, setShowPostModal] = useState(false);

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
        navigate({ to: '/login', search: { returnUrl: '/create' } });
        return null;
    }

    return (
        <div className="container mx-auto px-4 py-8 pb-24 lg:pb-8 max-w-lg">
            <Button
                variant="ghost"
                onClick={() => navigate({ to: '/feed' })}
                className="mb-6"
            >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
            </Button>

            <h1 className="text-2xl font-bold mb-6 text-center">Add Something New</h1>

            <div className="space-y-4">
                {/* Create Project Card */}
                <Card
                    className="cursor-pointer hover:border-primary transition-colors"
                    onClick={() => setShowProjectModal(true)}
                >
                    <CardHeader className="pb-3">
                        <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                                <FolderPlus className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <CardTitle className="text-lg">New Project</CardTitle>
                                <CardDescription>Start a new project to track your progress</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                </Card>

                {/* Add Update Card */}
                <Card
                    className="cursor-pointer hover:border-primary transition-colors"
                    onClick={() => setShowPostModal(true)}
                >
                    <CardHeader className="pb-3">
                        <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                                <FileText className="h-6 w-6 text-blue-500" />
                            </div>
                            <div>
                                <CardTitle className="text-lg">Add Update</CardTitle>
                                <CardDescription>Share progress on your projects</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                </Card>
            </div>

            {/* Modals */}
            <CreateProjectModal
                open={showProjectModal}
                onOpenChange={setShowProjectModal}
            />
            <CreatePostModal
                open={showPostModal}
                onOpenChange={setShowPostModal}
            />
        </div>
    );
}

export default CreatePage;
