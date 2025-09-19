import { locales, languageMetadata } from '@/i18n-config';

export interface FormattingOptions {
  locale?: string;
  currency?: string;
  precision?: number;
  compact?: boolean;
  useGrouping?: boolean;
}

export interface DateTimeOptions {
  locale?: string;
  format?: 'short' | 'medium' | 'long' | 'full';
  calendar?: 'gregorian' | 'buddhist' | 'japanese' | 'islamic' | 'hebrew';
  timezone?: string;
}

export interface MeasurementOptions {
  locale?: string;
  system?: 'metric' | 'imperial' | 'local';
  precision?: number;
  compact?: boolean;
}

/**
 * Advanced Number Formatting with Cultural Awareness
 */
export class AdvancedNumberFormatter {
  private static instance: AdvancedNumberFormatter;
  private formatters: Map<string, Intl.NumberFormat> = new Map();

  static getInstance(): AdvancedNumberFormatter {
    if (!AdvancedNumberFormatter.instance) {
      AdvancedNumberFormatter.instance = new AdvancedNumberFormatter();
    }
    return AdvancedNumberFormatter.instance;
  }

  formatNumber(value: number, options: FormattingOptions = {}): string {
    const locale = options.locale || 'en';
    const key = `${locale}-${JSON.stringify(options)}`;

    if (!this.formatters.has(key)) {
      this.formatters.set(key, new Intl.NumberFormat(locale, {
        minimumFractionDigits: options.precision || 0,
        maximumFractionDigits: options.precision || 2,
        useGrouping: options.useGrouping !== false,
        notation: options.compact ? 'compact' : 'standard'
      }));
    }

    return this.formatters.get(key)!.format(value);
  }

  formatPercentage(value: number, options: FormattingOptions = {}): string {
    const locale = options.locale || 'en';
    const key = `percent-${locale}-${JSON.stringify(options)}`;

    if (!this.formatters.has(key)) {
      this.formatters.set(key, new Intl.NumberFormat(locale, {
        style: 'percent',
        minimumFractionDigits: options.precision || 0,
        maximumFractionDigits: options.precision || 2,
        useGrouping: options.useGrouping !== false
      }));
    }

    return this.formatters.get(key)!.format(value / 100);
  }

  formatCompact(value: number, locale: string = 'en'): string {
    return this.formatNumber(value, { locale, compact: true });
  }
}

/**
 * Advanced Currency Formatting with Regional Awareness
 */
export class AdvancedCurrencyFormatter {
  private static instance: AdvancedCurrencyFormatter;
  private formatters: Map<string, Intl.NumberFormat> = new Map();

  // Currency mappings for different regions
  private static readonly currencyMap: Record<string, string> = {
    'en': 'USD',
    'ar': 'SAR', // Saudi Riyal for Arabic
    'bn': 'BDT', // Bangladeshi Taka
    'de': 'EUR', // Euro for German
    'es': 'EUR', // Euro for Spanish
    'fr': 'EUR', // Euro for French
    'gu': 'INR', // Indian Rupee for Gujarati
    'hi': 'INR', // Indian Rupee for Hindi
    'id': 'IDR', // Indonesian Rupiah
    'ja': 'JPY', // Japanese Yen
    'km': 'KHR', // Cambodian Riel
    'ko': 'KRW', // Korean Won
    'ms': 'MYR', // Malaysian Ringgit
    'ne': 'NPR', // Nepalese Rupee
    'pt': 'BRL', // Brazilian Real for Portuguese
    'ru': 'RUB', // Russian Ruble
    'ta': 'INR', // Indian Rupee for Tamil
    'te': 'INR', // Indian Rupee for Telugu
    'th': 'THB', // Thai Baht
    'vi': 'VND', // Vietnamese Dong
  };

  static getInstance(): AdvancedCurrencyFormatter {
    if (!AdvancedCurrencyFormatter.instance) {
      AdvancedCurrencyFormatter.instance = new AdvancedCurrencyFormatter();
    }
    return AdvancedCurrencyFormatter.instance;
  }

