
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Heart, ArrowLeft, Shield, CheckCircle, Droplets, Leaf } from "lucide-react";
import { useTranslations } from "next-intl";
import React from "react";

interface FgwPrinciple {
  id: string;
  title: string;
  icon: React.ReactElement;
  summary: string;
  howTo: string[];
  whyItWorks: string[];
  imageSrc: string;
  imageAlt: string;
  dataAiHint: string;
}

export default function FgwGuidePage() {
  const t = useTranslations('farmManagement.fgwGuidePage');
  
  const fgwPrinciples: FgwPrinciple[] = t.tm('principles');

  return (
    <div className="space-y-6">
      <Button asChild variant="outline" className="mb-4">
        <Link href="/farm-management">
          <ArrowLeft className="mr-2 h-4 w-4" /> {t('backLink')}
        </Link>
      </Button>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Heart className="h-8 w-8 text-primary" />
            <div>
              <CardTitle className="text-2xl md:text-3xl">{t('title')}</CardTitle>
              <CardDescription className="text-md">
                {t('description')}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            {t('intro')}
          </p>
          
          <Accordion type="single" collapsible className="w-full" defaultValue="no-tillage">
            {fgwPrinciples.map((principle) => (
              <AccordionItem value={principle.id} key={principle.id}>
                <AccordionTrigger className="text-lg hover:no-underline py-3">
                  <div className="flex items-center gap-3 text-left">
                    {principle.icon && React.createElement(
                        { 'Shield': Shield, 'Leaf': Leaf, 'CheckCircle': CheckCircle, 'Droplets': Droplets }[principle.icon as any] || Shield, 
                        { className: "h-5 w-5 text-primary" }
                    )}
                    {principle.title}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-1 pb-3 space-y-4 text-muted-foreground">
                  <p className="font-medium text-foreground/90">{principle.summary}</p>
                   <div className="grid md:grid-cols-2 gap-4 items-start">
                      <div className="space-y-3">
                         <div>
                            <h4 className="font-semibold text-foreground/90 text-md mb-1">{t('howToTitle')}</h4>
                            <ul className="list-disc list-inside text-sm space-y-1">
                                {principle.howTo.map((step, index) => <li key={index}>{step}</li>)}
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold text-foreground/90 text-md mb-1">{t('whyItWorksTitle')}</h4>
                            <ul className="list-disc list-inside text-sm space-y-1">
                                {principle.whyItWorks.map((reason, index) => <li key={index}>{reason}</li>)}
                            </ul>
                        </div>
                      </div>
                       <div className="relative aspect-video md:aspect-auto md:h-full rounded-md overflow-hidden my-2">
                           <Image src={principle.imageSrc} alt={principle.imageAlt} fill={true} style={{objectFit:"cover"}} data-ai-hint={principle.dataAiHint}/>
                        </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}

