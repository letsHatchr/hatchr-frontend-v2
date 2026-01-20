'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AboutSectionProps {
    about?: string;
    bio?: string;
    name?: string;
}

export function AboutSection({ about, name }: AboutSectionProps) {
    return (
        <Card className="gap-1">
            <CardHeader>
                <CardTitle className="text-2xl">About</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {about || `I am ${name || 'a user'}, Nothing much to know about me`}
                </p>
            </CardContent>
        </Card>
    );
}

export default AboutSection;
