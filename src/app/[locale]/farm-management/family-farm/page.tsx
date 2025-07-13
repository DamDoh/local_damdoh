
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Home, ArrowLeft, LayoutGrid, Sprout, ShoppingBasket, Recycle, Fish, Bird, ShieldCheck, Heart } from "lucide-react";
import { useTranslations } from "next-intl";
import React from "react";

interface FarmZone {
  id: string;
  title: string;
  icon: string;
  imageSrc: string;
  imageAlt: string;
  dataAiHint: string;
  description: string[];
  details?: { title: string; content: string[] }[];
  subSections?: { title: string; content: string[] }[];
}

const DetailCard = ({ title, content }: { title: string, content: string[] }) => (
    <Card className="bg-background/50">
        <CardHeader className="p-3">
            <CardTitle className="text-sm">{title}</CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-0 text-xs text-muted-foreground">
            {content.map((text, i) => <p key={i}>{text}</p>)}
        </CardContent>
    </Card>
);

export default function FamilyFarmPage() {
  const t = useTranslations('farmManagement.familyFarmPage');

  const farmZones: FarmZone[] = t.tm('zones');

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
            <Home className="h-8 w-8 text-primary" />
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
          
          <div className="my-6">
            <Image 
                src="https://firebasestorage.googleapis.com/v0/b/damdoh-923bf.appspot.com/o/images%2F200sqm-farm-model-diagram.png?alt=media&token=65b4f9a4-d53b-49e3-8d74-3566d5f231a7" 
                alt="200sqm Integrated Family Farm Model Diagram"
                width={800}
                height={500}
                className="rounded-lg border shadow-md object-contain mx-auto"
                data-ai-hint="farm layout diagram"
            />
            <p className="text-center text-xs text-muted-foreground mt-2">{t('diagramCaption')}</p>
          </div>

          <Accordion type="single" collapsible className="w-full" defaultValue="overall-layout">
            {farmZones.map((zone) => (
              <AccordionItem value={zone.id} key={zone.id}>
                <AccordionTrigger className="text-lg hover:no-underline py-3">
                  <div className="flex items-center gap-3 text-left">
                    {zone.icon && React.createElement(
                        { 'LayoutGrid': LayoutGrid, 'Sprout': Sprout, 'ShoppingBasket': ShoppingBasket, 'Fish': Fish, 'Bird': Bird, 'Recycle': Recycle, 'ShieldCheck': ShieldCheck, 'Heart': Heart }[zone.icon as any] || LayoutGrid, 
                        { className: "h-5 w-5 text-primary" }
                    )}
                    {zone.title}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-1 pb-3 space-y-4 text-muted-foreground">
                  <div className="grid md:grid-cols-3 gap-6 items-start">
                    <div className="md:col-span-1 relative aspect-video md:aspect-square rounded-md overflow-hidden my-2">
                       <Image src={zone.imageSrc} alt={zone.imageAlt} fill={true} style={{objectFit:"cover"}} data-ai-hint={zone.dataAiHint}/>
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      {zone.description.map((desc, index) => (
                        <p key={index}>{desc}</p>
                      ))}
                    </div>
                  </div>
                  {zone.details && zone.details.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-semibold text-foreground/90 text-md mb-2">{t('detailsTitle')}</h4>
                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {zone.details.map((detail, index) => (
                          <DetailCard key={index} title={detail.title} content={detail.content} />
                        ))}
                      </div>
                    </div>
                  )}
                  {zone.subSections && zone.subSections.length > 0 && (
                     <div className="mt-4">
                        <h4 className="font-semibold text-foreground/90 text-md mb-2">{t('principlesTitle')}</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {zone.subSections.map((sub, idx) => (
                               <DetailCard key={idx} title={sub.title} content={sub.content} />
                            ))}
                        </div>
                     </div>
                  )}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <Card className="bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-700 mt-6">
            <CardHeader>
                <CardTitle className="text-xl text-green-700 dark:text-green-300 flex items-center gap-2"><Home className="h-5 w-5"/>{t('conclusion.title')}</CardTitle>
            </CardHeader>
            <CardContent className="text-green-600 dark:text-green-400 space-y-2 text-sm">
                {(t.tm('conclusion.content') as string[]).map((p, i) => <p key={i} className={i === 2 ? 'font-semibold mt-2' : ''}>{p}</p>)}
            </CardContent>
          </Card>

        </CardContent>
      </Card>
    </div>
  );
}
