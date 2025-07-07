
"use client";

import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Leaf, Sprout, Tractor, DollarSign, FlaskConical, Home, Users, BookOpen, Heart } from 'lucide-react';

export default function FarmManagementPage() {
  const t = useTranslations('farmManagement.hub');

  const navItems = [
    {
      title: t('myFarms.title'),
      description: t('myFarms.description'),
      link: "/farm-management/farms",
      icon: <Home className="h-8 w-8 text-primary mb-2" />,
      buttonText: t('myFarms.button'),
      enabled: true,
    },
    {
      title: t('labor.title'),
      description: t('labor.description'),
      link: "/farm-management/labor",
      icon: <Users className="h-8 w-8 text-primary mb-2" />,
      buttonText: t('labor.button'),
      enabled: true,
    },
    {
      title: t('knf.title'),
      description: t('knf.description'),
      link: "/farm-management/knf-inputs",
      icon: <FlaskConical className="h-8 w-8 text-primary mb-2" />,
      buttonText: t('knf.button'),
      enabled: true,
    },
     {
      title: t('fgw.title'),
      description: t('fgw.description'),
      link: "/farm-management/fgw-guide",
      icon: <Heart className="h-8 w-8 text-primary mb-2" />,
      buttonText: t('fgw.button'),
      enabled: true,
    },
    {
      title: t('financials.title'),
      description: t('financials.description'),
      link: "/farm-management/financials",
      icon: <DollarSign className="h-8 w-8 text-primary mb-2" />,
      buttonText: t('financials.button'),
      enabled: true,
    },
     {
      title: t('seedStarting.title'),
      description: t('seedStarting.description'),
      link: "/farm-management/seed-starting",
      icon: <Sprout className="h-8 w-8 text-primary mb-2" />,
      buttonText: t('seedStarting.button'),
      enabled: true,
    },
    {
      title: t('familyFarm.title'),
      description: t('familyFarm.description'),
      link: "/farm-management/family-farm",
      icon: <Leaf className="h-8 w-8 text-primary mb-2" />,
      buttonText: t('familyFarm.button'),
      enabled: true,
    },
    {
      title: t('assetManagement.title'),
      description: t('assetManagement.description'),
      link: "#",
      icon: <Tractor className="h-8 w-8 text-primary mb-2" />,
      buttonText: t('assetManagement.button'),
      enabled: false,
    },
  ];

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6">{t('title')}</h1>
      <p className="mb-8 text-lg text-muted-foreground">
        {t('description')}
      </p>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {navItems.map((item) => (
            <Card key={item.title} className="flex flex-col">
                <CardHeader>
                    {item.icon}
                    <CardTitle>{item.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow">
                    <CardDescription>{item.description}</CardDescription>
                </CardContent>
                <div className="p-6 pt-0">
                     <Button asChild className="w-full" disabled={!item.enabled}>
                        <Link href={item.link}>{item.buttonText}</Link>
                    </Button>
                </div>
            </Card>
        ))}
      </div>
    </div>
  );
}

