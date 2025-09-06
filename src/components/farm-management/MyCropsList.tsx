
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format, formatDistanceToNow } from 'date-fns';
import { Badge } from '../ui/badge';
import Link from 'next/link';

interface Crop {
    id: string;
    name: string;
    farmId: string;
    farmName: string;
    stage: string;
    plantingDate: string | null;
}

interface MyCropsListProps {
  crops: Crop[];
}

export const MyCropsList = ({ crops }: MyCropsListProps) => {
  return (
    <Card className="lg:col-span-3">
      <CardHeader>
        <CardTitle>My Crops</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {crops.length > 0 ? (
          crops.map((crop) => (
            <Link key={crop.id} href={`/farm-management/farms/${crop.farmId}/crops/${crop.id}`}>
              <div className="p-3 border rounded-lg hover:bg-accent transition-colors cursor-pointer">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{crop.name}</p>
                    <p className="text-xs text-muted-foreground">{crop.farmName}</p>
                  </div>
                  <Badge>{crop.stage}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Planted: {crop.plantingDate ? format(new Date(crop.plantingDate), 'PPP') : 'N/A'}</p>
              </div>
            </Link>
          ))
        ) : (
          <p className="text-center text-muted-foreground py-8">No active crops found.</p>
        )}
      </CardContent>
    </Card>
  );
};

    