'use client';

import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Copy, Share2, ExternalLink, Egg, Rocket, Star, Flame, Zap, Crown, Trophy } from 'lucide-react';
import { toast } from '@/lib/toast';
import { UserAvatar } from '@/components/user-avatar';

// Rank icons mapping (same as profile-sidebar)
const RANK_ICONS: Record<string, typeof Egg> = {
    Hatchling: Egg,
    Novice: Rocket,
    Builder: Zap,
    Ascender: Star,
    Innovator: Flame,
    Pioneer: Crown,
    Visionary: Trophy,
    Legend: Crown,
};

const RANK_COLORS: Record<string, string> = {
    Hatchling: 'text-amber-600',
    Novice: 'text-green-500',
    Builder: 'text-blue-500',
    Ascender: 'text-purple-500',
    Innovator: 'text-orange-500',
    Pioneer: 'text-pink-500',
    Visionary: 'text-yellow-500',
    Legend: 'text-primary',
};

// Rank calculation (simplified version)
const RANKS = [
    { minPoints: 0, title: 'Hatchling' },
    { minPoints: 50, title: 'Novice' },
    { minPoints: 150, title: 'Builder' },
    { minPoints: 400, title: 'Ascender' },
    { minPoints: 800, title: 'Innovator' },
    { minPoints: 1500, title: 'Pioneer' },
    { minPoints: 3000, title: 'Visionary' },
    { minPoints: 6000, title: 'Legend' },
];

function getRankTitle(points: number): string {
    for (let i = RANKS.length - 1; i >= 0; i--) {
        if (points >= RANKS[i].minPoints) {
            return RANKS[i].title;
        }
    }
    return 'Hatchling';
}

interface ProfileData {
    username: string;
    name?: string;
    avatar?: string;
    bio?: string;
    hatchPoints?: number;
    projectsCount: number;
    followersCount: number;
    interests?: string[];
}

interface ProjectData {
    slug: string;
    title: string;
    coverImage?: string;
    description?: string;
    owner: {
        username: string;
        name?: string;
        avatar?: string;
    };
    watchersCount: number;
    postsCount: number;
    categories?: string[];
}

interface ShareModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    type: 'profile' | 'project';
    profileData?: ProfileData;
    projectData?: ProjectData;
}