  formatCurrency(
    value: number,
    options: FormattingOptions & { currency?: string } = {}
  ): string {
    const locale = options.locale || 'en';
    const currency = options.currency || AdvancedCurrencyFormatter.currencyMap[locale] || 'USD';
    const key = `currency-${locale}-${currency}-${JSON.stringify(options)}`;

    if (!this.formatters.has(key)) {
      this.formatters.set(key, new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: options.precision || 2,
        maximumFractionDigits: options.precision || 2,
        useGrouping: options.useGrouping !== false
      }));
    }

    return this.formatters.get(key)!.format(value);
  }

  getLocalCurrency(locale: string): string {
    return AdvancedCurrencyFormatter.currencyMap[locale] || 'USD';
  }

  convertAndFormat(
    value: number,
    fromCurrency: string,
    toCurrency: string,
    locale: string = 'en',
    exchangeRate: number = 1
  ): string {
    const convertedValue = value * exchangeRate;
    return this.formatCurrency(convertedValue, { locale, currency: toCurrency });
  }
}

/**
 * Advanced Date/Time Formatting with Cultural Calendar Support
 */
export class AdvancedDateTimeFormatter {
  private static instance: AdvancedDateTimeFormatter;
  private formatters: Map<string, Intl.DateTimeFormat> = new Map();

  static getInstance(): AdvancedDateTimeFormatter {
    if (!AdvancedDateTimeFormatter.instance) {
      AdvancedDateTimeFormatter.instance = new AdvancedDateTimeFormatter();
    }
    return AdvancedDateTimeFormatter.instance;
  }

  formatDate(date: Date, options: DateTimeOptions = {}): string {
    const locale = options.locale || 'en';
    const format = options.format || 'medium';
    const key = `date-${locale}-${format}-${options.calendar || 'gregorian'}`;

    if (!this.formatters.has(key)) {
      const dateTimeFormatOptions: Intl.DateTimeFormatOptions = {
        timeZone: options.timezone || 'UTC',
        calendar: options.calendar as any || 'gregorian'
      };

      switch (format) {
        case 'short':
          dateTimeFormatOptions.dateStyle = 'short';
          break;
        case 'medium':
          dateTimeFormatOptions.dateStyle = 'medium';
          break;
        case 'long':
          dateTimeFormatOptions.dateStyle = 'long';
          break;
        case 'full':
          dateTimeFormatOptions.dateStyle = 'full';
          break;
      }

      this.formatters.set(key, new Intl.DateTimeFormat(locale, dateTimeFormatOptions));
    }

    return this.formatters.get(key)!.format(date);
  }

  formatTime(date: Date, options: DateTimeOptions = {}): string {
    const locale = options.locale || 'en';
    const key = `time-${locale}-${options.timezone || 'UTC'}`;

    if (!this.formatters.has(key)) {
      this.formatters.set(key, new Intl.DateTimeFormat(locale, {
        timeStyle: 'medium',
        timeZone: options.timezone || 'UTC'
      }));
    }

    return this.formatters.get(key)!.format(date);
  }

  formatDateTime(date: Date, options: DateTimeOptions = {}): string {
    const locale = options.locale || 'en';
    const format = options.format || 'medium';
    const key = `datetime-${locale}-${format}-${options.timezone || 'UTC'}`;

    if (!this.formatters.has(key)) {
      const dateTimeFormatOptions: Intl.DateTimeFormatOptions = {
        timeZone: options.timezone || 'UTC'
      };

      switch (format) {
        case 'short':
          dateTimeFormatOptions.dateStyle = 'short';
          dateTimeFormatOptions.timeStyle = 'short';
          break;
        case 'medium':
          dateTimeFormatOptions.dateStyle = 'medium';
          dateTimeFormatOptions.timeStyle = 'medium';
          break;
        case 'long':
          dateTimeFormatOptions.dateStyle = 'long';
          dateTimeFormatOptions.timeStyle = 'medium';
          break;
        case 'full':
          dateTimeFormatOptions.dateStyle = 'full';
          dateTimeFormatOptions.timeStyle = 'medium';
          break;
      }

      this.formatters.set(key, new Intl.DateTimeFormat(locale, dateTimeFormatOptions));
    }

    return this.formatters.get(key)!.format(date);
  }

  formatRelativeTime(date: Date, locale: string = 'en'): string {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

    if (Math.abs(diffInSeconds) < 60) {
      return rtf.format(-diffInSeconds, 'second');
    } else if (Math.abs(diffInSeconds) < 3600) {
      return rtf.format(-Math.floor(diffInSeconds / 60), 'minute');
    } else if (Math.abs(diffInSeconds) < 86400) {
      return rtf.format(-Math.floor(diffInSeconds / 3600), 'hour');
    } else if (Math.abs(diffInSeconds) < 604800) {
      return rtf.format(-Math.floor(diffInSeconds / 86400), 'day');
    } else if (Math.abs(diffInSeconds) < 2592000) {
      return rtf.format(-Math.floor(diffInSeconds / 604800), 'week');
    } else {
      return rtf.format(-Math.floor(diffInSeconds / 2592000), 'month');
    }
  }

