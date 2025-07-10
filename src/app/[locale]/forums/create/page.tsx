
"use client";

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import Link from 'next/link';
import { useRouter } from '@/navigation';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app as firebaseApp } from '@/lib/firebase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/auth-utils';
import { useTranslations } from 'next-intl';

export default function CreateTopicPage() {
    const t = useTranslations('Forums.create');
    const router = useRouter();
    const { toast } = useToast();
    const { user } = useAuth();
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const functions = getFunctions(firebaseApp);
    const createTopicCallable = useMemo(() => httpsCallable(functions, 'createTopic'), [functions]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            toast({
                title: t('errors.auth.title'),
                description: t('errors.auth.description'),
                variant: "destructive"
            });
            return;
        }

        if (!name.trim() || !description.trim()) {
            toast({
                title: t('errors.incomplete.title'),
                description: t('errors.incomplete.description'),
                variant: "destructive",
            });
            return;
        }
        setIsSubmitting(true);

        try {
            await createTopicCallable({ name, description });
            toast({
                title: t('success.title'),
                description: t('success.description'),
            });
            router.push('/forums');
        } catch (error: any) {
            console.error("Error creating topic:", error);
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
            <Link href="/forums" className="flex items-center text-sm text-muted-foreground hover:underline mb-4">
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
                            <Label htmlFor="topic-name">{t('form.nameLabel')}</Label>
                            <Input 
                                id="topic-name" 
                                placeholder={t('form.namePlaceholder')} 
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                disabled={isSubmitting}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="topic-description">{t('form.descriptionLabel')}</Label>
                            <Textarea 
                                id="topic-description"
                                placeholder={t('form.descriptionPlaceholder')}
                                className="min-h-[100px]"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
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
                                <><Save className="h-4 w-4 mr-2" />{t('form.submitButton')}</>
                            )}
                        </Button>
                    </CardFooter>
                </Card>
            </form>
        </div>
    );
}
