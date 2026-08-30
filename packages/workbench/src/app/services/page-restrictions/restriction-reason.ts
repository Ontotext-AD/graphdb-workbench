export type RestrictionSeverity = 'info' | 'warn';

export interface RestrictionReason {
  severity: RestrictionSeverity;
  translationKey: string;
  translationParams?: Record<string, string>;
  ctaKey?: string;
  ctaLink?: string;
}
