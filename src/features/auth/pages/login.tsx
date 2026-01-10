'use client';

import { useState } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Logo } from '@/components/logo';
import { useAuthStore } from '@/store';
import { toast } from '@/lib/toast';
import api from '@/lib/api';

interface LoginFormData {
    emailOrUsername: string;
    password: string;
}

interface LoginResponse {
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

export function LoginPage() {
    const navigate = useNavigate();
    const { login } = useAuthStore();

    const [formData, setFormData] = useState<LoginFormData>({
        emailOrUsername: '',
        password: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<Partial<LoginFormData>>({});

    const validateForm = (): boolean => {
        const newErrors: Partial<LoginFormData> = {};

        if (!formData.emailOrUsername.trim()) {
            newErrors.emailOrUsername = 'Email or username is required';
        } else if (formData.emailOrUsername.trim().length < 3) {
            newErrors.emailOrUsername = 'Must be at least 3 characters';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsLoading(true);

        try {
            const response = await api.post<LoginResponse>('/auth/login', {
                emailOrUsername: formData.emailOrUsername.trim(),
                password: formData.password,
            });

            const { token, user } = response.data;

            // Login successful - no OTP check needed for login
            login(user, token);
            toast.success('Welcome back!', {
                description: `Logged in as @${user.username}`,
            });
            navigate({ to: '/feed' });

        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            const message = err.response?.data?.message || 'Login failed. Please try again.';
            toast.error('Login failed', { description: message });
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (field: keyof LoginFormData) => (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        setFormData(prev => ({ ...prev, [field]: e.target.value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }
    };

    return (
        <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
            <div className="flex w-full max-w-sm flex-col gap-6">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-2 self-center font-medium">
                    <Logo size="md" linkTo={undefined} />
                </Link>

                {/* Login Card */}
                <Card>
                    <CardHeader className="text-center">
                        <CardTitle className="text-xl">Welcome back</CardTitle>
                        <CardDescription>
                            Sign in to your account to continue
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={handleSubmit}>
                            <div className="grid gap-6">
                                {/* Email/Username Field */}
                                <div className="grid gap-2">
                                    <Label htmlFor="emailOrUsername">Email or Username</Label>
                                    <Input
                                        id="emailOrUsername"
                                        type="text"
                                        placeholder="you@example.com"
                                        value={formData.emailOrUsername}
                                        onChange={handleChange('emailOrUsername')}
                                        disabled={isLoading}
                                        className={cn(errors.emailOrUsername && 'border-destructive')}
                                    />
                                    {errors.emailOrUsername && (
                                        <p className="text-sm text-destructive">{errors.emailOrUsername}</p>
                                    )}
                                </div>

                                {/* Password Field */}
                                <div className="grid gap-2">
                                    <div className="flex items-center">
                                        <Label htmlFor="password">Password</Label>
                                        <Link
                                            to="/forgot-password"
                                            className="ml-auto text-sm underline-offset-4 hover:underline"
                                        >
                                            Forgot password?
                                        </Link>
                                    </div>
                                    <div className="relative">
                                        <Input
                                            id="password"
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder="Enter your password"
                                            value={formData.password}
                                            onChange={handleChange('password')}
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
                                </div>

                                {/* Submit Button */}
                                <Button type="submit" className="w-full" disabled={isLoading}>
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Signing in...
                                        </>
                                    ) : (
                                        'Sign In'
                                    )}
                                </Button>
                            </div>

                            <div className="mt-4 text-center text-sm">
                                Don't have an account?{' '}
                                <Link to="/signup" className="underline underline-offset-4">
                                    Sign up
                                </Link>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export default LoginPage;
