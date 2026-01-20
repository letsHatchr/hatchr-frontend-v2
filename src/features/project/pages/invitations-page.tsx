import { useMyInvitations, useAcceptInvitation, useDeclineInvitation } from '../hooks/use-project';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, Check, X, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export function InvitationsPage() {
    const { data: invitations, isLoading } = useMyInvitations();
    const acceptMutation = useAcceptInvitation();
    const declineMutation = useDeclineInvitation();

    const handleAccept = async (token: string) => {
        try {
            await acceptMutation.mutateAsync(token);
            toast.success('Invitation accepted!');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to accept invitation');
        }
    };

    const handleDecline = async (token: string) => {
        try {
            await declineMutation.mutateAsync(token);
            toast.success('Invitation declined');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to decline invitation');
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="container max-w-2xl mx-auto py-8 px-4">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">Project Invitations</h1>
            </div>

            {invitations?.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                    <Mail className="h-12 w-12 mx-auto mb-4 opacity-20" />
                    <p>No pending invitations</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {invitations?.map((invitation: any) => (
                        <Card key={invitation._id}>
                            <CardHeader className="pb-3">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle className="text-lg">
                                            Join {invitation.projectDetails?.title || 'Unknown Project'}
                                        </CardTitle>
                                        <CardDescription>
                                            Invited by {invitation.sender?.name || invitation.sender?.username} • {format(new Date(invitation.createdAt || invitation.sentAt), 'PPP')}
                                        </CardDescription>
                                    </div>
                                    <Avatar className="h-10 w-10">
                                        <AvatarImage src={invitation.projectDetails?.coverImage} />
                                        <AvatarFallback>{invitation.projectDetails?.title?.[0] || 'P'}</AvatarFallback>
                                    </Avatar>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="flex gap-3 justify-end">
                                    <Button
                                        variant="outline"
                                        onClick={() => handleDecline(invitation.token)}
                                        disabled={declineMutation.isPending || acceptMutation.isPending}
                                    >
                                        <X className="mr-2 h-4 w-4" />
                                        Decline
                                    </Button>
                                    <Button
                                        onClick={() => handleAccept(invitation.token)}
                                        disabled={declineMutation.isPending || acceptMutation.isPending}
                                    >
                                        <Check className="mr-2 h-4 w-4" />
                                        Accept
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
