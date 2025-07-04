
"use client";

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2, Sparkles } from "lucide-react";
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app as firebaseApp } from '@/lib/firebase/client';
import { useToast } from '@/hooks/use-toast';
import { useTranslations } from 'next-intl';
import { generateForumPostDraft } from '@/ai/flows/generate-forum-post-draft';

export default function CreatePostPage() {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const t = useTranslations('Forums.createPost');
    const topicId = params.topicId as string;

    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [aiPrompt, setAiPrompt] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    
    const functions = getFunctions(firebaseApp);
    const createForumPost = useMemo(() => httpsCallable(functions, 'createForumPost'), [functions]);

    const handleGenerateWithAi = async () => {
        if (!aiPrompt.trim()) {
            toast({
                title: t('errors.aiPromptMissing.title'),
                description: t('errors.aiPromptMissing.description'),
                variant: "destructive",
            });
            return;
        }
        setIsGenerating(true);
        try {
            const result = await generateForumPostDraft({ topicId, prompt: aiPrompt });
            setTitle(result.title);
            setContent(result.content);
            toast({
                title: t('success.aiDraft.title'),
                description: t('success.aiDraft.description'),
            });
        } catch (error: any) {
            console.error("Error generating post draft:", error);
            toast({
                title: t('errors.aiDraft.title'),
                description: error.message || t('errors.aiDraft.description'),
                variant: "destructive",
            });
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !content.trim()) {
            toast({
                title: t('errors.incomplete.title'),
                description: t('errors.incomplete.description'),
                variant: "destructive",
            });
            return;
        }
        setIsSubmitting(true);

        try {
            await createForumPost({ topicId, title, content });
            
            toast({
                title: t('success.title'),
                description: t('success.description'),
            });
            
            router.push(`/forums/${topicId}`);
        } catch (error: any) {
            console.error("Error creating post:", error);
            toast({
                title: t('errors.general.title'),
                description: error.message || t('errors.general.description'),
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="container mx-auto max-w-3xl py-8">
            <Link href={`/forums/${topicId}`} className="flex items-center text-sm text-muted-foreground hover:underline mb-4">
                <ArrowLeft className="h-4 w-4 mr-1" />
                {t('backLink')}
            </Link>

            <Card className="mb-6 bg-primary-foreground/40 border-primary/30">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-primary" />
                        {t('aiHelper.title')}
                    </CardTitle>
                    <CardDescription>{t('aiHelper.description')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                     <Label htmlFor="ai-prompt">{t('aiHelper.promptLabel')}</Label>
                    <Textarea 
                        id="ai-prompt"
                        placeholder={t('aiHelper.promptPlaceholder')}
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                        disabled={isGenerating}
                        rows={2}
                    />
                </CardContent>
                <CardFooter>
                    <Button onClick={handleGenerateWithAi} disabled={isGenerating || !aiPrompt.trim()}>
                        {isGenerating ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                {t('aiHelper.generatingButton')}
                            </>
                        ) : (
                            t('aiHelper.generateButton')
                        )}
                    </Button>
                </CardFooter>
            </Card>

            <form onSubmit={handleSubmit}>
                <Card>
                    <CardHeader>
                        <CardTitle>{t('title')}</CardTitle>
                        <CardDescription>{t('description')}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="post-title">{t('form.titleLabel')}</Label>
                            <Input 
                                id="post-title" 
                                placeholder={t('form.titlePlaceholder')}
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                                disabled={isSubmitting}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="post-content">{t('form.contentLabel')}</Label>
                            <Textarea 
                                id="post-content"
                                placeholder={t('form.contentPlaceholder')}
                                className="min-h-[200px]"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                required
                                disabled={isSubmitting}
                            />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button type="submit" disabled={isSubmitting}>
                           {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    {t('form.submittingButton')}
                                </>
                            ) : (
                                t('form.submitButton')
                            )}
                        </Button>
                    </CardFooter>
                </Card>
            </form>
        </div>
    );
}
