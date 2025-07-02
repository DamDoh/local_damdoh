
"use client";

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2, Sparkles } from "lucide-react";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app as firebaseApp } from '@/lib/firebase/client';
import { useToast } from '@/hooks/use-toast';
import { useTranslations } from 'next-intl';

export default function CreateListingPage() {
    const router = useRouter();
    const { toast } = useToast();
    const t = useTranslations('Marketplace.create');

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuggesting, setIsSuggesting] = useState(false);
    
    const functions = getFunctions(firebaseApp);
    // const createListing = useMemo(() => httpsCallable(functions, 'createMarketplaceListing'), [functions]);
    const suggestMarketPrice = useMemo(() => httpsCallable(functions, 'suggestMarketPrice'), [functions]);

    const handleSuggestPrice = async () => {
        if (!name.trim()) {
            toast({
                title: t('errors.productNameMissing.title'),
                description: t('errors.productNameMissing.description'),
                variant: "destructive",
            });
            return;
        }
        setIsSuggesting(true);
        try {
            const result = await suggestMarketPrice({ productName: name, description });
            const suggestedPrice = result.data as { price: string };
            setPrice(suggestedPrice.price);
            toast({
                title: t('success.priceSuggestion.title'),
                description: t('success.priceSuggestion.description'),
            });
        } catch (error) {
            console.error("Error suggesting price:", error);
            toast({
                title: t('errors.priceSuggestion.title'),
                description: t('errors.priceSuggestion.description'),
                variant: "destructive",
            });
        } finally {
            setIsSuggesting(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // Placeholder for submission logic
        console.log("Submitting:", { name, description, price });
        // try {
        //     await createListing({ name, description, price });
        //     toast({ title: "Listing created!" });
        //     router.push('/marketplace');
        // } catch (error) {
        //     toast({ title: "Error creating listing", variant: "destructive" });
        // }
    };

    return (
        <div className="container mx-auto max-w-2xl py-8">
            <Link href="/marketplace" className="flex items-center text-sm text-muted-foreground hover:underline mb-4">
                <ArrowLeft className="h-4 w-4 mr-1" />
                {t('backLink')}
            </Link>
            
            <form onSubmit={handleSubmit}>
                <Card>
                    <CardHeader>
                        <CardTitle>{t('title')}</CardTitle>
                        <CardDescription>{t('description')}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="product-name">{t('form.nameLabel')}</Label>
                            <Input 
                                id="product-name" 
                                placeholder={t('form.namePlaceholder')} 
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="product-description">{t('form.descriptionLabel')}</Label>
                            <Textarea 
                                id="product-description"
                                placeholder={t('form.descriptionPlaceholder')}
                                className="min-h-[100px]"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="price">{t('form.priceLabel')}</Label>
                            <div className="flex items-center gap-2">
                                <Input 
                                    id="price" 
                                    type="number"
                                    placeholder={t('form.pricePlaceholder')} 
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                    required
                                    className="flex-grow"
                                />
                                <Button type="button" variant="outline" onClick={handleSuggestPrice} disabled={isSuggesting || !name.trim()}>
                                    {isSuggesting ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                        <Sparkles className="mr-2 h-4 w-4" />
                                    )}
                                    {t('form.suggestPriceButton')}
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? t('form.submittingButton') : t('form.submitButton')}
                        </Button>
                    </CardFooter>
                </Card>
            </form>
        </div>
    );
}
