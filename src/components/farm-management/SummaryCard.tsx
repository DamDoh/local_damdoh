
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from 'next/link';

interface SummaryCardProps {
    title: string;
    count: number;
    icon: React.ReactNode;
    link: string;
}

export const SummaryCard = ({ title, count, icon, link }: SummaryCardProps) => {
    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex justify-between items-end">
                    <div>
                        <p className="text-3xl font-bold">{count}</p>
                         <Link href={link} className="text-xs text-muted-foreground hover:underline">
                            View All
                        </Link>
                    </div>
                     <div className="text-muted-foreground">
                        {icon}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
