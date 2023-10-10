import {KJUR, KEYUTIL, b64utoutf8, hextob64u} from 'jsrsasign';

const modules = [
    'toastr',
];

const openIDReqHeaders = {headers: {
        'X-GraphDB-Repository-Location': undefined,
        'X-GraphDB-Repository': undefined,
        'X-Requested-With': undefined,
        'Authorization': undefined
    }}


angular.module('graphdb.framework.core.services.openIDService', modules)
    .service('$openIDAuth', ['$http', '$location', '$window', 'toastr', '$translate', 'AuthTokenService',
        function ($http, $location, $window, toastr, $translate, AuthTokenService) {
            const storagePrefix = 'com.ontotext.graphdb.openid.';
            const that = this;

            /**
             * The OpenID config returned by GraphDB.
             *
             * @typedef {{
             *      authFlow : string,
             *      authorizeParameters : string,
             *      clientId : string,
             *      issuer : string,
             *      oidcAuthorizationEndpoint : string,
             *      oidcEndSessionEndpoint : string,
             *      oidcJwksUri : string,
             *      oidcScopesSupported : Array
             *      oidcTokenEndpoint : string,
             *      proxyOidc : boolean,
             *      tokenAudience : string,
             *      tokenIssuer : string,
             *      tokenType : string,
             *      extraScopes : string,
             *      oracleDomain : string
             * }} OpenIdConfig
             */

            /**
             * Performs OpenID login.
             *
             * @param {OpenIdConfig} openIDConfig The OpenID configuration provided by GraphDB.
             * @param {string} returnToUrl The redirect URL registered with the OpenID provider.
             */
            this.login = function(openIDConfig, returnToUrl) {
                // Create and store a random "state" value
                const state = that.generateRandomString();
                const authFlow = openIDConfig.authFlow;

                if (authFlow === 'code') {
                    that.setStorageItem('pkce_state', state);

                    // Create and store a new PKCE code_verifier (the plaintext random secret)
                    const code_verifier = that.generateRandomString();
                    that.setStorageItem('pkce_code_verifier', code_verifier);

                    // Hash and base64-urlencode the secret to use as the challenge
                    const code_challenge = that.pkceChallengeFromVerifier(code_verifier);

                    $window.location.href = that.getLoginUrl(state, code_challenge, returnToUrl, openIDConfig);
                } else if (authFlow === 'code_no_pkce') {
                    that.removeStorageItem('pkce_code_verifier');
                    $window.location.href = that.getLoginUrl(state, '', returnToUrl, openIDConfig);
                } else if (authFlow === 'implicit') {
                    that.setStorageItem('nonce', state);
                    $window.location.href = that.getLoginUrl(state, '', returnToUrl, openIDConfig);
                } else {
                    console.log('oidc: unknown auth flow: ' + authFlow);
                    toastr.error($translate.instant('openid.auth.unknown.flow', {authFlow: authFlow}));
                }
            };

            /**
             * Builds the OpenID login URL that we'll redirect to initiate OpenID login.
             *
             * @param {string} state A random string.
             * @param {string} code_challenge PKCE code challenge.
             * @param {string} redirectUrl The redirect URL registered with the OpenID provider.
             * @param {OpenIdConfig} openIDConfig The OpenID configuration provided by GraphDB.
             * @returns {string} The built login URL.
             */
            this.getLoginUrl = function(state, code_challenge, redirectUrl, openIDConfig) {
                const params = [];
                let response_type = '';

                switch (openIDConfig.authFlow) {
                    case 'code':
                        response_type = 'code';
                        params.push('state=' + encodeURIComponent(state));
                        params.push('code_challenge=' + encodeURIComponent(code_challenge));
                        params.push('code_challenge_method=S256');
                        break;
                    case 'code_no_pkce':
                        response_type = 'code';
                        break;
                    case 'implicit':
                        response_type = 'token id_token';
                        params.push('nonce=' + encodeURIComponent(state));
                        break;
                    default:
                        throw new Error($translate.instant('openid.auth.unknown.flow', {authFlow: openIDConfig.authFlow}));
                }

                // We want these first even though the order doesn't matter.
                params.unshift(`response_type=${encodeURIComponent(response_type)}`,
                    `scope=${encodeURIComponent(that.getScope(openIDConfig.extraScopes))}`,
                    `client_id=${encodeURIComponent(openIDConfig.clientId)}`,
                    `redirect_uri=${encodeURIComponent(redirectUrl)}`);

                if (openIDConfig.oracleDomain) {
                    // Oracle OAM deviates from the spec and requires this as well
                    params.push(`domain=${encodeURIComponent(openIDConfig.oracleDomain)}`)
                }

                if (openIDConfig.authorizeParameters) {
                    params.push(openIDConfig.authorizeParameters);
                }

                return `${openIDConfig.oidcAuthorizationEndpoint}?${params.join('&')}`;
            }


            /**
             * Fetches the OpenID public keys, stores them and then calls the provided callback.
             *
             * @param {string} openIdKeysUri The OpenID public keys URL.
             * @param {Function} callback
             */
            this.withOpenIdKeys = function(openIdKeysUri, callback) {
                $http.get(openIdKeysUri, openIDReqHeaders).success(function(jwks) {
                    AuthTokenService.OPENID_CONFIG.openIdKeys = {};
                    jwks['keys'].forEach(function(k) {
                        AuthTokenService.OPENID_CONFIG.openIdKeys[k.kid] = k
                    });
                    callback();
                });
            };


            /**
             * Initializes the OpenID service, verifies if there are existing valid tokens or completes
             * the OpenID login by parsing OpenID tokens/code from the browser URL.
             *
             * @param {OpenIdConfig} openIDConfig The OpenID configuration provided by GraphDB.
             * @param {string} gdbUrl The redirect URL registered with the OpenID provider.
             * @param {Function} successCallback The callback to call on success.
             * @param {Function} errorCallback The callback to call on failure.
             */
            this.initOpenId = function(openIDConfig, gdbUrl, successCallback, errorCallback) {
                // Set the clientId and tokenType needed to retrieve the token
                that.clientId = openIDConfig.clientId;
                that.tokenType = openIDConfig.tokenType;

                // Set the audience and issuer needed to verify the token
                that.idTokenAudience = openIDConfig.clientId;
                that.idTokenIssuer = openIDConfig.issuer;
                that.accessTokenAudience = openIDConfig.tokenAudience;
                that.accessTokenIssuer = openIDConfig.tokenIssuer;

                // Set the token and keys url properly depending on a proxy
                AuthTokenService.OPENID_CONFIG.openIdTokenUrl = openIDConfig.oidcTokenEndpoint;
                AuthTokenService.OPENID_CONFIG.openIdKeysUri = openIDConfig.oidcJwksUri;
                if (openIDConfig.proxyOidc) {
                    AuthTokenService.OPENID_CONFIG.openIdKeysUri = 'rest/openid/jwks';
                    AuthTokenService.OPENID_CONFIG.openIdTokenUrl = 'rest/openid/token';
                }
                AuthTokenService.OPENID_CONFIG.openIdEndSessionUrl = openIDConfig.oidcEndSessionEndpoint;
                AuthTokenService.OPENID_CONFIG.supportsOfflineAccess = openIDConfig.oidcScopesSupported.includes('offline_access');

                if (openIDConfig.oracleDomain) {
                    // Oracle OAM deviates from the spec and requires this as well
                    openIDReqHeaders['headers']['X-OAuth-Identity-Domain-Name'] = openIDConfig.oracleDomain;
                }

                that.withOpenIdKeys(AuthTokenService.OPENID_CONFIG.openIdKeysUri, function() {
                    that.isLoggedIn = that.hasValidIdToken();
                    if (that.isLoggedIn) {
                        that.setupTokensRefresh(false, successCallback, errorCallback);
                    } else if (that.hasValidRefreshToken()) {
                        that.refreshTokens(successCallback, errorCallback);
                    } else {
                        const realSuccessCallback = successCallback;
                        successCallback = function() {
                            that.isLoggedIn = true;
                            realSuccessCallback(true);
                        };
                        // Cleanup any stale tokens
                        that.softLogout();
                        // possibly auth code flow
                        const s = that.parseQueryString($window.location.search.substring(1));
                        if (s.code) {
                            if (openIDConfig.authFlow === 'code') {
                                // Verify state matches what we set at the beginning
                                if (that.getStorageItem('pkce_state') !== s.state) {
                                    toastr.error($translate.instant('openid.auth.invalid.pkce.state'));
                                    console.log('oidc: PKCE state mismatch ' + that.getStorageItem('pkce_state') + ' != ' + s.state);
                                    errorCallback();
                                } else {
                                    that.retrieveTokensByCode(s.code, gdbUrl, successCallback, errorCallback);
                                }
                            } else if (openIDConfig.authFlow === 'code_no_pkce') {
                                that.retrieveTokensByCode(s.code, gdbUrl, successCallback, errorCallback);
                            }
                        } else {
                            // possibly implicit flow
                            const q = that.parseQueryString($window.location.pathname.substring(1));
                            if (q.id_token) {
                                that.saveTokens(q,true, false, successCallback);
                            } else {
                                errorCallback();
                            }
                        }
                    }
                })
            }

            /**
             * Returns the Authorization header to use when we logged in via OpenID.
             * The header is composed of the keyword Bearer followed by a space and either the access
             * or the id token (according to the GraphDB configuration)
             *
             * @returns {string} The Authorization header value.
             */
            this.authHeaderGraphDB = function() {
                if (that.getStorageItem('token_type') === 'id') {
                    return 'Bearer ' + that.getToken('id');
                } else {
                    return 'Bearer ' + that.getToken('access');
                }
            }

            /**
             * Performs a soft logout -- all tokens will be removed from local storage.
             */
            this.softLogout = function() {
                that.isLoggedIn = false;
                that.setToken('id', null);
                that.setToken('access', null);
                that.setToken('refresh', null);
            }

            /**
             * Performs a hard logout -- all tokens will be removed from storage and the browser
             * will be redirected to the OpenID logout endpoint. Upon logout, OpenID will redirect
             * back to the supplied URL.
             *
             * @param {string} redirectUrl The URL to redirect back to after OpenID logout.
             */
            this.hardLogout = function(redirectUrl) {
                that.softLogout();
                if (AuthTokenService.OPENID_CONFIG.openIdEndSessionUrl) {
                    $window.location.href =
                        `${AuthTokenService.OPENID_CONFIG.openIdEndSessionUrl}?client_id=${encodeURIComponent(that.clientId)}&post_logout_redirect_uri=${encodeURIComponent(redirectUrl)}`;
                }
            }

            /**
             * Gets a token from local storage.
             *
             * @param {string} tokenName The token name: access, id or refresh.
             * @returns {string} The requested token as an encoded string.
             */
            this.getToken = function(tokenName) {
                return that.getStorageItem(tokenName + '_token');
            }

            /**
             * Sets a token into local storage.
             *
             * @param {string} tokenName The token name: access, id or refresh.
             * @param {?string} tokenData The token data as an encoded string or null.
             */
            this.setToken = function(tokenName, tokenData) {
                if (tokenData) {
                    that.setStorageItem(tokenName + '_token', tokenData);
                } else {
                    that.removeStorageItem(tokenName + '_token');
                }
            }

            /**
             * Decodes a JWT token and returns its header as an object. If there is no such token the empty
             * object will be returned. If the token isn't a JWT token an object with a single
             * property 'error' will be returned.
             *
             * The token header contains information on the cryptographic signature.
             *
             * @param {string} tokenName The token name: access, id or refresh.
             * @returns {Object|{error: string}|{}}
             */
            this.tokenHeader = function(tokenName) {
                const token = that.getToken(tokenName);
                if (token) {
                    try {
                        const decoded = KJUR.jws.JWS.readSafeJSONString(b64utoutf8(token.split('.')[0]));
                        if (decoded) {
                            return decoded;
                        }
                    } catch (e) {
                    }
                    return {error: $translate.instant('openid.auth.not.jwt.token', {token: token})};
                } else {
                    return {};
                }
            }

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
             * @param {string} tokenName The token name: access, id or refresh.
             * @returns {boolean} True if the token is valid.
             */
            this.verifyToken = function(tokenName) {
                const token = that.getToken(tokenName);
                const headerObj = that.tokenHeader(tokenName);
                if (!headerObj.kid) {
                    if (tokenName !== 'id') {
                        if (headerObj.error) {
                            console.log(`oidc: token ${tokenName} is not a JWT token (token considered valid)`);
                            return true;
                        } else {
                            console.log(`oidc: invalid token ${tokenName} (token is empty)`);
                            return false;
                        }
                    } else {
                        // Only the id token must be JWT, access and refresh tokens are always valid if not JWT
                        console.log('oidc: invalid token id (not a JWT token)');
                        return false;
                    }
                }
                const jwk = AuthTokenService.OPENID_CONFIG.openIdKeys[headerObj.kid];
                if (!jwk) {
                    console.log('oidc: no key to verify JWT token (token considered invalid)');
                    return false;
                }
                const key = KEYUTIL.getKey(jwk);
                const verifyFields = {
                    alg: [headerObj.alg],
                    iss: [that.idTokenIssuer],
                };
                if (tokenName === 'id') {
                    // Field validation is a bit counter-intuitive, the provided list should provide
                    // all expected values and validation will work even if some are missing from the token,
                    // but it will fail if the token contains a value that isn't in verifyFields.
                    verifyFields['aud'] = [that.idTokenAudience, that.idTokenIssuer];
                    verifyFields['nonce'] = [that.getStorageItem('nonce')];
                } else if (tokenName === 'access') {
                    verifyFields['aud'] = [that.accessTokenAudience];
                    verifyFields['iss'] = [that.accessTokenIssuer];
                }
                return KJUR.jws.JWS.verifyJWT(token, key, verifyFields);
            }

            /**
             * Determines if there is a valid ID token. A valid ID token means we are logged in.
             *
             * @returns {boolean}
             */
            this.hasValidIdToken = function() {
                if (!that.getToken('id')) {
                    console.log('oidc: no id token');
                    return false;
                }
                if (!that.verifyToken('id')) {
                    console.log('oidc: stale id token');
                    return false;
                }
                console.log('oidc: valid id token found');
                return true;
            }

            /**
             * Decodes a JWT token and returns its data as an object. If there is no such token the empty
             * object will be returned. If the token isn't a JWT token an object with a single
             * property 'error' will be returned.
             *
             * The token payload contains the actual information in the token.
             *
             * @param {string} tokenName The token name: access, id or refresh.
             * @returns {Object|{error: string}|{}}
             */
            this.tokenPayload = function(tokenName) {
                const token = that.getToken(tokenName);
                if (token) {
                    try {
                        const decoded = KJUR.jws.JWS.readSafeJSONString(b64utoutf8(token.split('.')[1]));
                        if (decoded) {
                            return decoded;
                        }
                    } catch (e) {
                    }
                    return {error: $translate.instant('openid.auth.not.jwt.token', {token: token})};
                } else {
                    return {};
                }
            }

            /**
             * Saves the retrieved tokens to local storage, removes the OpenID data from the URL
             * (on login) and calls the success callback.
             *
             * @param {Object} token The token data to save.
             * @param {boolean} justLoggedIn True if the tokens are the result of login.
             * @param {boolean} justRefreshed True if the tokens are the result of token refresh.
             * @param {Function} successCallback The callback function to call at the end.
             */
            this.saveTokens = function(token, justLoggedIn, justRefreshed, successCallback) {
                if (justLoggedIn || token.refresh_token) {
                    // Some OpenId providers give you a new token on refresh, some don't
                    that.setToken('refresh', token.refresh_token);
                }
                that.setToken('access', token.access_token);
                that.setToken('id', token.id_token);
                that.setStorageItem('token_type', that.tokenType);

                console.log('oidc: saved tokens');

                that.setupTokensRefresh(justLoggedIn || justRefreshed, successCallback);

                // Clean these up since we don't need them anymore
                that.removeStorageItem('pkce_state');
                that.removeStorageItem('pkce_code_verifier');

                if (justLoggedIn) {
                    // TODO: Maybe move this outside the service?
                    $location.url('/');
                }
            }

            /**
             * Transforms an object to an application/x-www-form-urlencoded string.
             *
             * @param obj The object to transform.
             * @returns {string} The urlencoded string.
             */
            function transformURLEncodedRequest(obj) {
                const str = [];
                for(let p in obj) {
                    if (obj.hasOwnProperty(p)) {
                        str.push(`${p}=${encodeURIComponent(obj[p])}`);
                    }
                }
                return str.join("&");
            }

            /**
             * Retrieves the tokens via an authorization code.
             *
             * @param {string} code The authorization code received via login.
             * @param {string} redirectUrl The redirect URL registered with the OpenID provider.
             * @param {Function} successCallback The callback to call on success.
             * @param {Function} errorCallback The callback to call on failure.
             */
            this.retrieveTokensByCode = function(code, redirectUrl, successCallback, errorCallback) {
                const params = {
                    grant_type: 'authorization_code',
                    client_id: that.clientId,
                    redirect_uri: redirectUrl,
                    code: code
                };

                const codeVerifier = that.getStorageItem('pkce_code_verifier');
                if (codeVerifier) {
                    params['code_verifier'] = codeVerifier;
                }

                const headers = {...openIDReqHeaders['headers'], ...{'Content-type': 'application/x-www-form-urlencoded; charset=utf-8'}};

                $http({
                    method: 'POST',
                    url: AuthTokenService.OPENID_CONFIG.openIdTokenUrl,
                    headers: headers,
                    transformRequest: transformURLEncodedRequest,
                    data: params
                }).success(function(data) {
                    that.saveTokens(data, true, false, successCallback);
                }).error(function(e) {
                    toastr.error($translate.instant('openid.auth.cannot.retrieve.token.msg', {error: getError(e)}));
                    errorCallback();
                })
            };

            /**
             * Refreshes the tokens by using the refresh token and calling the OpenID token endpoint.
             *
             * Calling this function without having a valid refresh token is an error.
             *
             * @param {Function} successCallback The callback to call on success.
             * @param {Function} [errorCallback] The callback to call on failure.
             */
            this.refreshTokens = function(successCallback, errorCallback) {
                if (that.hasValidRefreshToken()) {
                    const params = {
                        grant_type: 'refresh_token',
                        client_id: that.clientId,
                        refresh_token: that.getToken('refresh'),
                    };
                    const headers = {...openIDReqHeaders['headers'], ...{'Content-type': 'application/x-www-form-urlencoded; charset=utf-8'}};
                    $http({
                        method: 'POST',
                        url: AuthTokenService.OPENID_CONFIG.openIdTokenUrl,
                        headers: headers,
                        transformRequest: transformURLEncodedRequest,
                        data: params
                    }).success(function(data) {
                        console.log('oidc: refreshed tokens');
                        that.saveTokens(data, false, true, successCallback);
                        that.isLoggedIn = true;
                    }).error(function(e) {
                        console.log('oidc: could not refresh tokens');
                        toastr.error($translate.instant('openid.auth.cannot.refresh.token.msg', {error: getError(e)}));
                        if (errorCallback) {
                            errorCallback();
                        }
                    })
                } else {
                    console.log('oidc: refresh requested without a valid refresh token');
                }
            }

            /**
             * Determines if there is a valid refresh token.
             * If the refresh token is JWT it will be valid only if it hasn't expired yet.
             * It is always valid if it's JWT without expiration or non-JWT (opaque token).
             *
             * @returns {boolean} True if there is a valid refresh token, false otherwise.
             */
            this.hasValidRefreshToken = function() {
                const tolerance = 5000; // 5 seconds
                const refreshData = that.tokenPayload('refresh');
                if (refreshData['nbf'] && refreshData['nbf'] * 1000 - Date.now() > tolerance) {
                    return false;
                } else if (refreshData['exp'] && Date.now() - refreshData['exp'] * 1000 > tolerance) {
                    return false;
                } else {
                    return !!(refreshData['iat'] || refreshData['error']);
                }
            }

            /**
             * Sets a new refresh token timeout to refresh the tokens before they expire.
             * This is called immediately after login or another refresh, as well as after security
             * initialization if there is a valid OpenID login.
             *
             * Does nothing if the OpenID provider didn't supply a refresh token.
             *
             * @param {boolean} justGotTokens True if we just got new tokens (login or another refresh).
             * @param {Function} successCallback The callback to call on success.
             * @param {Function} [errorCallback] The callback to call on failure.
             */
            this.setupTokensRefresh = function(justGotTokens, successCallback, errorCallback) {
                if (that.hasValidRefreshToken()) {
                    clearTimeout(that.previousTimer);
                    const accessToken = that.tokenPayload('id');
                    if (accessToken['exp'] > 0) {
                        const expiresIn = accessToken['exp'] * 1000 - Date.now() - 60000;
                        if (justGotTokens || expiresIn > 1000) {
                            that.previousTimer = setTimeout(function() {
                                // When calling from the timer function we don't want the errorCallback
                                that.refreshTokens(successCallback);
                            }, expiresIn);
                            console.log('oidc: tokens will refresh in ' + (expiresIn / 1000) + ' seconds at ' + new Date(Date.now() + expiresIn));
                        } else {
                            that.previousTimer = null;
                            console.log('oidc: tokens will refresh now, ' + expiresIn + '; ' + justGotTokens);
                            that.refreshTokens(successCallback, errorCallback);
                            // Return immediately, successCallback/errorCallback will be called
                            // by refreshTokens().
                            return;
                        }
                    }
                } else {
                    console.log('oidc: no valid refresh token');
                }
                successCallback();
            }

            /**
             * Parses the OpenID values represented as an application/x-www-form-urlencoded string
             * and returns them as object.
             *
             * @param {string} string The string to parse.
             * @returns {{access_token: ?string, code: ?string, id_token: ?string, state: ?string}}
             */
            this.parseQueryString = function(string) {
                const queryString = {access_token: null, code: null, id_token: null, state: null};
                if (string === '') {
                    return queryString;
                }
                const segments = string.split('&').map(function(s) {return s.split('=')});
                segments.forEach(function(s) {queryString[s[0]] = decodeURIComponent(s[1])});
                return queryString;
            }


            /**
             * Generates a secure random string using the browser crypto functions.
             *
             * @returns {string} A random string.
             */
            this.generateRandomString = function() {
                const array = new Uint32Array(28);
                window.crypto.getRandomValues(array);
                return Array.from(array, function(dec) { return ('0' + dec.toString(16)).substr(-2)}).join('');
            }

            /**
             * Returns the base64-urlencoded SHA-256 hash for the PKCE challenge.
             *
             * @param {string} v The code verifier string.
             * @returns {string} The encoded hash.
             */
            this.pkceChallengeFromVerifier = function(v) {
                const md = new KJUR.crypto.MessageDigest({alg: 'sha256', prov: 'cryptojs'});
                return hextob64u(md.digestString(v));
            }

            /**
             * Returns the OpenID scope we need to request. The scope may include offline_access,
             * which is determined by OpenID configuration.
             *
             * @param {string} extraScopes Extra scopes to add to the default list
             * @returns {string} The OpenID scope to request.
             */
            this.getScope = function(extraScopes) {
                let scope = 'openid' + (that.supportsOfflineAccess ? ' offline_access' : '');
                if (extraScopes) {
                    scope += ' ' + extraScopes;
                }
                console.log(`oidc: requesting scopes '${scope}'`);
                return scope;
            }

            this.setStorageItem = function (name, value) {
                localStorage.setItem(storagePrefix + name, value);
            }

            this.getStorageItem = function (name) {
                return localStorage.getItem(storagePrefix + name);
            }

            this.removeStorageItem = function (name) {
                localStorage.removeItem(storagePrefix + name);
            }
        }]);
