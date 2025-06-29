
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
import { useRouter } from 'next/navigation';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app as firebaseApp } from '@/lib/firebase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/auth-utils';
import { useTranslation } from 'react-i18next';

export default function CreateGroupPage() {
    const { t } = useTranslation('common');
    const router = useRouter();
    const { user } = useAuth();
    const { toast } = useToast();
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [isPublic, setIsPublic] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const functions = getFunctions(firebaseApp);
    const createGroup = useMemo(() => httpsCallable(functions, 'createGroup'), [functions]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
             toast({ title: t('groups.create.authErrorTitle'), variant: "destructive" });
             router.push('/auth/signin');
             return;
        }

        if (!name.trim() || !description.trim()) {
            toast({
                title: t('groups.create.incompleteErrorTitle'),
                description: t('groups.create.incompleteErrorDescription'),
                variant: "destructive",
            });
            return;
        }
        setIsSubmitting(true);

        try {
            const result = await createGroup({ name, description, isPublic });
            const groupId = (result.data as { groupId: string }).groupId;
            toast({
                title: t('groups.create.successTitle'),
                description: t('groups.create.successDescription'),
            });
            router.push(`/groups/${groupId}`);
        } catch (error: any) {
            console.error("Error creating group:", error);
            toast({
                title: t('groups.create.failTitle'),
                description: error.message || t('groups.create.failDescription'),
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
                {t('groups.create.backButton')}
            </Link>
            <form onSubmit={handleSubmit}>
                <Card>
                    <CardHeader>
                        <CardTitle>{t('groups.create.title')}</CardTitle>
                        <CardDescription>{t('groups.create.description')}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="group-name">{t('groups.create.nameLabel')}</Label>
                            <Input 
                                id="group-name" 
                                placeholder={t('groups.create.namePlaceholder')} 
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                disabled={isSubmitting}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="group-description">{t('groups.create.descriptionLabel')}</Label>
                            <Textarea 
                                id="group-description"
                                placeholder={t('groups.create.descriptionPlaceholder')}
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
                            <Label htmlFor="is-public">{t('groups.create.publicLabel')}</Label>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                            {isSubmitting ? t('groups.create.submittingButton') : t('groups.create.submitButton')}
                        </Button>
                    </CardFooter>
                </Card>
            </form>
        </div>
    );
}
