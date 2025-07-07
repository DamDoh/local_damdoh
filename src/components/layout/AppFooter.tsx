
import { Link } from '@/navigation';
import Image from 'next/image';
import { APP_NAME } from '@/lib/constants';
import { Logo } from '@/components/Logo';
import { useTranslations } from 'next-intl';

export function AppFooter() {
  const t = useTranslations('AppFooter');
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border mt-12">
      {/* Top Section: Logo, Links */}
      <div className="bg-primary text-primary-foreground">
        <div className="container mx-auto max-w-screen-2xl px-4 py-10 md:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            <div className="space-y-3 md:col-span-12 lg:col-span-3">
              <Logo iconSize={32} textSize="text-2xl" className="text-primary-foreground" />
              <p className="text-sm text-primary-foreground/80">
                {t('tagline')}
              </p>
            </div>
            
            <div className="md:col-span-12 lg:col-span-9 grid grid-cols-2 sm:grid-cols-3 gap-8" data-ai-hint="Footer navigation links">
              <div>
                <h4 className="font-semibold mb-3 text-md text-primary-foreground">{t('damdohTitle')}</h4>
                <ul className="space-y-2 text-sm text-primary-foreground/90" data-ai-hint="Damdoh links">
                  <li><Link href="/about" className="hover:text-primary-foreground hover:underline transition-colors">{t('aboutLabel')}</Link></li>
                  <li><Link href="/contact" className="hover:text-primary-foreground hover:underline transition-colors">{t('contactLabel')}</Link></li>
                  <li><Link href="/careers" className="hover:text-primary-foreground hover:underline transition-colors">{t('careersLabel')}</Link></li>
                  <li><Link href="/blog" className="hover:text-primary-foreground hover:underline transition-colors">{t('blogLabel')}</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3 text-md text-primary-foreground">{t('resourcesTitle')}</h4>
                <ul className="space-y-2 text-sm text-primary-foreground/90" data-ai-hint="Resource links">
                  <li><Link href="/help-center" className="hover:text-primary-foreground hover:underline transition-colors">{t('helpCenterLabel')}</Link></li>
                  <li><Link href="/community-guidelines" className="hover:text-primary-foreground hover:underline transition-colors">{t('communityGuidelinesLabel')}</Link></li>
                  <li><Link href="/industry-news" className="hover:text-primary-foreground hover:underline transition-colors">{t('industryNewsLabel')}</Link></li>
                  <li><Link href="/agri-events" className="hover:text-primary-foreground hover:underline transition-colors">{t('eventsLabel')}</Link></li>
                  <li><Link href="/talent-exchange" className="hover:text-primary-foreground hover:underline transition-colors">{t('talentExchangeLabel')}</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3 text-md text-primary-foreground">{t('legalTitle')}</h4>
                <ul className="space-y-2 text-sm text-primary-foreground/90">
                  <li><Link href="/privacy" className="hover:text-primary-foreground hover:underline transition-colors">{t('privacyPolicyLabel')}</Link></li>
                  <li><Link href="/terms" className="hover:text-primary-foreground hover:underline transition-colors">{t('termsOfServiceLabel')}</Link></li>
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
              <p className="text-sm">{t('copyright', { year: currentYear, appName: APP_NAME })}</p>
            </div>
            <div className="flex flex-col items-center md:items-end gap-3">
              <p className="text-md font-medium">{t('getMobileApp')}</p>
              <div className="flex gap-3">
                <Link href="#playstore" passHref>
                  <Image 
                    src="https://placehold.co/135x40.png" 
                    alt={t('googlePlayAlt')}
                    width={135} 
                    height={40} 
                    className="rounded hover:opacity-90 transition-opacity"
                    data-ai-hint="google play badge"
                  />
                </Link>
                <Link href="#appstore" passHref>
                  <Image 
                    src="https://placehold.co/120x40.png" 
                    alt={t('appStoreAlt')}
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
