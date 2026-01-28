import { useEffect, useRef, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/lib/toast';
import { useUserUpdate, useUserProfile, useUploadAvatar, useUploadBanner } from '../hooks/use-user';
import { useAuthStore } from '@/store';
import { Plus, Trash2, Save, ArrowLeft, Camera, Image as ImageIcon, Loader2, User, Mail, Briefcase } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useNavigate } from '@tanstack/react-router';
import { EmailNotificationsSettings } from '../components/settings/email-notifications-settings';
import { cn } from '@/lib/utils';

interface ProfileFormValues {
    name: string;
    bio: string;
    about: string;
    school: string;
    college: string;
    socialLinks: {
        twitter: string;
        linkedin: string;
        github: string;
        website: string;
        instagram: string;
        huggingface: string;
    };
    interests: string;
    achievements: { title: string }[];
    experience: { company: string; role: string; startDate: string; endDate: string; isCurrent: boolean }[];
}

type SettingsSection = 'profile' | 'email';

export function SettingsProfilePage() {
    const navigate = useNavigate();
    const { user: authUser } = useAuthStore();
    const { data: profileData, isLoading } = useUserProfile(authUser?.username || '');
    const updateMutation = useUserUpdate();
    const uploadAvatarMutation = useUploadAvatar();
    const uploadBannerMutation = useUploadBanner();
    const avatarInputRef = useRef<HTMLInputElement>(null);
    const bannerInputRef = useRef<HTMLInputElement>(null);
    const [activeSection, setActiveSection] = useState<SettingsSection>('profile');

    const user = profileData?.user;

    const { register, control, handleSubmit, reset, watch, formState: { errors, isDirty } } = useForm<ProfileFormValues>({
        defaultValues: {
            achievements: [],
            experience: []
        }
    });

    const { fields: achievementFields, append: appendAchievement, remove: removeAchievement } = useFieldArray({
        control,
        name: "achievements"
    });

    const { fields: experienceFields, append: appendExperience, remove: removeExperience } = useFieldArray({
        control,
        name: "experience"
    });

    useEffect(() => {
        if (user) {
            reset({
                name: user.name || '',
                bio: user.bio || '',
                about: user.about || '',
                school: user.school || '',
                college: user.college || '',
                socialLinks: {
                    twitter: user.socialLinks?.twitter || '',
                    linkedin: user.socialLinks?.linkedin || '',
                    github: user.socialLinks?.github || '',
                    website: user.socialLinks?.website || '',
                    instagram: user.socialLinks?.instagram || '',
                    huggingface: user.socialLinks?.huggingface || '',
                },
                interests: user.interests?.join(', ') || '',
                achievements: user.achievements?.map(a => ({ title: a.title })) || [],
                experience: user.experience?.map(e => ({
                    company: e.company || '',
                    role: e.role || '',
                    startDate: e.startDate || '',
                    endDate: e.endDate || '',
                    isCurrent: e.isCurrent || false
                })) || [],
            });
        }
    }, [user, reset]);

    const onSubmit = async (data: ProfileFormValues) => {
        if (!user) return;

        try {
            const formattedData = {
                ...data,
                interests: data.interests.split(',').map(i => i.trim()).filter(Boolean),
                achievements: data.achievements.filter(a => a.title.trim() !== ''),
                experience: data.experience.filter(e => e.company.trim() !== '' && e.role.trim() !== ''),
            };

            await updateMutation.mutateAsync({
                userId: user._id,
                data: formattedData
            });

            toast.success('Profile updated successfully');
        } catch (error) {
            toast.error('Failed to update profile');
        }
    };

    const addAchievement = () => {
        appendAchievement({ title: '' });
    };

    const addExperience = () => {
        appendExperience({ company: '', role: '', startDate: '', endDate: '', isCurrent: false });
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'banner') => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Basic validation
        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image must be less than 5MB');
            return;
        }

        try {
            if (type === 'avatar') {
                await uploadAvatarMutation.mutateAsync(file);
                toast.success('Profile picture updated!');
            } else {
                await uploadBannerMutation.mutateAsync(file);
                toast.success('Banner image updated!');
            }
        } catch (error) {
            toast.error(`Failed to upload ${type}`);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-[50vh]">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!user) {
        return <div className="p-8">User not found. Please log in.</div>;
    }

    return (
        <div className="container mx-auto max-w-6xl py-10 px-4 pb-24 lg:pb-10">
            <div className="mb-8 flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate({ to: `/${user.username}` })}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                    <p className="text-muted-foreground">
                        Manage your profile settings and preferences.
                    </p>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Sidebar Navigation */}
                <aside className="lg:w-1/4">
                    <nav className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-4 lg:pb-0">
                        <Button
                            variant={activeSection === 'profile' ? 'secondary' : 'ghost'}
                            className={cn("justify-start", activeSection === 'profile' && "bg-secondary")}
                            onClick={() => setActiveSection('profile')}
                        >
                            <User className="mr-2 h-4 w-4" />
                            Profile Settings
                        </Button>
                        <Button
                            variant={activeSection === 'email' ? 'secondary' : 'ghost'}
                            className={cn("justify-start", activeSection === 'email' && "bg-secondary")}
                            onClick={() => setActiveSection('email')}
                        >
                            <Mail className="mr-2 h-4 w-4" />
                            Email Notifications
                        </Button>
                    </nav>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 min-w-0">
                    {activeSection === 'profile' && (
                        <div className="space-y-6 animate-in fade-in-50 duration-500">
                            <div>
                                <h2 className="text-2xl font-semibold tracking-tight">Profile Settings</h2>
                                <p className="text-muted-foreground">
                                    Update your public profile information.
                                </p>
                            </div>

                            <Tabs defaultValue="general" className="space-y-6">
                                <TabsList className="bg-background border w-full justify-start overflow-x-auto">
                                    <TabsTrigger value="general">General</TabsTrigger>
                                    <TabsTrigger value="social">Social & Links</TabsTrigger>
                                    <TabsTrigger value="education">Education & Interests</TabsTrigger>
                                </TabsList>

                                <form onSubmit={handleSubmit(onSubmit)}>
                                    <TabsContent value="general" className="space-y-6 mt-6">
                                        <Card>
                                            <CardHeader>
                                                <CardTitle>Public Profile</CardTitle>
                                                <CardDescription>
                                                    This information will be displayed publicly on your profile.
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent className="space-y-6">
                                                {/* Banner & Avatar Section */}
                                                <div className="space-y-4 pb-6 border-b">
                                                    <div className="relative group">
                                                        {/* Banner */}
                                                        <div className="h-32 md:h-40 w-full rounded-lg overflow-hidden bg-muted relative border">
                                                            {user?.bannerImage ? (
                                                                <img src={user.bannerImage} alt="Banner" className="w-full h-full object-cover" />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center bg-muted">
                                                                    <ImageIcon className="h-8 w-8 text-muted-foreground/50" />
                                                                </div>
                                                            )}
                                                            <div className="absolute inset-x-0 bottom-2 right-2 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <Button
                                                                    type="button"
                                                                    variant="secondary"
                                                                    size="sm"
                                                                    onClick={() => bannerInputRef.current?.click()}
                                                                    disabled={uploadBannerMutation.isPending}
                                                                >
                                                                    {uploadBannerMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Camera className="h-3 w-3 mr-1" />}
                                                                    Change Cover
                                                                </Button>
                                                            </div>
                                                        </div>

                                                        {/* Avatar */}
                                                        <div className="absolute -bottom-6 left-6">
                                                            <div className="relative group/avatar">
                                                                <Avatar className="h-20 w-20 border-4 border-background shadow-sm cursor-pointer" onClick={() => avatarInputRef.current?.click()}>
                                                                    <AvatarImage src={user?.avatar} />
                                                                    <AvatarFallback>{user?.username?.slice(0, 2).toUpperCase()}</AvatarFallback>
                                                                </Avatar>
                                                                <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover/avatar:opacity-100 transition-opacity cursor-pointer pointer-events-none">
                                                                    {uploadAvatarMutation.isPending ? <Loader2 className="h-5 w-5 text-white animate-spin" /> : <Camera className="h-5 w-5 text-white" />}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Spacer for avatar overlap */}
                                                    <div className="h-4"></div>

                                                    {/* Hidden Inputs */}
                                                    <input
                                                        type="file"
                                                        ref={avatarInputRef}
                                                        className="hidden"
                                                        accept="image/*"
                                                        onChange={(e) => handleFileChange(e, 'avatar')}
                                                    />
                                                    <input
                                                        type="file"
                                                        ref={bannerInputRef}
                                                        className="hidden"
                                                        accept="image/*"
                                                        onChange={(e) => handleFileChange(e, 'banner')}
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="name">Display Name</Label>
                                                    <Input id="name" {...register('name', { required: 'Name is required' })} />
                                                    {errors.name && <p className="text-destructive text-sm">{errors.name.message}</p>}
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="bio">Short Bio</Label>
                                                    <Input
                                                        id="bio"
                                                        {...register('bio')}
                                                        placeholder="A short tagline (e.g. Co-founder Hatchr)"
                                                        maxLength={160}
                                                    />
                                                    <p className="text-xs text-muted-foreground">Appears under your name in the sidebar. Max 160 characters.</p>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="about">About</Label>
                                                    <Textarea
                                                        id="about"
                                                        {...register('about')}
                                                        placeholder="Tell your story..."
                                                        className="resize-none min-h-[200px]"
                                                    />
                                                    <p className="text-xs text-muted-foreground">Detailed description appearing in the main profile area.</p>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </TabsContent>

                                    <TabsContent value="social" className="space-y-6 mt-6">
                                        <Card>
                                            <CardHeader>
                                                <CardTitle>Social Links</CardTitle>
                                                <CardDescription>Connect your social profiles.</CardDescription>
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div className="space-y-2">
                                                        <Label>GitHub</Label>
                                                        <Input {...register('socialLinks.github')} placeholder="https://github.com/..." />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>LinkedIn</Label>
                                                        <Input {...register('socialLinks.linkedin')} placeholder="https://linkedin.com/in/..." />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Twitter / X</Label>
                                                        <Input {...register('socialLinks.twitter')} placeholder="https://twitter.com/..." />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Instagram</Label>
                                                        <Input {...register('socialLinks.instagram')} placeholder="https://instagram.com/..." />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Hugging Face</Label>
                                                        <Input {...register('socialLinks.huggingface')} placeholder="https://huggingface.co/..." />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Website</Label>
                                                        <Input {...register('socialLinks.website')} placeholder="https://..." />
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </TabsContent>

                                    <TabsContent value="education" className="space-y-6 mt-6">
                                        <Card>
                                            <CardHeader>
                                                <CardTitle>Education & Skills</CardTitle>
                                                <CardDescription>Showcase your background.</CardDescription>
                                            </CardHeader>
                                            <CardContent className="space-y-6">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div className="space-y-2">
                                                        <Label>College / University</Label>
                                                        <Input {...register('college')} placeholder="e.g. Stanford University" />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>School / High School</Label>
                                                        <Input {...register('school')} placeholder="e.g. Lincoln High School" />
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label>Interests / Domains</Label>
                                                    <Input
                                                        {...register('interests')}
                                                        placeholder="AI, Robotics, Web Dev (comma separated)"
                                                    />
                                                    <p className="text-xs text-muted-foreground">These will appear as tags on your profile.</p>
                                                </div>


                                                {/* Experience Section */}
                                                <div className="space-y-4 pt-4 border-t">
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <Label className="text-base">Experience</Label>
                                                            <p className="text-xs text-muted-foreground">Add your work experience</p>
                                                        </div>
                                                        <Button type="button" variant="outline" size="sm" onClick={addExperience}>
                                                            <Plus className="h-4 w-4 mr-1" /> Add
                                                        </Button>
                                                    </div>

                                                    <div className="space-y-4">
                                                        {experienceFields.map((field, index) => (
                                                            <div key={field.id} className="p-4 border rounded-lg bg-muted/30 space-y-3">
                                                                <div className="flex justify-between items-start">
                                                                    <div className="flex items-center gap-2">
                                                                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                                                                        <span className="text-sm font-medium">Experience {index + 1}</span>
                                                                    </div>
                                                                    <Button
                                                                        type="button"
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        onClick={() => removeExperience(index)}
                                                                    >
                                                                        <Trash2 className="h-4 w-4 text-destructive" />
                                                                    </Button>
                                                                </div>
                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                                    <div className="space-y-1">
                                                                        <Label className="text-xs">Company</Label>
                                                                        <Input
                                                                            {...register(`experience.${index}.company`)}
                                                                            placeholder="e.g. Google"
                                                                        />
                                                                    </div>
                                                                    <div className="space-y-1">
                                                                        <Label className="text-xs">Role</Label>
                                                                        <Input
                                                                            {...register(`experience.${index}.role`)}
                                                                            placeholder="e.g. SDE Intern"
                                                                        />
                                                                    </div>
                                                                    <div className="space-y-1">
                                                                        <Label className="text-xs">Start Date</Label>
                                                                        <Input
                                                                            {...register(`experience.${index}.startDate`)}
                                                                            placeholder="e.g. Jan 2024"
                                                                        />
                                                                    </div>
                                                                    <div className="space-y-1">
                                                                        <Label className="text-xs">End Date</Label>
                                                                        <Input
                                                                            {...register(`experience.${index}.endDate`)}
                                                                            placeholder="e.g. Present"
                                                                            disabled={watch(`experience.${index}.isCurrent`)}
                                                                        />
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <input
                                                                        type="checkbox"
                                                                        id={`exp-current-${index}`}
                                                                        {...register(`experience.${index}.isCurrent`)}
                                                                        className="rounded border-input"
                                                                    />
                                                                    <Label htmlFor={`exp-current-${index}`} className="text-xs font-normal cursor-pointer">
                                                                        I currently work here
                                                                    </Label>
                                                                </div>
                                                            </div>
                                                        ))}
                                                        {experienceFields.length === 0 && (
                                                            <div className="text-sm text-muted-foreground text-center py-6 border border-dashed rounded-md bg-muted/50">
                                                                No experience added yet.
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="space-y-4 pt-4 border-t">
                                                    <div className="flex items-center justify-between">
                                                        <Label className="text-base">Achievements</Label>
                                                        <Button type="button" variant="outline" size="sm" onClick={addAchievement}>
                                                            <Plus className="h-4 w-4 mr-1" /> Add
                                                        </Button>
                                                    </div>

                                                    <div className="space-y-3">
                                                        {achievementFields.map((field, index) => (
                                                            <div key={field.id} className="flex gap-2">
                                                                <Input
                                                                    {...register(`achievements.${index}.title`)}
                                                                    placeholder="Rank, Award, Resume Link..."
                                                                />
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() => removeAchievement(index)}
                                                                >
                                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                                </Button>
                                                            </div>
                                                        ))}
                                                        {achievementFields.length === 0 && (
                                                            <div className="text-sm text-muted-foreground text-center py-6 border border-dashed rounded-md bg-muted/50">
                                                                No achievements added yet.
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </TabsContent>

                                    <div className="flex justify-end mt-8">
                                        <Button type="submit" size="lg" disabled={updateMutation.isPending || !isDirty}>
                                            {updateMutation.isPending ? (
                                                'Saving...'
                                            ) : (
                                                <>
                                                    <Save className="mr-2 h-4 w-4" /> Save Changes
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </form>
                            </Tabs>
                        </div>
                    )}

                    {activeSection === 'email' && (
                        <div className="space-y-6 animate-in fade-in-50 duration-500">
                            <div>
                                <h2 className="text-2xl font-semibold tracking-tight">Email Notifications</h2>
                                <p className="text-muted-foreground">
                                    Manage your email preferences and subscriptions.
                                </p>
                            </div>
                            <EmailNotificationsSettings />
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
