import {HttpService} from '../../http/http.service';
import {service} from '../../../providers';
import {SecurityContextService} from './../security-context.service';
import {OpenIdTokens} from '../../../models/security/authentication/openid-auth-flow-models';

export class OpenIdRestService extends HttpService {
  private readonly securityContextService = service(SecurityContextService);
  private readonly OAUTH_IDENTITY_DOMAIN_NAME_HEADER = 'X-OAuth-Identity-Domain-Name';
  private readonly CLIENT_ID;
  private readonly JWKS_ENDPOINT;
  private readonly TOKENS_ENDPOINT;

  private readonly headers: Record<string, string> = {};

  constructor() {
    super();
    const openIdSecurityConfig = this.securityContextService.getSecurityConfig()?.openidSecurityConfig;
    if (openIdSecurityConfig) {
      this.CLIENT_ID = openIdSecurityConfig.clientId!;

      this.JWKS_ENDPOINT = openIdSecurityConfig.openIdKeysUri!;
      this.TOKENS_ENDPOINT = openIdSecurityConfig.openIdTokenUrl!;
      if (openIdSecurityConfig?.oracleDomain) {
        // Oracle OAM deviates from the spec and requires this as well
        this.headers[this.OAUTH_IDENTITY_DOMAIN_NAME_HEADER] = openIdSecurityConfig.oracleDomain;
      }
    } else {
      throw new Error('OpenID security configuration is not available');
    }
  }

  getJSONWebKeySet(): Promise<{ keys: { kid: string }[] }> {
    return this.get<{ keys: { kid: string }[] }>(this.JWKS_ENDPOINT, undefined, this.headers);
  }

  refreshToken(refreshToken: string) {
    const params: Record<string, string> = {
      grant_type: 'refresh_token',
      client_id: this.CLIENT_ID,
      refresh_token: refreshToken
    };
    const headers = {...this.headers, 'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'};

    const body = this.transformURLEncodedRequest(params);

    return this.post<OpenIdTokens>(this.TOKENS_ENDPOINT, body, headers);
  }

  getTokens(redirectUrl: string, code: string, codeVerifier?: string | null) {
    const params: Record<string, string> = {
      grant_type: 'authorization_code',
      client_id: this.CLIENT_ID,
      redirect_uri: redirectUrl,
      code: code
    };

    if (codeVerifier) {
      params['code_verifier'] = codeVerifier;
    }

    const headers: Record<string, string> = {...this.headers, ...{'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'}};

    const body = this.transformURLEncodedRequest(params);

    return this.post<OpenIdTokens>(this.TOKENS_ENDPOINT, body, headers);
  }

  /**
   * Transforms an object to an application/x-www-form-urlencoded string.
   *
   * @param obj The object to transform.
   * @returns {string} The urlencoded string.
   */
  private transformURLEncodedRequest(obj: Record<string, string>) {
    const data = new URLSearchParams();
    Object.entries(obj).forEach(([key, value]) => {
      data.append(key, value);
    });

    return data;
  }
}
