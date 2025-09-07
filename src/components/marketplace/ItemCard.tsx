
"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { MarketplaceItem } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { Briefcase, DollarSign, Brain, Star } from "lucide-react";

interface ItemCardProps {
    item: MarketplaceItem;
    reason?: string;
    className?: string;
}

export function ItemCard({ item, reason, className }: ItemCardProps) {
    const t = useTranslations('Marketplace');
    const isService = item.listingType === 'Service';
    const isTourism = item.category === 'agri-tourism-services';

    return (
        <Card className={cn("flex flex-col h-full w-full max-w-sm hover:shadow-lg transition-shadow duration-200", className)}>
             <CardHeader className="p-0 relative">
                <Badge 
                    className={cn(
                        "absolute top-2 left-2 z-10",
                        isService ? "bg-blue-600" : "bg-green-600"
                    )}
                >
                    {item.listingType}
                </Badge>
                <Link href={`/marketplace/${item.id}`}>
                    <div className="relative w-full aspect-[4/3] bg-muted">
                        <Image
                            src={item.imageUrl || (Array.isArray(item.imageUrls) && item.imageUrls[0]) || 'https://placehold.co/400x300.png'}
                            alt={item.name}
                            fill
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                            className="object-cover rounded-t-lg hover:opacity-90 transition-opacity"
                            data-ai-hint="marketplace item"
                        />
                    </div>
                </Link>
            </CardHeader>
            <CardContent className="flex-grow p-3 space-y-1">
                <Link href={`/marketplace/${item.id}`} className="hover:text-primary">
                    <CardTitle className="text-sm font-semibold line-clamp-2 leading-tight h-10">{item.name}</CardTitle>
                </Link>
                <CardDescription className="text-xs text-muted-foreground">{item.location?.address}</CardDescription>
                
                <div className="text-md font-bold pt-1 flex items-center gap-1.5">
                    {isService ? <Briefcase className="h-4 w-4" /> : <DollarSign className="h-4 w-4" />}
                    
                    {isService && !isTourism ? (
                        <span className="text-sm">{(item as any).compensation || t('itemView.contactForRates')}</span>
                    ) : (
                        <span>
                            {typeof item.price === 'number' ? (
                                <>
                                    ${item.price.toFixed(2)} 
                                    {item.perUnit && <span className="text-xs font-normal text-muted-foreground"> / {item.perUnit}</span>}
                                </>
                            ) : (
                                "Contact for price"
                            )}
                        </span>
                    )}
                </div>
                 {isService && !isTourism && (item as any).experienceLevel && (
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <Star className="h-3 w-3" />
                        <span>{(item as any).experienceLevel}</span>
                    </div>
                )}
                 {reason && (
                    <div className="text-xs text-blue-700 dark:text-blue-300 pt-1 italic flex items-start gap-1.5">
                       <Brain className="h-4 w-4 shrink-0 mt-0.5"/>
                       <span>{reason}</span>
                    </div>
                )}
            </CardContent>
            <CardFooter className="p-2 pt-0">
                <Button asChild size="sm" className="w-full">
                    <Link href={`/marketplace/${item.id}`} className="flex items-center justify-center gap-2">
                        {isService ? t('viewServiceButton') : t('itemView.viewDetails')}
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    );
}
