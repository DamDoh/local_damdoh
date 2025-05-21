import { Leaf } from 'lucide-react';
import Link from 'next/link';

interface LogoProps {
  className?: string;
  iconSize?: number;
  textSize?: string;
}

export function Logo({ className, iconSize = 24, textSize = "text-2xl" }: LogoProps) {
  return (
    <Link href="/" className={`flex items-center gap-2 ${className}`}>
      <Leaf size={iconSize} /> {/* text-primary removed for color inheritance */}
      <span className={`font-bold ${textSize}`}>DamDoh</span> {/* text-primary removed for color inheritance */}
    </Link>
  );
}
