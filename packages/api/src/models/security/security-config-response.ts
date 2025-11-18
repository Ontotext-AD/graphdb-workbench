import {AuthSettings} from './auth-settings';
import {OpenidSecurityConfig} from './openid-security-config';
import {AuthSettingsResponse} from './response-models';

export interface OpenidSecurityConfigResponse {
  clientId?: string;
  issuer?: string;

  tokenType?: string;
  tokenAudience?: string;
  tokenIssuer?: string;

  oidcTokenEndpoint?: string;
  oidcJwksUri?: string;
  oidcEndSessionEndpoint?: string;
  oidcAuthorizationEndpoint?: string;

  oidcScopesSupported?: string[];

  oracleDomain?: string;
  proxyOidc?: boolean;

  authFlow?: string;
  extraScopes?: string;
  authorizeParameters?: string;

  openIdTokenUrl?: string;
  openIdKeysUri?: string;
  openIdEndSessionUrl?: string;
  supportsOfflineAccess?: boolean;
}

export interface SecurityConfigResponse {
  authImplementation?: string;
  enabled?: boolean;
  passwordLoginEnabled?: boolean;
  freeAccess?: AuthSettingsResponse;
  overrideAuth?: AuthSettingsResponse;
  openIdEnabled?: boolean;
  freeAccessActive?: boolean;
  hasExternalAuth?: boolean;
  methodSettings?: {
    openid?: OpenidSecurityConfigResponse;
  };
}

export interface SecurityConfigInit {
  authImplementation?: string;
  enabled?: boolean;
  passwordLoginEnabled?: boolean;
  freeAccess?: AuthSettings;
  overrideAuth?: AuthSettings;
  openIdEnabled?: boolean;
  freeAccessActive?: boolean;
  hasExternalAuth?: boolean;
  openidSecurityConfig?: OpenidSecurityConfig;
}
