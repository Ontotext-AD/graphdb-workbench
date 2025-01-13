import {Model} from '../common';

/**
 * Holds information about restricted pages for the logged-in user.
 */
export class RestrictedPages extends Model<RestrictedPages>{

  private pages: Record<string, boolean> = {};

  isRestricted(pageUrl: string): boolean {
    return this.pages[pageUrl];
  }

  setPageRestriction(pageUrl: string, isRestricted = true): RestrictedPages {
    this.pages[pageUrl] = isRestricted;
    return this;
  }
}
