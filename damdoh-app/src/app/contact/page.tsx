
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, MapPin, Phone, Send } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

export default function ContactPage() {
  const { t } = useTranslation('common');

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader className="text-center">
          <div className="inline-flex items-center justify-center gap-2 mb-2">
            <Mail className="h-10 w-10 text-primary" />
            <CardTitle className="text-4xl">{t('contact.title')}</CardTitle>
          </div>
          <CardDescription className="text-lg">
            {t('contact.subtitle')}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-8 items-start">
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-2 flex items-center gap-2"><Mail className="h-5 w-5 text-primary"/>{t('contact.emailUsTitle')}</h3>
              <p className="text-muted-foreground">{t('contact.generalInquiries')} <a href="mailto:info@damdoh.org" className="text-primary hover:underline">info@damdoh.org</a></p>
              <p className="text-muted-foreground">{t('contact.support')} <a href="mailto:support@damdoh.org" className="text-primary hover:underline">support@damdoh.org</a></p>
              <p className="text-muted-foreground">{t('contact.partnerships')} <a href="mailto:partners@damdoh.org" className="text-primary hover:underline">partners@damdoh.org</a></p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-2 flex items-center gap-2"><Phone className="h-5 w-5 text-primary"/>{t('contact.callUsTitle')}</h3>
              <p className="text-muted-foreground">{t('contact.callUsDesc')}</p>
              <p className="text-muted-foreground">{t('contact.phone')} +1 (555) DAM-DOH0 (Placeholder)</p>
            </div>
             <div>
              <h3 className="text-xl font-semibold text-foreground mb-2 flex items-center gap-2"><MapPin className="h-5 w-5 text-primary"/>{t('contact.officeTitle')}</h3>
              <p className="text-muted-foreground">{t('contact.officeLine1')}</p>
              <p className="text-muted-foreground">{t('contact.officeLine2')}</p>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-foreground mb-4">{t('contact.formTitle')}</h3>
            <form className="space-y-4">
              <div>
                <Label htmlFor="name">{t('contact.formNameLabel')}</Label>
                <Input id="name" placeholder={t('contact.formNamePlaceholder')} />
              </div>
              <div>
                <Label htmlFor="email_contact">{t('contact.formEmailLabel')}</Label>
                <Input type="email" id="email_contact" placeholder={t('contact.formEmailPlaceholder')} />
              </div>
              <div>
                <Label htmlFor="subject">{t('contact.formSubjectLabel')}</Label>
                <Input id="subject" placeholder={t('contact.formSubjectPlaceholder')} />
              </div>
              <div>
                <Label htmlFor="message">{t('contact.formMessageLabel')}</Label>
                <Textarea id="message" placeholder={t('contact.formMessagePlaceholder')} className="min-h-[120px]" />
              </div>
              <Button type="button" onClick={() => alert("Contact form submission is a placeholder. In a real app, this would send an email or save to a database.")}>
                <Send className="mr-2 h-4 w-4" /> {t('contact.sendButton')}
              </Button>
              <p className="text-xs text-muted-foreground">{t('contact.formNote')}</p>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
