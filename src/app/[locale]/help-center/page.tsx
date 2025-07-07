"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { HelpCircle, Search, BookOpen, ListChecks } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useTranslations } from "next-intl";

export default function HelpCenterPage() {
  const t = useTranslations('helpCenterPage');

  const faqCategories = [
    { name: t('gettingStarted.title'), icon: <BookOpen className="h-5 w-5 text-primary" />, description: t('gettingStarted.description'), link: "#getting-started" },
    { name: t('marketplaceGuide.title'), icon: <ListChecks className="h-5 w-5 text-primary" />, description: t('marketplaceGuide.description'), link: "#marketplace-guide" },
    { name: t('accountManagement.title'), icon: <HelpCircle className="h-5 w-5 text-primary" />, description: t('accountManagement.description'), link: "#account-management" },
    { name: t('troubleshooting.title'), icon: <HelpCircle className="h-5 w-5 text-primary" />, description: t('troubleshooting.description'), link: "#troubleshooting" },
  ];

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader className="text-center">
          <div className="inline-flex items-center justify-center gap-2 mb-2">
            <HelpCircle className="h-10 w-10 text-primary" />
            <CardTitle className="text-4xl">{t('title')}</CardTitle>
          </div>
          <CardDescription className="text-lg">
            {t('subtitle')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-10">
          <section className="text-center">
            <h2 className="text-2xl font-semibold text-foreground mb-3">{t('howCanWeHelp')}</h2>
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input placeholder={t('searchPlaceholder')} className="pl-10 h-12 text-md" />
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4 text-center">{t('browseTopics')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {faqCategories.map((category) => (
                <Link href={category.link} key={category.name} className="block hover:no-underline">
                  <Card className="hover:shadow-lg hover:border-primary/50 transition-all duration-200 h-full">
                    <CardHeader className="flex flex-row items-center gap-3">
                      {category.icon}
                      <CardTitle className="text-xl">{category.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{category.description}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
          
          <section className="text-center">
             <h2 className="text-2xl font-semibold text-foreground mb-3">{t('stillNeedHelp.title')}</h2>
             <p className="text-muted-foreground mb-4">
                {t('stillNeedHelp.description')}
             </p>
             <Button asChild>
                <Link href="/contact">{t('stillNeedHelp.button')}</Link>
             </Button>
          </section>

          <section id="getting-started" className="pt-6">
             <h3 className="text-xl font-semibold text-foreground mb-3">{t('gettingStarted.title')}</h3>
             <p className="text-muted-foreground">{t('gettingStarted.placeholder')}</p>
          </section>
           <section id="marketplace-guide" className="pt-6">
             <h3 className="text-xl font-semibold text-foreground mb-3">{t('marketplaceGuide.title')}</h3>
             <p className="text-muted-foreground">{t('marketplaceGuide.placeholder')}</p>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}