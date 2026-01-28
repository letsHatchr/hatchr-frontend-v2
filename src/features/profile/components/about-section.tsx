'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AboutSectionProps {
    about?: string;
    bio?: string;
}

export function AboutSection({ about }: AboutSectionProps) {
    return (
        <Card className="gap-1">
            <CardHeader>
                <CardTitle className="text-2xl">About</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {about || 'On a journey to create something amazing on Hatchr...'}
                </p>
            </CardContent>
        </Card>
    );
}

export default AboutSection;
