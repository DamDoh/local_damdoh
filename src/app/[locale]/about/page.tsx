
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Info, Users, Eye, Heart, Shield } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";

export default function AboutPage() {
  const t = useTranslations('about');

  const teamMembers = [
    { name: t('team.member1Name'), role: t('team.member1Role'), bio: t('team.member1Bio') },
    { name: t('team.member2Name'), role: t('team.member2Role'), bio: t('team.member2Bio') },
    { name: t('team.member3Name'), role: t('team.member3Role'), bio: t('team.member3Bio') },
  ];

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader className="text-center">
          <div className="inline-flex items-center justify-center gap-2 mb-2">
            <Info className="h-10 w-10 text-primary" />
            <CardTitle className="text-4xl">{t('title')}</CardTitle>
          </div>
          <CardDescription className="text-lg">
            {t('subtitle')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-10 text-muted-foreground">
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3 flex items-center gap-2"><Shield className="h-6 w-6 text-primary"/>{t('mission.title')}</h2>
            <p>
              {t('mission.content')}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3 flex items-center gap-2"><Eye className="h-6 w-6 text-primary"/>{t('vision.title')}</h2>
            <p>
              {t('vision.content')}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3 flex items-center gap-2"><Heart className="h-6 w-6 text-primary"/>{t('values.title')}</h2>
            <ul className="list-disc list-inside space-y-2 pl-5">
              <li><strong className="text-foreground">{t('values.sustainability.title')}:</strong> {t('values.sustainability.content')}</li>
              <li><strong className="text-foreground">{t('values.collaboration.title')}:</strong> {t('values.collaboration.content')}</li>
              <li><strong className="text-foreground">{t('values.innovation.title')}:</strong> {t('values.innovation.content')}</li>
              <li><strong className="text-foreground">{t('values.integrity.title')}:</strong> {t('values.integrity.content')}</li>
              <li><strong className="text-foreground">{t('values.empowerment.title')}:</strong> {t('values.empowerment.content')}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-3 flex items-center gap-2"><Users className="h-6 w-6 text-primary"/>{t('team.title')}</h2>
            <p className="mb-4">
              {t('team.intro')}
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
             <p className="mt-4 text-center">{t('team.note')}</p>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
