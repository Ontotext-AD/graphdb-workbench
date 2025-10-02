import {hextob64u, KJUR} from 'jsrsasign';
import {AuthFlowParams} from '../../../models/security/authentication';
import {WindowService} from '../../window';

export type OpenIdQueryParams = {
  access_token: string | null;
  code: string | null;
  id_token: string | null;
  state: string | null;
}

export class OpenIdUtils {
  /**
   * Returns the base64-urlencoded SHA-256 hash for the PKCE challenge.
   *
   * @param {string} v The code verifier string.
   * @returns {string} The encoded hash.
   */
  static pkceChallengeFromVerifier(v: string): string {
    const md = new KJUR.crypto.MessageDigest({alg: 'sha256', prov: 'cryptojs'});
    return hextob64u(md.digestString(v));
  };

  /**
   * Parses the OpenID values from URL parameters or hash fragment
   * and returns them as an object.
   *
   * @param {boolean} isImplicitFlow - If true, parses from URL hash fragment; if false, parses from query parameters.
   * @returns {AuthFlowParams} An object containing the parsed OpenID parameters.
   */
  static parseQueryString(isImplicitFlow: boolean): AuthFlowParams {
    const openIdParams: OpenIdQueryParams = {access_token: null, code: null, id_token: null, state: null};
    let urlParams;

    if (isImplicitFlow) {
      const fragment = WindowService.getLocationHash().substring(1);
      urlParams = new URLSearchParams(fragment);
    } else {
      urlParams = new URLSearchParams(WindowService.getLocationQueryParams());
    }

    if (urlParams.size === 0) {
      return openIdParams;
    }

    Object.keys(openIdParams).forEach((key) => {
      const value = urlParams.get(key);
      if (value) {
        openIdParams[key as keyof OpenIdQueryParams] = decodeURIComponent(value);
      }
    });

    return openIdParams;
  };
}
