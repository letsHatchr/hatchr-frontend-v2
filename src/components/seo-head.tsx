'use client';

import { useEffect } from 'react';

interface SeoHeadProps {
    title: string;
    description?: string;
    image?: string;
    url?: string;
    type?: 'website' | 'profile' | 'article';
}

/**
 * Updates document head with SEO meta tags.
 * Note: For SPA, these are useful for in-app purposes but won't work for social crawlers without SSR.
 */
export function SeoHead({
    title,
    description,
    image,
    url,
    type = 'website',
}: SeoHeadProps) {
    useEffect(() => {
        // Update title
        document.title = `${title} | Hatchr`;

        // Helper to update or create meta tag
        const updateMeta = (name: string, content: string, property?: boolean) => {
            const attr = property ? 'property' : 'name';
            let meta = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement;

            if (!meta) {
                meta = document.createElement('meta');
                meta.setAttribute(attr, name);
                document.head.appendChild(meta);
            }
            meta.content = content;
        };

        // Basic meta
        if (description) {
            updateMeta('description', description);
        }

        // Open Graph
        updateMeta('og:title', title, true);
        updateMeta('og:type', type, true);
        if (description) updateMeta('og:description', description, true);
        if (image) updateMeta('og:image', image, true);
        if (url) updateMeta('og:url', url, true);
        updateMeta('og:site_name', 'Hatchr', true);

        // Twitter Card
        updateMeta('twitter:card', image ? 'summary_large_image' : 'summary');
        updateMeta('twitter:title', title);
        if (description) updateMeta('twitter:description', description);
        if (image) updateMeta('twitter:image', image);

        // Cleanup - reset to defaults when component unmounts
        return () => {
            document.title = 'Hatchr';
        };
    }, [title, description, image, url, type]);

    return null;
}

export default SeoHead;
