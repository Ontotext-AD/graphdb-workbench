/**
 * Interface for cookie options used in the CookieBuilder class.
 */
export interface CookieOptions {
  /** Number of days until the cookie expires. Max supported by browsers is 400 days (or less depending on the browser). If omitted this is a session cookie. */
  expiration?: number;
  /** The URL path that must exist for the cookie to be sent. Defaults to '/'. */
  path?: string;
  /** The domain the cookie is accessible from. */
  domain?: string;
  /** If `true`, the cookie will only be sent over HTTPS. */
  secure?: boolean;
  /** If `true`, the cookie cannot be accessed via JavaScript. */
  httpOnly?: boolean;
  /** SameSite cookie attribute ('Strict', 'Lax', 'None'). */
  sameSite?: string;
}
