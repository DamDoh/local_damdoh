
"use client";

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app as firebaseApp } from '@/lib/firebase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/auth-utils';
import { useTranslations } from 'next-intl';

export default function CreateGroupPostPage() {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const { user } = useAuth();
    const t = useTranslations('groupsPage.createPost');
    const groupId = params.groupId as string;

    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const functions = getFunctions(firebaseApp);
    const createGroupPostCallable = useMemo(() => httpsCallable(functions, 'createGroupPost'), [functions]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            toast({
                title: t('toast.auth.title'),
                description: t('toast.auth.description'),
                variant: "destructive"
            });
            return;
        }

        if (!title.trim() || !content.trim()) {
            toast({
                title: t('toast.incomplete.title'),
                description: t('toast.incomplete.description'),
                variant: "destructive",
            });
            return;
        }
        setIsSubmitting(true);

        try {
            await createGroupPostCallable({ groupId, title, content });
            
            toast({
                title: t('toast.success.title'),
                description: t('toast.success.description'),
            });
            
            router.push(`/groups/${groupId}`);
        } catch (error: any) {
            console.error("Error creating post:", error);
            toast({
                title: t('toast.error.title'),
                description: error.message || t('toast.error.description'),
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="container mx-auto max-w-3xl py-8">
            <Link href={`/groups/${groupId}`} className="flex items-center text-sm text-muted-foreground hover:underline mb-4">
                <ArrowLeft className="h-4 w-4 mr-1" />
                {t('backLink')}
            </Link>
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
                                <>
                                    <Save className="mr-2 h-4 w-4" />
                                    {t('form.submitButton')}
                                </>
                            )}
                        </Button>
                    </CardFooter>
                </Card>
            </form>
        </div>
    );
}
