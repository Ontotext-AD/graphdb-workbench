import {CookieStore} from '../cookie-store';

/**
 * In-memory implementation of {@link CookieStore} that simulates browser cookie semantics.
 * Intended for use in tests and server-side / non-browser environments.
 */
export class InMemoryCookieStore implements CookieStore {
  private readonly cookies = new Map<string, string>();

  read(): string {
    return Array.from(this.cookies.entries())
      .map(([k, v]) => `${k}=${v}`)
      .join('; ');
  }

  write(cookie: string): void {
    const [rawPair, ...attributes] = cookie.split(';');
    const eqIndex = rawPair.indexOf('=');
    if (eqIndex === -1) {
      return;
    }
    const key = rawPair.slice(0, eqIndex).trim();
    const value = rawPair.slice(eqIndex + 1).trim();

    const expiresAttr = attributes.find((a) => a.trim().toLowerCase().startsWith('expires='));
    if (expiresAttr) {
      const expiresValue = expiresAttr.trim().slice('expires='.length);
      const expiryDate = new Date(expiresValue);
      if (expiryDate.getTime() <= Date.now()) {
        this.cookies.delete(key);
        return;
      }
    }

    this.cookies.set(key, value);
  }

  clear(): void {
    this.cookies.clear();
  }
}
