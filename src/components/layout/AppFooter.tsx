
import Link from 'next/link';
import Image from 'next/image';
import { APP_NAME } from '@/lib/constants';
import { Logo } from '@/components/Logo';

export function AppFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border mt-12">
      {/* Top Section: Logo, Links */}
      <div className="bg-muted/60">
        <div className="container mx-auto max-w-screen-2xl px-4 py-10 md:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            <div className="space-y-3 md:col-span-12 lg:col-span-3">
              <Logo iconSize={32} textSize="text-2xl" />
              <p className="text-sm text-muted-foreground">
                Bridging the agricultural supply chain for a thriving people, profit, and planet.
              </p>
            </div>
            
            <div className="md:col-span-12 lg:col-span-9 grid grid-cols-2 sm:grid-cols-3 gap-8">
              <div>
                <h4 className="font-semibold mb-3 text-md">DamDoh</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><Link href="/about" className="hover:text-primary transition-colors">About Us</Link></li>
                  <li><Link href="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
                  <li><Link href="/careers" className="hover:text-primary transition-colors">Careers</Link></li>
                  <li><Link href="/blog" className="hover:text-primary transition-colors">Blog</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3 text-md">Resources</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><Link href="/help-center" className="hover:text-primary transition-colors">Help Center</Link></li>
                  <li><Link href="/community-guidelines" className="hover:text-primary transition-colors">Community Guidelines</Link></li>
                  <li><Link href="/industry-news" className="hover:text-primary transition-colors">Industry News</Link></li>
                  <li><Link href="/agri-events" className="hover:text-primary transition-colors">Events</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3 text-md">Legal</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
                  <li><Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
                  <li><Link href="/cookie-policy" className="hover:text-primary transition-colors">Cookie Policy</Link></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Copyright, App Badges */}
      <div className="bg-[#6ec33f] text-primary-foreground"> {/* Using header green and primary-foreground for light text */}
        <div className="container mx-auto max-w-screen-2xl px-4 py-8 md:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-center md:text-left">
              <p className="text-sm">&copy; {currentYear} {APP_NAME}. All rights reserved.</p>
              <p className="text-xs text-primary-foreground/80 mt-1">
                Bridging the agricultural supply chain for a thriving people, profit, and planet.
              </p>
            </div>
            <div className="flex flex-col items-center md:items-end gap-3">
              <p className="text-md font-medium">Get Our Mobile App</p>
              <div className="flex gap-3">
                <Link href="#playstore" passHref>
                  <Image 
                    src="https://placehold.co/135x40.png" 
                    alt="Get it on Google Play" 
                    width={135} 
                    height={40}
                    className="rounded hover:opacity-90 transition-opacity"
                    data-ai-hint="Google Play badge" 
                  />
                </Link>
                <Link href="#appstore" passHref>
                  <Image 
                    src="https://placehold.co/120x40.png" 
                    alt="Download on the App Store" 
                    width={120} 
                    height={40} 
                    className="rounded hover:opacity-90 transition-opacity"
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