  // Support for different calendar systems
  formatWithCalendar(date: Date, calendar: string, locale: string = 'en'): string {
    const key = `calendar-${locale}-${calendar}`;

    if (!this.formatters.has(key)) {
      this.formatters.set(key, new Intl.DateTimeFormat(locale, {
        calendar: calendar as any,
        dateStyle: 'medium'
      }));
    }

    return this.formatters.get(key)!.format(date);
  }
}

/**
 * Advanced Measurement Formatting with Unit Conversion
 */
export class AdvancedMeasurementFormatter {
  private static instance: AdvancedMeasurementFormatter;

  // Conversion factors
  private static readonly conversions = {
    // Weight
    kg_to_lb: 2.20462,
    lb_to_kg: 0.453592,
    kg_to_ton: 0.001,
    ton_to_kg: 1000,

    // Area
    hectare_to_acre: 2.47105,
    acre_to_hectare: 0.404686,
    hectare_to_sqft: 107639,
    sqft_to_hectare: 1 / 107639,

    // Volume
    liter_to_gallon: 0.264172,
    gallon_to_liter: 3.78541,
    liter_to_cubic_meter: 0.001,
    cubic_meter_to_liter: 1000,

    // Length
    meter_to_foot: 3.28084,
    foot_to_meter: 0.3048,
    meter_to_yard: 1.09361,
    yard_to_meter: 0.9144,
    meter_to_mile: 0.000621371,
    mile_to_meter: 1609.34
  };

  static getInstance(): AdvancedMeasurementFormatter {
    if (!AdvancedMeasurementFormatter.instance) {
      AdvancedMeasurementFormatter.instance = new AdvancedMeasurementFormatter();
    }
    return AdvancedMeasurementFormatter.instance;
  }

  formatMeasurement(
    value: number,
    unit: string,
    options: MeasurementOptions = {}
  ): string {
    const locale = options.locale || 'en';
    const system = options.system || this.getPreferredSystem(locale);
    const convertedValue = this.convertUnit(value, unit, system);
    const convertedUnit = this.getLocalizedUnit(unit, system, locale);

    const numberFormatter = AdvancedNumberFormatter.getInstance();
    const formattedValue = numberFormatter.formatNumber(convertedValue, {
      locale,
      precision: options.precision || 2,
      compact: options.compact
    });

    return `${formattedValue} ${convertedUnit}`;
  }

  private convertUnit(value: number, fromUnit: string, toSystem: string): number {
    // For now, return the original value
    // In a full implementation, this would handle all unit conversions
    return value;
  }

  private getLocalizedUnit(unit: string, system: string, locale: string): string {
    // Unit localization mappings would go here
    const unitMap: Record<string, Record<string, string>> = {
      'kg': {
        'en': 'kg',
        'metric': 'kg',
        'imperial': 'lb'
      },
      'hectare': {
        'en': 'ha',
        'metric': 'ha',
        'imperial': 'ac'
      },
      'liter': {
        'en': 'L',
        'metric': 'L',
        'imperial': 'gal'
      }
    };

    return unitMap[unit]?.[locale] || unitMap[unit]?.['en'] || unit;
  }

  private getPreferredSystem(locale: string): 'metric' | 'imperial' | 'local' {
    // Determine preferred measurement system based on locale
    const imperialLocales = ['en-US', 'en-GB', 'en'];
    const metricLocales = ['de', 'fr', 'es', 'it', 'pt', 'ru', 'ja', 'ko', 'zh'];

    if (imperialLocales.some(l => locale.startsWith(l))) {
      return 'imperial';
    } else if (metricLocales.some(l => locale.startsWith(l))) {
      return 'metric';
    }

    return 'metric'; // Default to metric
  }

  formatArea(value: number, options: MeasurementOptions = {}): string {
    return this.formatMeasurement(value, 'hectare', options);
  }

  formatWeight(value: number, options: MeasurementOptions = {}): string {
    return this.formatMeasurement(value, 'kg', options);
  }

