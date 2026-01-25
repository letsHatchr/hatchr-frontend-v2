'use client';

import { useState } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { Eye, EyeOff, Loader2, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/store/auth-store';
import { toast } from '@/lib/toast';
import api from '@/lib/api';

interface SignupFormData {
    name: string;
    username: string;
    email: string;
    password: string;
    acceptTerms: boolean;
}

interface SignupErrors {
    name?: string;
    username?: string;
    email?: string;
    password?: string;
    acceptTerms?: string;
}

export function LoginPromptModal() {
    const navigate = useNavigate();
    const { showLoginModal, closeLoginModal } = useAuthStore();

    const [formData, setFormData] = useState<SignupFormData>({
        name: '',
        username: '',
        email: '',
        password: '',
        acceptTerms: false,
    });
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<SignupErrors>({});

    const passwordChecks = {
        length: formData.password.length >= 6,
        hasLetter: /[a-zA-Z]/.test(formData.password),
        hasNumber: /[0-9]/.test(formData.password),
    };

    const validateForm = (): boolean => {
        const newErrors: SignupErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
        } else if (formData.name.trim().length < 2) {
            newErrors.name = 'Name must be at least 2 characters';
        }

        if (!formData.username.trim()) {
            newErrors.username = 'Username is required';
        } else if (formData.username.length < 3) {
            newErrors.username = 'Username must be at least 3 characters';
        } else if (!/^[a-z0-9_]+$/.test(formData.username)) {
            newErrors.username = 'Only lowercase letters, numbers, and underscores';
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!emailRegex.test(formData.email)) {
            newErrors.email = 'Please enter a valid email';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        if (!formData.acceptTerms) {
            newErrors.acceptTerms = 'You must accept the terms';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsLoading(true);

        try {
            await api.post('/auth/signup', {
                name: formData.name.trim(),
                username: formData.username,
                email: formData.email.trim().toLowerCase(),
                password: formData.password,
            });

            toast.success('Account created!', {
                description: 'Please check your email for the verification code.',
            });

            closeLoginModal();
            navigate({ to: '/verify-otp', search: { email: formData.email } });

        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            const message = err.response?.data?.message || 'Signup failed. Please try again.';
            toast.error('Signup failed', { description: message });
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (field: keyof SignupFormData) => (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        let value: string | boolean = e.target.value;

        if (field === 'username') {
            value = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '');
        }

        if (field === 'acceptTerms') {
            value = e.target.checked;
        }

        setFormData(prev => ({ ...prev, [field]: value }));

        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }
    };

    const handleClose = () => {
        // Reset form when closing
        setFormData({
            name: '',
            username: '',
            email: '',
            password: '',
            acceptTerms: false,
        });
        setErrors({});
        closeLoginModal();
    };

    return (
        <Dialog open={showLoginModal} onOpenChange={(open) => !open && handleClose()}>
            <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-xl">Join Hatchr</DialogTitle>
                    <DialogDescription>
                        Create an account to vote, watch projects, and connect with innovators.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Name Field */}
                    <div className="space-y-2">
                        <Label htmlFor="modal-name">Full Name</Label>
                        <Input
                            id="modal-name"
                            type="text"
                            placeholder="John Doe"
                            value={formData.name}
                            onChange={handleChange('name')}
                            disabled={isLoading}
                            className={cn(errors.name && 'border-destructive')}
                        />
                        {errors.name && (
                            <p className="text-sm text-destructive">{errors.name}</p>
                        )}
                    </div>

                    {/* Username Field */}
                    <div className="space-y-2">
                        <Label htmlFor="modal-username">Username</Label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                @
                            </span>
                            <Input
                                id="modal-username"
                                type="text"
                                placeholder="johndoe"
                                value={formData.username}
                                onChange={handleChange('username')}
                                disabled={isLoading}
                                className={cn('pl-7', errors.username && 'border-destructive')}
                            />
                        </div>
                        {errors.username && (
                            <p className="text-sm text-destructive">{errors.username}</p>
                        )}
                    </div>

                    {/* Email Field */}
                    <div className="space-y-2">
                        <Label htmlFor="modal-email">Email</Label>
                        <Input
                            id="modal-email"
                            type="email"
                            placeholder="you@example.com"
                            value={formData.email}
                            onChange={handleChange('email')}
                            disabled={isLoading}
                            className={cn(errors.email && 'border-destructive')}
                        />
                        {errors.email && (
                            <p className="text-sm text-destructive">{errors.email}</p>
                        )}
                    </div>

                    {/* Password Field */}
                    <div className="space-y-2">
                        <Label htmlFor="modal-password">Password</Label>
                        <div className="relative">
                            <Input
                                id="modal-password"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Create a strong password"
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

                        {/* Password strength */}
                        {formData.password && (
                            <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs">
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

                    {/* Terms Checkbox */}
                    <div className="flex items-start gap-2">
                        <input
                            type="checkbox"
                            id="modal-acceptTerms"
                            checked={formData.acceptTerms}
                            onChange={handleChange('acceptTerms')}
                            disabled={isLoading}
                            className="mt-0.5 h-4 w-4 rounded border-input"
                        />
                        <Label htmlFor="modal-acceptTerms" className="text-sm font-normal leading-tight">
                            I agree to the{' '}
                            <Link to="/" className="underline underline-offset-4">Terms</Link>
                            {' '}and{' '}
                            <Link to="/" className="underline underline-offset-4">Privacy Policy</Link>
                        </Label>
                    </div>
                    {errors.acceptTerms && (
                        <p className="text-sm text-destructive">{errors.acceptTerms}</p>
                    )}

                    {/* Submit Button */}
                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Creating account...
                            </>
                        ) : (
                            'Create Account'
                        )}
                    </Button>

                    <div className="text-center text-sm text-muted-foreground">
                        Already have an account?{' '}
                        <Link
                            to="/login"
                            className="underline underline-offset-4 hover:text-foreground"
                            onClick={handleClose}
                        >
                            Sign in
                        </Link>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
