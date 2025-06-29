
"use client";

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app as firebaseApp } from '@/lib/firebase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/auth-utils';
import { useTranslation } from 'react-i18next';

export default function CreateTopicPage() {
    const { t } = useTranslation('common');
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
                title: t('forums.create.authErrorTitle'),
                description: t('forums.create.authErrorDescription'),
                variant: "destructive"
            });
            return;
        }

        if (!name.trim() || !description.trim()) {
            toast({
                title: t('forums.create.incompleteErrorTitle'),
                description: t('forums.create.incompleteErrorDescription'),
                variant: "destructive",
            });
            return;
        }
        setIsSubmitting(true);

        try {
            await createTopicCallable({ name, description });
            toast({
                title: t('forums.create.successTitle'),
                description: t('forums.create.successDescription'),
            });
            router.push('/forums');
        } catch (error: any) {
            console.error("Error creating topic:", error);
            toast({
                title: t('forums.create.failTitle'),
                description: error.message || t('forums.create.failDescription'),
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
                {t('forums.create.backButton')}
            </Link>
            <form onSubmit={handleSubmit}>
                <Card>
                    <CardHeader>
                        <CardTitle>{t('forums.create.title')}</CardTitle>
                        <CardDescription>{t('forums.create.description')}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="topic-name">{t('forums.create.nameLabel')}</Label>
                            <Input 
                                id="topic-name" 
                                placeholder={t('forums.create.namePlaceholder')} 
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                disabled={isSubmitting}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="topic-description">{t('forums.create.descriptionLabel')}</Label>
                            <Textarea 
                                id="topic-description"
                                placeholder={t('forums.create.descriptionPlaceholder')}
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
                            {isSubmitting ? t('forums.create.submittingButton') : t('forums.create.submitButton')}
                        </Button>
                    </CardFooter>
                </Card>
            </form>
        </div>
    );
}
