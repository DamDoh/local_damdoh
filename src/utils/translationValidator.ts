import { locales, fallbackLocales, localeNames, languageMetadata } from '@/i18n-config';

export interface ValidationResult {
  key: string;
  microservice: string;
  issues: ValidationIssue[];
  severity: 'error' | 'warning' | 'info';
}

export interface ValidationIssue {
  type: 'missing_translation' | 'inconsistent_format' | 'placeholder_mismatch' | 'length_violation' | 'cultural_inconsistency';
  language: string;
  message: string;
  suggestion?: string;
}

export interface TranslationStats {
  totalKeys: number;
  completeTranslations: number;
  partialTranslations: number;
  missingTranslations: number;
  completionRate: number;
  issuesByType: Record<string, number>;
  issuesByLanguage: Record<string, number>;
  issuesByMicroservice: Record<string, number>;
}

export class TranslationValidator {
  private static instance: TranslationValidator;
  private validationCache: Map<string, ValidationResult[]> = new Map();

  static getInstance(): TranslationValidator {
    if (!TranslationValidator.instance) {
      TranslationValidator.instance = new TranslationValidator();
    }
    return TranslationValidator.instance;
  }

  /**
   * Validate all translations for a microservice
   */
  async validateMicroservice(
    microservice: string,
    translations: Record<string, any>
  ): Promise<ValidationResult[]> {
    const cacheKey = `${microservice}-validation`;
    if (this.validationCache.has(cacheKey)) {
      return this.validationCache.get(cacheKey)!;
    }

    const results: ValidationResult[] = [];
    const allKeys = this.extractKeys(translations);

    for (const key of allKeys) {
      const issues = await this.validateKey(microservice, key, translations);
      if (issues.length > 0) {
        const severity = this.calculateSeverity(issues);
        results.push({ key, microservice, issues, severity });
      }
    }

    this.validationCache.set(cacheKey, results);
    return results;
  }

  /**
   * Validate a specific translation key
   */
  private async validateKey(
    microservice: string,
    key: string,
    translations: Record<string, any>
  ): Promise<ValidationIssue[]> {
    const issues: ValidationIssue[] = [];
    const keyTranslations = this.getTranslationsForKey(key, translations);

    // Check for missing translations
    for (const locale of locales) {
      if (!keyTranslations[locale]) {
        // Check if fallback is available
        const fallbacks = fallbackLocales[locale as keyof typeof fallbackLocales] || [];
        let hasFallback = false;

        for (const fallback of fallbacks) {
          if (keyTranslations[fallback]) {
            hasFallback = true;
            break;
          }
        }

        if (!hasFallback) {
          issues.push({
            type: 'missing_translation',
            language: locale,
            message: `Missing translation for ${locale}`,
            suggestion: `Add translation for ${localeNames[locale]}`
          });
        }
      }
    }

    // Check for placeholder consistency
    const baseTranslation = keyTranslations.en || keyTranslations[Object.keys(keyTranslations)[0]];
    if (baseTranslation) {
      const placeholders = this.extractPlaceholders(baseTranslation);

      for (const [locale, translation] of Object.entries(keyTranslations)) {
        if (locale !== 'en' && translation) {
          const translationPlaceholders = this.extractPlaceholders(translation);

          // Check for missing placeholders
          for (const placeholder of placeholders) {
            if (!translationPlaceholders.includes(placeholder)) {
              issues.push({
                type: 'placeholder_mismatch',
                language: locale,
                message: `Missing placeholder ${placeholder} in ${locale} translation`,
                suggestion: `Add ${placeholder} to the ${locale} translation`
              });
            }
          }

          // Check for extra placeholders
          for (const placeholder of translationPlaceholders) {
            if (!placeholders.includes(placeholder)) {
              issues.push({
                type: 'placeholder_mismatch',
                language: locale,
                message: `Extra placeholder ${placeholder} in ${locale} translation`,
                suggestion: `Remove ${placeholder} from the ${locale} translation`
              });
            }
          }
        }
      }
    }

    // Check for length violations (especially for UI elements)
    for (const [locale, translation] of Object.entries(keyTranslations)) {
      if (translation && typeof translation === 'string') {
        const lengthRatio = translation.length / (keyTranslations.en?.length || translation.length);

        // Warn if translation is significantly longer (potential UI issues)
        if (lengthRatio > 2.5) {
          issues.push({
            type: 'length_violation',
            language: locale,
            message: `Translation is ${lengthRatio.toFixed(1)}x longer than English`,
            suggestion: 'Consider shortening the translation to fit UI constraints'
          });
        }
      }
    }

    // Check for cultural inconsistencies
    issues.push(...this.checkCulturalConsistency(key, keyTranslations));

    return issues;
  }

  /**
   * Extract all translation keys from nested object
   */
  private extractKeys(obj: any, prefix = ''): string[] {
    const keys: string[] = [];

    for (const [key, value] of Object.entries(obj)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;

      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        keys.push(...this.extractKeys(value, fullKey));
      } else {
        keys.push(fullKey);
      }
    }

