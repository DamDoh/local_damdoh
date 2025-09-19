import '@testing-library/jest-dom'
import React from 'react'

// Extend Jest matchers
import { expect } from '@jest/globals'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return ''
  },
}))

// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: (namespace) => (key) => `${namespace}.${key}`,
  NextIntlClientProvider: ({ children }) => children,
}))

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
global.localStorage = localStorageMock

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe() {
    return null
  }
  disconnect() {
    return null
  }
  unobserve() {
    return null
  }
}

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  observe() {
    return null
  }
  disconnect() {
    return null
  }
  unobserve() {
    return null
  }
}

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Tractor: () => React.createElement('div', { 'data-testid': 'tractor-icon' }, 'Tractor'),
  Users: () => React.createElement('div', { 'data-testid': 'users-icon' }, 'Users'),
  ShoppingCart: () => React.createElement('div', { 'data-testid': 'shopping-cart-icon' }, 'ShoppingCart'),
  BarChart3: () => React.createElement('div', { 'data-testid': 'bar-chart-icon' }, 'BarChart3'),
  Settings: () => React.createElement('div', { 'data-testid': 'settings-icon' }, 'Settings'),
  Bell: () => React.createElement('div', { 'data-testid': 'bell-icon' }, 'Bell'),
  FileText: () => React.createElement('div', { 'data-testid': 'file-text-icon' }, 'FileText'),
  CreditCard: () => React.createElement('div', { 'data-testid': 'credit-card-icon' }, 'CreditCard'),
  Building2: () => React.createElement('div', { 'data-testid': 'building-icon' }, 'Building2'),
  Microscope: () => React.createElement('div', { 'data-testid': 'microscope-icon' }, 'Microscope'),
  Award: () => React.createElement('div', { 'data-testid': 'award-icon' }, 'Award'),
  Truck: () => React.createElement('div', { 'data-testid': 'truck-icon' }, 'Truck'),
  Package: () => React.createElement('div', { 'data-testid': 'package-icon' }, 'Package'),
  Calculator: () => React.createElement('div', { 'data-testid': 'calculator-icon' }, 'Calculator'),
  Globe: () => React.createElement('div', { 'data-testid': 'globe-icon' }, 'Globe'),
  Heart: () => React.createElement('div', { 'data-testid': 'heart-icon' }, 'Heart'),
  Activity: () => React.createElement('div', { 'data-testid': 'activity-icon' }, 'Activity'),
  CloudRain: () => React.createElement('div', { 'data-testid': 'cloud-rain-icon' }, 'CloudRain'),
  DollarSign: () => React.createElement('div', { 'data-testid': 'dollar-sign-icon' }, 'DollarSign'),
  GraduationCap: () => React.createElement('div', { 'data-testid': 'graduation-cap-icon' }, 'GraduationCap'),
  Clock: () => React.createElement('div', { 'data-testid': 'clock-icon' }, 'Clock'),
  Eye: () => React.createElement('div', { 'data-testid': 'eye-icon' }, 'Eye'),
  Shield: () => React.createElement('div', { 'data-testid': 'shield-icon' }, 'Shield'),
  Warehouse: () => React.createElement('div', { 'data-testid': 'warehouse-icon' }, 'Warehouse'),
  Factory: () => React.createElement('div', { 'data-testid': 'factory-icon' }, 'Factory'),
  Briefcase: () => React.createElement('div', { 'data-testid': 'briefcase-icon' }, 'Briefcase'),
  Sparkles: () => React.createElement('div', { 'data-testid': 'sparkles-icon' }, 'Sparkles'),
  Zap: () => React.createElement('div', { 'data-testid': 'zap-icon' }, 'Zap'),
  Star: () => React.createElement('div', { 'data-testid': 'star-icon' }, 'Star'),
  MessageSquare: () => React.createElement('div', { 'data-testid': 'message-square-icon' }, 'MessageSquare'),
  Reply: () => React.createElement('div', { 'data-testid': 'reply-icon' }, 'Reply'),
  Bookmark: () => React.createElement('div', { 'data-testid': 'bookmark-icon' }, 'Bookmark'),
  Flag: () => React.createElement('div', { 'data-testid': 'flag-icon' }, 'Flag'),
  Volume2: () => React.createElement('div', { 'data-testid': 'volume-icon' }, 'Volume2'),
  VolumeX: () => React.createElement('div', { 'data-testid': 'volume-x-icon' }, 'VolumeX'),
  Play: () => React.createElement('div', { 'data-testid': 'play-icon' }, 'Play'),
  Pause: () => React.createElement('div', { 'data-testid': 'pause-icon' }, 'Pause'),
  Hash: () => React.createElement('div', { 'data-testid': 'hash-icon' }, 'Hash'),
  AtSign: () => React.createElement('div', { 'data-testid': 'at-sign-icon' }, 'AtSign'),
  Link: () => React.createElement('div', { 'data-testid': 'link-icon' }, 'Link'),
  ExternalLink: () => React.createElement('div', { 'data-testid': 'external-link-icon' }, 'ExternalLink'),
  ChevronDown: () => React.createElement('div', { 'data-testid': 'chevron-down-icon' }, 'ChevronDown'),
  ChevronUp: () => React.createElement('div', { 'data-testid': 'chevron-up-icon' }, 'ChevronUp'),
  Filter: () => React.createElement('div', { 'data-testid': 'filter-icon' }, 'Filter'),
  Target: () => React.createElement('div', { 'data-testid': 'target-icon' }, 'Target'),
  Crown: () => React.createElement('div', { 'data-testid': 'crown-icon' }, 'Crown'),
  Verified: () => React.createElement('div', { 'data-testid': 'verified-icon' }, 'Verified'),
  Bot: () => React.createElement('div', { 'data-testid': 'bot-icon' }, 'Bot'),
  ShoppingBag: () => React.createElement('div', { 'data-testid': 'shopping-bag-icon' }, 'ShoppingBag'),
  Lightbulb: () => React.createElement('div', { 'data-testid': 'lightbulb-icon' }, 'Lightbulb'),
  HandHeart: () => React.createElement('div', { 'data-testid': 'hand-heart-icon' }, 'HandHeart'),
  Menu: () => React.createElement('div', { 'data-testid': 'menu-icon' }, 'Menu'),
  WifiOff: () => React.createElement('div', { 'data-testid': 'wifi-off-icon' }, 'WifiOff'),
  Download: () => React.createElement('div', { 'data-testid': 'download-icon' }, 'Download'),
  Home: () => React.createElement('div', { 'data-testid': 'home-icon' }, 'Home'),
  Search: () => React.createElement('div', { 'data-testid': 'search-icon' }, 'Search'),
  User: () => React.createElement('div', { 'data-testid': 'user-icon' }, 'User'),
  Check: () => React.createElement('div', { 'data-testid': 'check-icon' }, 'Check'),
  Camera: () => React.createElement('div', { 'data-testid': 'camera-icon' }, 'Camera'),
  MapPin: () => React.createElement('div', { 'data-testid': 'map-pin-icon' }, 'MapPin'),
  TrendingUp: () => React.createElement('div', { 'data-testid': 'trending-up-icon' }, 'TrendingUp'),
  Share: () => React.createElement('div', { 'data-testid': 'share-icon' }, 'Share'),
  MoreHorizontal: () => React.createElement('div', { 'data-testid': 'more-horizontal-icon' }, 'MoreHorizontal'),
  ThumbsUp: () => React.createElement('div', { 'data-testid': 'thumbs-up-icon' }, 'ThumbsUp'),
  Smile: () => React.createElement('div', { 'data-testid': 'smile-icon' }, 'Smile'),
  AlertTriangle: () => React.createElement('div', { 'data-testid': 'alert-triangle-icon' }, 'AlertTriangle'),
  Calendar: () => React.createElement('div', { 'data-testid': 'calendar-icon' }, 'Calendar'),
  Sprout: () => React.createElement('div', { 'data-testid': 'sprout-icon' }, 'Sprout'),
  FlaskConical: () => React.createElement('div', { 'data-testid': 'flask-conical-icon' }, 'FlaskConical'),
}))