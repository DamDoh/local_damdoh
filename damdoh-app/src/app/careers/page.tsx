
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, Sparkles, Users, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

export default function CareersPage() {
  const { t } = useTranslation('common');

  const dummyOpenings = [
    {
      id: "job1",
      title: t('careers.openings.job1.title'),
      location: t('careers.openings.job1.location'),
      type: t('careers.openings.job1.type'),
      description: t('careers.openings.job1.description'),
    },
    {
      id: "job2",
      title: t('careers.openings.job2.title'),
      location: t('careers.openings.job2.location'),
      type: t('careers.openings.job2.type'),
      description: t('careers.openings.job2.description'),
    },
    {
      id: "job3",
      title: t('careers.openings.job3.title'),
      location: t('careers.openings.job3.location'),
      type: t('careers.openings.job3.type'),
      description: t('careers.openings.job3.description'),
    }
  ];

  const showOpenings = true; 

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader className="text-center">
          <div className="inline-flex items-center justify-center gap-2 mb-2">
            <Briefcase className="h-10 w-10 text-primary" />
            <CardTitle className="text-4xl">{t('careers.title')}</CardTitle>
          </div>
          <CardDescription className="text-lg">
            {t('careers.subtitle')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 text-muted-foreground">
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3 flex items-center gap-2"><Sparkles className="h-6 w-6 text-primary"/>{t('careers.whyWorkWithUs.title')}</h2>
            <p>
              {t('careers.whyWorkWithUs.intro')}
            </p>
            <ul className="list-disc list-inside space-y-1 pl-5 mt-3">
              <li>{t('careers.whyWorkWithUs.point1')}</li>
              <li>{t('careers.whyWorkWithUs.point2')}</li>
              <li>{t('careers.whyWorkWithUs.point3')}</li>
              <li>{t('careers.whyWorkWithUs.point4')}</li>
              <li>{t('careers.whyWorkWithUs.point5')}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3 flex items-center gap-2"><Users className="h-6 w-6 text-primary"/>{t('careers.openings.title')}</h2>
            {showOpenings && dummyOpenings.length > 0 ? (
              <div className="space-y-4">
                {dummyOpenings.map(job => (
                  <Card key={job.id}>
                    <CardHeader>
                      <CardTitle className="text-xl text-primary">{job.title}</CardTitle>
                      <CardDescription className="flex items-center gap-4 text-sm">
                        <span className="flex items-center gap-1"><MapPin className="h-4 w-4"/>{job.location}</span>
                        <span className="flex items-center gap-1"><Briefcase className="h-4 w-4"/>{job.type}</span>
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{job.description}</p>
                    </CardContent>
                    <CardContent className="pt-2">
                      <Button>{t('careers.applyNowButton')}</Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="min-h-[200px] flex flex-col items-center justify-center text-center border-2 border-dashed border-muted-foreground/30 rounded-lg p-8">
                <Briefcase className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                <h3 className="text-xl font-semibold text-muted-foreground mb-2">{t('careers.noOpenings.title')}</h3>
                <p className="text-muted-foreground max-w-md">
                  {t('careers.noOpenings.content1')} <a href={`mailto:${t('careers.noOpenings.email')}`} className="text-primary hover:underline">{t('careers.noOpenings.email')}</a>.
                </p>
              </div>
            )}
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
