import {CookieConsent} from '../tracking';

/**
 * Represents application settings for a user.
 */
export class AppSettings {
  DEFAULT_VIS_GRAPH_SCHEMA: boolean;
  DEFAULT_INFERENCE: boolean;
  DEFAULT_SAMEAS: boolean;
  IGNORE_SHARED_QUERIES: boolean;
  EXECUTE_COUNT: boolean;
  COOKIE_CONSENT?: CookieConsent;

  constructor(data?: Partial<AppSettings>) {
    this.DEFAULT_VIS_GRAPH_SCHEMA = data?.DEFAULT_VIS_GRAPH_SCHEMA ?? true;
    this.DEFAULT_INFERENCE = data?.DEFAULT_INFERENCE ?? true;
    this.DEFAULT_SAMEAS = data?.DEFAULT_SAMEAS ?? true;
    this.IGNORE_SHARED_QUERIES = data?.IGNORE_SHARED_QUERIES ?? false;
    this.EXECUTE_COUNT = data?.EXECUTE_COUNT ?? true;
    this.COOKIE_CONSENT = data?.COOKIE_CONSENT;
  }

  /**
   * Converts the AppSettings instance to a POJO.
   * @returns A POJO representation of the AppSettings instance.
   */
  toJSON(): Record<string, unknown> {
    return {
      DEFAULT_VIS_GRAPH_SCHEMA: this.DEFAULT_VIS_GRAPH_SCHEMA,
      DEFAULT_INFERENCE: this.DEFAULT_INFERENCE,
      DEFAULT_SAMEAS: this.DEFAULT_SAMEAS,
      IGNORE_SHARED_QUERIES: this.IGNORE_SHARED_QUERIES,
      EXECUTE_COUNT: this.EXECUTE_COUNT,
      COOKIE_CONSENT: this.COOKIE_CONSENT,
    };
  }
}
