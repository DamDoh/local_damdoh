
"use client";

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import Link from 'next/link';
import { useRouter } from '@/navigation';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app as firebaseApp } from '@/lib/firebase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/auth-utils';
import { useTranslations } from 'next-intl';

export default function CreateGroupPage() {
    const t = useTranslations('groupsPage.create');
    const router = useRouter();
    const { user } = useAuth();
    const { toast } = useToast();
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [isPublic, setIsPublic] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const functions = getFunctions(firebaseApp);
    const createGroupCallable = useMemo(() => httpsCallable(functions, 'createGroup'), [functions]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
             toast({ title: t('toast.auth.title'), description: t('toast.auth.description'), variant: "destructive" });
             router.push('/auth/signin');
             return;
        }

        if (!name.trim() || !description.trim()) {
            toast({
                title: t('toast.incomplete.title'),
                description: t('toast.incomplete.description'),
                variant: "destructive",
            });
            return;
        }
        setIsSubmitting(true);

        try {
            const result = await createGroupCallable({ name, description, isPublic });
            const groupId = (result.data as { groupId: string }).groupId;
            toast({
                title: t('toast.success.title'),
                description: t('toast.success.description'),
            });
            router.push(`/groups/${groupId}`);
        } catch (error: any) {
            console.error("Error creating group:", error);
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
            <Link href="/groups" className="flex items-center text-sm text-muted-foreground hover:underline mb-4">
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
                            <Label htmlFor="group-name">{t('form.nameLabel')}</Label>
                            <Input 
                                id="group-name" 
                                placeholder={t('form.namePlaceholder')} 
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                disabled={isSubmitting}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="group-description">{t('form.descriptionLabel')}</Label>
                            <Textarea 
                                id="group-description"
                                placeholder={t('form.descriptionPlaceholder')}
                                className="min-h-[100px]"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                required
                                disabled={isSubmitting}
                            />
                        </div>
                        <div className="flex items-center space-x-2">
                            <Switch 
                                id="is-public" 
                                checked={isPublic}
                                onCheckedChange={setIsPublic}
                                disabled={isSubmitting}
                            />
                            <Label htmlFor="is-public">{t('form.publicLabel')}</Label>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                            {isSubmitting ? t('form.submittingButton') : <><Save className="mr-2 h-4 w-4" />{t('form.submitButton')}</>}
                        </Button>
                    </CardFooter>
                </Card>
            </form>
        </div>
    );
}
