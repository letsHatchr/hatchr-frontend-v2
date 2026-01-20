'use client';

import { GraduationCap, School } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { SocialLinks } from './social-links';
import type { User as UserType } from '../types';

interface ProfileSidebarProps {
    user: UserType;
    projectsCount: number;
    isOwnProfile: boolean;
    isFollowing: boolean;
    followLoading: boolean;
    onFollow: () => void;
    onEditProfile: () => void;
    onFollowersClick: () => void;
    onFollowingClick: () => void;
}

export function ProfileSidebar({
    user,
    projectsCount,
    isOwnProfile,
    isFollowing,
    followLoading,
    onFollow,
    onEditProfile,
    onFollowersClick,
    onFollowingClick,
}: ProfileSidebarProps) {
    return (
        <Card className="overflow-hidden pt-0">
            {/* Banner */}
            <div className="h-24 relative bg-gradient-to-r from-primary to-primary/80 overflow-hidden">
                {user.bannerImage ? (
                    <img
                        src={user.bannerImage}
                        alt="Profile banner"
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center px-3">
                        <p className="text-white/90 font-semibold text-xs text-center leading-tight">
                            Build in Public<br />
                            <span className="text-white/70 text-[10px] font-normal">Share -Your project. Your journey...</span>
                        </p>
                    </div>
                )}
            </div>

            <CardContent className="relative pt-0 pb-3 px-4">
                {/* Avatar & Name Row - reduced overlap */}
                <div className="flex flex-row items-end gap-3 -mt-10 sm:-mt-12 mb-4 px-1">
                    <img
                        src={
                            user.avatar && user.avatar.trim() !== ''
                                ? user.avatar
                                : `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || user.username)}&size=80&background=F5973F&color=fff`
                        }
                        alt={user.username}
                        className="w-24 h-24 rounded-full object-cover border-4 border-background shadow-lg z-10"
                        onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.onerror = null;
                            target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || user.username)}&size=80&background=F5973F&color=fff`;
                        }}
                    />

                    <div className="pb-2 min-w-0">
                        <h2 className="text-xl font-bold truncate">{user.name || user.username}</h2>
                        <p className="text-sm text-muted-foreground truncate">@{user.username}</p>
                    </div>
                </div>

                {/* Stats Row - Compact */}
                <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="bg-primary/10 rounded-lg p-2 text-center">
                        <div className="text-xs font-semibold text-primary">Projects</div>
                        <div className="text-lg font-bold">{projectsCount}</div>
                    </div>
                    <div className="bg-primary/10 rounded-lg p-2 text-center">
                        <div className="text-xs font-semibold text-primary">Hatch points</div>
                        <div className="text-lg font-bold">{user.hatchPoints || 0}</div>
                    </div>
                </div>

                {/* Following/Followers - improved touch targets */}
                <div className="flex items-center justify-center gap-3 text-sm mb-4">
                    <button
                        onClick={onFollowingClick}
                        className="hover:text-primary transition-colors py-2 px-3 -my-2 -mx-1 rounded-md hover:bg-accent min-h-[44px] flex items-center"
                    >
                        Following <span className="font-semibold ml-1">{user.following?.length || 0}</span>
                    </button>
                    <span className="text-muted-foreground">|</span>
                    <button
                        onClick={onFollowersClick}
                        className="hover:text-primary transition-colors py-2 px-3 -my-2 -mx-1 rounded-md hover:bg-accent min-h-[44px] flex items-center"
                    >
                        Followers <span className="font-semibold ml-1">{user.followers?.length || 0}</span>
                    </button>
                </div>

                {/* College/School */}
                {(user.college || user.school) && (
                    <div className="space-y-1 mb-4 text-sm text-muted-foreground">
                        {user.college && (
                            <div className="flex items-center gap-2">
                                <GraduationCap className="h-4 w-4" />
                                <span>{user.college}</span>
                            </div>
                        )}
                        {user.school && (
                            <div className="flex items-center gap-2">
                                <School className="h-4 w-4" />
                                <span>{user.school}</span>
                            </div>
                        )}
                    </div>
                )}

                {/* Interest Tags */}
                {user.interests && user.interests.length > 0 && (
                    <div className="bg-primary/10 rounded-lg p-3 mb-4 text-center">
                        <div className="flex flex-wrap justify-center gap-2">
                            {user.interests.map((interest, idx) => (
                                <span key={idx} className="text-sm text-foreground">
                                    {interest}
                                    {idx < user.interests!.length - 1 && <span className="text-muted-foreground ml-2">|</span>}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Bio */}
                <div className="mb-4">
                    <p className="text-sm text-muted-foreground text-center mb-3">
                        {user.bio || "No bio yet."}
                    </p>
                    {/* Social Links */}
                    <div className="flex justify-center gap-2 mb-3">
                        <SocialLinks socialLinks={user.socialLinks} />
                    </div>
                </div>

                {/* Achievements */}
                {user.achievements && user.achievements.length > 0 && (
                    <div className="bg-primary/10 rounded-lg p-3 mb-4">
                        <h4 className="text-sm font-semibold text-primary mb-2 pl-1">Achievements</h4>
                        <ul className="list-disc pl-5 space-y-1">
                            {user.achievements.slice(0, 3).map((achievement) => (
                                <li key={achievement._id} className="text-xs text-left">
                                    {achievement.title}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Action Button */}
                {isOwnProfile ? (
                    <Button
                        className="w-full bg-primary/20 text-foreground hover:bg-primary/30"
                        onClick={onEditProfile}
                    >
                        Edit Profile
                    </Button>
                ) : (
                    <Button
                        className="w-full"
                        variant={isFollowing ? 'outline' : 'default'}
                        onClick={onFollow}
                        disabled={followLoading}
                    >
                        {followLoading ? 'Loading...' : isFollowing ? 'Following' : 'Follow'}
                    </Button>
                )}
            </CardContent>
        </Card>
    );
}

export default ProfileSidebar;
