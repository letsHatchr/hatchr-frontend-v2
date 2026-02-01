'use client';

import { useForm, Controller } from 'react-hook-form';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { Switch } from '../../../../components/ui/switch';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/store';
import { useUpdateEmailPreferences } from '../../hooks/use-user';
import { useEffect } from 'react';
import type { EmailNotificationPreferences } from '../../types';

export function EmailNotificationsSettings() {
    const user = useAuthStore((state) => state.user);
    const { mutate: updatePreferences, isPending } = useUpdateEmailPreferences();

    const { control, handleSubmit, reset } = useForm<EmailNotificationPreferences>({
        defaultValues: {
            mentions: true,
            watchedProjectPosts: true,
            collaborationInvites: true,
            inviteResponses: true,
            pointsMilestones: true,
            trendingProjects: true,
            newFollowers: true,
            weeklySummary: true,
            monthlyStats: true,
            sundayDigest: true,
        },
    });

    // Update form default values when user data is loaded
    useEffect(() => {
        if (user?.emailNotifications) {
            reset({
                mentions: user.emailNotifications.mentions ?? true,
                watchedProjectPosts: user.emailNotifications.watchedProjectPosts ?? true,
                collaborationInvites: user.emailNotifications.collaborationInvites ?? true,
                inviteResponses: user.emailNotifications.inviteResponses ?? true,
                pointsMilestones: user.emailNotifications.pointsMilestones ?? true,
                trendingProjects: user.emailNotifications.trendingProjects ?? true,
                newFollowers: user.emailNotifications.newFollowers ?? true,
                weeklySummary: user.emailNotifications.weeklySummary ?? true,
                monthlyStats: user.emailNotifications.monthlyStats ?? true,
                sundayDigest: user.emailNotifications.sundayDigest ?? true,
            });
        }
    }, [user, reset]);

    function onSubmit(data: EmailNotificationPreferences) {
        updatePreferences(data, {
            onSuccess: () => {
                toast.success('Email preferences updated successfully');
            },
            onError: (error: any) => {
                toast.error(error.response?.data?.message || 'Failed to update preferences');
            },
        });
    }

    return (
        <div className="space-y-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Activity & Engagement</CardTitle>
                        <CardDescription>
                            Stay updated on interactions with your content and profile.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-6">
                        <Controller
                            control={control}
                            name="mentions"
                            render={({ field: { value, onChange } }) => (
                                <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <label className="text-base font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                            Mentions
                                        </label>
                                        <p className="text-sm text-muted-foreground">
                                            Receive emails when someone mentions you in a post or comment.
                                        </p>
                                    </div>
                                    <Switch checked={value} onCheckedChange={onChange} />
                                </div>
                            )}
                        />
                        <Controller
                            control={control}
                            name="newFollowers"
                            render={({ field: { value, onChange } }) => (
                                <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <label className="text-base font-medium">New Followers</label>
                                        <p className="text-sm text-muted-foreground">
                                            Receive emails when someone starts following you.
                                        </p>
                                    </div>
                                    <Switch checked={value} onCheckedChange={onChange} />
                                </div>
                            )}
                        />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Projects & Collaboration</CardTitle>
                        <CardDescription>
                            Manage notifications for your projects and team activities.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-6">
                        <Controller
                            control={control}
                            name="watchedProjectPosts"
                            render={({ field: { value, onChange } }) => (
                                <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <label className="text-base font-medium">Watched Projects</label>
                                        <p className="text-sm text-muted-foreground">
                                            Receive emails about new posts in projects you follow.
                                        </p>
                                    </div>
                                    <Switch checked={value} onCheckedChange={onChange} />
                                </div>
                            )}
                        />
                        <Controller
                            control={control}
                            name="collaborationInvites"
                            render={({ field: { value, onChange } }) => (
                                <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <label className="text-base font-medium">Collaboration Invites</label>
                                        <p className="text-sm text-muted-foreground">
                                            Receive emails when you are invited to join a project.
                                        </p>
                                    </div>
                                    <Switch checked={value} onCheckedChange={onChange} />
                                </div>
                            )}
                        />
                        <Controller
                            control={control}
                            name="inviteResponses"
                            render={({ field: { value, onChange } }) => (
                                <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <label className="text-base font-medium">Invite Responses</label>
                                        <p className="text-sm text-muted-foreground">
                                            Receive emails when someone accepts or declines your project invites.
                                        </p>
                                    </div>
                                    <Switch checked={value} onCheckedChange={onChange} />
                                </div>
                            )}
                        />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Growth & Updates</CardTitle>
                        <CardDescription>
                            Track your progress and discover new content.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-6">
                        <Controller
                            control={control}
                            name="pointsMilestones"
                            render={({ field: { value, onChange } }) => (
                                <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <label className="text-base font-medium">Points Milestones</label>
                                        <p className="text-sm text-muted-foreground">
                                            Receive emails when you reach new Hatchr Points milestones.
                                        </p>
                                    </div>
                                    <Switch checked={value} onCheckedChange={onChange} />
                                </div>
                            )}
                        />
                        <Controller
                            control={control}
                            name="trendingProjects"
                            render={({ field: { value, onChange } }) => (
                                <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <label className="text-base font-medium">Trending Projects</label>
                                        <p className="text-sm text-muted-foreground">
                                            Receive periodic updates about trending projects on Hatchr.
                                        </p>
                                    </div>
                                    <Switch checked={value} onCheckedChange={onChange} />
                                </div>
                            )}
                        />
                        <Controller
                            control={control}
                            name="weeklySummary"
                            render={({ field: { value, onChange } }) => (
                                <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <label className="text-base font-medium">Weekly Summary</label>
                                        <p className="text-sm text-muted-foreground">
                                            Get a weekly summary of your activity and relevant updates.
                                        </p>
                                    </div>
                                    <Switch checked={value} onCheckedChange={onChange} />
                                </div>
                            )}
                        />
                        <Controller
                            control={control}
                            name="monthlyStats"
                            render={({ field: { value, onChange } }) => (
                                <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <label className="text-base font-medium">Monthly Stats</label>
                                        <p className="text-sm text-muted-foreground">
                                            Receive a monthly deep-dive into your analytics and growth.
                                        </p>
                                    </div>
                                    <Switch checked={value} onCheckedChange={onChange} />
                                </div>
                            )}
                        />
                        <Controller
                            control={control}
                            name="sundayDigest"
                            render={({ field: { value, onChange } }) => (
                                <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <label className="text-base font-medium">Sunday Digest</label>
                                        <p className="text-sm text-muted-foreground">
                                            Get a weekly tech digest every Sunday with trending projects and news.
                                        </p>
                                    </div>
                                    <Switch checked={value} onCheckedChange={onChange} />
                                </div>
                            )}
                        />
                    </CardContent>
                </Card>

                <div className="flex justify-end">
                    <Button type="submit" disabled={isPending}>
                        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save preferences
                    </Button>
                </div>
            </form>
        </div>
    );
}
