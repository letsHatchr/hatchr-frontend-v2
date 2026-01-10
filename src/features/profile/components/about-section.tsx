'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AboutSectionProps {
    bio?: string;
    name?: string;
}

export function AboutSection({ bio, name }: AboutSectionProps) {
    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="text-2xl">About</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                    {bio || `I am ${name || 'a user'}, Nothing much to know about me`}
                </p>
            </CardContent>
        </Card>
    );
}

export default AboutSection;
