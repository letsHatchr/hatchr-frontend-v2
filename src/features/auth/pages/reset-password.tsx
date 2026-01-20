'use client';

import { useState } from 'react';
import { Link, useNavigate, useSearch } from '@tanstack/react-router';
import { Eye, EyeOff, Loader2, Check, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Logo } from '@/components/logo';
import { toast } from '@/lib/toast';
import api from '@/lib/api';



export function ResetPasswordPage() {
    const navigate = useNavigate();
    const { email } = useSearch({ from: '/reset-password' }) as { email?: string };

    const [otp, setOtp] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<{ otp?: string; password?: string; confirmPassword?: string }>({});

    // If no email provided, redirect back to forgot password
    if (!email) {
        navigate({ to: '/forgot-password' });
        return null;
    }

    const passwordChecks = {
        length: password.length >= 6,
        hasLetter: /[a-zA-Z]/.test(password),
        hasNumber: /[0-9]/.test(password),
        match: password === confirmPassword && confirmPassword !== '',
    };

    const validateForm = (): boolean => {
        const newErrors: { otp?: string; password?: string; confirmPassword?: string } = {};

        if (!otp) {
            newErrors.otp = 'Verification code is required';
        } else if (otp.length !== 6) {
            newErrors.otp = 'Code must be 6 digits';
        }

        if (!password) {
            newErrors.password = 'Password is required';
        } else if (password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        if (!confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (password !== confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsLoading(true);

        try {
            await api.post('/auth/reset-password', {
                email,
                otp,
                newPassword: password,
            });

            toast.success('Password reset successfully!', {
                description: 'You can now sign in with your new password.',
            });
            navigate({ to: '/login' });

        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            const message = err.response?.data?.message || 'Failed to reset password. Code might be expired.';
            toast.error('Reset failed', { description: message });
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
                    <CardHeader className="text-center">
                        <CardTitle className="text-xl">Reset your password</CardTitle>
                        <CardDescription>
                            Enter the code sent to <span className="font-medium text-foreground">{email}</span> and your new password.
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={handleSubmit}>
                            <div className="grid gap-6">
                                {/* OTP Input */}
                                <div className="grid gap-2">
                                    <Label htmlFor="otp">Verification Code</Label>
                                    <Input
                                        id="otp"
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={6}
                                        placeholder="Enter 6-digit code"
                                        value={otp}
                                        onChange={(e) => {
                                            const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                                            setOtp(value);
                                            if (errors.otp) setErrors(prev => ({ ...prev, otp: undefined }));
                                        }}
                                        disabled={isLoading}
                                        className={cn('text-center tracking-widest text-lg', errors.otp && 'border-destructive')}
                                    />
                                    {errors.otp && (
                                        <p className="text-sm text-destructive">{errors.otp}</p>
                                    )}
                                </div>

                                {/* New Password */}
                                <div className="grid gap-2">
                                    <Label htmlFor="password">New Password</Label>
                                    <div className="relative">
                                        <Input
                                            id="password"
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder="Enter new password"
                                            value={password}
                                            onChange={(e) => {
                                                setPassword(e.target.value);
                                                if (errors.password) setErrors(prev => ({ ...prev, password: undefined }));
                                            }}
                                            disabled={isLoading}
                                            className={cn('pr-10', errors.password && 'border-destructive')}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                            tabIndex={-1}
                                        >
                                            {showPassword ? (
                                                <EyeOff className="h-4 w-4" />
                                            ) : (
                                                <Eye className="h-4 w-4" />
                                            )}
                                        </button>
                                    </div>
                                    {errors.password && (
                                        <p className="text-sm text-destructive">{errors.password}</p>
                                    )}

                                    {/* Password strength */}
                                    {password && (
                                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
                                            <span className={cn('flex items-center gap-1', passwordChecks.length ? 'text-green-500' : 'text-muted-foreground')}>
                                                <Check className="h-3 w-3" /> 6+ chars
                                            </span>
                                            <span className={cn('flex items-center gap-1', passwordChecks.hasLetter ? 'text-green-500' : 'text-muted-foreground')}>
                                                <Check className="h-3 w-3" /> Letter
                                            </span>
                                            <span className={cn('flex items-center gap-1', passwordChecks.hasNumber ? 'text-green-500' : 'text-muted-foreground')}>
                                                <Check className="h-3 w-3" /> Number
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Confirm Password */}
                                <div className="grid gap-2">
                                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                                    <Input
                                        id="confirmPassword"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Confirm new password"
                                        value={confirmPassword}
                                        onChange={(e) => {
                                            setConfirmPassword(e.target.value);
                                            if (errors.confirmPassword) setErrors(prev => ({ ...prev, confirmPassword: undefined }));
                                        }}
                                        disabled={isLoading}
                                        className={cn(errors.confirmPassword && 'border-destructive')}
                                    />
                                    {errors.confirmPassword && (
                                        <p className="text-sm text-destructive">{errors.confirmPassword}</p>
                                    )}
                                    {confirmPassword && !errors.confirmPassword && (
                                        <span className={cn('flex items-center gap-1 text-xs', passwordChecks.match ? 'text-green-500' : 'text-muted-foreground')}>
                                            <Check className="h-3 w-3" /> Passwords match
                                        </span>
                                    )}
                                </div>

                                <Button type="submit" className="w-full" disabled={isLoading}>
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Resetting...
                                        </>
                                    ) : (
                                        'Reset Password'
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
                </Card>
            </div>
        </div>
    );
}

export default ResetPasswordPage;
