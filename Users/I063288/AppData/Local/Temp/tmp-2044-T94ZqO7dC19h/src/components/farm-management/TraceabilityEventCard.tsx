
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from 'date-fns';
import { Eye, HardHat, Package, CheckCircle, GitBranch, Truck, Sprout, Droplets, Weight } from 'lucide-react';
import type { FarmingAssistantOutput, TraceabilityEvent } from '@/lib/types';
import { useTranslations } from "next-intl";

const getEventIcon = (eventType: string) => {
    const iconProps = { className: "h-5 w-5" };
    switch (eventType) {
        case 'PLANTED': return <Sprout {...iconProps} />;
        case 'OBSERVED': return <Eye {...iconProps} />;
        case 'INPUT_APPLIED': return <Droplets {...iconProps} />;
        case 'HARVESTED': return <Weight {...iconProps} />;
        case 'PACKAGED': return <Package {...iconProps} />;
        case 'VERIFIED': return <CheckCircle {...iconProps} />;
        case 'TRANSPORTED': return <Truck {...iconProps} />;
        default: return <HardHat {...iconProps} />;
    }
};

const EventPayload = ({ payload }: { payload: any }) => {
    const t = useTranslations('farmManagement.cropDetailPage');
    
    if (!payload || typeof payload !== 'object' || Object.keys(payload).length === 0) {
        return <p className="text-xs text-muted-foreground italic">{t('eventPayload.noDetails')}</p>;
    }
    
    if (payload.aiAnalysis && typeof payload.aiAnalysis === 'object') {
        const analysis = payload.aiAnalysis as FarmingAssistantOutput;
        return (
            <div className="text-sm text-muted-foreground space-y-2 mt-2 p-2 bg-background rounded-md">
                <p><strong>{t('eventPayload.observationType')}:</strong> {payload.observationType}</p>
                <p><strong>{t('eventPayload.details')}:</strong> {payload.details}</p>
                <div className="mt-2 pt-2 border-t border-dashed">
                    <h5 className="font-semibold text-foreground text-sm">{t('eventPayload.aiDiagnosis')}</h5>
                    <p className="text-sm">{analysis.summary}</p>
                </div>
            </div>
        )
    }

    return (
        <ul className="space-y-1 text-muted-foreground text-xs list-disc list-inside">
            {Object.entries(payload).map(([key, value]) => {
                if (typeof value === 'object' && value !== null) return null;
                const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                return <li key={key} className="truncate"><strong>{formattedKey}:</strong> {String(value)}</li>
            })}
        </ul>
    );
};


export function TraceabilityEventCard({ event }: { event: TraceabilityEvent }) {
    return (
        <div className="relative flex items-start gap-4 pb-8">
            <div className="absolute left-0 top-0 h-full flex flex-col items-center">
                <span className="bg-background p-1.5 rounded-full border-2 border-primary flex items-center justify-center text-primary z-10">
                    {getEventIcon(event.eventType)}
                </span>
            </div>
            <div className="pl-14 w-full">
                <Card className="shadow-sm">
                    <CardHeader className="p-3">
                        <CardTitle className="text-base">{event.eventType.replace(/_/g, ' ')}</CardTitle>
                        <CardDescription className="text-xs">{format(new Date(event.timestamp), 'PPpp')}</CardDescription>
                    </CardHeader>
                    <CardContent className="p-3 pt-0">
                        <EventPayload payload={event.payload} />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
