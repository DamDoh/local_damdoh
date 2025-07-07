
"use client";

import { Link } from '@/navigation';
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Leaf, Users, ShoppingCart, MessageSquare, ArrowRight, CheckCircle, Briefcase } from "lucide-react";
import { useTranslations } from "next-intl";
import { APP_NAME } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";

export function LandingPage() {
  const t = useTranslations('LandingPage');

  const features = [
    {
      icon: <Users className="h-8 w-8 text-primary" />,
      title: t('features.networking.title'),
      description: t('features.networking.description')
    },
    {
      icon: <ShoppingCart className="h-8 w-8 text-primary" />,
      title: t('features.marketplace.title'),
      description: t('features.marketplace.description')
    },
    {
      icon: <MessageSquare className="h-8 w-8 text-primary" />,
      title: t('features.forums.title'),
      description: t('features.forums.description')
    },
    {
      icon: <Briefcase className="h-8 w-8 text-primary" />,
      title: t('features.talent.title'),
      description: t('features.talent.description')
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center text-center py-20 md:py-32 bg-beige-100 text-green-900 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: "url('https://placehold.co/1920x1080.png')" }}
          data-ai-hint="agriculture field sunrise"
        ></div>
        <div className="container px-4 md:px-6 z-10">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tighter text-primary">
            {t('hero.title', { appName: APP_NAME })}
          </h1>
          <p className="max-w-[700px] mx-auto text-lg md:text-xl text-muted-foreground mt-4">
            {t('hero.subtitle')}
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="text-lg py-6 px-8">
              <Link href="/auth/signup">{t('hero.getStartedButton')}</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg py-6 px-8 border-primary text-primary">
              <Link href="/about">{t('hero.learnMoreButton')}</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-12 md:py-24 bg-background">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">{t('features.title')}</h2>
            <p className="max-w-[600px] mx-auto text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              {t('features.subtitle')}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center p-6 shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* For Who Section */}
      <section className="py-12 md:py-24 bg-muted">
        <div className="container px-4 md:px-6 grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-4">
            <Badge variant="secondary">{t('forWho.badge')}</Badge>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">{t('forWho.title')}</h2>
            <p className="text-muted-foreground md:text-xl/relaxed">
              {t('forWho.description')}
            </p>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 mt-1 text-primary" />
                <div>
                  <h4 className="font-semibold">{t('forWho.farmers.title')}</h4>
                  <p className="text-sm text-muted-foreground">{t('forWho.farmers.description')}</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 mt-1 text-primary" />
                <div>
                  <h4 className="font-semibold">{t('forWho.buyers.title')}</h4>
                  <p className="text-sm text-muted-foreground">{t('forWho.buyers.description')}</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 mt-1 text-primary" />
                <div>
                  <h4 className="font-semibold">{t('forWho.experts.title')}</h4>
                  <p className="text-sm text-muted-foreground">{t('forWho.experts.description')}</p>
                </div>
              </li>
            </ul>
          </div>
           <div className="relative w-full aspect-square">
                <Image
                    src="https://placehold.co/600x600.png"
                    alt="Diverse group of agricultural stakeholders"
                    fill
                    className="rounded-xl object-cover shadow-2xl"
                    data-ai-hint="agriculture diverse community"
                />
            </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-12 md:py-24 bg-primary text-primary-foreground">
        <div className="container px-4 md:px-6 text-center">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">{t('cta.title')}</h2>
          <p className="max-w-[600px] mx-auto mt-4 text-primary-foreground/80 md:text-xl/relaxed">
            {t('cta.subtitle')}
          </p>
          <div className="mt-8">
            <Button asChild size="lg" variant="secondary" className="text-lg py-6 px-8">
              <Link href="/auth/signup">{t('cta.button')} <ArrowRight className="ml-2 h-5 w-5" /></Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
