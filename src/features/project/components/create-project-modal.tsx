import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from '@tanstack/react-router';
import { X, Upload, Loader2, FolderPlus, Type, FileText, Tags, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface CreateProjectModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    project?: any;
}

interface ProjectFormData {
    title: string;
    description: string;
}

import { useCreateProject, useUpdateProject } from '../hooks/use-project';

// Suggested categories for quick selection
const SUGGESTED_CATEGORIES = ['AI', 'Web', 'Mobile', 'Gaming', 'Education', 'FinTech', 'Health', 'Social'];

export function CreateProjectModal({ open, onOpenChange, project }: CreateProjectModalProps) {
    const navigate = useNavigate();
    const createProjectMutation = useCreateProject();
    const updateProjectMutation = useUpdateProject();

    const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<ProjectFormData>({
        defaultValues: {
            title: project?.title || '',
            description: project?.description || ''
        }
    });

    useEffect(() => {
        if (open) {
            if (project) {
                setValue('title', project.title);
                setValue('description', project.description);
                setCategories(project.categories || []);
                setPreviewUrl(project.coverImage || null);
            } else {
                reset();
                setCategories([]);
                setPreviewUrl(null);
            }
            setCoverImage(null);
        }
    }, [open, project, setValue, reset]);

    const [categories, setCategories] = useState<string[]>(project?.categories || []);
    const [categoryInput, setCategoryInput] = useState('');
    const [coverImage, setCoverImage] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(project?.coverImage || null);

    const handleCategoryKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            addCategory(categoryInput);
        }
    };

    const addCategory = (cat: string) => {
        const val = cat.trim();
        if (val && !categories.includes(val)) {
            if (categories.length >= 5) {
                toast.error("Maximum 5 categories allowed");
                return;
            }
            setCategories([...categories, val]);
            setCategoryInput('');
        }
    };

    const removeCategory = (catToRemove: string) => {
        setCategories(categories.filter(c => c !== catToRemove));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error("Image size must be less than 5MB");
                return;
            }
            setCoverImage(file);
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
        }
    };

    const onSubmit = async (data: ProjectFormData) => {
        if (categories.length === 0) {
            toast.error("Please add at least one category");
            return;
        }

        const formData = new FormData();
        formData.append('title', data.title);
        formData.append('description', data.description);
        formData.append('categories', JSON.stringify(categories));

        if (coverImage) {
            formData.append('coverImage', coverImage);
        }

        try {
            if (project) {
                const updatedProject = await updateProjectMutation.mutateAsync({ id: project._id, data: formData });
                toast.success("Project updated successfully!");
                onOpenChange(false);

                if (updatedProject?.slug && updatedProject.slug !== project.slug) {
                    navigate({ to: `/project/${updatedProject.slug}` });
                }
            } else {
                const res = await createProjectMutation.mutateAsync(formData);
                toast.success("Project hatched successfully!");
                onOpenChange(false);
                reset();
                setCategories([]);
                setCoverImage(null);
                setPreviewUrl(null);

                if (res.project?.slug) {
                    navigate({ to: `/project/${res.project.slug}`, state: { startHatching: true } });
                }
            }
        } catch (error) {
            toast.error(project ? "Failed to update project" : "Failed to create project");
            console.error(error);
        }
    };

    const isLoading = createProjectMutation.isPending || updateProjectMutation.isPending;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto p-0">
                {/* Header with gradient */}
                <DialogHeader className="p-6 pb-4 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-b">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <FolderPlus className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <DialogTitle className="text-xl">
                                {project ? "Edit Project" : "Hatch a New Project"}
                            </DialogTitle>
                            <p className="text-sm text-muted-foreground mt-0.5">
                                {project ? "Update your project details" : "Share your idea with the world"}
                            </p>
                        </div>
                    </div>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
                    {/* Cover Image Upload - Visual first */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Upload className="h-4 w-4 text-muted-foreground" />
                            <Label className="text-sm font-medium">Cover Image</Label>
                            <span className="text-xs text-muted-foreground">(optional)</span>
                        </div>
                        <div className="relative">
                            <label
                                htmlFor="cover-upload"
                                className={cn(
                                    "flex flex-col items-center justify-center w-full h-36 rounded-xl cursor-pointer transition-all duration-200 relative overflow-hidden",
                                    previewUrl
                                        ? "border-0"
                                        : "border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 hover:bg-primary/5"
                                )}
                            >
                                {previewUrl ? (
                                    <>
                                        <img
                                            src={previewUrl}
                                            alt="Cover preview"
                                            className="w-full h-full object-cover rounded-xl"
                                        />
                                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded-xl">
                                            <div className="text-center text-white">
                                                <Upload className="h-6 w-6 mx-auto mb-1" />
                                                <p className="text-sm font-medium">Change Image</p>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center justify-center text-center p-4">
                                        <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-2">
                                            <Upload className="h-5 w-5 text-muted-foreground" />
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            <span className="text-primary font-medium">Click to upload</span> or drag and drop
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 5MB</p>
                                    </div>
                                )}
                                <input
                                    id="cover-upload"
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                />
                            </label>
                        </div>
                    </div>

                    {/* Title */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Type className="h-4 w-4 text-muted-foreground" />
                            <Label htmlFor="title" className="text-sm font-medium">Project Title</Label>
                        </div>
                        <Input
                            id="title"
                            placeholder="e.g. Neural Net Visualizer"
                            className="h-11"
                            {...register('title', {
                                required: 'Title is required',
                                minLength: { value: 3, message: 'Minimum 3 characters' }
                            })}
                        />
                        {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <Label htmlFor="description" className="text-sm font-medium">Description</Label>
                        </div>
                        <Textarea
                            id="description"
                            placeholder="What problem does your project solve? What makes it unique?"
                            className="min-h-[100px] resize-none"
                            {...register('description', { required: 'Description is required' })}
                        />
                        {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
                    </div>

                    {/* Categories */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <Tags className="h-4 w-4 text-muted-foreground" />
                            <Label className="text-sm font-medium">Categories</Label>
                            <span className="text-xs text-muted-foreground">({categories.length}/5)</span>
                        </div>

                        {/* Selected categories */}
                        {categories.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {categories.map((cat) => (
                                    <Badge
                                        key={cat}
                                        variant="secondary"
                                        className="px-3 py-1.5 gap-1.5 text-sm bg-primary/10 text-primary hover:bg-primary/20"
                                    >
                                        {cat}
                                        <button
                                            type="button"
                                            onClick={() => removeCategory(cat)}
                                            className="hover:text-destructive focus:outline-none ml-1"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </Badge>
                                ))}
                            </div>
                        )}

                        {/* Quick select suggestions */}
                        {categories.length < 5 && (
                            <div className="flex flex-wrap gap-1.5">
                                {SUGGESTED_CATEGORIES.filter(c => !categories.includes(c)).slice(0, 6).map((cat) => (
                                    <button
                                        key={cat}
                                        type="button"
                                        onClick={() => addCategory(cat)}
                                        className="px-3 py-1 text-xs rounded-full border border-dashed border-muted-foreground/30 text-muted-foreground hover:border-primary hover:text-primary hover:bg-primary/5 transition-colors"
                                    >
                                        + {cat}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Custom category input */}
                        <Input
                            placeholder="Type a custom category and press Enter"
                            value={categoryInput}
                            onChange={(e) => setCategoryInput(e.target.value)}
                            onKeyDown={handleCategoryKeyDown}
                            disabled={categories.length >= 5}
                            className="h-10"
                        />
                    </div>

                    {/* Footer Actions - Sticky on mobile */}
                    <div className="grid grid-cols-2 gap-3 pt-4 border-t sm:flex sm:flex-row sm:justify-end">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            className="flex-1 sm:flex-none h-11"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="flex-1 h-11 gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    {project ? "Updating..." : "Hatching..."}
                                </>
                            ) : (
                                <>
                                    <Sparkles className="h-4 w-4" />
                                    {project ? "Save Changes" : "Hatch Project"}
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
