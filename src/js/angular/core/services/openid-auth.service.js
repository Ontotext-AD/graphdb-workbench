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
            const that = this;

            this.login = function(clientId, authFlow, returnToUrl) {
                this.loginOpenID(clientId, authFlow, returnToUrl);
            };

            this.loginOpenID = function(clientId, authFlow, redirectUrl) {
                // Create and store a random "state" value
                const state = this.generateRandomString();

                if (authFlow === 'code') {
                    localStorage.setItem('pkce_state', state);

                    // Create and store a new PKCE code_verifier (the plaintext random secret)
                    const code_verifier = that.generateRandomString();
                    localStorage.setItem('pkce_code_verifier', code_verifier);

                    // Hash and base64-urlencode the secret to use as the challenge
                    const code_challenge = that.pkceChallengeFromVerifier(code_verifier);

                    window.location.href = that.getLoginUrl(state, code_challenge, 'code', redirectUrl, clientId);
                } else if (authFlow === 'implicit') {
                    localStorage.setItem('nonce', state);
                    window.location.href = that.getLoginUrl(state, '', 'token id_token', redirectUrl, clientId);
                } else {
                    toastr.error('Uknown auth flow: ' + authFlow)
                }
            }

            this.getLoginUrl = function(state, code_challenge, flow, redirectUrl, clientId) {
                return this.openIdAuthorizeUrl +
                    '?' +
                    // flow is 'code' or 'token id_token'
                    'response_type=' + encodeURIComponent(flow) + '&' +
                    'scope=' + encodeURIComponent(this.getScope()) + '&' +
                    // TODO: this may be required in order to get a refresh token but it forces re-asking the user for permission
                    // TODO: we should probably have it configurable
                    'prompt=consent' + '&' +
                    'client_id=' + clientId + '&' +
                    'redirect_uri=' + redirectUrl + '&' +
                    (flow === 'code' ? (
                        // non-OpenID but a Google thing
                        'access_type=offline' + '&' +
                        'state=' + encodeURIComponent(state) + '&' +
                        'code_challenge=' + encodeURIComponent(code_challenge) + '&' +
                        'code_challenge_method=S256'
                    ) : (
                        'nonce=' + encodeURIComponent(state)
                    ));
            }


            this.withOpenIdConfiguration = function(clientId, clientSecret, url, redirectUrl, callback) {
                return $http.get(url + '/.well-known/openid-configuration', openIDReqHeaders).success(function (configuration) {
                    that.openIdIssuerUrl = configuration['issuer'];
                    that.openIdKeysUri = configuration['jwks_uri'];
                    that.openIdAuthorizeUrl = configuration['authorization_endpoint'];
                    that.openIdTokenUrl = configuration['token_endpoint'];
                    that.openIdUserInfoUrl = configuration['userinfo_endpoint'];
                    that.openIdEndSessionUrl = configuration['end_session_endpoint'];
                    that.supportsOfflineAccess = configuration['scopes_supported'].includes('offline_access');

                    $http.get(that.openIdKeysUri, openIDReqHeaders).success(function(jwks) {
                        that.openIdKeys = {};
                        jwks['keys'].forEach(function(k) {
                            that.openIdKeys[k.kid] = k
                        });
                        callback();
                    })
                });
            }

            this.initOpenId = function(clientId, clientSecret, issuerUrl, tokenType, redirectUrl, successCallback) {
                this.withOpenIdConfiguration(clientId, clientSecret, issuerUrl, redirectUrl, function() {
                    that.isLoggedIn = that.checkCredentials(clientId);
                    if (that.isLoggedIn) {
                        that.setupTokenRefreshTimer(tokenType, clientId, redirectUrl, clientSecret);
                        successCallback();
                    } else if (that.hasValidRefreshToken()) {
                        that.refreshToken(tokenType, clientId, redirectUrl, clientSecret);
                    } else {
                        // possibly auth code flow
                        const s = that.parseQueryString(window.location.search.substring(1));
                        if (s.code) {
                            // Verify state matches what we set at the beginning
                            if (localStorage.getItem('pkce_state') !== s.state) {
                                toastr.error('Invalid pkce_state');
                            } else {
                                that.retrieveToken(s.code, tokenType, redirectUrl, clientId, clientSecret);
                            }
                        } else {
                            // possibly implicit flow
                            const q = that.parseQueryString(window.location.pathname.substring(1));
                            if (q.id_token) {
                                that.saveToken(q, tokenType, false, redirectUrl, clientId, clientSecret);
                            } else {
                                successCallback();
                            }
                        }
                    }
                })
            }

            this.authHeaderGraphDB = function() {
                if (localStorage.getItem('token_type') === 'id') {
                    return 'Bearer ' + this.getToken('id');
                } else {
                    return this.authHeaderOpenId();
                }
            }

            this.logoutOpenID = function() {
                this.isLoggedIn = false;
                this.setToken('id', null);
                this.setToken('access', null);
                this.setToken('refresh', null);
            }

            this.hardLogout = function(redirectUrl, clientId) {
                this.logoutOpenID();
                if (this.openIdEndSessionUrl) {
                    window.location.href = this.openIdEndSessionUrl +
                        '?' +
                        'client_id=' + clientId + '&' +
                        'post_logout_redirect_uri=' + redirectUrl;
                }
            }

            this.isOpenIDRedirect = function() {
                const s = that.parseQueryString(window.location.search.substring(1));
                return (s.code || s.access_token);
            }

            this.getToken = function(tokenName) {
                return localStorage.getItem(tokenName + '_token');
            }

            this.setToken = function(tokenName, tokenData) {
                if (tokenData) {
                    localStorage.setItem(tokenName + '_token', tokenData);
                } else {
                    localStorage.removeItem(tokenName + '_token');
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

            this.verifyToken = function(tokenName, clientId) {
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
                    iss: [this.openIdIssuerUrl],
                };
                if (tokenName === 'id') {
                    verifyFields['aud'] = [clientId];
                    verifyFields['nonce'] = [localStorage.getItem('nonce')];
                }
                return KJUR.jws.JWS.verifyJWT(token, key, verifyFields);
            }

            this.checkCredentials = function(clientId) {
                if (!this.getToken('id')) {
                    console.log('No id_token');
                    return false;
                }
                if (!this.verifyToken('id', clientId)) {
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

            this.saveToken = function(token, tokenType, isRefresh, redirectUrl, clientId, clientSecret) {
                if (!isRefresh || token.refresh_token) {
                    // Some OpenId providers give you a new token on refresh, some don't
                    this.setToken('refresh', token.refresh_token);
                }
                this.setToken('access', token.access_token);
                this.setToken('id', token.id_token);
                localStorage.setItem('token_type', tokenType);

                this.setupTokenRefreshTimer(tokenType, clientId, redirectUrl, clientSecret);

                // Clean these up since we don't need them anymore
                localStorage.removeItem('pkce_state');
                localStorage.removeItem('pkce_code_verifier');

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

            this.retrieveToken = function(code, tokenType, redirectUrl, clientId, clientSecret) {
                const params = {
                    grant_type: 'authorization_code',
                    client_id: clientId,
                    redirect_uri: encodeURIComponent(redirectUrl),
                    code: code,
                    code_verifier: localStorage.getItem('pkce_code_verifier'),
                }

                if (clientSecret) {
                    params['client_secret'] = clientSecret;
                }

                const headers = {...openIDReqHeaders['headers'], ...{'Content-type': 'application/x-www-form-urlencoded; charset=utf-8'}};

                $http({
                    method: 'POST',
                    url: this.openIdTokenUrl,
                    headers: headers,
                    transformRequest: transformURLEncodedRequest,
                    data: params
                }).success(function(data) {
                    that.saveToken(data, tokenType, false, redirectUrl, clientId, clientSecret)
                }).error(function(e) {
                    toastr.error('Cannot retrieve token after login; ' + getError(e));
                })
            };

            this.refreshToken = function(tokenType, clientId, redirectUrl, clientSecret) {
                if (this.hasValidRefreshToken()) {
                    const params = {
                        grant_type: 'refresh_token',
                        client_id: clientId,
                        refresh_token: this.getToken('refresh'),
                    };
                    if (clientSecret) {
                        params['client_secret'] = clientSecret;
                    }
                    const headers = {...openIDReqHeaders['headers'], ...{'Content-type': 'application/x-www-form-urlencoded; charset=utf-8'}};
                    $http({
                        method: 'POST',
                        url: this.openIdTokenUrl,
                        headers: headers,
                        transformRequest: transformURLEncodedRequest,
                        data: params
                    }).success(function(data) {
                        console.log('refreshed token');
                        that.saveToken(data, tokenType, true, redirectUrl, clientId, clientSecret);
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

            this.setupTokenRefreshTimer = function(tokenType, clientId, redirectUrl, clientSecret) {
                if (this.hasValidRefreshToken()) {
                    clearTimeout(this.previousTimer);
                    const accessToken = this.tokenPayload('id');
                    if (accessToken['exp'] > 0) {
                        const expiresIn = accessToken['exp'] * 1000 - Date.now() - 60000;
                        if (expiresIn > 60000) {
                            this.previousTimer = setTimeout(function() {
                                that.refreshToken(tokenType, clientId, redirectUrl, clientSecret);
                            }, expiresIn);
                            console.log('token will refresh in ' + expiresIn + ' milliseconds');
                        } else {
                            this.previousTimer = null;
                            console.log('token will refresh now');
                            that.refreshToken(tokenType, clientId, redirectUrl, clientSecret);
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
                return 'openid profile email' + (this.supportsOfflineAccess ? ' offline_access' : '');
            }


        }]);
