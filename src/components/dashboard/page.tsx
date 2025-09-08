"use client";

import { Link } from '@/navigation';
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, CheckCircle, Leaf, BrainCircuit, LineChart, MessageCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { APP_NAME } from "@/lib/constants";
import { SignUpModal } from '@/components/auth/SignUpModal';
import { useState } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

export function LandingPage() {
  const t = useTranslations('LandingPage');
  const [isSignUpModalOpen, setIsSignUpModalOpen] = useState(false);

  const features = [
    {
      icon: <BrainCircuit className="h-8 w-8 text-primary" />,
      title: t('features.diagnostics.title'),
      description: t('features.diagnostics.description')
    },
    {
      icon: <LineChart className="h-8 w-8 text-primary" />,
      title: t('features.insights.title'),
      description: t('features.insights.description')
    },
    {
      icon: <Leaf className="h-8 w-8 text-primary" />,
      title: t('features.recommendations.title'),
      description: t('features.recommendations.description')
    },
    {
      icon: <MessageCircle className="h-8 w-8 text-primary" />,
      title: t('features.assistant.title'),
      description: t('features.assistant.description')
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

  return (
    <>
      <div className="flex flex-col min-h-screen bg-background">
        {/* Hero Section */}
        <section className="relative flex flex-col items-center justify-center text-center py-24 md:py-32 bg-gray-50 dark:bg-gray-900/50">
          <div className="container px-4 md:px-6 z-10">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tighter text-gray-900 dark:text-gray-50">
              {t('hero.title')}
            </h1>
            <p className="max-w-[700px] mx-auto text-lg md:text-xl text-muted-foreground mt-4">
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
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-8 items-center justify-items-center">
                    <p className="text-xl font-bold text-gray-400">Forbes</p>
                    <p className="text-xl font-bold text-gray-400">Bloomberg</p>
                    <p className="text-xl font-bold text-gray-400">TechCrunch</p>
                    <p className="text-xl font-bold text-gray-400">WIRED</p>
                </div>
            </div>
        </section>


        {/* Problem/Solution Section */}
        <section className="py-16 md:py-24 bg-background">
            <div className="container mx-auto px-4 md:px-6">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div className="relative w-full aspect-square">
                        <Image
                            src="https://placehold.co/600x600.png"
                            alt={t('stopGuessing.imageAlt')}
                            fill
                            className="rounded-xl object-cover shadow-lg"
                            data-ai-hint="farmer looking at crop"
                        />
                    </div>
                    <div className="space-y-4">
                        <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">{t('stopGuessing.title')}</h2>
                        <p className="text-muted-foreground md:text-lg">
                           {t('stopGuessing.description')}
                        </p>
                        <ul className="space-y-3">
                            <li className="flex items-start gap-3">
                                <CheckCircle className="h-5 w-5 mt-1 text-primary shrink-0" />
                                <div>
                                <h4 className="font-semibold">{t('stopGuessing.p1_title')}</h4>
                                <p className="text-sm text-muted-foreground">{t('stopGuessing.p1_desc')}</p>
                                </div>
                            </li>
                             <li className="flex items-start gap-3">
                                <CheckCircle className="h-5 w-5 mt-1 text-primary shrink-0" />
                                <div>
                                <h4 className="font-semibold">{t('stopGuessing.p2_title')}</h4>
                                <p className="text-sm text-muted-foreground">{t('stopGuessing.p2_desc')}</p>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-16 md:py-24 bg-muted/50">
          <div className="container px-4 md:px-6 flex flex-col items-center">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">{t('features.title')}</h2>
              <p className="max-w-[600px] mx-auto text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                {t('features.subtitle')}
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <Card key={index} className="text-center p-6 shadow-md hover:shadow-lg transition-shadow bg-card">
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
                        <div key={step.number} className="relative">
                            <h3 className="text-7xl font-bold text-primary/10">{step.number}</h3>
                            <div className="relative -mt-8">
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
                        <Card key={index} className="p-6">
                            <CardContent className="p-0">
                                <p className="italic text-muted-foreground">"{testimonial.quote}"</p>
                                <div className="flex items-center gap-3 mt-4">
                                    <Avatar className="h-12 w-12">
                                        <AvatarImage src={testimonial.avatar} alt={testimonial.name} data-ai-hint="farmer portrait" />
                                        <AvatarFallback>{testimonial.name.substring(0,1)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-semibold">{testimonial.name}</p>
                                        <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                                    </div>
                                </div>
                            </CardContent>
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