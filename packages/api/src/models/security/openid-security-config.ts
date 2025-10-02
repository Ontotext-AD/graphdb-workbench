import {Model} from '../common';

/**
 * Configuration model for OpenID Connect authentication settings.
 *
 * Contains all necessary configuration parameters for OpenID Connect integration
 * including endpoints, client credentials, and authentication flow settings.
 */
export class OpenidSecurityConfig extends Model<OpenidSecurityConfig> {
  // Client configuration
  clientId?: string;
  issuer?: string;

  // Token configuration
  tokenType?: string;
  tokenAudience?: string;
  tokenIssuer?: string;

  // OpenID Connect endpoints
  oidcTokenEndpoint?: string;
  oidcJwksUri?: string;
  oidcEndSessionEndpoint?: string;
  oidcAuthorizationEndpoint?: string;

  // Supported features and scopes
  oidcScopesSupported?: string[];

  // Provider-specific settings
  oracleDomain?: string;
  proxyOidc?: boolean;

  // Authentication flow configuration
  authFlow?: string;
  extraScopes?: string;
  authorizeParameters?: string;

  // Computed URLs (based on proxyOidc setting)
  openIdTokenUrl?: string;
  openIdKeysUri?: string;
  openIdEndSessionUrl?: string;
  supportsOfflineAccess?: boolean;

  constructor(config?: Partial<OpenidSecurityConfig>) {
    super();
    if (!config) {
      return;
    }
    // Basic configuration
    this.clientId = config.clientId;
    this.issuer = config.issuer;
    this.tokenType = config.tokenType;
    this.tokenAudience = config.tokenAudience;
    this.tokenIssuer = config.tokenIssuer;

    // Endpoints
    this.oidcTokenEndpoint = config.oidcTokenEndpoint;
    this.oidcJwksUri = config.oidcJwksUri;
    this.oidcEndSessionEndpoint = config.oidcEndSessionEndpoint;
    this.oidcAuthorizationEndpoint = config.oidcAuthorizationEndpoint;

    // Features and scopes
    this.oidcScopesSupported = config.oidcScopesSupported || [];

    // Provider settings
    this.oracleDomain = config.oracleDomain;
    this.proxyOidc = config.proxyOidc || false;

    // Authentication flow
    this.authFlow = config.authFlow;
    this.extraScopes = config.extraScopes;
    this.authorizeParameters = config.authorizeParameters;

    // Computed properties
    this.openIdTokenUrl = this.proxyOidc ? 'rest/openid/token' : this.oidcTokenEndpoint;
    this.openIdKeysUri = this.proxyOidc ? 'rest/openid/jwks' : this.oidcJwksUri;
    this.openIdEndSessionUrl = this.oidcEndSessionEndpoint;
    this.supportsOfflineAccess = this.oidcScopesSupported.includes('offline_access');
  }
}
