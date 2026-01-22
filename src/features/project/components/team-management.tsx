import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Loader2, UserPlus, X, Shield, LogOut, User, Mail } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Card,
    CardContent,
} from '@/components/ui/card';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
    useInvitePartner,
    useRemovePartner,
    useLeaveProject,
    useMyInvitations,
    useAcceptInvitation,
    useDeclineInvitation,
    useWithdrawInvitation
} from '../hooks/use-project';




interface TeamManagementProps {
    project: any;
    isOwner: boolean;
    currentUser: any;
}

export function TeamManagement({ project, isOwner, currentUser }: TeamManagementProps) {
    const inviteMutation = useInvitePartner();
    const removeMutation = useRemovePartner();
    const leaveMutation = useLeaveProject();

    // Invitations logic for the current user
    const { data: myInvitations } = useMyInvitations();
    const acceptMutation = useAcceptInvitation();
    const declineMutation = useDeclineInvitation();
    const withdrawMutation = useWithdrawInvitation();

    const [inviteOpen, setInviteOpen] = useState(false);

    const pendingInvite = myInvitations?.find((inv: any) =>
        (inv.project?._id === project._id) || (inv.projectDetails?._id === project._id)
    );

    const onAcceptInvite = async () => {
        if (!pendingInvite) return;
        try {
            await acceptMutation.mutateAsync(pendingInvite.token);
            toast.success('Invitation accepted! You are now a member.');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to accept invitation');
        }
    };

    const onDeclineInvite = async () => {
        if (!pendingInvite) return;
        try {
            await declineMutation.mutateAsync(pendingInvite.token);
            toast.success('Invitation declined');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to decline invitation');
        }
    };

    const { register, handleSubmit, reset } = useForm({
        defaultValues: {
            usernameOrEmail: '',
        },
    });

    const onInvite = async (values: { usernameOrEmail: string }) => {
        if (!values.usernameOrEmail) {
            toast.error('Username or email is required');
            return;
        }
        try {
            await inviteMutation.mutateAsync({
                projectId: project._id,
                usernameOrEmail: values.usernameOrEmail,
                projectSlug: project.slug,
            });
            toast.success('Invitation sent successfully');
            reset();
            setInviteOpen(false);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to send invitation');
        }
    };

    const onRemove = async (partnerId: string) => {
        try {
            await removeMutation.mutateAsync({
                projectId: project._id,
                partnerId,
                projectSlug: project.slug,
            });
            toast.success('Partner removed successfully');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to remove partner');
        }
    };

    const onLeave = async () => {
        try {
            await leaveMutation.mutateAsync(project._id);
            toast.success('You have left the project');
            // Redirect or refresh logic handled by parent or query invalidation
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to leave project');
        }
    };

    // Combine owner and partners for display, filtering out owner from partners to avoid duplicates
    const teamMembers = [
        {
            user: project.user,
            role: 'owner',
            _id: 'owner', // placeholder for map key consistency if needed
        },
        ...(project.partners || [])
            .filter((p: any) => p.user._id !== project.user._id && p.user !== project.user._id)
            .map((p: any) => ({
                ...p,
                user: p.user,
                role: p.role || 'partner',
            })),
    ];

    // Check if current user is a team member (partner, not owner)
    const isTeamMember = currentUser && (project.partners || []).some((p: any) =>
        p.user._id === currentUser._id || p.user === currentUser._id
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold">Team Members</h3>
                    <p className="text-sm text-muted-foreground">
                        Manage your project team and collaboration settings.
                    </p>
                </div>
                {isOwner ? (
                    <div className="flex gap-2">
                        {inviteOpen ? (
                            <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-4">
                                <form onSubmit={handleSubmit(onInvite)} className="flex gap-2">
                                    <Input
                                        placeholder="Username or Email"
                                        className="w-64"
                                        {...register("usernameOrEmail", { required: true })}
                                    />
                                    <Button type="submit" size="sm" disabled={inviteMutation.isPending}>
                                        {inviteMutation.isPending ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            'Send'
                                        )}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setInviteOpen(false)}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </form>
                            </div>
                        ) : (
                            <Button onClick={() => setInviteOpen(true)} size="sm">
                                <UserPlus className="h-4 w-4 mr-2" />
                                Invite Member
                            </Button>
                        )}
                    </div>
                ) : isTeamMember ? (
                    <AlertDialog>
                        <AlertDialogTrigger className={buttonVariants({ variant: "destructive", size: "sm" })}>
                            <LogOut className="h-4 w-4 mr-2" />
                            Leave Project
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Leave Project?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Are you sure you want to leave <b>{project.title}</b>? You will lose access to team-only features.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={onLeave} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                    Leave Team
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                ) : null}
            </div>



            {/* Pending Invitation Banner for Invitee */}
            {
                pendingInvite && (
                    <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            <div>
                                <h4 className="font-medium text-blue-900 dark:text-blue-100">You have been invited to join this project</h4>
                                <p className="text-sm text-blue-700 dark:text-blue-300">
                                    Invited by {pendingInvite.sender?.name || pendingInvite.sender?.username || 'the owner'}
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                size="sm"
                                variant="outline"
                                className="border-blue-200 hover:bg-blue-100 dark:border-blue-800 dark:hover:bg-blue-900"
                                onClick={onDeclineInvite}
                                disabled={declineMutation.isPending || acceptMutation.isPending}
                            >
                                Decline
                            </Button>
                            <Button
                                size="sm"
                                onClick={onAcceptInvite}
                                disabled={declineMutation.isPending || acceptMutation.isPending}
                            >
                                Accept
                            </Button>
                        </div>
                    </div>
                )
            }

            {
                isOwner && project.pendingInvitations && project.pendingInvitations.length > 0 && (
                    <div className="mb-6">
                        <h4 className="text-sm font-medium mb-3">Pending Invitations</h4>
                        <div className="grid gap-4">
                            {project.pendingInvitations
                                .filter((invite: any) => {
                                    // Filter out invitations for users who are already partners
                                    // This checks both ID (if available) and email logic if needed
                                    const isAlreadyPartner = project.partners.some((p: any) =>
                                        (invite.userId && p.user._id === invite.userId) ||
                                        (invite.email && p.user.email === invite.email)
                                    );
                                    return !isAlreadyPartner;
                                })
                                .map((invite: any) => (
                                    <Card key={invite._id} className="overflow-hidden border-dashed">
                                        <CardContent className="p-4 flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                                                    <Mail className="h-5 w-5 text-muted-foreground" />
                                                </div>
                                                <div>
                                                    <div className="font-medium">{invite.email || 'User'}</div>
                                                    <p className="text-sm text-muted-foreground">Invited {new Date(invite.sentAt).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                            <Badge variant="outline">Pending</Badge>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="ml-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                disabled={withdrawMutation.isPending}
                                                onClick={() => {
                                                    if (window.confirm('Are you sure you want to withdraw this invitation?')) {
                                                        withdrawMutation.mutateAsync({
                                                            projectId: project._id,
                                                            invitationId: invite._id,
                                                            projectSlug: project.slug
                                                        }).then(() => toast.success('Invitation withdrawn'));
                                                    }
                                                }}
                                            >
                                                Withdraw
                                            </Button>
                                        </CardContent>
                                    </Card>
                                ))}
                        </div>
                    </div>
                )
            }

            <div className="grid gap-4">
                {teamMembers.map((member: any) => (
                    <Card key={member.user._id} className="overflow-hidden">
                        <CardContent className="p-0 flex items-center justify-between">
                            <a
                                href={`/${member.user.username}`}
                                className="flex items-center gap-4 flex-1 p-3 hover:bg-muted/50 transition-colors"
                            >
                                <Avatar className="h-10 w-10 border text-blue-500">
                                    <AvatarImage src={member.user.avatar} />
                                    <AvatarFallback>
                                        <User className="h-5 w-5" />
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <div className="font-medium flex items-center gap-2">
                                        {member.user.name || member.user.username}
                                        {member.role === 'owner' && (
                                            <Badge variant="secondary" className="text-[10px] h-5 px-1.5 gap-0.5">
                                                <Shield className="h-2.5 w-2.5" />
                                                Owner
                                            </Badge>
                                        )}
                                        {member.user._id === currentUser?._id && (
                                            <Badge variant="outline" className="text-[10px] h-5">You</Badge>
                                        )}
                                    </div>
                                    <p className="text-sm text-muted-foreground">@{member.user.username}</p>
                                </div>
                            </a>

                            {isOwner && member.role !== 'owner' && (
                                <div className="pr-3">
                                    <AlertDialog>
                                        <AlertDialogTrigger className={buttonVariants({ variant: "ghost", size: "icon" })} onClick={(e) => e.stopPropagation()}>
                                            <X className="h-4 w-4" />
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Remove Partner</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    Are you sure you want to remove <b>@{member.user.username}</b> from the team? They will lose access immediately.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction
                                                    onClick={() => onRemove(member.user._id)}
                                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                >
                                                    Remove
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div >
    );
}
