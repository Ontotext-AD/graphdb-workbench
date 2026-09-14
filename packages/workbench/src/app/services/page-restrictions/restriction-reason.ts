export type RestrictionSeverity = 'info' | 'warn';

export interface RestrictionReason {
  severity: RestrictionSeverity;
  translationKey: string;
  translationParams?: Record<string, string>;
  /** Translation key for the actionable link's label, e.g. "Set new license". */
  actionLabelKey?: string;
  /**
   * Target of the actionable link. By default (undefined/false isExternalAction) an in-app
   * route (e.g. "/license"), rendered with routerLink; when isExternalAction is true, an
   * external URL (e.g. a documentation page), rendered as a plain href.
   */
  actionLink?: string;
  /**
   * Whether actionLink points outside the application. Defaults to false (an in-app route).
   */
  isExternalAction?: boolean;
}
