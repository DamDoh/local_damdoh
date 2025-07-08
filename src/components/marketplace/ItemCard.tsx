
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { MarketplaceItem, ServiceItem } from "@/lib/types";
import { cn, withIcon } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { Briefcase, DollarSign } from "lucide-react";

interface ItemCardProps {
    item: MarketplaceItem;
    reason?: string;
    className?: string;
}

export function ItemCard({ item, reason, className }: ItemCardProps) {
    const t = useTranslations('Marketplace');
    const isService = item.listingType === 'Service';

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
                    <Image
                        src={item.imageUrl || (Array.isArray(item.imageUrls) && item.imageUrls[0]) || 'https://placehold.co/600x400.png'}
                        alt={item.name}
                        width={300}
                        height={200}
                        className="w-full h-40 object-cover rounded-t-lg hover:opacity-90 transition-opacity"
                        data-ai-hint="marketplace item"
                    />
                </Link>
            </CardHeader>
            <CardContent className="flex-grow p-3 space-y-1">
                <Link href={`/marketplace/${item.id}`} className="hover:text-primary">
                    <CardTitle className="text-sm font-semibold line-clamp-2 leading-tight h-10">{item.name}</CardTitle>
                </Link>
                <CardDescription className="text-xs text-muted-foreground">{item.location}</CardDescription>
                
                <div className="text-md font-bold pt-1 flex items-center gap-1.5">
                    {isService ? <Briefcase className="h-4 w-4" /> : <DollarSign className="h-4 w-4" />}
                    {isService ? (
                        <span>{(item as ServiceItem).compensation || t('itemView.contactForRates')}</span>
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
                 {reason && <p className="text-xs text-blue-600 pt-1 italic">"{reason}"</p>}
            </CardContent>
            <CardFooter className="p-2 pt-0">
                <Button asChild size="sm" className="w-full">
                    <Link href={`/marketplace/${item.id}`} className="flex items-center justify-center gap-2">
                        {isService ? "View Service" : t('viewDetails')}
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    );
}
