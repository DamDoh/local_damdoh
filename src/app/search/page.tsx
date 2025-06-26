
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search as SearchIcon } from "lucide-react";
import { UniversalSearchModal } from '@/components/layout/UniversalSearchModal';

export default function SearchPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [initialQuery, setInitialQuery] = useState("");

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            setInitialQuery(searchQuery);
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
                            <CardTitle className="text-4xl">Search DamDoh</CardTitle>
                        </div>
                        <CardDescription className="text-lg">
                            Find products, services, stakeholders, or ask our AI assistant.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="max-w-xl mx-auto">
                        <form onSubmit={handleSearchSubmit} className="flex gap-2">
                            <Input
                                type="search"
                                placeholder="What are you looking for?"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="h-12 text-lg"
                                autoFocus
                            />
                            <Button type="submit" size="lg" disabled={!searchQuery.trim()}>
                                <SearchIcon className="mr-2 h-5 w-5" />
                                Search
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                 <Card>
                    <CardHeader>
                        <CardTitle>Popular Searches</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-wrap gap-2">
                         {['Organic Fertilizer', 'Coffee Beans', 'Logistics Kenya', 'Soil Health', 'Tractor Rental'].map(term => (
                             <Button key={term} variant="outline" onClick={() => {
                                 setInitialQuery(term);
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
                initialQuery={initialQuery}
            />
        </>
    );
}
