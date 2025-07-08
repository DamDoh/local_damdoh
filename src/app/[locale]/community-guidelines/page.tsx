
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, ShieldCheck, MessageCircle, ThumbsUp, Handshake, Leaf } from "lucide-react";
import { useTranslations } from "next-intl";

export default function CommunityGuidelinesPage() {
  const t = useTranslations('communityGuidelines');
  
  const guidelines = [
    { 
      icon: <ThumbsUp className="h-6 w-6 text-primary"/>, 
      title: t('respectful.title'), 
      description: t('respectful.description') 
    },
    { 
      icon: <ShieldCheck className="h-6 w-6 text-primary"/>, 
      title: t('authentic.title'), 
      description: t('authentic.description')
    },
    { 
      icon: <MessageCircle className="h-6 w-6 text-primary"/>, 
      title: t('relevant.title'), 
      description: t('relevant.description') 
    },
    { 
      icon: <Handshake className="h-6 w-6 text-primary"/>, 
      title: t('fairTrade.title'), 
      description: t('fairTrade.description')
    },
    { 
      icon: <Leaf className="h-6 w-6 text-primary"/>, 
      title: t('sustainable.title'), 
      description: t('sustainable.description')
    },
  ];

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader className="text-center">
          <div className="inline-flex items-center justify-center gap-2 mb-2">
            <Users className="h-10 w-10 text-primary" />
            <CardTitle className="text-4xl">{t('title')}</CardTitle>
          </div>
          <CardDescription className="text-lg">
            {t('subtitle')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8 text-muted-foreground">
          <p className="text-center">
            {t('intro')}
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
            <h3 className="text-xl font-semibold text-foreground mb-2">{t('reporting.title')}</h3>
            <div className="mb-3">
              {t.rich('reporting.content', {
                emailLink: (chunks) => <a href="mailto:support@damdoh.org" className="text-primary hover:underline">{chunks}</a>
              })}
            </div>
            <p>
              {t('conclusion')}
            </p>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
