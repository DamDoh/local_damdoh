
import Link from 'next/link';
import { APP_NAME } from '@/lib/constants';
import { Logo } from '@/components/Logo';

export function AppFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-muted/60 border-t border-border mt-12">
      <div className="container mx-auto max-w-screen-2xl px-4 py-8 md:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          <div className="space-y-2">
            <Logo iconSize={28} textSize="text-xl" />
            <p className="text-xs text-muted-foreground">
              Connecting the agricultural supply chain for a sustainable future.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:col-span-2">
            <div>
              <h4 className="font-semibold mb-2 text-sm">DamDoh</h4>
              <ul className="space-y-1 text-xs text-muted-foreground">
                <li><Link href="/about" className="hover:text-primary">About Us</Link></li>
                <li><Link href="/contact" className="hover:text-primary">Contact</Link></li>
                <li><Link href="/careers" className="hover:text-primary">Careers</Link></li> {/* Placeholder */}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2 text-sm">Resources</h4>
              <ul className="space-y-1 text-xs text-muted-foreground">
                <li><Link href="/help-center" className="hover:text-primary">Help Center</Link></li> {/* Placeholder */}
                <li><Link href="/blog" className="hover:text-primary">Blog</Link></li> {/* Placeholder */}
                <li><Link href="/community-guidelines" className="hover:text-primary">Community Guidelines</Link></li> {/* Placeholder */}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2 text-sm">Legal</h4>
              <ul className="space-y-1 text-xs text-muted-foreground">
                <li><Link href="/privacy" className="hover:text-primary">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-primary">Terms of Service</Link></li>
                <li><Link href="/cookie-policy" className="hover:text-primary">Cookie Policy</Link></li> {/* Placeholder */}
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t border-border pt-6 text-center text-xs text-muted-foreground">
          <p>&copy; {currentYear} {APP_NAME}. All rights reserved.</p>
          <p className="mt-1">Empowering the agricultural value chain, from farm to fork.</p>
        </div>
      </div>
    </footer>
  );
}
