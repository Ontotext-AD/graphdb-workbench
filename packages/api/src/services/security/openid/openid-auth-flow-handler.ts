import {service} from '../../../providers';
import {OpenidSecurityConfig} from '../../../models/security/openid-security-config';
import {LoggerProvider} from '../../logging/logger-provider';
import {getOrigin} from '../../utils';
import {AuthFlowParams, OpenIdAuthFlowType} from '../../../models/security/authentication/openid-auth-flow-models';
import {OpenidStorageService} from './openid-storage.service';
import {OpenidTokenUtils} from './openid-token-utils';
import {OpenIdUtils} from './openid-utils';
import {OntoToastrService} from '../../toastr';

export type ExchangeTokensCallback = (code: string, redirectUrl: string, codeVerifier?: string | null) => Promise<void>;

/**
 * Handles OpenID Connect authentication flows including PKCE, code without PKCE, and implicit flows.
 * Manages the complete authentication process from code exchange to token validation.
 */
export class OpenIdAuthFlowHandler {
  private readonly logger = LoggerProvider.logger;
  private readonly tokenUtils = service(OpenidTokenUtils);
  private readonly openidStorageService = service(OpenidStorageService);
  private readonly toasterService = service(OntoToastrService);

  /**
   * Handles authorization code flow for both PKCE and non-PKCE variants.
   * @param config OpenID security configuration
   * @param params Authentication flow parameters from callback
   * @param exchangeTokensCallback Function to exchange code for tokens
   * @returns Promise resolving to true if successful
   */
  async handleAuthorizationCode(config: OpenidSecurityConfig, params: AuthFlowParams, exchangeTokensCallback: ExchangeTokensCallback): Promise<boolean> {
    const redirectUri = `${getOrigin()}login`;

    try {
      if (config.authFlow === OpenIdAuthFlowType.CODE) {
        await this.handlePkceFlow(params, redirectUri, exchangeTokensCallback);
      } else if (config.authFlow === OpenIdAuthFlowType.CODE_NO_PKCE) {
        if (!params.code) {
          throw new Error('Missing authorization code');
        }
        await this.handleCodeNoPkceFlow(params.code, redirectUri, exchangeTokensCallback);
      } else {
        throw new Error('Invalid OpenID authentication flow');
      }
      return true;
    } catch (error) {
      this.logger.error('oidc: error handling authorization code', error);
      throw error;
    }
  }

  /**
   * Handles implicit flow by directly saving tokens from URL parameters.
   * @param config OpenID security configuration
   * @param params Authentication flow parameters containing tokens
   */
  async handleImplicitFlow(config: OpenidSecurityConfig, params: AuthFlowParams): Promise<void> {
    this.tokenUtils.saveTokens(params, config);
  }

  /**
   * Checks if user has existing valid authentication tokens.
   * @param config OpenID security configuration
   * @returns true if authentication is valid, false otherwise
   */
  checkExistingAuthentication(config: OpenidSecurityConfig): boolean {
    const hasValidIdToken = this.tokenUtils.hasValidIdToken(config);
    const hasValidRefreshToken = this.tokenUtils.hasValidRefreshToken();

    return hasValidIdToken || hasValidRefreshToken;
  }

  /**
   * Stores PKCE state and code verifier for authorization code flow.
   * @param state Random state value for CSRF protection
   */
  storeCodeFlowData(state: string): void {
    this.openidStorageService.setPkceState(state);
    this.openidStorageService.setPkceCodeVerifier(OpenIdUtils.generateRandomString());
  }

  /**
   * Builds authorization URL for code flow with PKCE challenge.
   *
   * @returns Complete authorization URL
   */
  getCodeChallengeForCodeFlow(): string {
    const codeVerifier = this.openidStorageService.getPkceCodeVerifier().getValue();
    if (!codeVerifier) {
      throw new Error('Missing PKCE code verifier');
    }
    return OpenIdUtils.pkceChallengeFromVerifier(codeVerifier);
  }

  /**
   * Handles PKCE flow with state validation and code verifier.
   * @private
   */
  private async handlePkceFlow(params: AuthFlowParams, redirectUri: string, exchangeTokensCallback: ExchangeTokensCallback): Promise<void> {
    const storedState = this.openidStorageService.getPkceState().getValue();
    if (storedState !== params.state) {
      this.logger.debug(`oidc: PKCE state mismatch ${storedState} != ${params.state}`);
      this.toasterService.error('openid.auth.invalid.pkce.state');
      throw new Error('openid.auth.invalid.pkce.state');
    }

    if (!params.code) {
      throw new Error('Missing authorization code');
    }

    const codeVerifier = this.openidStorageService.getPkceCodeVerifier().getValue();
    await exchangeTokensCallback(params.code, redirectUri, codeVerifier);
  }

  /**
   * Handles authorization code flow without PKCE.
   * @private
   */
  private async handleCodeNoPkceFlow(
    code: string,
    redirectUri: string,
    exchangeTokensCallback: (code: string, redirectUrl: string) => Promise<void>
  ): Promise<void> {
    await exchangeTokensCallback(code, redirectUri);
  }
}
