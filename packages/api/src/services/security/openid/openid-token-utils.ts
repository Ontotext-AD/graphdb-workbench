import {LoggerProvider} from '../../../services/logging/logger-provider';
import {b64utoutf8, KEYUTIL, KJUR, RSAKey} from 'jsrsasign';
import {service} from '../../../providers';
import {OpenidStorageService} from '../../../services/security/openid/openid-storage.service';
import {SecurityContextService} from '../../../services/security';
import {OpenidSecurityConfig} from '../../../models/security/openid-security-config';
import {OpenIdTokens, TokenType} from '../../../models/security/authentication';
import {InvalidJwtToken} from '../errors/openid/invalid-jwt-token';

export class OpenidTokenUtils {
  private readonly logger = LoggerProvider.logger;
  private readonly openidStorageService = service(OpenidStorageService);
  private readonly securityContextService = service(SecurityContextService);
  private readonly REFRESH_TOKEN_TOLERANCE = 5000; // 5 seconds

  /**
   * Determines if there is a valid ID token. A valid ID token means we are logged in.
   *
   * @param {OpenidSecurityConfig} openIdSecurityConfig - The OpenID security configuration
   * @returns {boolean} True if there is a valid ID token, false otherwise
   */
  hasValidIdToken(openIdSecurityConfig: OpenidSecurityConfig): boolean {
    const idToken = this.getTokenByType(TokenType.ID);
    if (!idToken) {
      this.logger.debug('OpenID: no id token');
      return false;
    }
    if (!this.verifyToken(TokenType.ID, openIdSecurityConfig)) {
      this.logger.debug('OpenID: stale id token');
      return false;
    }
    this.logger.debug('OpenID: valid id token found');
    return true;
  };

  /**
   * Determines if there is a valid refresh token.
   * If the refresh token is JWT it will be valid only if it hasn't expired yet.
   * It is always valid if it's JWT without expiration or non-JWT (opaque token).
   *
   * @returns {boolean} True if there is a valid refresh token, false otherwise.
   */
  hasValidRefreshToken(): boolean {
    const refreshToken = this.getTokenByType(TokenType.REFRESH);

    if (!refreshToken) {
      this.logger.debug('OpenID: no refresh token');
      return false;
    }

    let refreshData: Record<string, number>;
    try {
      refreshData = this.getTokenPayload(refreshToken) as Record<string, number>;
    } catch {
      return true;
    }

    if (refreshData['nbf'] && refreshData['nbf'] * 1000 - Date.now() > this.REFRESH_TOKEN_TOLERANCE) {
      return false;
    } else if (refreshData['exp'] && Date.now() - refreshData['exp'] * 1000 > this.REFRESH_TOKEN_TOLERANCE) {
      return false;
    } else {
      return !!refreshData['iat'];
    }
  };

  /**
   * Saves the retrieved tokens to local storage and cleans up temporary OpenID data.
   *
   * @param {OpenIdTokens} token - The token data to save
   * @param {OpenidSecurityConfig} openIdSecurityConfig - The OpenID security configuration
   */
  saveTokens(token: OpenIdTokens, openIdSecurityConfig: OpenidSecurityConfig) {
    if (token.refresh_token) {
      // Some OpenId providers give you a new token on refresh, some don't
      this.openidStorageService.setRefreshToken(token.refresh_token);
    } else {
      this.openidStorageService.clearRefreshToken();
    }

    if (token.access_token) {
      this.openidStorageService.setAccessToken(token.access_token);
    } else {
      this.openidStorageService.clearAccessToken();
    }

    if (token.id_token) {
      this.openidStorageService.setIdToken(token.id_token);
    } else {
      this.openidStorageService.clearIdToken();
    }

    this.openidStorageService.setTokenType(openIdSecurityConfig.tokenType!);

    this.logger.debug('OpenID: saved tokens');

    // Clean these up since we don't need them anymore
    this.openidStorageService.clearPkceState();
    this.openidStorageService.clearPkceCodeVerifier();
  };

  /**
   * Returns the Authorization header to use when we logged in via OpenID.
   * The header is composed of the keyword Bearer followed by a space and either the access
   * or the id token (according to the GraphDB configuration)
   *
   * @returns {string} The Authorization header value.
   */
  authHeaderGraphDB(): string {
    const tokenType = this.openidStorageService.getTokenType().getValue();
    if (tokenType === TokenType.ID) {
      return 'Bearer ' + this.getTokenByType(TokenType.ID);
    } else {
      return 'Bearer ' + this.getTokenByType(TokenType.ACCESS);
    }
  };

