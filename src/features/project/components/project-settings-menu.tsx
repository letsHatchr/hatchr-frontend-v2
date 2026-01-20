import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Settings, Edit, Users, Archive, Trash } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { toast } from '@/lib/toast';
import type { Project } from '../types';
import {
    useArchiveProject,
    useUnarchiveProject,
    useDeleteProject,
} from '../hooks/use-project';
import { CreateProjectModal } from './create-project-modal';

interface ProjectSettingsMenuProps {
    project: Project;
}

export function ProjectSettingsMenu({ project }: ProjectSettingsMenuProps) {
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);

    const archiveMutation = useArchiveProject();
    const unarchiveMutation = useUnarchiveProject();
    const deleteMutation = useDeleteProject();

    const [showEditModal, setShowEditModal] = useState(false);

    const handleEdit = () => {
        setShowEditModal(true);
        setOpen(false);
    };

    const handleManageTeam = () => {
        navigate({
            to: '/project/$slug',
            params: { slug: project.slug },
            search: { tab: 'team' },
        });
        setOpen(false);
    };

    const handleArchive = async () => {
        try {
            if (project.isArchived) {
                await unarchiveMutation.mutateAsync(project._id);
                toast.success('Project unarchived successfully');
            } else {
                await archiveMutation.mutateAsync(project._id);
                toast.success('Project archived successfully');
            }
            setOpen(false);
        } catch (error) {
            toast.error('Failed to archive project');
        }
    };

    const handleDelete = async () => {
        if (
            !window.confirm(
                'Are you sure you want to delete this project? This action cannot be undone.'
            )
        ) {
            return;
        }

        try {
            await deleteMutation.mutateAsync(project.slug);
            toast.success('Project deleted successfully');
            navigate({ to: '/' });
        } catch (error) {
            toast.error('Failed to delete project');
        }
    };

    return (
        <>
            <DropdownMenu open={open} onOpenChange={setOpen}>
                <DropdownMenuTrigger
                    render={
                        <Button variant="outline" className="w-full">
                            <Settings className="mr-2 h-4 w-4" />
                            Project Settings
                        </Button>
                    }
                />
                <DropdownMenuContent align="start" className="w-56">
                    <DropdownMenuItem onClick={handleEdit}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Project
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleManageTeam}>
                        <Users className="mr-2 h-4 w-4" />
                        Manage Team
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        onClick={handleArchive}
                        disabled={archiveMutation.isPending || unarchiveMutation.isPending}
                    >
                        <Archive className="mr-2 h-4 w-4" />
                        {project.isArchived ? 'Unarchive' : 'Archive'}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={handleDelete}
                        className="text-destructive focus:text-destructive"
                        disabled={deleteMutation.isPending}
                    >
                        <Trash className="mr-2 h-4 w-4" />
                        Delete Project
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <CreateProjectModal
                open={showEditModal}
                onOpenChange={setShowEditModal}
                project={project}
            />
        </>
    );
}
