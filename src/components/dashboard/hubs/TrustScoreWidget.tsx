
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ShieldCheck, Award, Star } from "lucide-react";

interface TrustScoreWidgetProps {
    reputationScore: number;
    certifications: {
        id: string;
        name: string;
        issuingBody: string;
    }[];
}

export const TrustScoreWidget = ({ reputationScore, certifications }: TrustScoreWidgetProps) => {
    return (
        <Card className="bg-gradient-to-br from-green-50 to-blue-50">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                    <ShieldCheck className="h-5 w-5 text-primary" />
                    Trust & Reputation
                </CardTitle>
                <CardDescription>Your verifiable credentials and platform standing.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="text-center">
                    <p className="text-xs text-muted-foreground">Reputation Score</p>
                    <p className="text-4xl font-bold text-primary">{reputationScore}</p>
                </div>
                <div>
                    <h4 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
                        <Award className="h-4 w-4" />
                        Verifiable Certifications
                    </h4>
                    <div className="space-y-2">
                        {certifications.length > 0 ? (
                            certifications.map(cert => (
                                <div key={cert.id} className="text-xs p-2 bg-background/50 rounded-md border">
                                    <p className="font-medium">{cert.name}</p>
                                    <p className="text-muted-foreground">Issued by: {cert.issuingBody}</p>
                                </div>
                            ))
                        ) : (
                            <p className="text-xs text-muted-foreground text-center py-2">No certifications listed.</p>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
