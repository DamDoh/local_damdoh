
"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search as SearchIcon } from "lucide-react";
import { UniversalSearchModal } from '@/components/layout/UniversalSearchModal';
import { useTranslations } from 'next-intl';

export default function SearchPage() {
    const t = useTranslations('searchPage');
    const [searchQuery, setSearchQuery] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [initialModalQuery, setInitialModalQuery] = useState("");

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            setInitialModalQuery(searchQuery);
            setIsModalOpen(true);
        }
    };

    return (
        <>
            <div className="space-y-8">
                <Card>
                    <CardHeader className="text-center">
                        <div className="inline-flex items-center justify-center gap-2 mb-2">
                            <SearchIcon className="h-10 w-10 text-primary" />
                            <CardTitle className="text-4xl">{t('title')}</CardTitle>
                        </div>
                        <CardDescription className="text-lg">
                            {t('description')}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="max-w-xl mx-auto">
                        <form onSubmit={handleSearchSubmit} className="flex gap-2">
                            <Input
                                type="search"
                                placeholder={t('placeholder')}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="h-12 text-lg"
                                autoFocus
                            />
                            <Button type="submit" size="lg" disabled={!searchQuery.trim()}>
                                <SearchIcon className="mr-2 h-5 w-5" />
                                {t('searchButton')}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                 <Card>
                    <CardHeader>
                        <CardTitle>{t('popularSearches')}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-wrap gap-2">
                         {[t('popularSearch1'), t('popularSearch2'), t('popularSearch3'), t('popularSearch4'), t('popularSearch5')].map(term => (
                             <Button key={term} variant="outline" onClick={() => {
                                 setInitialModalQuery(term);
                                 setIsModalOpen(true);
                             }}>
                                {term}
                            </Button>
                         ))}
                    </CardContent>
                </Card>
            </div>
            
            <UniversalSearchModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                initialQuery={initialModalQuery}
            />
        </>
    );
}
