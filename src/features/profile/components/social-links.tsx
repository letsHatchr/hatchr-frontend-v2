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

                // Ensure URL has protocol
                const href = url?.startsWith('http') ? url : `https://${url}`;

                return (
                    <a
                        key={key}
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-muted/50 hover:bg-primary/20 text-muted-foreground hover:text-primary transition-colors"
                        title={label}
                    >
                        <Icon className="h-4 w-4" />
                        <span className="sr-only">{label}</span>
                    </a>
                );
            })}
        </div>
    );
}

export default SocialLinks;
