
"use client";

import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Leaf, Briefcase, PackageIcon } from "lucide-react";
import type { MarketplaceItem } from "@/lib/types";
import { useTranslation } from "react-i18next";

export const ItemCard = ({ item, reason }: { item: MarketplaceItem, reason?: string }) => {
    const { t } = useTranslation('common');

    return (
        <Card className="rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-200 flex flex-col group">
        <Link href={`/marketplace/${item.id}`} className="block">
            <div className="relative w-full aspect-[4/3]">
            <Image 
                src={item.imageUrl || "https://placehold.co/400x300.png"} alt={item.name} fill
                sizes="(max-width: 640px) 50vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                data-ai-hint={item.dataAiHint || `${item.category.split('-')[0]} agricultural`}
            />
            <div className="absolute top-2 right-2 flex flex-col gap-1.5 items-end">
                <Badge variant="secondary" className="py-1 px-2 text-xs flex items-center capitalize shadow-md">
                {item.listingType === 'Product' ? <PackageIcon className="h-3 w-3 mr-1" /> : <Briefcase className="h-3 w-3 mr-1" />}
                {t(`marketplacePage.${item.listingType.toLowerCase()}s`)}
                </Badge>
                {item.isSustainable && (
                <Badge variant="default" className="bg-green-600 hover:bg-green-700 text-white py-1 px-2 text-xs shadow-md">
                    <Leaf className="h-3 w-3 mr-1" />{t('itemDetailPage.sustainableLabel')}
                </Badge>
                )}
            </div>
            </div>
        </Link>
        <CardContent className="p-3 flex flex-col flex-grow">
            <Badge variant="outline" className="text-xs w-fit py-0.5 px-1.5 capitalize mb-2">{t(`categories.${item.category}`, item.category.replace(/-/g, ' '))}</Badge>
            <Link href={`/marketplace/${item.id}`} className="block mb-1">
            <h3 className="text-sm font-semibold text-foreground hover:text-primary transition-colors line-clamp-2 h-10">
                {item.name}
            </h3>
            </Link>
            {reason && <p className="text-[11px] text-muted-foreground/80 italic line-clamp-2 h-7" title={reason}>✨ {reason}</p>}
            <div className="mt-auto">
            <div className="flex items-center text-xs text-muted-foreground my-2">
                <MapPin className="h-3.5 w-3.5 mr-1.5 shrink-0" />
                <span className="truncate">{item.location}</span>
            </div>
            {item.listingType === 'Product' ? (
                <div className="text-lg font-bold text-primary">
                {item.price ? `${item.currency} ${item.price.toFixed(2)}` : t('itemDetailPage.inquireLabel')}
                {item.perUnit && <span className="text-xs text-muted-foreground font-normal ml-1.5">{item.perUnit}</span>}
                </div>
            ) : (
                item.compensation && <p className="text-sm font-medium text-primary line-clamp-1">{item.compensation}</p>
            )}
            </div>
        </CardContent>
        <CardFooter className="p-3 border-t">
            <Button asChild className="w-full h-9 text-xs" variant="outline">
            <Link href={`/marketplace/${item.id}`}>{t('itemCard.viewDetailsButton')}</Link>
            </Button>
        </CardFooter>
        </Card>
    );
};
