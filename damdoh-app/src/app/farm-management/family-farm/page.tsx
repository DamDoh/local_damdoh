
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Home, ArrowLeft, LayoutGrid, Sprout, ShoppingBasket, Recycle, Fish, Bird, ShieldCheck, Heart, Info } from "lucide-react";
import { useTranslation } from "react-i18next";

interface FarmZone {
  id: string;
  title: string;
  icon: React.ReactElement;
  imageSrc: string;
  imageAlt: string;
  dataAiHint: string;
  description: string[];
  details?: string[];
  subSections?: { title: string; content: string[] }[];
}

export default function FamilyFarmPage() {
  const { t } = useTranslation('common');

  const farmZones: FarmZone[] = [
    {
      id: "overall-layout",
      title: t('farmManagement.familyFarm.zones.overallLayout.title'),
      icon: <LayoutGrid className="h-5 w-5 text-green-700" />,
      imageSrc: "https://placehold.co/600x400.png",
      imageAlt: t('farmManagement.familyFarm.zones.overallLayout.imageAlt'),
      dataAiHint: "farm layout diagram",
      description: [
        t('farmManagement.familyFarm.zones.overallLayout.description1'),
        t('farmManagement.familyFarm.zones.overallLayout.description2'),
        t('farmManagement.familyFarm.zones.overallLayout.description3'),
        t('farmManagement.familyFarm.zones.overallLayout.description4')
      ],
      details: [
        t('farmManagement.familyFarm.zones.overallLayout.detail1'),
        t('farmManagement.familyFarm.zones.overallLayout.detail2'),
        t('farmManagement.familyFarm.zones.overallLayout.detail3'),
        t('farmManagement.familyFarm.zones.overallLayout.detail4')
      ]
    },
    {
      id: "vegetable-production",
      title: t('farmManagement.familyFarm.zones.vegetableProduction.title'),
      icon: <Sprout className="h-5 w-5 text-green-600" />,
      imageSrc: "https://placehold.co/600x400.png",
      imageAlt: t('farmManagement.familyFarm.zones.vegetableProduction.imageAlt'),
      dataAiHint: "vegetable garden rows",
      description: [
        t('farmManagement.familyFarm.zones.vegetableProduction.description1'),
        t('farmManagement.familyFarm.zones.vegetableProduction.description2'),
        t('farmManagement.familyFarm.zones.vegetableProduction.description3')
      ],
      details: [
        t('farmManagement.familyFarm.zones.vegetableProduction.detail1'),
        t('farmManagement.familyFarm.zones.vegetableProduction.detail2'),
        t('farmManagement.familyFarm.zones.vegetableProduction.detail3'),
        t('farmManagement.familyFarm.zones.vegetableProduction.detail4'),
        t('farmManagement.familyFarm.zones.vegetableProduction.detail5'),
        t('farmManagement.familyFarm.zones.vegetableProduction.detail6')
      ]
    },
    {
      id: "fruit-tree-borders",
      title: t('farmManagement.familyFarm.zones.fruitTreeBorders.title'),
      icon: <ShoppingBasket className="h-5 w-5 text-orange-500" />,
      imageSrc: "https://placehold.co/600x400.png",
      imageAlt: t('farmManagement.familyFarm.zones.fruitTreeBorders.imageAlt'),
      dataAiHint: "fruit trees farm",
      description: [
        t('farmManagement.familyFarm.zones.fruitTreeBorders.description1'),
        t('farmManagement.familyFarm.zones.fruitTreeBorders.description2'),
        t('farmManagement.familyFarm.zones.fruitTreeBorders.description3')
      ],
      details: [
        t('farmManagement.familyFarm.zones.fruitTreeBorders.detail1'),
        t('farmManagement.familyFarm.zones.fruitTreeBorders.detail2'),
        t('farmManagement.familyFarm.zones.fruitTreeBorders.detail3'),
        t('farmManagement.familyFarm.zones.fruitTreeBorders.detail4')
      ]
    },
    {
      id: "aquaculture-zone",
      title: t('farmManagement.familyFarm.zones.aquaculture.title'),
      icon: <Fish className="h-5 w-5 text-blue-600" />,
      imageSrc: "https://placehold.co/600x400.png",
      imageAlt: t('farmManagement.familyFarm.zones.aquaculture.imageAlt'),
      dataAiHint: "fish ponds aquaculture",
      description: [
        t('farmManagement.familyFarm.zones.aquaculture.description1'),
        t('farmManagement.familyFarm.zones.aquaculture.description2'),
        t('farmManagement.familyFarm.zones.aquaculture.description3'),
        t('farmManagement.familyFarm.zones.aquaculture.description4')
      ],
      details: [
        t('farmManagement.familyFarm.zones.aquaculture.detail1'),
        t('farmManagement.familyFarm.zones.aquaculture.detail2'),
        t('farmManagement.familyFarm.zones.aquaculture.detail3'),
        t('farmManagement.familyFarm.zones.aquaculture.detail4'),
        t('farmManagement.familyFarm.zones.aquaculture.detail5')
      ]
    },
    {
      id: "poultry-mushroom-zone",
      title: t('farmManagement.familyFarm.zones.poultryMushroom.title'),
      icon: <Bird className="h-5 w-5 text-red-600" />,
      imageSrc: "https://placehold.co/600x400.png",
      imageAlt: t('farmManagement.familyFarm.zones.poultryMushroom.imageAlt'),
      dataAiHint: "chicken coop mushrooms",
      description: [
        t('farmManagement.familyFarm.zones.poultryMushroom.description1'),
        t('farmManagement.familyFarm.zones.poultryMushroom.description2'),
        t('farmManagement.familyFarm.zones.poultryMushroom.description3')
      ],
      details: [
        t('farmManagement.familyFarm.zones.poultryMushroom.detail1'),
        t('farmManagement.familyFarm.zones.poultryMushroom.detail2'),
        t('farmManagement.familyFarm.zones.poultryMushroom.detail3'),
        t('farmManagement.familyFarm.zones.poultryMushroom.detail4')
      ]
    },
    {
      id: "support-systems",
      title: t('farmManagement.familyFarm.zones.supportSystems.title'),
      icon: <Recycle className="h-5 w-5 text-amber-600" />,
      imageSrc: "https://placehold.co/600x400.png",
      imageAlt: t('farmManagement.familyFarm.zones.supportSystems.imageAlt'),
      dataAiHint: "compost pile water tank",
      description: [
        t('farmManagement.familyFarm.zones.supportSystems.description1'),
        t('farmManagement.familyFarm.zones.supportSystems.description2'),
        t('farmManagement.familyFarm.zones.supportSystems.description3')
      ],
      details: [
        t('farmManagement.familyFarm.zones.supportSystems.detail1'),
        t('farmManagement.familyFarm.zones.supportSystems.detail2'),
        t('farmManagement.familyFarm.zones.supportSystems.detail3'),
        t('farmManagement.familyFarm.zones.supportSystems.detail4')
      ]
    },
    {
      id: "management-principles",
      title: t('farmManagement.familyFarm.zones.managementPrinciples.title'),
      icon: <ShieldCheck className="h-5 w-5 text-purple-600" />,
      imageSrc: "https://placehold.co/600x400.png",
      imageAlt: t('farmManagement.familyFarm.zones.managementPrinciples.imageAlt'),
      dataAiHint: "sustainable farming infographic",
      description: [
        t('farmManagement.familyFarm.zones.managementPrinciples.description1')
      ],
      subSections: [
        {
          title: t('farmManagement.familyFarm.zones.managementPrinciples.subSection1.title'),
          content: [t('farmManagement.familyFarm.zones.managementPrinciples.subSection1.content1')]
        },
        {
          title: t('farmManagement.familyFarm.zones.managementPrinciples.subSection2.title'),
          content: [
            t('farmManagement.familyFarm.zones.managementPrinciples.subSection2.content1'),
            t('farmManagement.familyFarm.zones.managementPrinciples.subSection2.content2'),
            t('farmManagement.familyFarm.zones.managementPrinciples.subSection2.content3')
          ]
        },
        {
          title: t('farmManagement.familyFarm.zones.managementPrinciples.subSection3.title'),
          content: [
            t('farmManagement.familyFarm.zones.managementPrinciples.subSection3.content1'),
            t('farmManagement.familyFarm.zones.managementPrinciples.subSection3.content2'),
            t('farmManagement.familyFarm.zones.managementPrinciples.subSection3.content3')
          ]
        },
        {
          title: t('farmManagement.familyFarm.zones.managementPrinciples.subSection4.title'),
          content: [
            t('farmManagement.familyFarm.zones.managementPrinciples.subSection4.content1'),
            t('farmManagement.familyFarm.zones.managementPrinciples.subSection4.content2')
          ]
        },
        {
          title: t('farmManagement.familyFarm.zones.managementPrinciples.subSection5.title'),
          content: [t('farmManagement.familyFarm.zones.managementPrinciples.subSection5.content1')]
        },
        {
          title: t('farmManagement.familyFarm.zones.managementPrinciples.subSection6.title'),
          content: [t('farmManagement.familyFarm.zones.managementPrinciples.subSection6.content1')]
        }
      ]
    },
    {
      id: "family-sustenance",
      title: t('farmManagement.familyFarm.zones.familySustenance.title'),
      icon: <Heart className="h-5 w-5 text-teal-600" />,
      imageSrc: "https://placehold.co/600x400.png",
      imageAlt: t('farmManagement.familyFarm.zones.familySustenance.imageAlt'),
      dataAiHint: "family harvest food",
      description: [
        t('farmManagement.familyFarm.zones.familySustenance.description1'),
        t('farmManagement.familyFarm.zones.familySustenance.description2')
      ],
      details: [
        t('farmManagement.familyFarm.zones.familySustenance.detail1'),
        t('farmManagement.familyFarm.zones.familySustenance.detail2'),
        t('farmManagement.familyFarm.zones.familySustenance.detail3'),
        t('farmManagement.familyFarm.zones.familySustenance.detail4'),
        t('farmManagement.familyFarm.zones.familySustenance.detail5'),
        t('farmManagement.familyFarm.zones.familySustenance.detail6'),
        t('farmManagement.familyFarm.zones.familySustenance.detail7')
      ]
    }
  ];

  return (
    <div className="space-y-6">
      <Button asChild variant="outline" className="mb-4">
        <Link href="/farm-management">
          <ArrowLeft className="mr-2 h-4 w-4" /> {t('farmManagement.backToHub')}
        </Link>
      </Button>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Home className="h-8 w-8 text-primary" />
            <div>
              <CardTitle className="text-2xl md:text-3xl">{t('farmManagement.familyFarm.title')}</CardTitle>
              <CardDescription className="text-md">
                {t('farmManagement.familyFarm.description')}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            {t('farmManagement.familyFarm.intro')}
          </p>
          
          <div className="my-6">
            <Image 
                src="https://firebasestorage.googleapis.com/v0/b/damdoh-923bf.appspot.com/o/images%2F200sqm-farm-model-diagram.png?alt=media&token=65b4f9a4-d53b-49e3-8d74-3566d5f231a7" 
                alt={t('farmManagement.familyFarm.diagramAlt')}
                width={800}
                height={500}
                className="rounded-lg border shadow-md object-contain mx-auto"
                data-ai-hint="farm layout diagram"
            />
            <p className="text-center text-xs text-muted-foreground mt-2">{t('farmManagement.familyFarm.diagramCaption')}</p>
          </div>

          <Accordion type="single" collapsible className="w-full" defaultValue="overall-layout">
            {farmZones.map((zone) => (
              <AccordionItem value={zone.id} key={zone.id}>
                <AccordionTrigger className="text-lg hover:no-underline py-3">
                  <div className="flex items-center gap-3 text-left">
                    {zone.icon}
                    {zone.title}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-1 pb-3 space-y-3 text-muted-foreground">
                  <div className="grid md:grid-cols-3 gap-4 items-start">
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
                    <div className="mt-3 pl-3 border-l-2 border-primary/30 space-y-1.5">
                      <h4 className="font-semibold text-foreground/90 text-md mb-1">{t('farmManagement.familyFarm.keyConsiderations')}</h4>
                      <ul className="list-disc list-inside text-sm space-y-1">
                        {zone.details.map((detail, index) => (
                          <li key={index}>{detail}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {zone.subSections && zone.subSections.length > 0 && (
                     <div className="mt-4 space-y-3">
                        {zone.subSections.map((sub, idx) => (
                           <div key={idx} className="pl-3 border-l-2 border-accent/50">
                              <h4 className="font-semibold text-foreground/90 text-md mb-1">{sub.title}</h4>
                              <ul className="list-disc list-inside text-sm space-y-0.5">
                                 {sub.content.map((item, itemIdx) => <li key={itemIdx}>{item}</li>)}
                              </ul>
                           </div>
                        ))}
                     </div>
                  )}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <Card className="bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-700 mt-6">
            <CardHeader>
                <CardTitle className="text-xl text-green-700 dark:text-green-300 flex items-center gap-2"><Info className="h-5 w-5"/>{t('farmManagement.familyFarm.conclusion.title')}</CardTitle>
            </CardHeader>
            <CardContent className="text-green-600 dark:text-green-400 space-y-2 text-sm">
                <p>
                    {t('farmManagement.familyFarm.conclusion.p1')}
                </p>
                <p>
                    {t('farmManagement.familyFarm.conclusion.p2')}
                </p>
                 <p className="font-semibold mt-2">
                    {t('farmManagement.familyFarm.conclusion.p3')}
                </p>
            </CardContent>
          </Card>

        </CardContent>
      </Card>
    </div>
  );
}
