
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import Link from 'next/link';

interface Crop {
    name: string;
    type: string;
    growthStage: string;
    growthPercent: number;
    healthMetrics: { name: string; value: number, color: string }[];
    imageUrl: string;
    dataAiHint?: string;
}

interface MyCropsListProps {
  crops: Crop[];
}

const HealthMetric = ({ name, value, color }: { name: string, value: number, color: string }) => (
    <div className="text-center">
        <p className="text-sm font-semibold" style={{ color }}>{value}%</p>
        <p className="text-xs text-muted-foreground">{name}</p>
    </div>
);

export const MyCropsList = ({ crops }: MyCropsListProps) => {
  return (
    <Card className="lg:col-span-3">
      <CardHeader>
        <CardTitle>My Crops</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {crops.map((crop, index) => (
          <div key={index} className="p-3 border rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12 rounded-lg">
                  <AvatarImage src={crop.imageUrl} alt={crop.name} data-ai-hint={crop.dataAiHint} />
                  <AvatarFallback>{crop.name.substring(0, 1)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{crop.name}</p>
                  <p className="text-xs text-muted-foreground">{crop.type}</p>
                   <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="text-xs text-green-600 flex items-center hover:underline">
                            Health Report <ChevronDown className="h-3 w-3 ml-1" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem>View Full Report</DropdownMenuItem>
                            <DropdownMenuItem>Request Analysis</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">{crop.growthStage}</p>
                <p className="text-sm font-semibold">{crop.growthPercent}%</p>
              </div>
            </div>
            <Progress value={crop.growthPercent} className="mt-2 h-1" />
            {crop.healthMetrics.length > 0 && (
                 <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t">
                    {crop.healthMetrics.map(metric => (
                        <HealthMetric key={metric.name} {...metric} />
                    ))}
                 </div>
            )}
          </div>
        ))}
        <div className="text-center">
             <Link href="/farm-management/farms" className="text-sm text-primary hover:underline">
                View All
            </Link>
        </div>
      </CardContent>
    </Card>
  );
};
