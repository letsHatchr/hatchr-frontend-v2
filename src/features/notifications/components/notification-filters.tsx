'use client';

import { cn } from '@/lib/utils';
import { Bell, UserPlus, Heart, FolderKanban, Inbox } from 'lucide-react';

export type NotificationFilter = 'all' | 'unread' | 'invites' | 'social' | 'projects';

interface FilterOption {
    value: NotificationFilter;
    label: string;
    icon: React.ReactNode;
}

const filterOptions: FilterOption[] = [
    { value: 'all', label: 'All', icon: <Inbox className="h-4 w-4" /> },
    { value: 'unread', label: 'Unread', icon: <Bell className="h-4 w-4" /> },
    { value: 'invites', label: 'Invites', icon: <FolderKanban className="h-4 w-4" /> },
    { value: 'social', label: 'Social', icon: <Heart className="h-4 w-4" /> },
    { value: 'projects', label: 'Projects', icon: <UserPlus className="h-4 w-4" /> },
];

interface NotificationFiltersProps {
    activeFilter: NotificationFilter;
    onFilterChange: (filter: NotificationFilter) => void;
    unreadCount?: number;
}

export function NotificationFilters({
    activeFilter,
    onFilterChange,
    unreadCount = 0
}: NotificationFiltersProps) {
    return (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hidden">
            {filterOptions.map((option) => (
                <button
                    key={option.value}
                    onClick={() => onFilterChange(option.value)}
                    className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap",
                        "hover:bg-accent/80 focus:outline-none focus:ring-2 focus:ring-primary/20",
                        activeFilter === option.value
                            ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                            : "bg-card/60 text-muted-foreground border border-border/50 hover:text-foreground hover:border-border"
                    )}
                >
                    {option.icon}
                    <span>{option.label}</span>
                    {option.value === 'unread' && unreadCount > 0 && (
                        <span className={cn(
                            "ml-1 px-1.5 py-0.5 text-xs rounded-full font-semibold min-w-[20px] text-center",
                            activeFilter === 'unread'
                                ? "bg-primary-foreground/20 text-primary-foreground"
                                : "bg-primary/10 text-primary"
                        )}>
                            {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                    )}
                </button>
            ))}
        </div>
    );
}

export default NotificationFilters;
