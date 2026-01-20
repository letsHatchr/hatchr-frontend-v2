import { useState, useRef, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { X, Loader2, Film, Paperclip, FileCode, FileText, MessageSquare, Megaphone, Flag, ImagePlus, Sparkles } from 'lucide-react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreatePost, useUpdatePost } from '@/features/feed/hooks/use-posts';
import { useMyProjects } from '../hooks/use-project';
import { TiptapEditor } from '@/components/editor/tiptap-editor';
import { cn } from '@/lib/utils';

interface CreatePostModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    projectId?: string;
    projectSlug?: string;
    post?: any;
}

interface PostFormData {
    title: string;
    caption: string;
    type: string;
    selectedProjectId?: string;
}

const POST_TYPES = [
    { value: 'update', label: 'Update', icon: MessageSquare, description: 'Share progress or news' },
    { value: 'milestone', label: 'Milestone', icon: Flag, description: 'Celebrate an achievement' },
    { value: 'announcement', label: 'Announcement', icon: Megaphone, description: 'Important news' },
];

export function CreatePostModal({ open, onOpenChange, projectId, post }: CreatePostModalProps) {
    const createPostMutation = useCreatePost();
    const updatePostMutation = useUpdatePost();
    const { data: myProjects, isLoading: isLoadingProjects } = useMyProjects();
    const [selectedProject, setSelectedProject] = useState<string>(projectId || '');

    const { register, control, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<PostFormData>({
        defaultValues: {
            type: post?.type || 'update',
            title: post?.title || '',
            caption: post?.caption || '',
        }
    });

    useEffect(() => {
        if (open) {
            if (post) {
                setValue('title', post.title);
                setValue('caption', post.caption);
                setValue('type', post.type);
                setSelectedProject(post.project?._id || '');
            } else {
                reset();
                if (projectId) setSelectedProject(projectId);
            }
        }
    }, [open, post, projectId, setValue, reset]);

    useEffect(() => {
        if (projectId) {
            setSelectedProject(projectId);
        }
    }, [projectId]);

    const [mediaFiles, setMediaFiles] = useState<File[]>([]);
    const [mediaPreviews, setMediaPreviews] = useState<{ url: string, type: 'image' | 'video' }[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
    const attachmentInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const newFiles = Array.from(e.target.files);

            if (mediaFiles.length + newFiles.length > 10) {
                toast.error("Maximum 10 media files allowed");
                return;
            }

            const newPreviews = newFiles.map(file => ({
                url: URL.createObjectURL(file),
                type: file.type.startsWith('video/') ? 'video' : 'image' as 'image' | 'video'
            }));

            setMediaFiles([...mediaFiles, ...newFiles]);
            setMediaPreviews([...mediaPreviews, ...newPreviews]);
        }
    };

    const removeMedia = (index: number) => {
        const newFiles = [...mediaFiles];
        const newPreviews = [...mediaPreviews];
        URL.revokeObjectURL(newPreviews[index].url);
        newFiles.splice(index, 1);
        newPreviews.splice(index, 1);
        setMediaFiles(newFiles);
        setMediaPreviews(newPreviews);
    };

    const handleAttachmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const newFiles = Array.from(e.target.files);
            if (attachedFiles.length + newFiles.length > 10) {
                toast.error("Maximum 10 attachments allowed");
                return;
            }
            setAttachedFiles([...attachedFiles, ...newFiles]);
        }
    };

    const removeAttachedFile = (index: number) => {
        const newFiles = [...attachedFiles];
        newFiles.splice(index, 1);
        setAttachedFiles(newFiles);
    };

    const onSubmit = async (data: PostFormData) => {
        if (!post) {
            if (mediaFiles.length === 0) {
                toast.error("Please add at least one image or video");
                return;
            }
        }

        const targetProjectId = projectId || selectedProject;

        if (!targetProjectId && !post) {
            toast.error("Please select a project");
            return;
        }

        const formData = new FormData();
        formData.append('title', data.title);
        formData.append('caption', data.caption);
        formData.append('type', data.type);
        formData.append('projectId', targetProjectId);
        formData.append('contentFormat', 'tiptap');

        mediaFiles.forEach((file) => {
            formData.append('media', file);
        });

        attachedFiles.forEach((file) => {
            formData.append('files', file);
        });

        try {
            if (post) {
                await updatePostMutation.mutateAsync({ id: post._id, data: formData });
                toast.success("Post updated successfully!");
                onOpenChange(false);
            } else {
                await createPostMutation.mutateAsync(formData);
                toast.success("Post created successfully!");
                onOpenChange(false);
                reset();
                setMediaFiles([]);
                setMediaPreviews([]);
                setAttachedFiles([]);
                if (!projectId) setSelectedProject('');
            }
        } catch (error) {
            toast.error(post ? "Failed to update post" : "Failed to create post");
            console.error(error);
        }
    };

    const isLoading = createPostMutation.isPending || updatePostMutation.isPending;
    const currentType = watch('type');

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto p-0">
                {/* Header with gradient */}
                <DialogHeader className="p-6 pb-4 bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent border-b">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                            <FileText className="h-5 w-5 text-blue-500" />
                        </div>
                        <div>
                            <DialogTitle className="text-xl">
                                {post ? "Edit Post" : "Create New Post"}
                            </DialogTitle>
                            <p className="text-sm text-muted-foreground mt-0.5">
                                {post ? "Update your post content" : "Share updates with your followers"}
                            </p>
                        </div>
                    </div>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
                    {/* Project Selection */}
                    {!projectId && !post && (
                        <div className="space-y-2">
                            <Label className="text-sm font-medium">Select Project</Label>
                            <Select
                                value={selectedProject}
                                onValueChange={(val) => setSelectedProject(val || '')}
                            >
                                <SelectTrigger className="h-11">
                                    <SelectValue>
                                        {selectedProject
                                            ? myProjects?.find(p => p._id === selectedProject)?.title || "Unknown Project"
                                            : (isLoadingProjects ? "Loading projects..." : "Choose a project")}
                                    </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                    {myProjects?.map((project) => (
                                        <SelectItem key={project._id} value={project._id}>
                                            {project.title}
                                        </SelectItem>
                                    ))}
                                    {myProjects?.length === 0 && (
                                        <div className="p-3 text-sm text-muted-foreground text-center">
                                            No projects yet. Create one first!
                                        </div>
                                    )}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {/* Post Type - Visual Selection */}
                    <div className="space-y-2">
                        <Label className="text-sm font-medium">Post Type</Label>
                        <div className="grid grid-cols-3 gap-2">
                            {POST_TYPES.map((type) => {
                                const Icon = type.icon;
                                const isSelected = currentType === type.value;
                                return (
                                    <button
                                        key={type.value}
                                        type="button"
                                        onClick={() => setValue('type', type.value)}
                                        className={cn(
                                            "flex flex-col items-center gap-1.5 p-3 rounded-lg border-2 transition-all",
                                            isSelected
                                                ? "border-primary bg-primary/5 text-primary"
                                                : "border-muted hover:border-muted-foreground/30 text-muted-foreground hover:text-foreground"
                                        )}
                                    >
                                        <Icon className={cn("h-5 w-5", isSelected && "text-primary")} />
                                        <span className="text-xs font-medium">{type.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Title */}
                    <div className="space-y-2">
                        <Label htmlFor="title" className="text-sm font-medium">Post Title</Label>
                        <Input
                            id="title"
                            placeholder="e.g. First Prototype Demo"
                            className="h-11"
                            {...register('title', { required: 'Title is required' })}
                        />
                        {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
                    </div>

                    {/* Caption */}
                    <div className="space-y-2">
                        <Label htmlFor="caption" className="text-sm font-medium">Caption</Label>
                        <Controller
                            name="caption"
                            control={control}
                            render={({ field }) => (
                                <TiptapEditor
                                    content={field.value}
                                    onChange={field.onChange}
                                    placeholder="Write your update here..."
                                    minHeight="150px"
                                />
                            )}
                        />
                    </div>

                    {/* Media Upload - More visual */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Label className="text-sm font-medium">Media</Label>
                            <span className="text-xs text-muted-foreground">{mediaPreviews.length}/10 files</span>
                        </div>

                        <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                            {mediaPreviews.map((preview, idx) => (
                                <div key={idx} className="relative aspect-square rounded-lg overflow-hidden bg-muted group">
                                    {preview.type === 'video' ? (
                                        <video src={preview.url} className="w-full h-full object-cover" />
                                    ) : (
                                        <img src={preview.url} alt="Preview" className="w-full h-full object-cover" />
                                    )}
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <button
                                            type="button"
                                            onClick={() => removeMedia(idx)}
                                            className="h-8 w-8 rounded-full bg-destructive/90 text-white flex items-center justify-center hover:bg-destructive"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                    {preview.type === 'video' && (
                                        <div className="absolute bottom-1 right-1 bg-black/70 rounded px-1.5 py-0.5">
                                            <Film className="h-3 w-3 text-white" />
                                        </div>
                                    )}
                                </div>
                            ))}

                            {post && mediaFiles.length === 0 && (
                                <div className="col-span-full p-4 text-center text-sm text-muted-foreground border border-dashed rounded-lg bg-muted/30">
                                    Media cannot be changed when editing
                                </div>
                            )}

                            {!post && mediaPreviews.length < 10 && (
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="flex flex-col items-center justify-center aspect-square rounded-lg border-2 border-dashed hover:border-primary hover:bg-primary/5 transition-all group"
                                >
                                    <ImagePlus className="h-6 w-6 text-muted-foreground group-hover:text-primary mb-1" />
                                    <span className="text-[10px] text-muted-foreground group-hover:text-primary">Add</span>
                                </button>
                            )}
                        </div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*,video/*"
                            multiple
                            onChange={handleFileChange}
                        />
                        {!post && mediaPreviews.length === 0 && (
                            <p className="text-xs text-muted-foreground">At least one image or video is required</p>
                        )}
                    </div>

                    {/* File Attachments */}
                    {!post && (
                        <div className="space-y-3">
                            <Label className="text-sm font-medium">Attachments (optional)</Label>

                            {attachedFiles.length > 0 && (
                                <div className="space-y-2">
                                    {attachedFiles.map((file, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-2.5 rounded-lg bg-muted/50 border group">
                                            <div className="flex items-center gap-2.5 overflow-hidden">
                                                <div className="h-8 w-8 rounded bg-background flex items-center justify-center border">
                                                    <FileCode className="h-4 w-4 text-primary" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-medium truncate">{file.name}</p>
                                                    <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(0)} KB</p>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => removeAttachedFile(idx)}
                                                className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive p-1.5 transition-opacity"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => attachmentInputRef.current?.click()}
                                className="w-full gap-2 h-10"
                            >
                                <Paperclip className="h-4 w-4" />
                                Attach Files (PDF, Code, Zip, etc.)
                            </Button>
                            <input
                                type="file"
                                ref={attachmentInputRef}
                                className="hidden"
                                multiple
                                onChange={handleAttachmentChange}
                            />
                        </div>
                    )}

                    {/* Footer Actions */}
                    <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4 border-t">
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
                                    {post ? "Updating..." : "Publishing..."}
                                </>
                            ) : (
                                <>
                                    <Sparkles className="h-4 w-4" />
                                    {post ? "Save Changes" : "Publish Post"}
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
