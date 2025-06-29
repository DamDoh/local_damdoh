
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, ShieldCheck, MessageCircle, ThumbsUp, Handshake, Leaf } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function CommunityGuidelinesPage() {
  const { t } = useTranslation('common');

  const guidelines = [
    { 
      icon: <ThumbsUp className="h-6 w-6 text-primary"/>, 
      title: t('communityGuidelines.guideline1.title'), 
      description: t('communityGuidelines.guideline1.description') 
    },
    { 
      icon: <ShieldCheck className="h-6 w-6 text-primary"/>, 
      title: t('communityGuidelines.guideline2.title'), 
      description: t('communityGuidelines.guideline2.description')
    },
    { 
      icon: <MessageCircle className="h-6 w-6 text-primary"/>, 
      title: t('communityGuidelines.guideline3.title'), 
      description: t('communityGuidelines.guideline3.description')
    },
    { 
      icon: <Handshake className="h-6 w-6 text-primary"/>, 
      title: t('communityGuidelines.guideline4.title'), 
      description: t('communityGuidelines.guideline4.description')
    },
    { 
      icon: <Leaf className="h-6 w-6 text-primary"/>, 
      title: t('communityGuidelines.guideline5.title'), 
      description: t('communityGuidelines.guideline5.description')
    },
  ];

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader className="text-center">
          <div className="inline-flex items-center justify-center gap-2 mb-2">
            <Users className="h-10 w-10 text-primary" />
            <CardTitle className="text-4xl">{t('communityGuidelines.title')}</CardTitle>
          </div>
          <CardDescription className="text-lg">
            {t('communityGuidelines.subtitle')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8 text-muted-foreground">
          <p className="text-center">
            {t('communityGuidelines.intro')}
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {guidelines.map(guideline => (
              <div key={guideline.title} className="flex items-start gap-4 p-4 border rounded-lg shadow-sm bg-card">
                <div className="mt-1">{guideline.icon}</div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-1">{guideline.title}</h3>
                  <p className="text-sm">{guideline.description}</p>
                </div>
              </div>
            ))}
          </div>

          <section className="pt-4 text-center">
            <h3 className="text-xl font-semibold text-foreground mb-2">{t('communityGuidelines.reportingTitle')}</h3>
            <p className="mb-3">
              {t('communityGuidelines.reportingContent')} <a href={`mailto:${t('communityGuidelines.supportEmail')}`} className="text-primary hover:underline">{t('communityGuidelines.supportEmail')}</a>.
            </p>
            <p>
              {t('communityGuidelines.conclusion')}
            </p>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}

    