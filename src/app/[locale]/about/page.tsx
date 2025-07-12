
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Leaf, Users, Shield, Heart, Handshake, CheckCircle, ArrowRight, BookOpen, Truck, CircleDollarSign, ShoppingCart, Brain, Briefcase, Globe, Database, Thermometer, Filter } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from 'next/link';

export default function AboutPage() {
  const t = useTranslations('aboutPage');

  const challenges = [
    { text: t('challenge.list.marketAccess'), icon: <ShoppingCart className="h-6 w-6 text-destructive" />, detailKey: 'marketAccess' },
    { text: t('challenge.list.inefficiency'), icon: <Truck className="h-6 w-6 text-destructive" />, detailKey: 'inefficiency' },
    { text: t('challenge.list.financialExclusion'), icon: <CircleDollarSign className="h-6 w-6 text-destructive" />, detailKey: 'financialExclusion' },
    { text: t('challenge.list.informationGaps'), icon: <BookOpen className="h-6 w-6 text-destructive" />, detailKey: 'informationGaps' },
    { text: t('challenge.list.qualityTrust'), icon: <CheckCircle className="h-6 w-6 text-destructive" />, detailKey: 'qualityTrust' },
    { text: t('challenge.list.climatePressure'), icon: <Thermometer className="h-6 w-6 text-destructive" />, detailKey: 'climatePressure' },
    { text: t('challenge.list.foodLoss'), icon: <Filter className="h-6 w-6 text-destructive" />, detailKey: 'foodLoss' },
    { text: t('challenge.list.dataFragmentation'), icon: <Database className="h-6 w-6 text-destructive" />, detailKey: 'dataFragmentation' }
  ];
  
  const solutions = [
    { text: t('solution.list.education'), icon: <BookOpen className="h-5 w-5 text-primary" /> },
    { text: t('solution.list.ai'), icon: <Brain className="h-5 w-5 text-primary" /> },
    { text: t('solution.list.marketplace'), icon: <ShoppingCart className="h-5 w-5 text-primary" /> },
    { text: t('solution.list.logistics'), icon: <Truck className="h-5 w-5 text-primary" /> },
    { text: t('solution.list.financial'), icon: <CircleDollarSign className="h-5 w-5 text-primary" /> },
  ];
  
  const connectionTypes = [
    { id: "c1", title: t('beyondTechnology.list.p2p.title'), content: t('beyondTechnology.list.p2p.content'), icon: <Users className="h-5 w-5 text-primary" /> },
    { id: "c2", title: t('beyondTechnology.list.p2b.title'), content: t('beyondTechnology.list.p2b.content'), icon: <Handshake className="h-5 w-5 text-primary" /> },
    { id: "c3", title: t('beyondTechnology.list.p2e.title'), content: t('beyondTechnology.list.p2e.content'), icon: <Briefcase className="h-5 w-5 text-primary" /> },
    { id: "c4", title: t('beyondTechnology.list.p2w.title'), content: t('beyondTechnology.list.p2w.content'), icon: <Globe className="h-5 w-5 text-primary" /> },
  ];

  return (
    <div className="space-y-12 md:space-y-20">
      {/* Hero Section */}
      <section className="relative text-center py-20 md:py-28 rounded-lg overflow-hidden bg-primary/10">
         <div className="absolute inset-0 bg-cover bg-center opacity-20" style={{ backgroundImage: "url('https://placehold.co/1920x1080.png')" }} data-ai-hint="agriculture field landscape"></div>
        <div className="container relative z-10">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-primary-foreground/90">{t('hero.title')}</h1>
          <p className="max-w-3xl mx-auto mt-4 text-lg md:text-xl text-primary-foreground/80">{t('hero.subtitle')}</p>
        </div>
      </section>

      {/* Vision Section */}
      <section className="container grid md:grid-cols-2 gap-12 items-center">
        <div className="space-y-4">
          <h2 className="text-3xl font-bold tracking-tight">{t('vision.title')}</h2>
          <p className="text-muted-foreground">{t('vision.p1')}</p>
          <p className="text-muted-foreground">{t('vision.p2')}</p>
        </div>
        <div className="flex flex-col items-center gap-6 p-6 bg-muted/50 rounded-lg">
          <h3 className="font-semibold text-lg">{t('vision.foundersTitle')}</h3>
          <div className="flex gap-6">
            <div className="text-center">
              <Avatar className="h-20 w-20 mx-auto mb-2">
                <AvatarImage src="https://placehold.co/150x150.png" alt="Manil" data-ai-hint="founder portrait"/>
                <AvatarFallback>M</AvatarFallback>
              </Avatar>
              <p className="font-medium">Manil</p>
            </div>
            <div className="text-center">
              <Avatar className="h-20 w-20 mx-auto mb-2">
                <AvatarImage src="https://placehold.co/150x150.png" alt="Sok" data-ai-hint="founder portrait"/>
                <AvatarFallback>S</AvatarFallback>
              </Avatar>
              <p className="font-medium">Sok</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* The Challenge Section */}
      <section className="container">
          <Card className="bg-destructive/5 border-destructive/20">
              <CardHeader className="text-center">
                  <h2 className="text-3xl font-bold tracking-tight">{t('challenge.title')}</h2>
                  <p className="text-destructive/80 max-w-2xl mx-auto mt-2">{t('challenge.description')}</p>
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
                  {challenges.map((challenge, index) => (
                      <div key={index} className="flex items-start gap-4 p-4 bg-background rounded-lg shadow-sm">
                          <div className="flex-shrink-0 mt-1">{challenge.icon}</div>
                          <div>
                            <h4 className="font-semibold text-foreground">{challenge.text}</h4>
                            <p className="text-sm text-muted-foreground">{t(`challenge.details.${challenge.detailKey}`)}</p>
                          </div>
                      </div>
                  ))}
              </CardContent>
          </Card>
      </section>

      {/* The Solution Section */}
      <section className="container">
          <Card className="bg-primary/5 border-primary/20">
              <CardHeader className="text-center">
                  <h2 className="text-3xl font-bold tracking-tight">{t('solution.title')}</h2>
                  <CardDescription>{t('solution.description')}</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {solutions.map((solution, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-background rounded-lg">
                           <div className="shrink-0">{solution.icon}</div>
                          <p className="text-sm text-muted-foreground">{solution.text}</p>
                      </div>
                  ))}
              </CardContent>
          </Card>
      </section>

       {/* Beyond Technology Section */}
      <section className="container">
        <h2 className="text-3xl font-bold tracking-tight text-center mb-8">{t('beyondTechnology.title')}</h2>
        <Accordion type="single" collapsible className="w-full max-w-3xl mx-auto" defaultValue="c1">
          {connectionTypes.map(item => (
            <AccordionItem value={item.id} key={item.id}>
              <AccordionTrigger className="text-lg hover:no-underline">
                <div className="flex items-center gap-3">
                  {item.icon}
                  {item.title}
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{item.content}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      {/* Final CTA */}
      <section className="container">
         <Card className="text-center p-8 md:p-12 bg-muted/50">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">{t('commitment.title')}</h2>
            <p className="max-w-2xl mx-auto mt-3 text-muted-foreground">{t('commitment.p1')}</p>
            <p className="max-w-2xl mx-auto mt-3 text-muted-foreground">{t('commitment.p2')}</p>
            <p className="max-w-2xl mx-auto mt-4 font-semibold text-primary">{t('commitment.p3')}</p>
            <Button size="lg" asChild className="mt-6">
                <Link href="/auth/signup">{t('commitment.button')} <ArrowRight className="ml-2 h-5 w-5"/></Link>
            </Button>
         </Card>
      </section>

    </div>
  );
}
