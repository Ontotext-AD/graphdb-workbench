import {KJUR, KEYUTIL, b64utoutf8, hextob64u} from 'jsrsasign';

const modules = [
    'toastr',
];

const openIDReqHeaders = {headers: {
        'X-GraphDB-Repository': undefined,
        'X-Requested-With': undefined,
        'Authorization': undefined
    }}


angular.module('graphdb.framework.core.services.openIDService', modules)
    // .config(['$httpProvider', function($httpProvider) {
    //     delete $httpProvider.defaults.headers.common['X-Requested-With'];
    //     delete $httpProvider.defaults.headers.common['X-GraphDB-Repository'];
    // }])
    .service('$openIDAuth', ['$http', '$location', 'toastr',
        function ($http, $location, toastr) {
            const storagePrefix = 'com.ontotext.graphdb.openid.';
            const that = this;

            this.login = function(openIDConfig, returnToUrl) {
                // Create and store a random "state" value
                const state = this.generateRandomString();
                const authFlow = openIDConfig.authFlow;

                if (authFlow === 'code') {
                    this.setStorageItem('pkce_state', state);

                    // Create and store a new PKCE code_verifier (the plaintext random secret)
                    const code_verifier = that.generateRandomString();
                    this.setStorageItem('pkce_code_verifier', code_verifier);

                    // Hash and base64-urlencode the secret to use as the challenge
                    const code_challenge = that.pkceChallengeFromVerifier(code_verifier);

                    window.location.href = that.getLoginUrl(state, code_challenge, returnToUrl, openIDConfig);
                } else if (authFlow === 'code_no_pkce') {
                    window.location.href = that.getLoginUrl(state, '', returnToUrl, openIDConfig);
                } else if (authFlow === 'implicit') {
                    this.setStorageItem('nonce', state);
                    window.location.href = that.getLoginUrl(state, '', returnToUrl, openIDConfig);
                } else {
                    toastr.error('Uknown auth flow: ' + authFlow)
                }
            };

            this.getLoginUrl = function(state, code_challenge, redirectUrl, openIDConfig) {
                let response_type = '';
                let flow_params = '';
                switch (openIDConfig.authFlow) {
                    case 'code':
                        response_type = 'code';
                        flow_params = 'state=' + encodeURIComponent(state) + '&' +
                            'code_challenge=' + encodeURIComponent(code_challenge) + '&' +
                            'code_challenge_method=S256';
                        break;
                    case 'code_no_pkce':
                        response_type = 'code';
                        break;
                    case 'implicit':
                        response_type = 'token id_token';
                        flow_params = 'nonce=' + encodeURIComponent(state);
                        break;
                    default:
                        throw new Error('Unknown authentication flow: ' + openIDConfig.authFlow);
                }
                return openIDConfig.oidcAuthorizationEndpoint +
                    '?' +
                    'response_type=' + encodeURIComponent(response_type) + '&' +
                    'scope=' + encodeURIComponent(this.getScope()) + '&' +
                    'client_id=' + openIDConfig.clientId + '&' +
                    'redirect_uri=' + redirectUrl + '&' +
                    (flow_params ? ('&' + flow_params) : '') +
                    (openIDConfig.authorizeParameters ? ('&' + openIDConfig.authorizeParameters) : '');
            }


            this.withOpenIdKeys = function(openIdKeysUri, callback) {
                $http.get(openIdKeysUri, openIDReqHeaders).success(function(jwks) {
                    that.openIdKeys = {};
                    jwks['keys'].forEach(function(k) {
                        that.openIdKeys[k.kid] = k
                    });
                    callback();
                });
            };

            this.initOpenId = function(openIDConfig, gdbUrl, successCallback) {
                // Set the clientId and tokenType needed to retrieve the token
                that.clientId = openIDConfig.clientId;
                that.tokenType = openIDConfig.tokenType;

                // Set the audience and issuer needed to verify the token
                that.idTokenAudience = openIDConfig.clientId;
                that.idTokenIssuer = openIDConfig.issuer;
                that.accessTokenAudience = openIDConfig.tokenAudience;
                that.accessTokenIssuer = openIDConfig.tokenIssuer;

                // Set the token and keys url properly depending on a proxy
                that.openIdTokenUrl = openIDConfig.oidcTokenEndpoint;
                let openIdKeysUri = openIDConfig.oidcJwksUri;
                if (openIDConfig.proxyOidc) {
                    openIdKeysUri = 'rest/openid/jwks';
                    that.openIdTokenUrl = 'rest/openid/token';
                }
                that.openIdEndSessionUrl = openIDConfig.oidcEndSessionEndpoint;
                that.supportsOfflineAccess = openIDConfig.oidcScopesSupported.includes('offline_access');

                this.withOpenIdKeys(openIdKeysUri, function() {
                    that.isLoggedIn = that.checkCredentials();
                    if (that.isLoggedIn) {
                        that.setupTokenRefreshTimer(gdbUrl);
                        successCallback();
                    } else if (that.hasValidRefreshToken()) {
                        that.refreshToken(gdbUrl);
                    } else {
                        // possibly auth code flow
                        const s = that.parseQueryString(window.location.search.substring(1));
                        if (s.code) {
                            if (openIDConfig.authFlow === 'code') {
                                // Verify state matches what we set at the beginning
                                if (that.getStorageItem('pkce_state') !== s.state) {
                                    toastr.error('Invalid pkce_state');
                                    console.log('PKCE state ' + that.getStorageItem('pkce_state') + ' != ' + s.state);
                                } else {
                                    that.retrieveToken(s.code, gdbUrl);
                                }
                            } else if (openIDConfig.authFlow === 'code_no_pkce') {
                                that.retrieveToken(s.code, gdbUrl);
                            }
                        } else {
                            // possibly implicit flow
                            const q = that.parseQueryString(window.location.pathname.substring(1));
                            if (q.id_token) {
                                that.saveToken(q,false, gdbUrl);
                            } else {
                                successCallback();
                            }
                        }
                    }
                })
            }

            this.authHeaderGraphDB = function() {
                if (this.getStorageItem('token_type') === 'id') {
                    return 'Bearer ' + this.getToken('id');
                } else {
                    return this.authHeaderOpenId();
                }
            }

            this.softLogout = function() {
                this.isLoggedIn = false;
                this.setToken('id', null);
                this.setToken('access', null);
                this.setToken('refresh', null);
            }

            this.hardLogout = function(redirectUrl) {
                const isLoggedIn = this.getToken('access');
                this.softLogout();
                if (this.openIdEndSessionUrl && isLoggedIn != null) {
                    window.location.href = this.openIdEndSessionUrl +
                        '?' +
                        'client_id=' + this.clientId + '&' +
                        'post_logout_redirect_uri=' + redirectUrl;
                }
            }

            this.isOpenIDRedirect = function() {
                const s = that.parseQueryString(window.location.search.substring(1));
                return (s.code || s.access_token);
            }

            this.getToken = function(tokenName) {
                return this.getStorageItem(tokenName + '_token');
            }

            this.setToken = function(tokenName, tokenData) {
                if (tokenData) {
                    this.setStorageItem(tokenName + '_token', tokenData);
                } else {
                    this.removeStorageItem(tokenName + '_token');
                }
            }

            this.tokenHeader = function(tokenName) {
                const token = this.getToken(tokenName);
                if (token) {
                    try {
                        return KJUR.jws.JWS.readSafeJSONString(b64utoutf8(token.split('.')[0]));
                    } catch (e) {
                        return {error: 'not a JWT token: ' + token};
                    }
                } else {
                    return {};
                }
            }

            this.verifyToken = function(tokenName) {
                const token = this.getToken(tokenName);
                const headerObj = this.tokenHeader(tokenName);
                if (!headerObj.kid) {
                    console.log('token ' + tokenName + ' is not a JWT token (may be still valid)');
                    // Only the id token must be JWT, access and refresh tokens are always valid if not JWT
                    return tokenName !== 'id';
                }
                const jwk = this.openIdKeys[headerObj.kid];
                if (!jwk) {
                    console.log('no key to verify JWT token');
                    return false;
                }
                const key = KEYUTIL.getKey(jwk);
                const verifyFields = {
                    alg: [headerObj.alg],
                    iss: [this.idTokenIssuer],
                };
                if (tokenName === 'id') {
                    verifyFields['aud'] = [this.idTokenAudience];
                    verifyFields['nonce'] = [this.getStorageItem('nonce')];
                } else if (tokenName === 'access') {
                    verifyFields['aud'] = [this.accessTokenAudience];
                    verifyFields['iss'] = [this.accessTokenIssuer];
                }
                return KJUR.jws.JWS.verifyJWT(token, key, verifyFields);
            }

            this.checkCredentials = function() {
                if (!this.getToken('id')) {
                    console.log('No id_token');
                    return false;
                }
                if (!this.verifyToken('id')) {
                    console.log('Stale id token');
                    return false;
                }
                return true;
            }

            this.authHeaderOpenId = function() {
                return 'Bearer ' + this.getToken('access');
            }

            this.tokenPayload = function(tokenName) {
                const token = this.getToken(tokenName);
                if (token) {
                    try {
                        return KJUR.jws.JWS.readSafeJSONString(b64utoutf8(token.split('.')[1]));
                    } catch (e) {
                        return {error: 'not a JWT token: ' + token};
                    }
                } else {
                    return {};
                }
            }

            this.saveToken = function(token, isRefresh, redirectUrl) {
                if (!isRefresh || token.refresh_token) {
                    // Some OpenId providers give you a new token on refresh, some don't
                    this.setToken('refresh', token.refresh_token);
                }
                this.setToken('access', token.access_token);
                this.setToken('id', token.id_token);
                this.setStorageItem('token_type', that.tokenType);

                this.setupTokenRefreshTimer(that.tokenType, that.clientId, redirectUrl);

                // Clean these up since we don't need them anymore
                this.removeStorageItem('pkce_state');
                this.removeStorageItem('pkce_code_verifier');

                if (!isRefresh) {
                    window.location.href = redirectUrl;
                }
            }


            function transformURLEncodedRequest(obj) {
                var str = [];
                for(var p in obj)
                    str.push(p + "=" + obj[p]);
                return str.join("&");
            };

            this.retrieveToken = function(code, redirectUrl) {
                const params = {
                    grant_type: 'authorization_code',
                    client_id: that.clientId,
                    redirect_uri: encodeURIComponent(redirectUrl),
                    code: code
                };

                const codeVerifier = this.getStorageItem('pkce_code_verifier');
                if (codeVerifier) {
                    params['code_verifier'] = codeVerifier;
                }

                const headers = {...openIDReqHeaders['headers'], ...{'Content-type': 'application/x-www-form-urlencoded; charset=utf-8'}};

                $http({
                    method: 'POST',
                    url: this.openIdTokenUrl,
                    headers: headers,
                    transformRequest: transformURLEncodedRequest,
                    data: params
                }).success(function(data) {
                    that.saveToken(data, false, redirectUrl);
                }).error(function(e) {
                    toastr.error('Cannot retrieve token after login; ' + getError(e));
                })
            };

            this.refreshToken = function(redirectUrl) {
                if (this.hasValidRefreshToken()) {
                    const params = {
                        grant_type: 'refresh_token',
                        client_id: that.clientId,
                        refresh_token: this.getToken('refresh'),
                    };
                    const headers = {...openIDReqHeaders['headers'], ...{'Content-type': 'application/x-www-form-urlencoded; charset=utf-8'}};
                    $http({
                        method: 'POST',
                        url: this.openIdTokenUrl,
                        headers: headers,
                        transformRequest: transformURLEncodedRequest,
                        data: params
                    }).success(function(data) {
                        console.log('refreshed token');
                        that.saveToken(data, true, redirectUrl);
                        that.isLoggedIn = true;
                    }).error(function(e) {
                        toastr.error('Could not refresh OpenID token; ' + getError(e));
                    })
                }
            }

            this.hasValidRefreshToken = function() {
                const tolerance = 5000; // 5 seconds
                const refreshData = this.tokenPayload('refresh');
                if (refreshData['nbf'] && refreshData['nbf'] * 1000 - Date.now() > tolerance) {
                    return false;
                } else if (refreshData['exp'] && Date.now() - refreshData['exp'] * 1000 > tolerance) {
                    return false;
                } else if (refreshData['iat'] || refreshData['error']) {
                    return true;
                }
            }

            this.setupTokenRefreshTimer = function(redirectUrl) {
                if (this.hasValidRefreshToken()) {
                    clearTimeout(this.previousTimer);
                    const accessToken = this.tokenPayload('id');
                    if (accessToken['exp'] > 0) {
                        const expiresIn = accessToken['exp'] * 1000 - Date.now() - 60000;
                        if (expiresIn > 60000) {
                            this.previousTimer = setTimeout(function() {
                                that.refreshToken(redirectUrl);
                            }, expiresIn);
                            console.log('token will refresh in ' + expiresIn + ' milliseconds');
                        } else {
                            this.previousTimer = null;
                            console.log('token will refresh now');
                            that.refreshToken(redirectUrl);
                        }
                    }
                }
            }

            this.parseQueryString = function(string) {
                const queryString = {access_token: null, code: null, id_token: null, state: null};
                if (string === '') {
                    return queryString;
                }
                const segments = string.split('&').map(function(s) {return s.split('=')});
                segments.forEach(function(s) {queryString[s[0]] = decodeURIComponent(s[1])});
                return queryString;
            }


            // Generate a secure random string using the browser crypto functions
            this.generateRandomString = function() {
                const array = new Uint32Array(28);
                window.crypto.getRandomValues(array);
                return Array.from(array, function(dec) { return ('0' + dec.toString(16)).substr(-2)}).join('');
            }

            // Return the base64-urlencoded sha256 hash for the PKCE challenge
            this.pkceChallengeFromVerifier = function(v) {
                const md = new KJUR.crypto.MessageDigest({alg: 'sha256', prov: 'cryptojs'});
                return hextob64u(md.digestString(v));
            }

            this.getScope = function() {
                return 'openid ' + (this.supportsOfflineAccess ? ' offline_access' : '');
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