export function ShareModal({
    open,
    onOpenChange,
    type,
    profileData,
    projectData,
}: ShareModalProps) {
    const [copied, setCopied] = useState(false);
    const [showOgPreview, setShowOgPreview] = useState(true);

    // Reset copied state when modal closes
    useEffect(() => {
        if (!open) setCopied(false);
    }, [open]);

    const shareUrl = type === 'profile'
        ? `${window.location.origin}/${profileData?.username}`
        : `${window.location.origin}/project/${projectData?.slug}`;

    const shareTitle = type === 'profile'
        ? `Check out ${profileData?.name || profileData?.username}'s profile on Hatchr`
        : `Check out ${projectData?.title} on Hatchr`;

    // OG Image URL from backend
    const apiBase = import.meta.env.VITE_API_URL?.replace(/\/api$/, '') || 'http://localhost:5000';
    const ogImageUrl = type === 'profile'
        ? `${apiBase}/api/og/profile/${profileData?.username}.png`
        : `${apiBase}/api/og/project/${projectData?.slug}.png`;

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            toast.success('Link copied to clipboard!');
            setTimeout(() => setCopied(false), 2000);
        } catch {
            toast.error('Failed to copy link');
        }
    };

    const handleNativeShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: shareTitle,
                    url: shareUrl,
                });
            } catch {
                // User cancelled
            }
        } else {
            handleCopyLink();
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Share2 className="h-5 w-5" />
                        Share {type === 'profile' ? 'Profile' : 'Project'}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 w-full min-w-0">
                    {/* Toggle between OG Preview and Card Preview */}
                    <div className="flex gap-2 text-xs">
                        <button
                            onClick={() => setShowOgPreview(true)}
                            className={`px-3 py-1.5 rounded-full transition-colors ${showOgPreview
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                }`}
                        >
                            📱 Social Preview
                        </button>
                        <button
                            onClick={() => setShowOgPreview(false)}
                            className={`px-3 py-1.5 rounded-full transition-colors ${!showOgPreview
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                }`}
                        >
                            📋 Details
                        </button>
                    </div>

                    {/* OG Image Preview - How it looks on Twitter/LinkedIn */}
                    {showOgPreview && (
                        <div className="space-y-2">
                            <p className="text-xs text-muted-foreground">
                                How your link appears on Twitter, LinkedIn, WhatsApp, etc.
                            </p>
                            <div className="rounded-lg overflow-hidden border bg-card">
                                <img
                                    src={ogImageUrl}
                                    alt="Link preview"
                                    className="w-full aspect-[1200/630] object-cover bg-muted"
                                    onError={(e) => {
                                        // Fallback if OG image fails to load
                                        (e.target as HTMLImageElement).style.display = 'none';
                                    }}
                                />
                                <div className="p-3 border-t">
                                    <p className="text-xs text-muted-foreground truncate">hatchr.in</p>
                                    <p className="text-sm font-medium truncate">
                                        {type === 'profile'
                                            ? `${profileData?.name || profileData?.username} | Hatchr`
                                            : `${projectData?.title} | Hatchr`
                                        }
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Original Preview Cards */}
                    {!showOgPreview && (
                        <>
                            {type === 'profile' && profileData && (
                                <ProfilePreviewCard data={profileData} />
                            )}
                            {type === 'project' && projectData && (
                                <ProjectPreviewCard data={projectData} />
                            )}
                        </>
                    )}

                    {/* Share URL */}
                    <div className="p-3 bg-muted rounded-lg w-full overflow-hidden">
                        <div className="flex items-center gap-2">
                            <ExternalLink className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <div className="overflow-x-auto flex-1" style={{ scrollbarWidth: 'none' }}>
                                <span className="text-sm text-muted-foreground whitespace-nowrap">
                                    {shareUrl}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            className="flex-1"
                            onClick={handleCopyLink}
                        >
                            {copied ? (
                                <>
                                    <Check className="h-4 w-4 mr-2" />
                                    Copied!
                                </>
                            ) : (
                                <>
                                    <Copy className="h-4 w-4 mr-2" />
                                    Copy Link
                                </>
                            )}
                        </Button>
                        <Button
                            className="flex-1"
                            onClick={handleNativeShare}
                        >
                            <Share2 className="h-4 w-4 mr-2" />
                            Share
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

// Profile Preview Card
function ProfilePreviewCard({ data }: { data: ProfileData }) {
    const rankTitle = getRankTitle(data.hatchPoints || 0);
    const RankIcon = RANK_ICONS[rankTitle] || Egg;
    const rankColor = RANK_COLORS[rankTitle] || 'text-amber-600';

    return (
        <Card className="p-4 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 w-full overflow-hidden">
            {/* Avatar + Name + Username */}
            <div className="flex items-center gap-3">
                <UserAvatar
                    src={data.avatar}
                    name={data.name}
                    username={data.username}
                    size="lg"
                />
                <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-sm leading-tight break-words">{data.name || data.username}</h3>
                    <p className="text-sm text-muted-foreground">@{data.username}</p>
                </div>
            </div>

            {/* Rank + Hatch Points + Projects */}
            <div className="mt-3 flex items-center gap-3 flex-wrap">
                {/* Rank Badge */}
                <div className="flex items-center gap-1.5">
                    <RankIcon className={`h-4 w-4 ${rankColor}`} />
                    <span className={`text-sm font-medium ${rankColor}`}>{rankTitle}</span>
                </div>
                <span className="text-muted-foreground">•</span>
                <div className="text-sm">
                    <span className="font-bold">{data.hatchPoints || 0}</span>
                    <span className="text-muted-foreground ml-1">HP</span>
                </div>
                <span className="text-muted-foreground">•</span>
                <div className="text-sm">
                    <span className="font-bold">{data.projectsCount}</span>
                    <span className="text-muted-foreground ml-1">projects</span>
                </div>
            </div>

            {/* Domain/Interests */}
            {data.interests && data.interests.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                    {data.interests.slice(0, 3).map((interest) => (
                        <Badge key={interest} variant="secondary" className="text-xs">
                            {interest}
                        </Badge>
                    ))}
                </div>
            )}

            {/* Bio */}
            {data.bio && (
                <p className="mt-3 text-sm text-muted-foreground line-clamp-2">{data.bio}</p>
            )}
        </Card>
    );
}

// Project Preview Card
function ProjectPreviewCard({ data }: { data: ProjectData }) {
    return (
        <Card className="p-4 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 w-full overflow-hidden">
            <h3 className="font-bold text-base line-clamp-2">{data.title}</h3>

            {/* Owner */}
            <div className="flex items-center gap-2 mt-3 overflow-hidden">
                <UserAvatar
                    src={data.owner.avatar}
                    name={data.owner.name}
                    username={data.owner.username}
                    size="sm"
                    className="flex-shrink-0"
                />
                <span
                    className="text-sm text-muted-foreground"
                    style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                >
                    by {data.owner.name || data.owner.username}
                </span>
            </div>

            {/* Stats */}
            <div className="mt-3 flex items-center gap-4 text-sm">
                <div>
                    <span className="font-bold">{data.watchersCount}</span>
                    <span className="text-muted-foreground ml-1">watchers</span>
                </div>
                <div>
                    <span className="font-bold">{data.postsCount}</span>
                    <span className="text-muted-foreground ml-1">updates</span>
                </div>
            </div>

            {/* Categories */}
            {data.categories && data.categories.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                    {data.categories.slice(0, 3).map((cat) => (
                        <Badge key={cat} variant="secondary" className="text-xs">
                            {cat}
                        </Badge>
                    ))}
                </div>
            )}
        </Card>
    );
}

export default ShareModal;
