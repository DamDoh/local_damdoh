
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info, CheckCircle, AlertCircle, ShieldCheck, Award } from "lucide-react";
import { useTranslations } from "next-intl";

interface ScoreComponent {
    name: 'Character' | 'Capacity' | 'Capital' | 'Collateral' | 'Conditions';
    score: number;
    weight: number;
    factors: string[];
}

interface TrustScoreWidgetProps {
    reputationScore: number;
    riskFactors: ScoreComponent[]; // Updated to expect the breakdown
    certifications: {
        id: string;
        name: string;
        issuingBody: string;
    }[];
}

export const TrustScoreWidget = ({ reputationScore, riskFactors, certifications }: TrustScoreWidgetProps) => {
    const t = useTranslations('FarmerDashboard.trustWidget');
    
    const getScoreColor = (score: number, maxScore: number = 100) => {
        const percentage = (score / maxScore) * 100;
        if (percentage >= 75) return "bg-green-500";
        if (percentage >= 40) return "bg-yellow-500";
        return "bg-red-500";
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
                <div className="text-center p-4 border rounded-lg bg-background/50">
                    <p className="text-sm font-medium text-muted-foreground">{t('creditScore')}</p>
                    <p className={`text-4xl font-bold ${getScoreColor(reputationScore)}`}>{reputationScore}</p>
                    <Progress value={reputationScore > 100 ? 100 : reputationScore} className="mt-2 h-2" indicatorClassName={getScoreColor(reputationScore)} />
                </div>
                 <div>
                    <h4 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
                        <Info className="h-4 w-4" />
                        {t('keyFactorsTitle')}
                    </h4>
                    <div className="space-y-3">
                        {riskFactors && riskFactors.length > 0 ? (
                            riskFactors.map((component) => (
                                <div key={component.name} className="text-xs">
                                     <div className="flex justify-between items-center mb-1">
                                        <p className="font-semibold">{t(component.name.toLowerCase() as any)} <span className="text-muted-foreground">({t('weight', { weight: component.weight })})</span></p>
                                        <Badge variant="outline" className={getScoreColor(component.score, component.weight).replace('bg-', 'border-').replace('-500', '/50')}>{component.score}/{component.weight}</Badge>
                                    </div>
                                    <Progress value={(component.score / component.weight) * 100} className="h-1.5" indicatorClassName={getScoreColor(component.score, component.weight)} />
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
                        {certifications && certifications.length > 0 ? (
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
