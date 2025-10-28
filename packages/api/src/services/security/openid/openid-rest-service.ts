import {HttpService} from '../../http/http.service';
import {service} from '../../../providers';
import {SecurityContextService} from '../security-context.service';
import {MissingOpenidConfiguration} from '../errors/openid/missing-openid-configuration';
import {OpenIdTokens} from '../../../models/security/authentication/openid-auth-flow-models';

export class OpenIdRestService extends HttpService {
  private readonly securityContextService = service(SecurityContextService);
  private readonly OAUTH_IDENTITY_DOMAIN_NAME_HEADER = 'X-OAuth-Identity-Domain-Name';

  /**
   * Fetches the JSON Web Key Set (JWKS) from the OpenID provider.
   */
  getJSONWebKeySet(): Promise<{ keys: { kid: string }[] }> {
    return this.get<{ keys: { kid: string }[] }>(this.getJWKSEndpoint(), undefined, this.getDomainHeader());
  }

  /**
   * Refreshes the OpenID tokens using the provided refresh token.
   * @param refreshToken
   */
  refreshToken(refreshToken: string) {
    const params: Record<string, string> = {
      grant_type: 'refresh_token',
      client_id: this.getClientId(),
      refresh_token: refreshToken
    };
    const headers = {...this.getDomainHeader(), 'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'};

    const body = this.transformURLEncodedRequest(params);

    return this.post<OpenIdTokens>(this.getTokensEndpoint(), body, headers);
  }

  /**
   * Exchanges the authorization code for tokens.
   * @param redirectUrl The redirect URL used in the authorization request.
   * @param code The authorization code received from the OpenID provider.
   * @param codeVerifier The PKCE code verifier if PKCE was used, otherwise null or undefined.
   */
  getTokens(redirectUrl: string, code: string, codeVerifier?: string | null) {
    const params: Record<string, string> = {
      grant_type: 'authorization_code',
      client_id: this.getClientId(),
      redirect_uri: redirectUrl,
      code: code
    };

    if (codeVerifier) {
      params['code_verifier'] = codeVerifier;
    }

    const headers: Record<string, string> = {...this.getDomainHeader(), ...{'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'}};

    const body = this.transformURLEncodedRequest(params);

    return this.post<OpenIdTokens>(this.getTokensEndpoint(), body, headers);
  }

  /**
   * Transforms an object to an application/x-www-form-urlencoded string.
   *
   * @param obj The object to transform.
   * @returns The URL-encoded string.
   */
  private transformURLEncodedRequest(obj: Record<string, string>) {
    const data = new URLSearchParams();
    Object.entries(obj).forEach(([key, value]) => {
      data.append(key, value);
    });

    return data;
  }

  private getClientId(): string {
    const openIdSecurityConfig = this.securityContextService.getSecurityConfig()?.openidSecurityConfig;
    if (openIdSecurityConfig) {
      return openIdSecurityConfig.clientId!;
    } else {
      throw new MissingOpenidConfiguration();
    }
  }

  private getJWKSEndpoint(): string {
    const openIdSecurityConfig = this.securityContextService.getSecurityConfig()?.openidSecurityConfig;
    if (openIdSecurityConfig) {
      return openIdSecurityConfig.openIdKeysUri!;
    } else {
      throw new MissingOpenidConfiguration();
    }
  }

  private getTokensEndpoint(): string {
    const openIdSecurityConfig = this.securityContextService.getSecurityConfig()?.openidSecurityConfig;
    if (openIdSecurityConfig) {
      return openIdSecurityConfig.openIdTokenUrl!;
    } else {
      throw new MissingOpenidConfiguration();
    }
  }

  private getDomainHeader(): Record<string, string> {
    const openIdSecurityConfig = this.securityContextService.getSecurityConfig()?.openidSecurityConfig;
    if (openIdSecurityConfig?.oracleDomain) {
      return { [this.OAUTH_IDENTITY_DOMAIN_NAME_HEADER]: openIdSecurityConfig.oracleDomain };
    }
    return {};
  }
}
