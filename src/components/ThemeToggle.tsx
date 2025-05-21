
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
    // Render a placeholder or null on the server and during initial client render
    // to avoid hydration mismatch due to localStorage/window.matchMedia access.
    return (
      <div key="placeholder" className="flex gap-1">
        <Button variant="ghost" disabled className="h-9 opacity-50">
          <Sun className="h-5 w-5" />
          <span>Light</span>
        </Button>
        <Button variant="ghost" disabled className="h-9 opacity-50">
          <Moon className="h-5 w-5" />
          <span>Dark</span>
        </Button>
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
