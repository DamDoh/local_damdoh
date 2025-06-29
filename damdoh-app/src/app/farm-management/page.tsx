
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Sprout, Home, Recycle, FlaskConical, ArrowRight, Tractor, DollarSign, Bell, PlusCircle, Drumstick, Fish } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/lib/auth-utils";
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app as firebaseApp } from '@/lib/firebase/client';
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "react-i18next";

interface Farm {
  id: string;
  name: string;
  location: string;
  farmType: string;
}

const getFarmIcon = (farmType: string) => {
  const iconProps = { className: "h-6 w-6 text-muted-foreground" };
  switch (farmType?.toLowerCase()) {
    case 'crop': return <Sprout {...iconProps} />;
    case 'livestock': return <Drumstick {...iconProps} />;
    case 'mixed': return <Tractor {...iconProps} />;
    case 'aquaculture': return <Fish {...iconProps} />;
    default: return <Home {...iconProps} />;
  }
};

export default function FarmManagementPage() {
  const { t } = useTranslation('common');
  const { user } = useAuth();
  const [farms, setFarms] = useState<Farm[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const functions = getFunctions(firebaseApp);
  const getUserFarmsCallable = useMemo(() => httpsCallable(functions, 'getUserFarms'), [functions]);

  useEffect(() => {
    if (user) {
      setIsLoading(true);
      getUserFarmsCallable()
        .then((result) => {
          setFarms(result.data as Farm[]);
        })
        .catch((error) => {
          console.error("Error fetching user farms:", error);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
      setFarms([]);
    }
  }, [user, getUserFarmsCallable]);

  const resourceGuides = [
    {
      title: t('farmManagement.hub.knfTitle'),
      description: t('farmManagement.hub.knfDescription'),
      link: "/farm-management/knf-inputs",
      icon: <FlaskConical className="h-8 w-8 text-primary mb-2" />,
      dataAiHint: "natural farming inputs",
    },
    {
      title: t('farmManagement.hub.familyFarmTitle'),
      description: t('farmManagement.hub.familyFarmDescription'),
      link: "/farm-management/family-farm",
      icon: <Home className="h-8 w-8 text-primary mb-2" />,
      dataAiHint: "small farm plan",
    },
    {
      title: t('farmManagement.hub.compostTitle'),
      description: t('farmManagement.hub.compostDescription'),
      link: "/farm-management/compost-fgw",
      icon: <Recycle className="h-8 w-8 text-primary mb-2" />,
      dataAiHint: "compost heap",
    },
    {
      title: t('farmManagement.hub.seedStartingTitle'),
      description: t('farmManagement.hub.seedStartingDescription'),
      link: "/farm-management/seed-starting", 
      icon: <Sprout className="h-8 w-8 text-primary mb-2" />,
      dataAiHint: "seed starting guide",
    },
  ];

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Tractor className="h-8 w-8 text-primary" />
            <div>
                <CardTitle className="text-3xl">{t('farmManagement.hub.title')}</CardTitle>
                <CardDescription className="text-lg">{t('farmManagement.hub.description')}</CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xl">{t('farmManagement.hub.myFarmsTitle')}</CardTitle>
            <CardDescription>{t('farmManagement.hub.myFarmsDescription')}</CardDescription>
          </div>
           <Button asChild>
            <Link href="/farm-management/create-farm">
                <PlusCircle className="mr-2 h-4 w-4" /> {t('farmManagement.hub.addFarmButton')}
            </Link>
           </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          ) : farms.length > 0 ? (
            <div className="space-y-4">
              {farms.map((farm) => (
                <Card key={farm.id} className="flex items-center justify-between p-4 hover:bg-accent/50 transition-colors">
                  <div className="flex items-center gap-4">
                    {getFarmIcon(farm.farmType)}
                    <div>
                      <h4 className="font-semibold">{farm.name}</h4>
                      <p className="text-sm text-muted-foreground">{farm.location}</p>
                    </div>
                  </div>
                  <Button asChild variant="outline">
                    <Link href={`/farm-management/farms/${farm.id}`}>{t('farmManagement.hub.manageFarmButton')}</Link>
                  </Button>
                </Card>
              ))}
            </div>
          ) : (
            <div className="p-6 border rounded-lg shadow-inner bg-muted/50 text-center">
              <p className="text-sm text-muted-foreground">{t('farmManagement.hub.noFarmsMessage')}</p>
              <p className="text-xs text-muted-foreground mt-1">{t('farmManagement.hub.noFarmsSubMessage')}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
            <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2"><DollarSign className="h-5 w-5"/>{t('farmManagement.hub.financialsTitle')}</CardTitle>
                <CardDescription>{t('farmManagement.hub.financialsDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
                 <div className="p-6 border rounded-lg shadow-inner bg-muted/50 text-center">
                    <p className="text-sm text-muted-foreground">{t('farmManagement.hub.financialsComingSoon')}</p>
                </div>
            </CardContent>
            <CardFooter>
                <Button asChild className="w-full">
                    <Link href="/farm-management/financials">{t('farmManagement.hub.financialsButton')} <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
            </CardFooter>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2"><Bell className="h-5 w-5"/>{t('farmManagement.hub.alertsTitle')}</CardTitle>
                <CardDescription>{t('farmManagement.hub.alertsDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="p-6 border rounded-lg shadow-inner bg-muted/50 text-center">
                    <p className="text-sm text-muted-foreground">{t('farmManagement.hub.alertsComingSoon')}</p>
                     <p className="text-xs text-muted-foreground mt-1">{t('farmManagement.hub.alertsComingSoonSub')}</p>
                </div>
            </CardContent>
        </Card>
      </div>

       <div className="space-y-4 pt-4">
        <h2 className="text-2xl font-semibold">{t('farmManagement.hub.resourcesTitle')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {resourceGuides.map((func) => (
            <Card key={func.title} className="flex flex-col hover:shadow-lg transition-shadow">
                <CardHeader className="items-center text-center">
                {func.icon}
                <CardTitle className="text-lg">{func.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow text-center">
                <p className="text-sm text-muted-foreground">{func.description}</p>
                </CardContent>
                <CardFooter>
                <Button asChild className="w-full">
                    <Link href={func.link}>
                    {t('farmManagement.hub.viewGuideButton')} <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
                </CardFooter>
            </Card>
            ))}
        </div>
      </div>

    </div>
  );
}