  /**
   * Decodes a JWT token and returns its header as an object. If there is no such token the empty
   * object will be returned. If the token isn't a JWT token an object with a single
   * property 'error' will be returned.
   *
   * The token header contains information on the cryptographic signature.
   *
   * @param {string} token - The token
   * @returns {Object|undefined} The decoded token header or empty object if no token
   */
  getTokenHeader(token: string): object | undefined {
    try {
      const decoded = KJUR.jws.JWS.readSafeJSONString(b64utoutf8(token.split('.')[0]));
      if (decoded) {
        return decoded;
      }
    } catch (e) {
      this.logger.error('OpenID: token header decode failed', e);
      throw new InvalidJwtToken();
    }
  };

  /**
   * Decodes a JWT token and returns its data as an object. If there is no such token the empty
   * object will be returned. If the token isn't a JWT token an object with a single
   * property 'error' will be returned.
   *
   * The token payload contains the actual information in the token.
   *
   * @param {string} token - The token
   * @returns {Object|undefined} The decoded token payload or empty object if no token
   */
  getTokenPayload(token: string): object | undefined {
    try {
      const decoded = KJUR.jws.JWS.readSafeJSONString(b64utoutf8(token.split('.')[1]));
      if (decoded) {
        return decoded;
      }
    } catch (e) {
      this.logger.debug('Token payload decode error', e);
      throw new InvalidJwtToken();
    }
  };

  /**
   * Verifies that a token exists and it's valid. Tokens are valid if they are JWT tokens
   * issued by the expected issuer to the expected audience and signed by a known public key.
   *
   * ID token only: if a nonce was used on login it must match as well.
   *
   * Refresh token only: only the issuer will be verified but not the audience.
   *
   * Non-JWT (opaque) tokens are always valid.
   *
   * @param {TokenType} tokenType - The token type: access, id or refresh
   * @param {OpenidSecurityConfig} openIdSecurityConfig - The OpenID security configuration
   * @returns {boolean} True if the token is valid, false otherwise
   */
  verifyToken(tokenType: TokenType, openIdSecurityConfig: OpenidSecurityConfig): boolean {
    const token = this.getTokenByType(tokenType);
    if (!token) {
      return false;
    }
    let headerObj;
    try {
      headerObj = this.getTokenHeader(token) as Record<string, string>;
    } catch {
      return false;
    }

    if (!headerObj.kid) {
      if (tokenType !== TokenType.ID) {
        if (headerObj.error) {
          this.logger.debug(`OpenID: token ${tokenType} is not a JWT token (token considered valid)`);
          return true;
        } else {
          this.logger.debug(`OpenID: invalid token ${tokenType} (token is empty)`);
          return false;
        }
      } else {
        // Only the id token must be JWT, access and refresh tokens are always valid if not JWT
        this.logger.debug('OpenID: invalid token id (not a JWT token)');
        return false;
      }
    }
    const jwk = this.securityContextService.getJsonWebKeysSet()?.[headerObj.kid];
    if (!jwk) {
      this.logger.debug('OpenID: no key to verify JWT token (token considered invalid)');
      return false;
    }
    // @ts-expect-error Not sure the correct type KJUR or dom JsonWebKey
    const key = KEYUTIL.getKey(jwk) as string | RSAKey;
    const verifyFields: Record<string, (string | undefined)[]> = {
      alg: [headerObj.alg],
      iss: [openIdSecurityConfig.issuer]
    };
    if (tokenType === 'id') {
      // Field validation is a bit counter-intuitive, the provided list should provide
      // all expected values and validation will work even if some are missing from the token,
      // but it will fail if the token contains a value that isn't in verifyFields.
      verifyFields['aud'] = [openIdSecurityConfig.clientId, openIdSecurityConfig.issuer];
      verifyFields['nonce'] = [this.openidStorageService.getNonce().getValue() || ''];
    } else if (tokenType === 'access') {
      verifyFields['aud'] = [openIdSecurityConfig.tokenAudience];
      verifyFields['iss'] = [openIdSecurityConfig.tokenIssuer];
    }
    return KJUR.jws.JWS.verifyJWT(token, key, verifyFields);
  };

  /**
   * Clears all stored tokens from local storage.
   */
  clearTokens() {
    this.openidStorageService.clearTokens();
  }

  /**
   * Retrieves a token of the specified type from storage.
   *
   * @param {TokenType} tokenType - The token type: access, id or refresh
   * @returns {string | null} The token string if found, null otherwise
   */
  getTokenByType(tokenType: TokenType): string | null {
    if (tokenType === TokenType.ID) {
      return this.openidStorageService.getIdToken().getValue();
    } else if (tokenType === TokenType.ACCESS) {
      return this.openidStorageService.getAccessToken().getValue();
    } else if (tokenType === TokenType.REFRESH) {
      return this.openidStorageService.getRefreshToken().getValue();
    }
    return null;
  }
}
