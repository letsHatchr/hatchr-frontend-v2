'use client';

import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { Loader2, ArrowLeft, Mail } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Logo } from '@/components/logo';
import { toast } from '@/lib/toast';
import api from '@/lib/api';

export function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [error, setError] = useState('');

    const validateEmail = (): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email.trim()) {
            setError('Email is required');
            return false;
        }
        if (!emailRegex.test(email)) {
            setError('Please enter a valid email');
            return false;
        }
        setError('');
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateEmail()) return;

        setIsLoading(true);

        try {
            await api.post('/auth/forgot-password', {
                email: email.trim().toLowerCase(),
            });

            setIsSubmitted(true);
            toast.success('Reset link sent!', {
                description: 'Check your email for the password reset link.',
            });

        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            const message = err.response?.data?.message || 'Failed to send reset link.';
            toast.error('Request failed', { description: message });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
            <div className="flex w-full max-w-sm flex-col gap-6">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-2 self-center font-medium">
                    <Logo size="md" linkTo={undefined} />
                </Link>

                {/* Card */}
                <Card>
                    {!isSubmitted ? (
                        <>
                            <CardHeader className="text-center">
                                <CardTitle className="text-xl">Forgot password?</CardTitle>
                                <CardDescription>
                                    Enter your email and we'll send you a reset link
                                </CardDescription>
                            </CardHeader>

                            <CardContent>
                                <form onSubmit={handleSubmit}>
                                    <div className="grid gap-6">
                                        <div className="grid gap-2">
                                            <Label htmlFor="email">Email</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                placeholder="you@example.com"
                                                value={email}
                                                onChange={(e) => {
                                                    setEmail(e.target.value);
                                                    if (error) setError('');
                                                }}
                                                disabled={isLoading}
                                                className={cn(error && 'border-destructive')}
                                            />
                                            {error && (
                                                <p className="text-sm text-destructive">{error}</p>
                                            )}
                                        </div>

                                        <Button type="submit" className="w-full" disabled={isLoading}>
                                            {isLoading ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Sending...
                                                </>
                                            ) : (
                                                'Send Reset Link'
                                            )}
                                        </Button>
                                    </div>

                                    <div className="mt-4 text-center text-sm">
                                        <Link
                                            to="/login"
                                            className="inline-flex items-center gap-1 underline-offset-4 hover:underline"
                                        >
                                            <ArrowLeft className="h-4 w-4" />
                                            Back to login
                                        </Link>
                                    </div>
                                </form>
                            </CardContent>
                        </>
                    ) : (
                        <>
                            <CardHeader className="text-center">
                                <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10">
                                    <Mail className="h-6 w-6 text-green-500" />
                                </div>
                                <CardTitle className="text-xl">Check your email</CardTitle>
                                <CardDescription>
                                    We sent a password reset link to<br />
                                    <span className="font-medium text-foreground">{email}</span>
                                </CardDescription>
                            </CardHeader>

                            <CardContent className="grid gap-4">
                                <p className="text-center text-sm text-muted-foreground">
                                    Didn't receive the email? Check your spam folder or{' '}
                                    <button
                                        onClick={() => setIsSubmitted(false)}
                                        className="underline underline-offset-4"
                                    >
                                        try again
                                    </button>
                                </p>

                                <div className="text-center text-sm">
                                    <Link
                                        to="/login"
                                        className="inline-flex items-center gap-1 underline-offset-4 hover:underline"
                                    >
                                        <ArrowLeft className="h-4 w-4" />
                                        Back to login
                                    </Link>
                                </div>
                            </CardContent>
                        </>
                    )}
                </Card>
            </div>
        </div>
    );
}

export default ForgotPasswordPage;
