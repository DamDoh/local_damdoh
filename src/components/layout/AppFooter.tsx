
import Link from 'next/link';
import Image from 'next/image';
import { APP_NAME } from '@/lib/constants';
import { Logo } from '@/components/Logo';

export function AppFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-muted/60 border-t border-border mt-12">
      <div className="container mx-auto max-w-screen-2xl px-4 py-8 md:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-start">
          <div className="space-y-2 md:col-span-1">
            <Logo iconSize={28} textSize="text-xl" />
            <p className="text-xs text-muted-foreground">
              Bridging the agricultural supply chain for a thriving people, profit, and planet.
            </p>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 md:col-span-3">
            <div>
              <h4 className="font-semibold mb-2 text-sm">DamDoh</h4>
              <ul className="space-y-1 text-xs text-muted-foreground">
                <li><Link href="/about" className="hover:text-primary">About Us</Link></li>
                <li><Link href="/contact" className="hover:text-primary">Contact</Link></li>
                <li><Link href="/careers" className="hover:text-primary">Careers</Link></li>
                <li><Link href="/blog" className="hover:text-primary">Blog</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2 text-sm">Resources</h4>
              <ul className="space-y-1 text-xs text-muted-foreground">
                <li><Link href="/help-center" className="hover:text-primary">Help Center</Link></li>
                <li><Link href="/community-guidelines" className="hover:text-primary">Community Guidelines</Link></li>
                <li><Link href="/industry-news" className="hover:text-primary">Industry News</Link></li>
                <li><Link href="/agri-events" className="hover:text-primary">Events</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2 text-sm">Legal</h4>
              <ul className="space-y-1 text-xs text-muted-foreground">
                <li><Link href="/privacy" className="hover:text-primary">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-primary">Terms of Service</Link></li>
                <li><Link href="/cookie-policy" className="hover:text-primary">Cookie Policy</Link></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-border">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-center sm:text-left">
              <p className="text-xs text-muted-foreground">&copy; {currentYear} {APP_NAME}. All rights reserved.</p>
              <p className="text-xs text-muted-foreground mt-1">Empowering the agricultural value chain, from farm to fork.</p>
            </div>
            <div className="flex flex-col items-center sm:items-end gap-2">
              <p className="text-sm font-medium text-muted-foreground">Get Our Mobile App</p>
              <div className="flex gap-3">
                <Link href="#playstore" passHref>
                  <Image 
                    src="https://placehold.co/135x40.png" 
                    alt="Get it on Google Play" 
                    width={135} 
                    height={40}
                    className="rounded"
                    data-ai-hint="Google Play badge" 
                  />
                </Link>
                <Link href="#appstore" passHref>
                  <Image 
                    src="https://placehold.co/120x40.png" 
                    alt="Download on the App Store" 
                    width={120} 
                    height={40} 
                    className="rounded"
                    data-ai-hint="App Store badge"
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
