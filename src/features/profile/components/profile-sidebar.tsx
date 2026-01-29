'use client';

import { useState } from 'react';
import { GraduationCap, School, Egg, Rocket, Star, Flame, Zap, Crown, Trophy, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { SocialLinks } from './social-links';
import { toast } from '@/lib/toast';
import type { User as UserType } from '../types';

// Rank definitions based on hatch points
const RANKS = [
    { minPoints: 0, title: 'Hatchling', icon: Egg, color: 'text-amber-600', bgColor: 'bg-amber-600/20', borderColor: 'border-amber-600/30' },
    { minPoints: 50, title: 'Novice', icon: Rocket, color: 'text-green-500', bgColor: 'bg-green-500/20', borderColor: 'border-green-500/30' },
    { minPoints: 150, title: 'Builder', icon: Zap, color: 'text-blue-500', bgColor: 'bg-blue-500/20', borderColor: 'border-blue-500/30' },
    { minPoints: 400, title: 'Ascender', icon: Star, color: 'text-purple-500', bgColor: 'bg-purple-500/20', borderColor: 'border-purple-500/30' },
    { minPoints: 800, title: 'Innovator', icon: Flame, color: 'text-orange-500', bgColor: 'bg-orange-500/20', borderColor: 'border-orange-500/30' },
    { minPoints: 1500, title: 'Pioneer', icon: Crown, color: 'text-pink-500', bgColor: 'bg-pink-500/20', borderColor: 'border-pink-500/30' },
    { minPoints: 3000, title: 'Visionary', icon: Trophy, color: 'text-yellow-500', bgColor: 'bg-yellow-500/20', borderColor: 'border-yellow-500/30' },
    { minPoints: 6000, title: 'Legend', icon: Crown, color: 'text-primary', bgColor: 'bg-primary/20', borderColor: 'border-primary/30' },
];

function getRank(points: number) {
    let rank = RANKS[0];
    let level = 1;
    for (let i = RANKS.length - 1; i >= 0; i--) {
        if (points >= RANKS[i].minPoints) {
            rank = RANKS[i];
            level = i + 1;
            break;
        }
    }
    // Calculate progress to next level
    const currentIdx = RANKS.findIndex(r => r.title === rank.title);
    const nextRank = RANKS[currentIdx + 1];
    const progress = nextRank
        ? ((points - rank.minPoints) / (nextRank.minPoints - rank.minPoints)) * 100
        : 100;
    return { ...rank, level, progress: Math.min(progress, 100) };
}

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
    const hatchPoints = user.hatchPoints || 0;
    const rankInfo = getRank(hatchPoints);
    const RankIcon = rankInfo.icon;
    const [achievementsExpanded, setAchievementsExpanded] = useState(false);

    const handleShare = async () => {
        const shareUrl = `${window.location.origin}/${user.username}`;
        try {
            await navigator.clipboard.writeText(shareUrl);
            toast.success('Link copied!');
        } catch {
            toast.error('Failed to copy link');
        }
    };

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

                {/* Floating Share Button */}
                <button
                    onClick={handleShare}
                    className="absolute top-2 right-2 p-2 rounded-full bg-black/30 backdrop-blur-sm hover:bg-black/50 transition-all hover:scale-105 active:scale-95 group"
                    title="Share Profile"
                >
                    <Share2 className="h-4 w-4 text-white/90 group-hover:text-white" />
                </button>
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
                        <h2 className="text-lg font-bold leading-tight break-words">{user.name || user.username}</h2>
                        <p className="text-sm text-muted-foreground truncate">@{user.username}</p>
                    </div>
                </div>

                {/* Rank & Stats Card - 2 Columns */}
                <div className="rounded-lg p-3 mb-3 border border-border bg-muted/30">
                    <div className="flex items-center">
                        {/* Rank Column */}
                        <div className="flex items-center gap-2.5 flex-1">
                            {/* Icon with Progress Ring */}
                            <div className="relative w-10 h-10 shrink-0">
                                <svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
                                    <circle cx="18" cy="18" r="16" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-muted" />
                                    <circle
                                        cx="18" cy="18" r="16" fill="none" stroke="currentColor" strokeWidth="2.5"
                                        className={rankInfo.color}
                                        strokeDasharray={`${rankInfo.progress} 100`}
                                        strokeLinecap="round"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <RankIcon className={`w-4 h-4 ${rankInfo.color}`} />
                                </div>
                            </div>

                            {/* Rank Info */}
                            <div className="min-w-0">
                                <div className={`text-sm font-semibold ${rankInfo.color}`}>{rankInfo.title}</div>
                                <div className="text-[10px] text-muted-foreground">{hatchPoints} HP</div>
                            </div>
                        </div>

                        {/* Projects Column */}
                        <div className="flex items-center gap-2.5">
                            {/* Projects Label */}
                            <div className="text-sm font-semibold">Projects</div>

                            {/* Circle with Number */}
                            <div className="relative w-10 h-10 shrink-0">
                                <svg className="w-10 h-10" viewBox="0 0 36 36">
                                    <circle cx="18" cy="18" r="16" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-muted" />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-sm font-bold">{projectsCount}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Following/Followers - Original compact style */}
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

                {/* Interest Tags - Professional pill badges */}
                {user.interests && user.interests.length > 0 && (
                    <div className="flex flex-wrap justify-center gap-1.5 mb-4">
                        {user.interests.map((interest, idx) => (
                            <span
                                key={idx}
                                className="px-2.5 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary border border-primary/20"
                            >
                                {interest}
                            </span>
                        ))}
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

                {/* Experience - Timeline Style */}
                {user.experience && user.experience.length > 0 && (
                    <div className="mb-4">
                        <h4 className="text-sm font-semibold text-primary mb-3 px-1">Experience</h4>
                        <div className="relative pl-4 border-l-2 border-primary/30 space-y-3">
                            {user.experience.map((exp, idx) => (
                                <div key={exp._id || idx} className="relative">
                                    {/* Timeline dot */}
                                    <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-primary border-2 border-background" />

                                    <div className="text-sm">
                                        <div className="font-medium">{exp.role}</div>
                                        <div className="text-muted-foreground text-xs">{exp.company}</div>
                                        <div className="text-muted-foreground text-[10px] mt-0.5">
                                            {exp.startDate} — {exp.isCurrent ? 'Present' : exp.endDate}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Achievements - Collapsible on mobile */}
                {user.achievements && user.achievements.length > 0 && (
                    <div className="bg-primary/10 rounded-lg p-3 mb-4">
                        <button
                            className="w-full flex items-center justify-between sm:cursor-default"
                            onClick={() => setAchievementsExpanded(!achievementsExpanded)}
                        >
                            <h4 className="text-sm font-semibold text-primary">
                                Achievements
                                <span className="text-xs font-normal text-muted-foreground ml-1 sm:hidden">
                                    ({user.achievements.length})
                                </span>
                            </h4>
                            <svg
                                className={`w-4 h-4 text-muted-foreground transition-transform sm:hidden ${achievementsExpanded ? 'rotate-180' : ''}`}
                                fill="none" viewBox="0 0 24 24" stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                        <ul className={`list-disc pl-5 space-y-1 mt-2 ${achievementsExpanded ? 'block' : 'hidden sm:block'}`}>
                            {user.achievements.map((achievement) => (
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
