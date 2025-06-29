
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Info, Users, Eye, Heart, Shield } from "lucide-react";
import Image from "next/image";
import { useTranslation } from "react-i18next";

export default function AboutPage() {
  const { t } = useTranslation('common');

  const teamMembers = [
    { name: t('about.team.member1Name'), role: t('about.team.member1Role'), bio: t('about.team.member1Bio') },
    { name: t('about.team.member2Name'), role: t('about.team.member2Role'), bio: t('about.team.member2Bio') },
    { name: t('about.team.member3Name'), role: t('about.team.member3Role'), bio: t('about.team.member3Bio') },
  ];

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader className="text-center">
          <div className="inline-flex items-center justify-center gap-2 mb-2">
            <Info className="h-10 w-10 text-primary" />
            <CardTitle className="text-4xl">{t('about.title')}</CardTitle>
          </div>
          <CardDescription className="text-lg">
            {t('about.subtitle')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-10 text-muted-foreground">
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3 flex items-center gap-2"><Shield className="h-6 w-6 text-primary"/>{t('about.mission.title')}</h2>
            <p>
              {t('about.mission.content')}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3 flex items-center gap-2"><Eye className="h-6 w-6 text-primary"/>{t('about.vision.title')}</h2>
            <p>
              {t('about.vision.content')}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3 flex items-center gap-2"><Heart className="h-6 w-6 text-primary"/>{t('about.values.title')}</h2>
            <ul className="list-disc list-inside space-y-2 pl-5">
              <li><strong className="text-foreground">{t('about.values.sustainability.title')}:</strong> {t('about.values.sustainability.content')}</li>
              <li><strong className="text-foreground">{t('about.values.collaboration.title')}:</strong> {t('about.values.collaboration.content')}</li>
              <li><strong className="text-foreground">{t('about.values.innovation.title')}:</strong> {t('about.values.innovation.content')}</li>
              <li><strong className="text-foreground">{t('about.values.integrity.title')}:</strong> {t('about.values.integrity.content')}</li>
              <li><strong className="text-foreground">{t('about.values.empowerment.title')}:</strong> {t('about.values.empowerment.content')}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3 flex items-center gap-2"><Users className="h-6 w-6 text-primary"/>{t('about.team.title')}</h2>
            <p className="mb-4">
              {t('about.team.intro')}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {teamMembers.map((member, index) => (
                <Card key={index} className="text-center p-4">
                  <Image 
                    src={`https://placehold.co/150x150.png`} 
                    alt={member.name} 
                    width={120} 
                    height={120} 
                    className="rounded-full mx-auto mb-3 border-2 border-primary"
                    data-ai-hint="team member portrait"
                  />
                  <h3 className="font-semibold text-foreground">{member.name}</h3>
                  <p className="text-sm text-primary">{member.role}</p>
                  <p className="text-xs mt-1">{member.bio}</p>
                </Card>
              ))}
            </div>
             <p className="mt-4 text-center">{t('about.team.note')}</p>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
