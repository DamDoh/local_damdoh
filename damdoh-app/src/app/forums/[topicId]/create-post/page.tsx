
"use client";

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app as firebaseApp } from '@/lib/firebase/client';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';

export default function CreatePostPage() {
    const { t } = useTranslation('common');
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const topicId = params.topicId as string;

    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const functions = getFunctions(firebaseApp);
    const createForumPost = useMemo(() => httpsCallable(functions, 'createForumPost'), [functions]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !content.trim()) {
            toast({
                title: t('forums.post.create.errorIncompleteTitle'),
                description: t('forums.post.create.errorIncompleteDescription'),
                variant: "destructive",
            });
            return;
        }
        setIsSubmitting(true);

        try {
            await createForumPost({ topicId, title, content });
            
            toast({
                title: t('forums.post.create.successTitle'),
                description: t('forums.post.create.successDescription'),
            });
            
            router.push(`/forums/${topicId}`);
        } catch (error) {
            console.error("Error creating post:", error);
            toast({
                title: t('forums.post.create.failTitle'),
                description: t('forums.post.create.failDescription'),
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
                {t('forums.post.create.backButton')}
            </Link>
            <form onSubmit={handleSubmit}>
                <Card>
                    <CardHeader>
                        <CardTitle>{t('forums.post.create.title')}</CardTitle>
                        <CardDescription>{t('forums.post.create.description')}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="post-title">{t('forums.post.create.titleLabel')}</Label>
                            <Input 
                                id="post-title" 
                                placeholder={t('forums.post.create.titlePlaceholder')} 
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                                disabled={isSubmitting}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="post-content">{t('forums.post.create.contentLabel')}</Label>
                            <Textarea 
                                id="post-content"
                                placeholder={t('forums.post.create.contentPlaceholder')}
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
                            {isSubmitting ? t('forums.post.create.submittingButton') : t('forums.post.create.submitButton')}
                        </Button>
                    </CardFooter>
                </Card>
            </form>
        </div>
    );
}