    return keys;
  }

  /**
   * Get translations for a specific key from nested structure
   */
  private getTranslationsForKey(key: string, translations: Record<string, any>): Record<string, string> {
    const keys = key.split('.');
    let current = translations;

    for (const k of keys) {
      if (current && typeof current === 'object') {
        current = current[k];
      } else {
        return {};
      }
    }

    if (typeof current === 'string') {
      return { en: current }; // Assume English if direct string
    }

    return current || {};
  }

  /**
   * Extract ICU placeholders from translation string
   */
  private extractPlaceholders(text: string): string[] {
    const placeholderRegex = /\{([^}]+)\}/g;
    const placeholders: string[] = [];
    let match;

    while ((match = placeholderRegex.exec(text)) !== null) {
      placeholders.push(match[1]);
    }

    return [...new Set(placeholders)]; // Remove duplicates
  }

  /**
   * Check for cultural inconsistencies in translations
   */
  private checkCulturalConsistency(
    key: string,
    translations: Record<string, string>
  ): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    // Agricultural terminology checks
    if (key.includes('crop') || key.includes('farm')) {
      for (const [locale, translation] of Object.entries(translations)) {
        if (translation) {
          // Check for inappropriate agricultural terms for the region
          const metadata = languageMetadata[locale as keyof typeof languageMetadata];
          if (metadata?.agriculturalFocus) {
            // This would contain region-specific validation logic
            // For example, warning if rice terminology is used in desert regions
          }
        }
      }
    }

    // Currency and number format checks
    if (key.includes('price') || key.includes('cost') || key.includes('amount')) {
      for (const [locale, translation] of Object.entries(translations)) {
        if (translation && translation.includes('$')) {
          issues.push({
            type: 'cultural_inconsistency',
            language: locale,
            message: 'Using USD symbol in non-English translation',
            suggestion: `Use local currency symbol for ${localeNames[locale as keyof typeof localeNames]}`
          });
        }
      }
    }

    return issues;
  }

  /**
   * Calculate overall severity for a set of issues
   */
  private calculateSeverity(issues: ValidationIssue[]): 'error' | 'warning' | 'info' {
    if (issues.some(issue => issue.type === 'missing_translation')) {
      return 'error';
    }
    if (issues.some(issue => issue.type === 'placeholder_mismatch' || issue.type === 'length_violation')) {
      return 'warning';
    }
    return 'info';
  }

  /**
   * Generate comprehensive statistics
   */
  async generateStats(microservice: string, translations: Record<string, any>): Promise<TranslationStats> {
    const results = await this.validateMicroservice(microservice, translations);
    const allKeys = this.extractKeys(translations);

    const issuesByType: Record<string, number> = {};
    const issuesByLanguage: Record<string, number> = {};
    const issuesByMicroservice: Record<string, number> = {};

    results.forEach(result => {
      result.issues.forEach(issue => {
        issuesByType[issue.type] = (issuesByType[issue.type] || 0) + 1;
        issuesByLanguage[issue.language] = (issuesByLanguage[issue.language] || 0) + 1;
      });
      issuesByMicroservice[result.microservice] = (issuesByMicroservice[result.microservice] || 0) + result.issues.length;
    });

    const completeTranslations = allKeys.filter(key => {
      const keyTranslations = this.getTranslationsForKey(key, translations);
      return Object.keys(keyTranslations).length === locales.length;
    }).length;

    const partialTranslations = allKeys.filter(key => {
      const keyTranslations = this.getTranslationsForKey(key, translations);
      const count = Object.keys(keyTranslations).length;
      return count > 0 && count < locales.length;
    }).length;

    const missingTranslations = allKeys.length - completeTranslations - partialTranslations;

    const completionRate = allKeys.length > 0
      ? ((completeTranslations + partialTranslations * 0.5) / allKeys.length) * 100
      : 0;

    return {
      totalKeys: allKeys.length,
      completeTranslations,
      partialTranslations,
      missingTranslations,
      completionRate,
      issuesByType,
      issuesByLanguage,
      issuesByMicroservice
    };
  }

  /**
   * Clear validation cache
   */
  clearCache(): void {
    this.validationCache.clear();
  }

  /**
   * Get validation results for a specific microservice
   */
  getCachedResults(microservice: string): ValidationResult[] | undefined {
    return this.validationCache.get(`${microservice}-validation`);
  }
}

// Helper function for external use
export const validateTranslations = async (
  microservice: string,
  translations: Record<string, any>
): Promise<ValidationResult[]> => {
  const validator = TranslationValidator.getInstance();
  return validator.validateMicroservice(microservice, translations);
};

// Helper function for stats
export const generateTranslationStats = async (
  microservice: string,
  translations: Record<string, any>
): Promise<TranslationStats> => {
  const validator = TranslationValidator.getInstance();
  return validator.generateStats(microservice, translations);
};