
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import Link from 'next/link';
import { Button } from "../ui/button";
import { ArrowRight } from "lucide-react";

interface StatCardProps {
    title: string;
    value: string | number;
    icon?: React.ReactNode;
    isCurrency?: boolean;
    link: string;
    ctaText: string;
}

export const StatCard = ({ title, value, icon, isCurrency, link, ctaText }: StatCardProps) => {
    const formattedValue = isCurrency ? `$${Number(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : value;

    return (
        <Card className="flex flex-col">
            <CardHeader className="pb-2">
                 <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
                    {icon}
                 </div>
            </CardHeader>
            <CardContent className="flex-grow">
                <p className="text-3xl font-bold">{formattedValue}</p>
            </CardContent>
            <CardFooter className="pt-0">
                 <Button asChild variant="outline" size="sm" className="w-full">
                    <Link href={link}>{ctaText} <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
            </CardFooter>
        </Card>
    );
};
