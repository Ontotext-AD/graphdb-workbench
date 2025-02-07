/**
 * Represents the user's consent for various types of cookies.
 */
export class CookieConsent {
  /** Indicates whether the cookie policy has been accepted. */
  policyAccepted?: boolean;

  /** Indicates consent for statistical cookies. */
  statistic?: boolean;

  /** Indicates consent for third-party cookies. */
  thirdParty?: boolean;

  /** Epoch timestamp of last update in seconds. */
  updatedAt?: number;

  constructor(data?: CookieConsent) {
    this.policyAccepted = data?.policyAccepted;
    this.statistic = data?.statistic;
    this.thirdParty = data?.thirdParty;
    this.updatedAt = data?.updatedAt;
  }
}
