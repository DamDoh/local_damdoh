
// src/components/ThemeToggle.tsx
"use client";

import { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ThemeToggle() {
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
    // This ensures the server and initial client render are very basic.
    return (
      <div key="placeholder" className="flex gap-1" aria-hidden="true" style={{height: '36px'}}> {/* h-9 equivalent */}
        <div className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium h-9 px-4 py-2 opacity-50">
          <Sun className="h-5 w-5" />
          <span>Light</span>
        </div>
        <div className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium h-9 px-4 py-2 opacity-50">
          <Moon className="h-5 w-5" />
          <span>Dark</span>
        </div>
      </div>
    );
  }

  return (
    <div key="actual" className="flex gap-1">
      <Button 
        variant={currentTheme === 'light' ? 'secondary' : 'ghost'} 
        onClick={() => handleSetTheme('light')} 
        aria-label="Switch to light theme"
        className="h-9"
      >
        <Sun className="h-5 w-5" />
        <span>Light</span>
      </Button>
      <Button 
        variant={currentTheme === 'dark' ? 'secondary' : 'ghost'} 
        onClick={() => handleSetTheme('dark')} 
        aria-label="Switch to dark theme"
        className="h-9"
      >
        <Moon className="h-5 w-5" />
        <span>Dark</span>
      </Button>
    </div>
  );
}
