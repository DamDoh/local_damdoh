
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info, CheckCircle, AlertCircle } from "lucide-react";
import { useTranslations } from "next-intl";

interface ScoreComponent {
    name: 'Character' | 'Capacity' | 'Capital' | 'Collateral' | 'Conditions';
    score: number;
    weight: number;
    factors: string[];
}

interface CreditScorecardProps {
  score: number;
  breakdown: ScoreComponent[];
}

const getScoreColor = (score: number) => {
    if (score >= 70) return "bg-green-500";
    if (score >= 50) return "bg-yellow-500";
    return "bg-red-500";
};

const getComponentScoreColor = (score: number, weight: number) => {
    const percentage = (score / weight) * 100;
    if (percentage >= 75) return "bg-green-500";
    if (percentage >= 40) return "bg-yellow-500";
    return "bg-red-500";
}

export function CreditScorecard({ score, breakdown }: CreditScorecardProps) {
  const t = useTranslations('FiApplicationPage.scorecard');

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
        <CardDescription>{t('description')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center p-4 border rounded-lg bg-muted/50">
            <p className="text-sm font-medium text-muted-foreground">{t('overallScore')}</p>
            <p className={`text-5xl font-bold ${getScoreColor(score)}`}>{score}</p>
            <Progress value={score} className="mt-2 h-2" indicatorClassName={getScoreColor(score)} />
        </div>

        <div className="space-y-4">
            {breakdown.map(component => (
                <div key={component.name} className="p-3 border rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                        <p className="font-semibold">{t(component.name.toLowerCase() as any)} <span className="text-xs text-muted-foreground">({t('weight', { weight: component.weight })})</span></p>
                        <Badge variant="outline" className={getComponentScoreColor(component.score, component.weight).replace('bg-', 'border-').replace('-500', '/50')}>{component.score}/{component.weight}</Badge>
                    </div>
                    <ul className="space-y-1.5 text-xs">
                        {component.factors.map((factor, index) => (
                             <li key={index} className="flex items-start gap-2 text-muted-foreground">
                                {factor.toLowerCase().includes('negative') || factor.toLowerCase().includes('low') || factor.toLowerCase().includes('limited') ? <AlertCircle className="h-3.5 w-3.5 text-destructive mt-0.5 shrink-0"/> : <CheckCircle className="h-3.5 w-3.5 text-green-600 mt-0.5 shrink-0"/>}
                                <span>{factor}</span>
                             </li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>
      </CardContent>
    </Card>
  );
}
