"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, MapPin, Phone, Send } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

export default function ContactPage() {
  const t = useTranslations('contact');

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader className="text-center">
          <div className="inline-flex items-center justify-center gap-2 mb-2">
            <Mail className="h-10 w-10 text-primary" />
            <CardTitle className="text-4xl">{t('title')}</CardTitle>
          </div>
          <CardDescription className="text-lg">
            {t('subtitle')}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-8 items-start">
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-2 flex items-center gap-2"><Mail className="h-5 w-5 text-primary"/>{t('emailUs.title')}</h3>
              <p className="text-muted-foreground">{t('emailUs.general')}: <a href="mailto:info@damdoh.org" className="text-primary hover:underline">info@damdoh.org</a></p>
              <p className="text-muted-foreground">{t('emailUs.support')}: <a href="mailto:support@damdoh.org" className="text-primary hover:underline">support@damdoh.org</a></p>
              <p className="text-muted-foreground">{t('emailUs.partnerships')}: <a href="mailto:partners@damdoh.org" className="text-primary hover:underline">partners@damdoh.org</a></p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-2 flex items-center gap-2"><Phone className="h-5 w-5 text-primary"/>{t('callUs.title')}</h3>
              <p className="text-muted-foreground">{t('callUs.hours')}</p>
              <p className="text-muted-foreground">{t('callUs.phone')}</p>
            </div>
             <div>
              <h3 className="text-xl font-semibold text-foreground mb-2 flex items-center gap-2"><MapPin className="h-5 w-5 text-primary"/>{t('ourOffice.title')}</h3>
              <p className="text-muted-foreground">{t('ourOffice.org')}</p>
              <p className="text-muted-foreground">{t('ourOffice.address')}</p>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-foreground mb-4">{t('sendMessage.title')}</h3>
            <form className="space-y-4">
              <div>
                <Label htmlFor="name">{t('sendMessage.nameLabel')}</Label>
                <Input id="name" placeholder={t('sendMessage.namePlaceholder')} />
              </div>
              <div>
                <Label htmlFor="email_contact">{t('sendMessage.emailLabel')}</Label>
                <Input type="email" id="email_contact" placeholder={t('sendMessage.emailPlaceholder')} />
              </div>
              <div>
                <Label htmlFor="subject">{t('sendMessage.subjectLabel')}</Label>
                <Input id="subject" placeholder={t('sendMessage.subjectPlaceholder')} />
              </div>
              <div>
                <Label htmlFor="message">{t('sendMessage.messageLabel')}</Label>
                <Textarea id="message" placeholder={t('sendMessage.messagePlaceholder')} className="min-h-[120px]" />
              </div>
              <Button type="button" onClick={() => alert("Contact form submission is a placeholder. In a real app, this would send an email or save to a database.")}>
                <Send className="mr-2 h-4 w-4" /> {t('sendMessage.buttonText')}
              </Button>
              <p className="text-xs text-muted-foreground">{t('sendMessage.note')}</p>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}