  formatVolume(value: number, options: MeasurementOptions = {}): string {
    return this.formatMeasurement(value, 'liter', options);
  }
}

/**
 * Cultural Calendar Support
 */
export class CulturalCalendarFormatter {
  private static instance: CulturalCalendarFormatter;

  static getInstance(): CulturalCalendarFormatter {
    if (!CulturalCalendarFormatter.instance) {
      CulturalCalendarFormatter.instance = new CulturalCalendarFormatter();
    }
    return CulturalCalendarFormatter.instance;
  }

  formatWithCulturalCalendar(date: Date, locale: string): string {
    const metadata = languageMetadata[locale as keyof typeof languageMetadata];

    if (!metadata) {
      return new Intl.DateTimeFormat(locale).format(date);
    }

    // Use appropriate calendar system based on locale
    let calendar: string;
    switch (locale.split('-')[0]) {
      case 'th':
        calendar = 'buddhist';
        break;
      case 'ja':
        calendar = 'japanese';
        break;
      case 'ar':
        calendar = 'islamic';
        break;
      case 'he':
        calendar = 'hebrew';
        break;
      default:
        calendar = 'gregorian';
    }

    const dateTimeFormatter = AdvancedDateTimeFormatter.getInstance();
    return dateTimeFormatter.formatWithCalendar(date, calendar, locale);
  }

  getAgriculturalSeasons(locale: string): Record<string, { start: Date; end: Date; name: string }> {
    // This would return culturally appropriate agricultural seasons
    // For example, different regions have different planting/harvest seasons
    const metadata = languageMetadata[locale as keyof typeof languageMetadata];

    if (!metadata) {
      return {};
    }

    // Simplified example - in real implementation, this would be much more comprehensive
    const currentYear = new Date().getFullYear();

    switch (metadata.region) {
      case 'South Asia':
        return {
          kharif: {
            name: 'Kharif Season',
            start: new Date(currentYear, 5, 1), // June
            end: new Date(currentYear, 9, 30) // October
          },
          rabi: {
            name: 'Rabi Season',
            start: new Date(currentYear, 10, 1), // November
            end: new Date(currentYear + 1, 2, 31) // March
          }
        };
      case 'Southeast Asia':
        return {
          wet: {
            name: 'Wet Season',
            start: new Date(currentYear, 4, 1), // May
            end: new Date(currentYear, 9, 30) // October
          },
          dry: {
            name: 'Dry Season',
            start: new Date(currentYear, 10, 1), // November
            end: new Date(currentYear + 1, 3, 30) // April
          }
        };
      default:
        return {
          spring: {
            name: 'Spring',
            start: new Date(currentYear, 2, 1), // March
            end: new Date(currentYear, 4, 31) // May
          },
          summer: {
            name: 'Summer',
            start: new Date(currentYear, 5, 1), // June
            end: new Date(currentYear, 7, 31) // August
          },
          fall: {
            name: 'Fall',
            start: new Date(currentYear, 8, 1), // September
            end: new Date(currentYear, 10, 31) // November
          },
          winter: {
            name: 'Winter',
            start: new Date(currentYear, 11, 1), // December
            end: new Date(currentYear + 1, 1, 28) // February
          }
        };
    }
  }
}

// Export singleton instances for easy use
export const numberFormatter = AdvancedNumberFormatter.getInstance();
export const currencyFormatter = AdvancedCurrencyFormatter.getInstance();
export const dateTimeFormatter = AdvancedDateTimeFormatter.getInstance();
export const measurementFormatter = AdvancedMeasurementFormatter.getInstance();
export const culturalCalendarFormatter = CulturalCalendarFormatter.getInstance();

// Convenience functions
export const formatNumber = (value: number, options?: FormattingOptions) =>
  numberFormatter.formatNumber(value, options);

export const formatCurrency = (value: number, options?: FormattingOptions & { currency?: string }) =>
  currencyFormatter.formatCurrency(value, options);

export const formatDate = (date: Date, options?: DateTimeOptions) =>
  dateTimeFormatter.formatDate(date, options);

export const formatDateTime = (date: Date, options?: DateTimeOptions) =>
  dateTimeFormatter.formatDateTime(date, options);

export const formatRelativeTime = (date: Date, locale?: string) =>
  dateTimeFormatter.formatRelativeTime(date, locale);

export const formatMeasurement = (value: number, unit: string, options?: MeasurementOptions) =>
  measurementFormatter.formatMeasurement(value, unit, options);