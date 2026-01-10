'use client';

import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useSearch } from '@tanstack/react-router';
import { Loader2, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Logo } from '@/components/logo';
import { useAuthStore } from '@/store';
import { toast } from '@/lib/toast';
import api from '@/lib/api';

interface VerifyOtpSearch {
    email?: string;
}

interface VerifyResponse {
    success: boolean;
    token: string;
    user: {
        _id: string;
        name: string;
        username: string;
        email: string;
        avatar?: string;
        bio?: string;
        hatchPoints: number;
        followers: string[];
        following: string[];
        isEmailVerified: boolean;
    };
    message?: string;
}

export function VerifyOtpPage() {
    const navigate = useNavigate();
    const { email } = useSearch({ from: '/verify-otp' }) as VerifyOtpSearch;
    const { login } = useAuthStore();

    const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
    const [isLoading, setIsLoading] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);

    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        if (resendCooldown > 0) {
            const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendCooldown]);

    useEffect(() => {
        inputRefs.current[0]?.focus();
    }, []);

    const handleChange = (index: number, value: string) => {
        if (value && !/^\d$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }

        if (value && index === 5 && newOtp.every(d => d !== '')) {
            handleSubmit(newOtp.join(''));
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);

        if (pastedData.length === 6) {
            const newOtp = pastedData.split('');
            setOtp(newOtp);
            inputRefs.current[5]?.focus();
            handleSubmit(pastedData);
        }
    };

    const handleSubmit = async (code?: string) => {
        const otpCode = code || otp.join('');

        if (otpCode.length !== 6) {
            toast.error('Invalid code', { description: 'Please enter all 6 digits.' });
            return;
        }

        setIsLoading(true);

        try {
            const response = await api.post<VerifyResponse>('/auth/verify-email', {
                email,
                otp: otpCode,
            });

            const { token, user } = response.data;

            login(user, token);
            toast.success('Email verified!', {
                description: 'Your account is now active.',
            });
            navigate({ to: '/feed' });

        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            const message = err.response?.data?.message || 'Verification failed. Please try again.';
            toast.error('Verification failed', { description: message });
            setOtp(['', '', '', '', '', '']);
            inputRefs.current[0]?.focus();
        } finally {
            setIsLoading(false);
        }
    };

    const handleResend = async () => {
        if (resendCooldown > 0) return;

        setIsResending(true);

        try {
            await api.post('/auth/resend-otp', { email });
            toast.success('Code sent!', {
                description: 'Check your email for the new verification code.',
            });
            setResendCooldown(60);
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            const message = err.response?.data?.message || 'Failed to resend code.';
            toast.error('Failed to resend', { description: message });
        } finally {
            setIsResending(false);
        }
    };

    return (
        <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
            <div className="flex w-full max-w-sm flex-col gap-6">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-2 self-center font-medium">
                    <Logo size="md" linkTo={undefined} />
                </Link>

                {/* Verify Card */}
                <Card>
                    <CardHeader className="text-center">
                        <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                            <Mail className="h-6 w-6 text-primary" />
                        </div>
                        <CardTitle className="text-xl">Check your email</CardTitle>
                        <CardDescription>
                            We sent a verification code to<br />
                            <span className="font-medium text-foreground">{email || 'your email'}</span>
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="grid gap-6">
                        {/* OTP Input */}
                        <div className="flex justify-center gap-2">
                            {otp.map((digit, index) => (
                                <input
                                    key={index}
                                    ref={el => { inputRefs.current[index] = el; }}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={1}
                                    value={digit}
                                    onChange={e => handleChange(index, e.target.value)}
                                    onKeyDown={e => handleKeyDown(index, e)}
                                    onPaste={index === 0 ? handlePaste : undefined}
                                    disabled={isLoading}
                                    className="h-12 w-12 rounded-lg border border-input bg-background text-center text-xl font-semibold focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
                                />
                            ))}
                        </div>

                        {/* Submit Button */}
                        <Button
                            onClick={() => handleSubmit()}
                            className="w-full"
                            disabled={isLoading || otp.some(d => !d)}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Verifying...
                                </>
                            ) : (
                                'Verify Email'
                            )}
                        </Button>

                        {/* Resend Link */}
                        <p className="text-center text-sm text-muted-foreground">
                            Didn't receive the code?{' '}
                            <button
                                onClick={handleResend}
                                disabled={isResending || resendCooldown > 0}
                                className="underline underline-offset-4 disabled:opacity-50 disabled:no-underline"
                            >
                                {isResending ? (
                                    'Sending...'
                                ) : resendCooldown > 0 ? (
                                    `Resend in ${resendCooldown}s`
                                ) : (
                                    'Resend code'
                                )}
                            </button>
                        </p>

                        {/* Back to login */}
                        <div className="text-center text-sm">
                            <Link to="/login" className="underline underline-offset-4">
                                Back to login
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export default VerifyOtpPage;
