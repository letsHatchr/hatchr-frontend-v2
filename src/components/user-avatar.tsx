import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface UserAvatarProps {
    src?: string | null;
    name?: string;
    username?: string;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
}

const sizeClasses = {
    xs: 'h-6 w-6 text-[10px]',
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-16 w-16 text-lg',
    xl: 'h-24 w-24 text-2xl',
};

/**
 * Get initials from name (first letter of first and last name)
 */
function getInitials(name?: string, username?: string): string {
    if (name) {
        const parts = name.trim().split(' ');
        if (parts.length >= 2) {
            return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
        }
        return name.slice(0, 2).toUpperCase();
    }
    if (username) {
        return username.slice(0, 2).toUpperCase();
    }
    return '??';
}

/**
 * Generate a fallback avatar URL using UI Avatars
 */
function getFallbackUrl(name?: string, username?: string): string {
    const displayName = name || username || 'User';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=F5973F&color=fff&bold=true`;
}

/**
 * Avatar component with multiple fallback options:
 * 1. User's actual avatar image
 * 2. UI Avatars service (external fallback)
 * 3. Initials (final fallback)
 */
export function UserAvatar({
    src,
    name,
    username,
    size = 'md',
    className
}: UserAvatarProps) {
    const initials = getInitials(name, username);
    const fallbackUrl = getFallbackUrl(name, username);

    return (
        <Avatar className={cn(sizeClasses[size], className)}>
            <AvatarImage
                src={src || fallbackUrl}
                alt={name || username || 'User avatar'}
            />
            <AvatarFallback
                className="bg-primary text-primary-foreground font-medium"
                delayMs={600}
            >
                {initials}
            </AvatarFallback>
        </Avatar>
    );
}

export default UserAvatar;
