
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { MarketplaceItem } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

interface ItemCardProps {
    item: MarketplaceItem;
    reason?: string;
    className?: string;
}

export function ItemCard({ item, reason, className }: ItemCardProps) {
    const t = useTranslations('marketplacePage');

    return (
        <Card className={cn("flex flex-col h-full w-52 snap-start", className)}>
             <CardHeader className="p-0 relative">
                <Badge 
                    className={cn(
                        "absolute top-2 left-2 z-10",
                        item.listingType === 'Service' ? "bg-blue-600" : "bg-green-600"
                    )}
                >
                    {item.listingType}
                </Badge>
                <Link href={`/marketplace/${item.id}`}>
                    <Image
                        src={item.imageUrl || (Array.isArray(item.imageUrls) && item.imageUrls[0]) || 'https://placehold.co/600x400.png'}
                        alt={item.name}
                        width={300}
                        height={200}
                        className="w-full h-32 object-cover rounded-t-lg hover:opacity-90 transition-opacity"
                        data-ai-hint="marketplace item"
                    />
                </Link>
            </CardHeader>
            <CardContent className="flex-grow p-3 space-y-1">
                <Link href={`/marketplace/${item.id}`} className="hover:text-primary">
                    <CardTitle className="text-sm font-semibold line-clamp-2 leading-tight h-8">{item.name}</CardTitle>
                </Link>
                <CardDescription className="text-xs text-muted-foreground">{item.location}</CardDescription>
                {/* Safely handle optional price */}
                {typeof item.price === 'number' ? (
                    <p className="text-md font-bold pt-1">
                        ${item.price.toFixed(2)} 
                        {item.perUnit && <span className="text-xs font-normal text-muted-foreground"> / {item.perUnit}</span>}
                    </p>
                ) : (
                    <p className="text-sm font-semibold pt-1 text-muted-foreground">Contact for price</p>
                )}
                {reason && <p className="text-xs text-blue-500 pt-1 italic">"{reason}"</p>}
            </CardContent>
            <CardFooter className="p-2 pt-0">
                <Button asChild size="sm" className="w-full">
                    <Link href={`/marketplace/${item.id}`}>{t('viewDetails')}</Link>
                </Button>
            </CardFooter>
        </Card>
    );
}
