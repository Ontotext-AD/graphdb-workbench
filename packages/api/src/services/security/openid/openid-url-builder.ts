import {OpenidSecurityConfig} from '../../../models/security';
import {OpenIdAuthFlowType, OpenIdResponseType} from '../../../models/security/authentication';
import {SecurityContextService} from '../security-context.service';
import {service} from '../../../providers';
import {MissingOpenidConfiguration} from './errors/missing-openid-configuration';
import {InvalidOpenidAuthFlow} from './errors/invalid-openid-auth-flow';

/**
 * Builds OpenID Connect URLs for authentication and logout operations.
 *
 * Constructs properly formatted URLs with required parameters based on
 * the configured authentication flow (PKCE, implicit, etc.).
 */
export class OpenIdUrlBuilder {
  private readonly securityContextService = service(SecurityContextService);

  /**
   * Builds the authorization URL for login with all required parameters.
   * @param state Random state value for CSRF protection
   * @param codeChallenge PKCE code challenge (used for code flows)
   * @param redirectUrl URL to redirect to after authentication
   * @returns Complete authorization URL
   */
  buildLoginUrl(state: string, codeChallenge: string, redirectUrl: string): string {
    const responseType = this.getResponseType();
    const baseParams = this.buildBaseParameters(responseType, redirectUrl);
    const flowSpecificParams = this.buildFlowSpecificParameters(state, codeChallenge);
    const additionalParams = this.buildAdditionalParameters();

    const allParams = [...baseParams, ...flowSpecificParams, ...additionalParams];
    return `${this.getOpenIdConfig().oidcAuthorizationEndpoint}?${allParams.join('&')}`;
  }

  /**
   * Builds the logout URL with post-logout redirect.
   * @param redirectUrl URL to redirect to after logout
   * @returns Complete logout URL
   */
  buildLogoutUrl(redirectUrl: string): string {
    const config = this.getOpenIdConfig();
    const clientId = config.clientId!;
    const endSessionUrl = config.openIdEndSessionUrl!;
    return `${endSessionUrl}?client_id=${encodeURIComponent(clientId)}&post_logout_redirect_uri=${encodeURIComponent(redirectUrl)}`;
  }

  /**
   * Gets OpenID security config from context.
   * @returns {OpenidSecurityConfig} OpenID config
   * @throws {OpenIdError} If no config
   */
  private getOpenIdConfig(): OpenidSecurityConfig {
    const openIdSecurityConfig = this.securityContextService.getSecurityConfig()?.openidSecurityConfig;
    if (!openIdSecurityConfig) {
      throw new MissingOpenidConfiguration();
    }
    return openIdSecurityConfig;
  }

  /**
   * Determines the OAuth2 response type based on configured auth flow.
   * @private
   * @returns Response type ('code' or 'token')
   */
  private getResponseType(): string {
    const authFlow = this.getOpenIdConfig().authFlow;

    if (authFlow === OpenIdAuthFlowType.CODE || authFlow === OpenIdAuthFlowType.CODE_NO_PKCE) {
      return OpenIdResponseType.CODE;
    } else if (authFlow === OpenIdAuthFlowType.IMPLICIT) {
      return OpenIdResponseType.TOKEN;
    } else {
      throw new InvalidOpenidAuthFlow(authFlow);
    }
  }

  /**
   * Builds base OAuth2 parameters required for all flows.
   * @private
   */
  private buildBaseParameters(responseType: string, redirectUrl: string): string[] {
    return [
      `response_type=${encodeURIComponent(responseType)}`,
      `scope=${encodeURIComponent(this.getScope())}`,
      `client_id=${encodeURIComponent(this.getOpenIdConfig().clientId!)}`,
      `redirect_uri=${encodeURIComponent(redirectUrl)}`
    ];
  }

  /**
   * Builds parameters specific to the configured authentication flow.
   * @private
   */
  private buildFlowSpecificParameters(state: string, codeChallenge: string): string[] {
    const authFlow = this.getOpenIdConfig().authFlow;
    const params: string[] = [];

    if (authFlow === OpenIdAuthFlowType.CODE) {
      params.push(
        `state=${encodeURIComponent(state)}`,
        `code_challenge=${encodeURIComponent(codeChallenge)}`,
        'code_challenge_method=S256'
      );
    } else if (authFlow === OpenIdAuthFlowType.IMPLICIT) {
      params.push(`nonce=${encodeURIComponent(state)}`);
    }

    return params;
  }

  /**
   * Builds additional optional parameters from configuration.
   * @private
   */
  private buildAdditionalParameters(): string[] {
    const config = this.getOpenIdConfig();
    const params: string[] = [];

    if (config.oracleDomain) {
      params.push(`domain=${encodeURIComponent(config.oracleDomain)}`);
    }

    if (config.authorizeParameters) {
      params.push(config.authorizeParameters);
    }

    return params;
  }

  /**
   * Constructs the OAuth2 scope string with required and optional scopes.
   * @private
   * @returns Space-separated scope string
   */
  private getScope(): string {
    const scopes: string[] = ['openid'];

    if (this.getOpenIdConfig().supportsOfflineAccess) {
      scopes.push('offline_access');
    }

    const extraScopes = this.getOpenIdConfig().extraScopes;

    if (extraScopes) {
      scopes.push(extraScopes);
    }

    return scopes.join(' ');
  }
}
