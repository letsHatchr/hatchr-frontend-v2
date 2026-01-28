'use client';

import { Twitter, Linkedin, Instagram, Github, Globe, Link as LinkIcon, Brain } from 'lucide-react';
import type { SocialLinks as SocialLinksType } from '../types';

interface SocialLinksDisplayProps {
    socialLinks?: SocialLinksType;
}

const socialIcons = {
    twitter: Twitter,
    linkedin: Linkedin,
    instagram: Instagram,
    github: Github,
    website: Globe,
    customLink: LinkIcon,
    huggingface: Brain,
};

const socialLabels: Record<string, string> = {
    twitter: 'Twitter',
    linkedin: 'LinkedIn',
    instagram: 'Instagram',
    github: 'GitHub',
    website: 'Website',
    customLink: 'Link',
    huggingface: 'Hugging Face',
};

// Brand colors for social icons
const socialColors: Record<string, string> = {
    twitter: 'bg-[#1DA1F2]/15 text-[#1DA1F2] hover:bg-[#1DA1F2]/25',
    linkedin: 'bg-[#0A66C2]/15 text-[#0A66C2] hover:bg-[#0A66C2]/25',
    instagram: 'bg-gradient-to-br from-[#F56040]/15 to-[#C13584]/15 text-[#E1306C] hover:from-[#F56040]/25 hover:to-[#C13584]/25',
    github: 'bg-[#6e5494]/15 text-[#6e5494] hover:bg-[#6e5494]/25',
    website: 'bg-primary/15 text-primary hover:bg-primary/25',
    customLink: 'bg-primary/15 text-primary hover:bg-primary/25',
    huggingface: 'bg-[#FFD21E]/15 text-[#FFD21E] hover:bg-[#FFD21E]/25',
};

export function SocialLinks({ socialLinks }: SocialLinksDisplayProps) {
    if (!socialLinks) return null;

    const links = Object.entries(socialLinks).filter(
        ([_, value]) => value && value.trim() !== ''
    );

    if (links.length === 0) return null;

    return (
        <div className="flex flex-wrap items-center justify-center gap-2">
            {links.map(([key, url]) => {
                const Icon = socialIcons[key as keyof typeof socialIcons] || LinkIcon;
                const label = socialLabels[key] || key;
                const colorClass = socialColors[key as keyof typeof socialColors] || 'bg-muted/50 text-muted-foreground hover:bg-primary/20';

                // Ensure URL has protocol
                const href = url?.startsWith('http') ? url : `https://${url}`;

                return (
                    <a
                        key={key}
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`inline-flex items-center justify-center w-9 h-9 rounded-full transition-all duration-200 ${colorClass}`}
                        title={label}
                    >
                        <Icon className="h-[18px] w-[18px]" />
                        <span className="sr-only">{label}</span>
                    </a>
                );
            })}
        </div>
    );
}

export default SocialLinks;

