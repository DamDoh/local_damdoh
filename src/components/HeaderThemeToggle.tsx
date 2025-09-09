
"use client";

import { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';

export function HeaderThemeToggle() {
  const t = useTranslations('settingsPage.appearance');
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const storedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (storedTheme) {
      setCurrentTheme(storedTheme);
    } else if (systemPrefersDark) {
      setCurrentTheme('dark');
    } else {
      setCurrentTheme('light');
    }
  }, []); 

  useEffect(() => {
    if (!mounted) return; 
    if (currentTheme === 'dark') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [currentTheme, mounted]); 

  const handleSetTheme = (theme: 'light' | 'dark') => {
    setCurrentTheme(theme);
  };

  if (!mounted) {
    // Render a simplified placeholder to avoid hydration mismatch
    return (
      <div key="placeholder" style={{height: '36px', width: '36px'}}></div>
    );
  }

  return (
    <Button
        key="actual"
        variant="ghost"
        size="icon"
        onClick={() => handleSetTheme(currentTheme === 'light' ? 'dark' : 'light')}
        aria-label={currentTheme === 'light' ? t('switchToDarkAria') : t('switchToLightAria')}
        className="hover:bg-white/10"
      >
        <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
