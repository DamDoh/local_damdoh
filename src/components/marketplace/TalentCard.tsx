
"use client";

import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { MarketplaceItem } from "@/lib/types";
import { cn } from "@/lib/utils";
import { MapPin, Briefcase, Star, DollarSign } from "lucide-react";
import { useTranslations } from "next-intl";

interface TalentCardProps {
    item: MarketplaceItem;
    className?: string;
}

export function TalentCard({ item, className }: TalentCardProps) {
    const t = useTranslations('talentExchangePage');
    
    // Robustly handle skillsRequired, which might be an array, a string, or undefined.
    const skills: string[] = Array.isArray(item.skillsRequired)
        ? item.skillsRequired
        : (typeof item.skillsRequired === 'string' && item.skillsRequired)
            ? item.skillsRequired.split(',').map(s => s.trim())
            : [];

    return (
        <Card className={cn("flex flex-col h-full hover:shadow-lg transition-shadow", className)}>
             <CardHeader className="flex-row items-center gap-4">
                 {/* In a real app, you'd fetch the seller's profile to get their avatar */}
                <Avatar className="h-14 w-14 border">
                    <AvatarImage src={"https://placehold.co/100x100.png"} alt={item.sellerId} />
                    <AvatarFallback>{item.sellerId.substring(0, 1)}</AvatarFallback>
                </Avatar>
                <div>
                     <Link href={`/marketplace/${item.id}`} className="hover:text-primary">
                        <CardTitle className="text-md font-semibold leading-tight">{item.name}</CardTitle>
                    </Link>
                    <CardDescription className="text-xs">{item.location}</CardDescription>
                </div>
            </CardHeader>
            <CardContent className="flex-grow p-4 pt-0 space-y-2">
                <p className="text-sm text-muted-foreground h-16 line-clamp-3">{item.description}</p>
                {skills.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                        {skills.slice(0, 4).map((skill, index) => (
                            <Badge key={index} variant="secondary">{skill}</Badge>
                        ))}
                    </div>
                )}
            </CardContent>
            <CardFooter className="flex-col items-start gap-3 p-4 pt-2">
                 {item.compensation && (
                    <div className="text-sm font-semibold flex items-center gap-1.5">
                        <DollarSign className="h-4 w-4 text-primary" />
                        <span>{item.compensation}</span>
                    </div>
                 )}
                 {item.experienceLevel && (
                     <div className="text-sm font-semibold flex items-center gap-1.5">
                        <Star className="h-4 w-4 text-primary" />
                        <span>{item.experienceLevel}</span>
                    </div>
                 )}
                <Button asChild className="w-full">
                    <Link href={`/marketplace/${item.id}`}>{t('viewServiceButton')}</Link>
                </Button>
            </CardFooter>
        </Card>
    );
}
