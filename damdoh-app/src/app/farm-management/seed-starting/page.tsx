
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Sprout, ArrowLeft, Leaf, Package, Sun, CheckCircle, Lightbulb, Grid, AlertTriangle } from "lucide-react";
import { useTranslation } from "react-i18next";

interface Section {
  id: string;
  title: string;
  icon: React.ReactElement;
  content: React.ReactElement;
}

export default function SeedStartingPage() {
  const { t } = useTranslation('common');

  const sections: Section[] = [
    {
      id: "why-start-indoors",
      title: t('farmManagement.seedStarting.sections.why.title'),
      icon: <Lightbulb className="h-5 w-5 text-amber-500" />,
      content: (
        <>
          <p className="text-muted-foreground">{t('farmManagement.seedStarting.sections.why.intro')}</p>
          <ul className="list-disc list-inside text-muted-foreground pl-5 mt-2 space-y-1">
            <li><strong className="font-medium">{t('farmManagement.seedStarting.sections.why.point1.title')}:</strong> {t('farmManagement.seedStarting.sections.why.point1.text')}</li>
            <li><strong className="font-medium">{t('farmManagement.seedStarting.sections.why.point2.title')}:</strong> {t('farmManagement.seedStarting.sections.why.point2.text')}</li>
            <li><strong className="font-medium">{t('farmManagement.seedStarting.sections.why.point3.title')}:</strong> {t('farmManagement.seedStarting.sections.why.point3.text')}</li>
            <li><strong className="font-medium">{t('farmManagement.seedStarting.sections.why.point4.title')}:</strong> {t('farmManagement.seedStarting.sections.why.point4.text')}</li>
            <li><strong className="font-medium">{t('farmManagement.seedStarting.sections.why.point5.title')}:</strong> {t('farmManagement.seedStarting.sections.why.point5.text')}</li>
          </ul>
        </>
      ),
    },
    {
      id: "what-you-need",
      title: t('farmManagement.seedStarting.sections.materials.title'),
      icon: <Package className="h-5 w-5 text-primary" />,
      content: (
        <>
          <p className="text-muted-foreground mb-2">{t('farmManagement.seedStarting.sections.materials.intro')}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium text-md mb-1 text-foreground">{t('farmManagement.seedStarting.sections.materials.containers.title')}</h3>
              <ul className="list-disc list-inside text-muted-foreground pl-5 space-y-1 text-sm">
                <li>{t('farmManagement.seedStarting.sections.materials.containers.item1')}</li>
                <li>{t('farmManagement.seedStarting.sections.materials.containers.item2')}</li>
                <li>{t('farmManagement.seedStarting.sections.materials.containers.item3')}</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-md mb-1 text-foreground">{t('farmManagement.seedStarting.sections.materials.mix.title')}</h3>
              <ul className="list-disc list-inside text-muted-foreground pl-5 space-y-1 text-sm">
                <li>{t('farmManagement.seedStarting.sections.materials.mix.item1')}</li>
                <li>{t('farmManagement.seedStarting.sections.materials.mix.item2')}</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-md mb-1 text-foreground">{t('farmManagement.seedStarting.sections.materials.seeds.title')}</h3>
              <ul className="list-disc list-inside text-muted-foreground pl-5 space-y-1 text-sm">
                <li>{t('farmManagement.seedStarting.sections.materials.seeds.item1')}</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-md mb-1 text-foreground">{t('farmManagement.seedStarting.sections.materials.essentials.title')}</h3>
              <ul className="list-disc list-inside text-muted-foreground pl-5 space-y-1 text-sm">
                <li><strong className="font-semibold">{t('farmManagement.seedStarting.sections.materials.essentials.light.title')}:</strong> {t('farmManagement.seedStarting.sections.materials.essentials.light.text')}</li>
                <li><strong className="font-semibold">{t('farmManagement.seedStarting.sections.materials.essentials.water.title')}:</strong> {t('farmManagement.seedStarting.sections.materials.essentials.water.text')}</li>
                <li><strong className="font-semibold">{t('farmManagement.seedStarting.sections.materials.essentials.labels.title')}:</strong> {t('farmManagement.seedStarting.sections.materials.essentials.labels.text')}</li>
              </ul>
            </div>
          </div>
        </>
      ),
    },
    {
      id: "step-by-step",
      title: t('farmManagement.seedStarting.sections.sowing.title'),
      icon: <Grid className="h-5 w-5 text-green-700" />,
      content: (
        <ol className="list-decimal list-inside text-muted-foreground space-y-3 pl-5">
          <li><strong className="font-medium">{t('farmManagement.seedStarting.sections.sowing.step1.title')}:</strong> {t('farmManagement.seedStarting.sections.sowing.step1.text')}</li>
          <li><strong className="font-medium">{t('farmManagement.seedStarting.sections.sowing.step2.title')}:</strong> {t('farmManagement.seedStarting.sections.sowing.step2.text')}</li>
          <li><strong className="font-medium">{t('farmManagement.seedStarting.sections.sowing.step3.title')}:</strong> {t('farmManagement.seedStarting.sections.sowing.step3.text')}</li>
          <li><strong className="font-medium">{t('farmManagement.seedStarting.sections.sowing.step4.title')}:</strong> {t('farmManagement.seedStarting.sections.sowing.step4.text')}</li>
          <li><strong className="font-medium">{t('farmManagement.seedStarting.sections.sowing.step5.title')}:</strong> {t('farmManagement.seedStarting.sections.sowing.step5.text')}</li>
          <li><strong className="font-medium">{t('farmManagement.seedStarting.sections.sowing.step6.title')}:</strong> {t('farmManagement.seedStarting.sections.sowing.step6.text')}</li>
        </ol>
      ),
    },
    {
      id: "caring-for-seedlings",
      title: t('farmManagement.seedStarting.sections.caring.title'),
      icon: <Leaf className="h-5 w-5 text-green-600" />,
      content: (
        <ul className="list-disc list-inside text-muted-foreground pl-5 space-y-3">
          <li><strong className="font-medium">{t('farmManagement.seedStarting.sections.caring.point1.title')}:</strong> {t('farmManagement.seedStarting.sections.caring.point1.text')}</li>
          <li><strong className="font-medium">{t('farmManagement.seedStarting.sections.caring.point2.title')}:</strong> {t('farmManagement.seedStarting.sections.caring.point2.text')}</li>
          <li><strong className="font-medium">{t('farmManagement.seedStarting.sections.caring.point3.title')}:</strong> {t('farmManagement.seedStarting.sections.caring.point3.text')}</li>
          <li><strong className="font-medium">{t('farmManagement.seedStarting.sections.caring.point4.title')}:</strong> {t('farmManagement.seedStarting.sections.caring.point4.text')}</li>
          <li><strong className="font-medium">{t('farmManagement.seedStarting.sections.caring.point5.title')}:</strong> {t('farmManagement.seedStarting.sections.caring.point5.text')}</li>
        </ul>
      ),
    },
    {
      id: "hardening-off",
      title: t('farmManagement.seedStarting.sections.hardening.title'),
      icon: <Sun className="h-5 w-5 text-orange-500" />,
      content: (
        <>
          <p className="text-muted-foreground mb-2"><strong className="font-semibold">{t('farmManagement.seedStarting.sections.hardening.intro.title')}</strong> {t('farmManagement.seedStarting.sections.hardening.intro.text')}</p>
          <ol className="list-decimal list-inside text-muted-foreground space-y-1 pl-5 text-sm">
            <li><strong className="font-medium">{t('farmManagement.seedStarting.sections.hardening.step1.title')}:</strong> {t('farmManagement.seedStarting.sections.hardening.step1.text')}</li>
            <li><strong className="font-medium">{t('farmManagement.seedStarting.sections.hardening.step2.title')}:</strong> {t('farmManagement.seedStarting.sections.hardening.step2.text')}</li>
            <li><strong className="font-medium">{t('farmManagement.seedStarting.sections.hardening.step3.title')}:</strong> {t('farmManagement.seedStarting.sections.hardening.step3.text')}</li>
            <li><strong className="font-medium">{t('farmManagement.seedStarting.sections.hardening.step4.title')}:</strong> {t('farmManagement.seedStarting.sections.hardening.step4.text')}</li>
            <li><strong className="font-medium">{t('farmManagement.seedStarting.sections.hardening.step5.title')}:</strong> {t('farmManagement.seedStarting.sections.hardening.step5.text')}</li>
          </ol>
        </>
      ),
    },
    {
      id: "transplanting",
      title: t('farmManagement.seedStarting.sections.transplanting.title'),
      icon: <CheckCircle className="h-5 w-5 text-green-500" />,
      content: (
        <>
          <p className="text-muted-foreground mb-2">{t('farmManagement.seedStarting.sections.transplanting.intro')}</p>
          <ul className="list-disc list-inside text-muted-foreground pl-5 space-y-2">
            <li><strong className="font-medium">{t('farmManagement.seedStarting.sections.transplanting.point1.title')}:</strong> {t('farmManagement.seedStarting.sections.transplanting.point1.text')}</li>
            <li><strong className="font-medium">{t('farmManagement.seedStarting.sections.transplanting.point2.title')}:</strong> {t('farmManagement.seedStarting.sections.transplanting.point2.text')}</li>
            <li><strong className="font-medium">{t('farmManagement.seedStarting.sections.transplanting.point3.title')}:</strong> {t('farmManagement.seedStarting.sections.transplanting.point3.text')}</li>
            <li><strong className="font-medium">{t('farmManagement.seedStarting.sections.transplanting.point4.title')}:</strong> {t('farmManagement.seedStarting.sections.transplanting.point4.text')}</li>
            <li><strong className="font-medium">{t('farmManagement.seedStarting.sections.transplanting.point5.title')}:</strong> {t('farmManagement.seedStarting.sections.transplanting.point5.text')}</li>
            <li><strong className="font-medium">{t('farmManagement.seedStarting.sections.transplanting.point6.title')}:</strong> {t('farmManagement.seedStarting.sections.transplanting.point6.text')}</li>
          </ul>
        </>
      ),
    },
    {
      id: "troubleshooting",
      title: t('farmManagement.seedStarting.sections.troubleshooting.title'),
      icon: <AlertTriangle className="h-5 w-5 text-red-500" />,
      content: (
        <ul className="list-disc list-inside text-muted-foreground pl-5 space-y-3">
          <li><strong className="font-medium">{t('farmManagement.seedStarting.sections.troubleshooting.point1.title')}:</strong> {t('farmManagement.seedStarting.sections.troubleshooting.point1.text')}</li>
          <li><strong className="font-medium">{t('farmManagement.seedStarting.sections.troubleshooting.point2.title')}:</strong> {t('farmManagement.seedStarting.sections.troubleshooting.point2.text')}</li>
          <li><strong className="font-medium">{t('farmManagement.seedStarting.sections.troubleshooting.point3.title')}:</strong> {t('farmManagement.seedStarting.sections.troubleshooting.point3.text')}</li>
          <li><strong className="font-medium">{t('farmManagement.seedStarting.sections.troubleshooting.point4.title')}:</strong> {t('farmManagement.seedStarting.sections.troubleshooting.point4.text')}</li>
        </ul>
      )
    },
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
          <div className="flex items-center gap-2">
            <Sprout className="h-7 w-7 text-primary" />
            <CardTitle className="text-2xl">{t('farmManagement.seedStarting.title')}</CardTitle>
          </div>
          <CardDescription>{t('farmManagement.seedStarting.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">{t('farmManagement.seedStarting.intro')}</p>
          <Accordion type="single" collapsible className="w-full" defaultValue="why-start-indoors">
            {sections.map((section) => (
              <AccordionItem value={section.id} key={section.id}>
                <AccordionTrigger className="text-lg hover:no-underline py-3">
                  <div className="flex items-center gap-3 text-left">
                    {section.icon}
                    {section.title}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-1 pb-3 space-y-4">
                  {section.content}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
