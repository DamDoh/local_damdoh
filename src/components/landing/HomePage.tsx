
"use client";

import { Link } from '@/navigation';
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { ArrowRight, CheckCircle, Leaf, BrainCircuit, LineChart, MessageCircle, Users, Truck, Banknote, ShieldCheck, GitBranch } from "lucide-react";
import { useTranslations } from "next-intl";
import { APP_NAME } from "@/lib/constants";
import { SignUpModal } from '@/components/auth/SignUpModal';
import { useState } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StakeholderIcon } from '../icons/StakeholderIcon';
import { Badge } from "@/components/ui/badge";


export function LandingPage() {
  const t = useTranslations('LandingPage');
  const [isSignUpModalOpen, setIsSignUpModalOpen] = useState(false);

  const trustPillars = [
    {
      icon: <GitBranch className="h-8 w-8 text-primary" />,
      title: t('trustPillars.traceability.title'),
      description: t('trustPillars.traceability.description')
    },
    {
      icon: <Users className="h-8 w-8 text-primary" />,
      title: t('trustPillars.network.title'),
      description: t('trustPillars.network.description')
    },
    {
      icon: <BrainCircuit className="h-8 w-8 text-primary" />,
      title: t('trustPillars.ai.title'),
      description: t('trustPillars.ai.description')
    },
    {
      icon: <ShieldCheck className="h-8 w-8 text-primary" />,
      title: t('trustPillars.security.title'),
      description: t('trustPillars.security.description')
    }
  ];

  const steps = [
    { number: "01", title: t('howItWorks.step1.title'), description: t('howItWorks.step1.description') },
    { number: "02", title: t('howItWorks.step2.title'), description: t('howItWorks.step2.description') },
    { number: "03", title: t('howItWorks.step3.title'), description: t('howItWorks.step3.description') }
  ];

  const testimonials = [
    {
      quote: t('testimonials.t1.quote'),
      name: t('testimonials.t1.name'),
      role: t('testimonials.t1.role'),
      avatar: "https://placehold.co/100x100.png"
    },
    {
      quote: t('testimonials.t2.quote'),
      name: t('testimonials.t2.name'),
      role: t('testimonials.t2.role'),
      avatar: "https://placehold.co/100x100.png"
    },
     {
      quote: t('testimonials.t3.quote'),
      name: t('testimonials.t3.name'),
      role: t('testimonials.t3.role'),
      avatar: "https://placehold.co/100x100.png"
    }
  ];
  
  const stakeholderTabs = [
    { id: "farmers", name: t('stakeholders.farmers.name'), icon: "Farmer" },
    { id: "buyers", name: t('stakeholders.buyers.name'), icon: "Buyer (Restaurant, Supermarket, Exporter)" },
    { id: "logistics", name: t('stakeholders.logistics.name'), icon: "Logistics Partner (Third-Party Transporter)" },
    { id: "financial", name: t('stakeholders.financial.name'), icon: "Financial Institution (Micro-finance/Loans)" },
  ];

  return (
    <>
      <div className="flex flex-col min-h-screen bg-background">
        {/* Hero Section */}
        <section className="relative flex flex-col items-center justify-center text-center py-24 md:py-32 bg-gray-50 dark:bg-gray-900/50">
          <div
            className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(to_bottom,transparent,white,transparent)] dark:bg-grid-slate-700/40"
          ></div>
          <div className="container px-4 md:px-6 z-10">
             <Badge variant="secondary" className="mb-4">
                <span className="relative inline-flex overflow-hidden rounded-full p-[1px]">
                  <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]"></span>
                  <div className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-background/95 px-3 py-1 text-xs font-medium text-foreground backdrop-blur-3xl">
                    {t('hero.badge')}
                  </div>
                </span>
             </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tighter text-gray-900 dark:text-gray-50">
              {t('hero.title', { appName: APP_NAME })}
            </h1>
            <p className="max-w-3xl mx-auto text-lg md:text-xl text-muted-foreground mt-4">
              {t('hero.subtitle')}
            </p>
            <div className="mt-8">
              <Button onClick={() => setIsSignUpModalOpen(true)} size="lg" className="text-lg py-6 px-8 shadow-lg hover:shadow-xl transition-shadow">
                {t('hero.getStartedButton')} <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </section>

        {/* As Featured In */}
        <section className="py-8 bg-muted/50">
            <div className="container mx-auto px-4 md:px-6">
                <h2 className="text-center text-sm font-semibold text-muted-foreground uppercase tracking-wider">{t('featured.title')}</h2>
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-8 items-center justify-items-center opacity-70">
                    <p className="text-xl font-bold text-gray-400">Forbes</p>
                    <p className="text-xl font-bold text-gray-400">Bloomberg</p>
                    <p className="text-xl font-bold text-gray-400">TechCrunch</p>
                    <p className="text-xl font-bold text-gray-400">WIRED</p>
                </div>
            </div>
        </section>


        {/* For Every Stakeholder Section */}
        <section className="py-16 md:py-24 bg-background">
            <div className="container mx-auto px-4 md:px-6">
                 <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">{t('stakeholders.title')}</h2>
                    <p className="max-w-[700px] mx-auto text-muted-foreground md:text-lg/relaxed">{t('stakeholders.subtitle')}</p>
                </div>
                <Tabs defaultValue="farmers" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto">
                        {stakeholderTabs.map(tab => (
                            <TabsTrigger key={tab.id} value={tab.id} className="flex flex-col sm:flex-row gap-2 h-full py-3 px-2">
                                <StakeholderIcon role={tab.icon} />
                                {tab.name}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                    {stakeholderTabs.map(tab => (
                        <TabsContent key={tab.id} value={tab.id}>
                            <Card className="border-t-0 rounded-t-none">
                                <CardContent className="p-6 md:p-10 grid md:grid-cols-2 gap-8 items-center">
                                    <div className="relative w-full aspect-[4/3]">
                                        <Image src={t(`stakeholders.${tab.id}.image`)} alt={t(`stakeholders.${tab.id}.name`)} fill className="rounded-lg object-cover shadow-md" data-ai-hint="agriculture professional" />
                                    </div>
                                    <div className="space-y-4">
                                        <h3 className="text-2xl font-bold">{t(`stakeholders.${tab.id}.headline`)}</h3>
                                        <ul className="space-y-3">
                                            {(t.raw(`stakeholders.${tab.id}.points`) as {title: string, desc: string}[]).map((point, index) => (
                                                 <li key={index} className="flex items-start gap-3">
                                                    <CheckCircle className="h-5 w-5 mt-1 text-primary shrink-0" />
                                                    <div>
                                                        <h4 className="font-semibold">{point.title}</h4>
                                                        <p className="text-sm text-muted-foreground">{point.desc}</p>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    ))}
                </Tabs>
            </div>
        </section>


        {/* Trust Pillars Section */}
        <section id="features" className="py-16 md:py-24 bg-muted/50">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">{t('trustPillars.title')}</h2>
              <p className="max-w-[600px] mx-auto text-muted-foreground md:text-xl/relaxed">
                {t('trustPillars.subtitle')}
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {trustPillars.map((feature, index) => (
                <Card key={index} className="text-center p-6 shadow-md hover:shadow-lg hover:-translate-y-1 transition-all bg-card">
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
        
        {/* How It Works Section */}
        <section className="py-16 md:py-24">
            <div className="container mx-auto px-4 md:px-6">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">{t('howItWorks.title')}</h2>
                    <p className="max-w-[600px] mx-auto text-muted-foreground md:text-xl/relaxed">{t('howItWorks.subtitle')}</p>
                </div>
                <div className="grid md:grid-cols-3 gap-8 text-center">
                    {steps.map((step) => (
                        <div key={step.number} className="relative p-6">
                            <h3 className="text-8xl font-bold text-primary/10">{step.number}</h3>
                            <div className="relative -mt-12">
                                <h4 className="text-xl font-semibold">{step.title}</h4>
                                <p className="text-muted-foreground mt-2">{step.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-16 md:py-24 bg-muted/50">
            <div className="container mx-auto px-4 md:px-6">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl text-center mb-12">{t('testimonials.title')}</h2>
                <div className="grid lg:grid-cols-3 gap-8">
                    {testimonials.map((testimonial, index) => (
                        <Card key={index} className="p-6 flex flex-col">
                            <CardContent className="p-0 flex-grow">
                                <p className="italic text-muted-foreground">"{testimonial.quote}"</p>
                            </CardContent>
                            <CardFooter className="p-0 pt-6 mt-4 border-t">
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-12 w-12">
                                        <AvatarImage src={testimonial.avatar} alt={testimonial.name} data-ai-hint="farmer portrait" />
                                        <AvatarFallback>{testimonial.name.substring(0,1)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-semibold">{testimonial.name}</p>
                                        <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                                    </div>
                                </div>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            </div>
        </section>


        {/* Final CTA Section */}
        <section className="py-16 md:py-24 bg-primary text-primary-foreground">
          <div className="container px-4 md:px-6 text-center">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">{t('cta.title')}</h2>
            <p className="max-w-[600px] mx-auto mt-4 text-primary-foreground/80 md:text-xl/relaxed">
              {t('cta.subtitle')}
            </p>
            <div className="mt-8">
              <Button onClick={() => setIsSignUpModalOpen(true)} size="lg" variant="secondary" className="text-lg py-6 px-8">
                  {t('cta.button')} <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </section>
      </div>
      <SignUpModal isOpen={isSignUpModalOpen} onClose={() => setIsSignUpModalOpen(false)} />
    </>
  )
}
