
"use client"; 

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from '@/navigation';

export default function TermsOfServicePage() {
  const t = useTranslations('termsOfService');

  const sections = [
    "agreementToTerms",
    "intellectualProperty",
    "userRepresentations",
    "prohibitedActivities",
    "platformManagement",
    "termAndTermination",
    "modificationsAndInterruptions",
    "governingLaw",
    "disputeResolution",
    "contactUs"
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileText className="h-7 w-7 text-primary" />
            <CardTitle className="text-3xl">{t('title')}</CardTitle>
          </div>
          <CardDescription>{t('lastUpdated')}</CardDescription>
        </CardHeader>
        <CardContent className="prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none dark:prose-invert">
          <p>{t('introduction')}</p>
          {sections.map((sectionKey, index) => (
            <div key={index} className="mt-6">
              <h2 className="text-xl font-semibold">{t(`${sectionKey}.heading`)}</h2>
              {/* Assuming content is a single paragraph. For multiple, we'd need another structure. */}
              <p className="mt-2 text-muted-foreground">{t.raw(`${sectionKey}.content`)}</p>
            </div>
          ))}
          {t.rich('conclusion', {
            contactLink: (chunks) => <Link href="/contact" className="text-primary hover:underline">{chunks}</Link>
          })}
        </CardContent>
      </Card>
    </div>
  );
}
