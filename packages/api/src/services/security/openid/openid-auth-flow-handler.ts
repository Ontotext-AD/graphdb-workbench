import {service} from '../../../providers';
import {OpenidSecurityConfig} from '../../../models/security';
import {LoggerProvider} from '../../logging/logger-provider';
import {getOrigin} from '../../utils';
import {OpenidStorageService} from './openid-storage.service';
import {OpenidTokenUtils} from './openid-token-utils';
import {OpenIdUtils} from './openid-utils';
import {GeneratorUtils} from '../../utils/generator-utils';
import {OpenIdError} from '../errors/openid/openid-error';
import {InvalidOpenidAuthFlow} from '../errors/openid/invalid-openid-auth-flow';
import {MissingAuthorizationCode} from '../errors/openid/missing-authorization-code';
import {AuthFlowParams, OpenIdAuthFlowType} from '../../../models/security/authentication/openid-auth-flow-models';
import {Notification, NotificationParam} from '../../../models/notification';
import {notify} from '../../notification';

export type ExchangeTokensCallback = (code: string, redirectUrl: string, codeVerifier?: string | null) => Promise<void>;

/**
 * Handles OpenID Connect authentication flows including PKCE, code without PKCE, and implicit flows.
 * Manages the complete authentication process from code exchange to token validation.
 */
export class OpenIdAuthFlowHandler {
  private readonly logger = LoggerProvider.logger;
  private readonly tokenUtils = service(OpenidTokenUtils);
  private readonly openidStorageService = service(OpenidStorageService);

  /**
   * Handles authorization code flow for both PKCE and non-PKCE variants.
   * @param config OpenID security configuration
   * @param params Authentication flow parameters from callback
   * @param exchangeTokensCallback Function to exchange code for tokens
   * @returns Promise resolving to true if successful or throws error on failure
   * @throws OpenIdError on failure scenarios
   */
  async handleAuthorizationCode(config: OpenidSecurityConfig, params: AuthFlowParams, exchangeTokensCallback: ExchangeTokensCallback): Promise<boolean> {
    if (!params.code) {
      this.logger.error('OpenID: Missing authorization code');
      throw new MissingAuthorizationCode();
    }

    const redirectUri = `${getOrigin()}`;

    if (config.authFlow === OpenIdAuthFlowType.CODE) {
      await this.handlePkceFlow(params, redirectUri, exchangeTokensCallback);
    } else if (config.authFlow === OpenIdAuthFlowType.CODE_NO_PKCE) {
      await this.handleCodeNoPkceFlow(params.code, redirectUri, exchangeTokensCallback);
    } else {
      this.logger.error('OpenID: Invalid OpenID authentication flow');
      throw new InvalidOpenidAuthFlow(config.authFlow);
    }
    return true;
  }

  /**
   * Handles implicit flow by directly saving tokens from URL parameters.
   * @param config OpenID security configuration
   * @param params Authentication flow parameters containing tokens
   * @returns Promise resolving when tokens are saved
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
    this.openidStorageService.setPkceCodeVerifier(GeneratorUtils.generateRandomString(28));
  }

  /**
   * Builds authorization URL for code flow with PKCE challenge.
   *
   * @returns Complete authorization URL
   */
  getCodeChallengeForCodeFlow(): string {
    const codeVerifier = this.openidStorageService.getPkceCodeVerifier().getValue();
    if (!codeVerifier) {
      throw new OpenIdError('Missing PKCE code verifier');
    }
    return OpenIdUtils.pkceChallengeFromVerifier(codeVerifier);
  }

  /**
   * Handles PKCE flow with state validation and code verifier.
   * @private
   * @param params Authentication flow parameters
   * @param redirectUri Redirect URI used in the authentication request
   * @param exchangeTokensCallback Function to exchange code for tokens
   * @throws OpenIdError on state mismatch or missing code
   */
  private async handlePkceFlow(params: AuthFlowParams, redirectUri: string, exchangeTokensCallback: ExchangeTokensCallback): Promise<void> {
    const storedState = this.openidStorageService.getPkceState().getValue();
    if (storedState !== params.state) {
      this.logger.debug(`OpenID: PKCE state mismatch ${storedState} != ${params.state}`);

      const notification = Notification.error('openid.errors.invalid_pkce_state')
        .withTitle('openid.errors.title')
        .withParameters({[NotificationParam.SHOULD_TOAST]: true});
      notify(notification);

      throw new OpenIdError(`PKCE state mismatch ${storedState} != ${params.state}`);
    }

    if (!params.code) {
      throw new MissingAuthorizationCode();
    }

    const codeVerifier = this.openidStorageService.getPkceCodeVerifier().getValue();
    await exchangeTokensCallback(params.code, redirectUri, codeVerifier);
  }

  /**
   * Handles authorization code flow without PKCE.
   * @private
   * @param code Authorization code
   * @param redirectUri Redirect URI used in the authentication request
   * @param exchangeTokensCallback Function to exchange code for tokens
   */
  private async handleCodeNoPkceFlow(code: string, redirectUri: string, exchangeTokensCallback: (code: string, redirectUrl: string) => Promise<void>): Promise<void> {
    await exchangeTokensCallback(code, redirectUri);
  }
}
