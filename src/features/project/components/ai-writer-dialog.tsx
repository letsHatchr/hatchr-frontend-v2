import { useState } from 'react';
import { Loader2, Sparkles, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import api from '@/lib/api';
import { toast } from 'sonner';

interface AIWriterDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onGenerate: (content: string) => void;
}

export function AIWriterDialog({ open, onOpenChange, onGenerate }: AIWriterDialogProps) {
    const [topic, setTopic] = useState('');
    const [tone, setTone] = useState('casual');
    const [length, setLength] = useState('medium');
    const [isGenerating, setIsGenerating] = useState(false);

    const handleGenerate = async () => {
        if (!topic.trim()) {
            toast.error('Please enter a topic');
            return;
        }

        setIsGenerating(true);
        try {
            const response = await api.post('/ai/generate-post', {
                topic,
                tone,
                length,
                format: 'html', // Request HTML for Tiptap
            });

            if (response.data.success) {
                // Handle nested data structure { success: true, data: { html: ..., content: ... } }
                // Prioritize HTML if available, as that contains the marked-processed content
                const content = response.data.data?.html || response.data.data?.content || response.data.html || response.data.content;

                if (content) {
                    onGenerate(content);
                    onOpenChange(false);
                    setTopic(''); // Reset topic after success
                    toast.success('Content generated successfully!');
                } else {
                    toast.error('Generated content was empty');
                    console.error('Unexpected response structure:', response.data);
                }
            } else {
                toast.error(response.data.error || 'Failed to generate content');
            }
        } catch (error: any) {
            console.error('AI Generation error:', error);
            // Handle rate limiting specifically if possible, though api.ts might wrap errors
            const errorMessage = error.response?.data?.error || error.message || 'Something went wrong';
            toast.error(errorMessage);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-purple-500" />
                        Write with AI
                    </DialogTitle>
                    <DialogDescription>
                        Describe what you want to post about, and let AI write a draft for you.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="topic">What's this post about?</Label>
                        <Textarea
                            id="topic"
                            placeholder="e.g., The importance of consistency in startups..."
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            rows={3}
                            className="resize-none"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="tone">Tone</Label>
                            <Select value={tone} onValueChange={(val) => val && setTone(val)}>
                                <SelectTrigger id="tone">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="casual">Casual & Friendly</SelectItem>
                                    <SelectItem value="professional">Professional</SelectItem>
                                    <SelectItem value="funny">Humorous</SelectItem>
                                    <SelectItem value="inspiring">Inspiring</SelectItem>
                                    <SelectItem value="technical">Technical</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="length">Length</Label>
                            <Select value={length} onValueChange={(val) => val && setLength(val)}>
                                <SelectTrigger id="length">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="short">Short (Twitter style)</SelectItem>
                                    <SelectItem value="medium">Medium (LinkedIn style)</SelectItem>
                                    <SelectItem value="long">Long (Blog style)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleGenerate}
                        disabled={isGenerating || !topic.trim()}
                        className="bg-purple-600 hover:bg-purple-700 text-white"
                    >
                        {isGenerating ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Generating...
                            </>
                        ) : (
                            <>
                                <Wand2 className="mr-2 h-4 w-4" />
                                Generate Draft
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
