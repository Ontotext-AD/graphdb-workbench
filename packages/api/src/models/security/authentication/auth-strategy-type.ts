/**
 * Enum representing the supported authentication strategy types.
 *
 * The security module provides a common interface for pluggable self-contained authentication strategies.
 * This prevents bloating the security module with entangled logic and promotes flexibility and extensibility.
 */
export enum AuthStrategyType {
  /**
   * Authentication using a GraphDB-specific token.
   */
  GDB_TOKEN = 'GDB_TOKEN',

  /**
   * Authentication using OpenID Connect protocol.
   */
  OPENID = 'OPENID',

  /**
   * Authentication using external protocol e.g. Kerberos, X.509.
   */
  EXTERNAL = 'EXTERNAL',

  /**
   * No authentication; open access.
   */
  NO_SECURITY = 'NO_SECURITY'
}
