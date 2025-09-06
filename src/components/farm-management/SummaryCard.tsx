
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from 'next/link';
import { Button } from "../ui/button";

interface SummaryCardProps {
    title: string;
    count: number;
    icon: React.ReactNode;
    link: string;
}

export const SummaryCard = ({ title, count, icon, link }: SummaryCardProps) => {
    return (
        <Card className="flex flex-col">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow flex justify-between items-end">
                <p className="text-3xl font-bold">{count}</p>
                <div className="text-muted-foreground">
                    {icon}
                </div>
            </CardContent>
            <CardContent>
                <Button asChild variant="outline" size="sm" className="w-full">
                    <Link href={link}>
                        View All
                    </Link>
                </Button>
            </CardContent>
        </Card>
    );
};

    