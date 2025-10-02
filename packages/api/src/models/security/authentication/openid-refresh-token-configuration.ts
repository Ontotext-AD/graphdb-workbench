export interface RefreshTokenConfiguration {
  /**
   * How long before token expiry we attempt refresh (default: 60 seconds)
   */
  refreshAheadMs: number;

  /**
   * Never schedule a refresh earlier than this (default: 1 second)
   */
  minDelayMs: number;
}
