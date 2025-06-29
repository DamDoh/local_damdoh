
"use client";

import Link from 'next/link';
import Image from 'next/image';
import { APP_NAME } from '@/lib/constants';
import { Logo } from '@/components/Logo';
import { useTranslation } from "react-i18next";

export function AppFooter() {
  const { t } = useTranslation('common');
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border mt-12">
      {/* Top Section: Logo, Links - NOW GREEN BACKGROUND */}
      <div className="bg-[#8FBC8F] text-white"> {/* Updated to #8FBC8F */}
        <div className="container mx-auto max-w-screen-2xl px-4 py-10 md:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            <div className="space-y-3 md:col-span-12 lg:col-span-3">
              <Logo iconSize={32} textSize="text-2xl" className="text-white" />
              <p className="text-sm text-white/80"> {/* Lighter text for tagline */}
                {t('footer.tagline')}
              </p>
            </div>
            
            <div className="md:col-span-12 lg:col-span-9 grid grid-cols-2 sm:grid-cols-3 gap-8">
              <div>
                <h4 className="font-semibold mb-3 text-md text-white">{t('footer.companyTitle')}</h4>
                <ul className="space-y-2 text-sm text-white/90">
                  <li><Link href="/about" className="hover:text-white hover:underline transition-colors">{t('footer.aboutLink')}</Link></li>
                  <li><Link href="/contact" className="hover:text-white hover:underline transition-colors">{t('footer.contactLink')}</Link></li>
                  <li><Link href="/careers" className="hover:text-white hover:underline transition-colors">{t('footer.careersLink')}</Link></li>
                  <li><Link href="/blog" className="hover:text-white hover:underline transition-colors">{t('footer.blogLink')}</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3 text-md text-white">{t('footer.resourcesTitle')}</h4>
                <ul className="space-y-2 text-sm text-white/90">
                  <li><Link href="/help-center" className="hover:text-white hover:underline transition-colors">{t('footer.helpCenterLink')}</Link></li>
                  <li><Link href="/community-guidelines" className="hover:text-white hover:underline transition-colors">{t('footer.guidelinesLink')}</Link></li>
                  <li><Link href="/industry-news" className="hover:text-white hover:underline transition-colors">{t('footer.industryNewsLink')}</Link></li>
                  <li><Link href="/agri-events" className="hover:text-white hover:underline transition-colors">{t('footer.agriEventsLink')}</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3 text-md text-white">{t('footer.legalTitle')}</h4>
                <ul className="space-y-2 text-sm text-white/90">
                  <li><Link href="/privacy" className="hover:text-white hover:underline transition-colors">{t('footer.privacyLink')}</Link></li>
                  <li><Link href="/terms" className="hover:text-white hover:underline transition-colors">{t('footer.termsLink')}</Link></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Copyright, App Badges - LIGHT BACKGROUND */}
      <div className="bg-background text-foreground"> {/* Main page background, default text color */}
        <div className="container mx-auto max-w-screen-2xl px-4 py-8 md:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-center md:text-left">
              <p className="text-sm">{t('footer.copyright', { currentYear, appName: APP_NAME })}</p>
            </div>
            <div className="flex flex-col items-center md:items-end gap-3">
              <p className="text-md font-medium">{t('footer.getAppTitle')}</p>
              <div className="flex gap-3">
                <Link href="#playstore" passHref>
                  <Image 
                    src="https://placehold.co/135x40.png" 
                    alt="Get it on Google Play" 
                    width={135} 
                    height={40} 
                    className="rounded hover:opacity-90 transition-opacity"
                    data-ai-hint="google play badge"
                  />
                </Link>
                <Link href="#appstore" passHref>
                  <Image 
                    src="https://placehold.co/120x40.png" 
                    alt="Download on the App Store" 
                    width={120} 
                    height={40} 
                    className="rounded hover:opacity-90 transition-opacity"
                    data-ai-hint="apple store badge"
                  />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
