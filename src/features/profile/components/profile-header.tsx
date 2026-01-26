'use client';

import { Calendar } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { optimizeCloudinaryUrl } from '@/lib/cloudinary';
import type { User as UserType } from '../types';

interface ProfileHeaderProps {
    user: UserType;
    isOwnProfile: boolean;
    isFollowing: boolean;
    followLoading: boolean;
    onFollow: () => void;
    onEditProfile: () => void;
}

export function ProfileHeader({
    user,
    isOwnProfile,
    isFollowing,
    followLoading,
    onFollow,
    onEditProfile,
}: ProfileHeaderProps) {
    return (
        <div className="bg-card rounded-lg overflow-hidden border">
            {/* Banner */}
            <div className="h-32 lg:h-40 relative">
                {user.bannerImage ? (
                    <img
                        src={optimizeCloudinaryUrl(user.bannerImage, { width: 1200, height: 400 })}
                        alt="Profile banner"
                        className="w-full h-full object-cover"
                        loading="eager"
                        fetchPriority="high"
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-r from-primary/80 to-primary" />
                )}
            </div>

            {/* Profile Content */}
            <div className="px-4 lg:px-6 pb-6 relative">
                {/* Avatar - overlapping banner */}
                <div className="flex justify-center lg:justify-start -mt-16 lg:-mt-20 mb-4">
                    <div className="relative">
                        <img
                            src={
                                user.avatar && user.avatar.trim() !== ''
                                    ? optimizeCloudinaryUrl(user.avatar, { width: 200, height: 200 })
                                    : `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || user.username)}&size=128&background=F5973F&color=fff`
                            }
                            alt={user.username}
                            className="w-24 h-24 lg:w-32 lg:h-32 rounded-full object-cover border-4 border-background shadow-lg"
                            loading="eager"
                            fetchPriority="high"
                            width="128"
                            height="128"
                            onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.onerror = null;
                                target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || user.username)}&size=128&background=F5973F&color=fff`;
                            }}
                        />
                    </div>
                </div>

                {/* Username Badge */}
                <div className="flex justify-center lg:justify-start mb-2">
                    <span className="bg-muted px-3 py-1 rounded-full text-sm text-muted-foreground">
                        @{user.username}
                    </span>
                </div>

                {/* Display Name */}
                <h1 className="text-2xl font-bold text-center lg:text-left mb-2">
                    {user.name || user.username}
                </h1>

                {/* Bio */}
                {user.bio && (
                    <p className="text-muted-foreground text-center lg:text-left mb-4 leading-relaxed">
                        {user.bio}
                    </p>
                )}

                {/* Joined Date */}
                <div className="flex items-center justify-center lg:justify-start gap-2 text-sm text-muted-foreground mb-6">
                    <Calendar className="h-4 w-4" />
                    <span>
                        Joined {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
                    </span>
                </div>

                {/* Action Button */}
                {isOwnProfile ? (
                    <Button
                        variant="outline"
                        className="w-full"
                        onClick={onEditProfile}
                    >
                        Edit Profile
                    </Button>
                ) : (
                    <Button
                        variant={isFollowing ? 'outline' : 'default'}
                        className="w-full"
                        onClick={onFollow}
                        disabled={followLoading}
                    >
                        {followLoading ? 'Loading...' : isFollowing ? 'Following' : 'Follow'}
                    </Button>
                )}
            </div>
        </div>
    );
}

export default ProfileHeader;
