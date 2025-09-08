
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ShieldCheck, Award, Star, Info } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface TrustScoreWidgetProps {
    reputationScore: number;
    riskFactors: string[];
    certifications: {
        id: string;
        name: string;
        issuingBody: string;
    }[];
}

export const TrustScoreWidget = ({ reputationScore, riskFactors, certifications }: TrustScoreWidgetProps) => {
    const t = useTranslations('FarmerDashboard.trustWidget');
    
    const getScoreColor = (score: number) => {
        if (score >= 750) return "text-green-600";
        if (score >= 600) return "text-yellow-500";
        return "text-red-500";
    };
    
    return (
        <Card className="bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/30 dark:to-blue-900/30">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                    <ShieldCheck className="h-5 w-5 text-primary" />
                    {t('title')}
                </CardTitle>
                <CardDescription>{t('description')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="text-center">
                    <p className="text-xs text-muted-foreground">{t('creditScore')}</p>
                    <p className={`text-4xl font-bold ${getScoreColor(reputationScore)}`}>{reputationScore}</p>
                </div>
                 <div>
                    <h4 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
                        <Info className="h-4 w-4" />
                        {t('keyFactorsTitle')}
                    </h4>
                    <div className="space-y-2">
                        {riskFactors.length > 0 ? (
                            riskFactors.map((factor, index) => (
                                <div key={index} className="text-xs p-2 bg-background/50 rounded-md border">
                                    <p className="text-muted-foreground">{factor}</p>
                                </div>
                            ))
                        ) : (
                            <p className="text-xs text-muted-foreground text-center py-2">{t('noFactors')}</p>
                        )}
                    </div>
                </div>
                <div>
                    <h4 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
                        <Award className="h-4 w-4" />
                        {t('certificationsTitle')}
                    </h4>
                    <div className="space-y-2">
                        {certifications.length > 0 ? (
                            certifications.map(cert => (
                                <div key={cert.id} className="text-xs p-2 bg-background/50 rounded-md border">
                                    <p className="font-medium">{cert.name}</p>
                                    <p className="text-muted-foreground">{t('issuedBy')}: {cert.issuingBody}</p>
                                </div>
                            ))
                        ) : (
                            <p className="text-xs text-muted-foreground text-center py-2">{t('noCertifications')}</p>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
