'use client';

interface ProfileStatsProps {
    followersCount: number;
    followingCount: number;
    projectsCount: number;
    hatchPoints: number;
    onFollowersClick: () => void;
    onFollowingClick: () => void;
}

export function ProfileStats({
    followersCount,
    followingCount,
    projectsCount,
    hatchPoints,
    onFollowersClick,
    onFollowingClick,
}: ProfileStatsProps) {
    return (
        <div className="grid grid-cols-2 gap-3">
            {/* Followers */}
            <button
                onClick={onFollowersClick}
                className="text-center p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
            >
                <div className="font-bold text-lg text-primary">{followersCount}</div>
                <div className="text-xs text-muted-foreground">Followers</div>
            </button>

            {/* Following */}
            <button
                onClick={onFollowingClick}
                className="text-center p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
            >
                <div className="font-bold text-lg text-primary">{followingCount}</div>
                <div className="text-xs text-muted-foreground">Following</div>
            </button>

            {/* Projects */}
            <div className="text-center p-3 rounded-lg bg-muted/50 border-l-4 border-primary">
                <div className="font-bold text-lg text-primary">{projectsCount}</div>
                <div className="text-xs text-muted-foreground">Projects</div>
            </div>

            {/* Hatch Points */}
            <div className="text-center p-3 rounded-lg bg-muted/50 border-l-4 border-yellow-500">
                <div className="font-bold text-lg text-yellow-500">{hatchPoints}</div>
                <div className="text-xs text-muted-foreground">Hatch Points</div>
            </div>
        </div>
    );
}

export default ProfileStats;
