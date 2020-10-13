import {KJUR, KEYUTIL, b64utoutf8, hextob64u} from 'jsrsasign';

const modules = [

];

const issuerUrl = 'https://accounts.google.com';
const clientId = '961901053006-q6t7i3nm3csarr40tnp0jtib349n2fqd.apps.googleusercontent.com';
const clientSecret = 'jy-vPqbjAB7P-n3TkgHngb9R';
const redirectUrl = 'http://testopenid.ontotext.com:9000/';
const graphdbUrl = 'http://ec2-52-48-15-93.eu-west-1.compute.amazonaws.com:7200';

angular.module('graphdb.framework.core.services.openIDService', modules)
    .config(['$httpProvider', function($httpProvider) {
        delete $httpProvider.defaults.headers.common['X-Requested-With'];
        delete $httpProvider.defaults.headers.common['X-GraphDB-Repository'];
    }])
    .service('$openIDAuth', ['$http',
        function ($http) {
            this.login = function() {
                this.loginOpenID();
            }
            const that = this;

            that.authFlow = 'code';

            this.initOpenId = function(clientId, clientSecret, url, redirectUrl, graphdbUrl, callback) {
                return $http.get(url + '/.well-known/openid-configuration').success(function (configuration) {
                    that.openIdIssuerUrl = configuration['issuer'];
                    that.openIdKeysUri = configuration['jwks_uri'];
                    that.openIdAuthorizeUrl = configuration['authorization_endpoint'];
                    that.openIdTokenUrl = configuration['token_endpoint'];
                    that.openIdUserInfoUrl = configuration['userinfo_endpoint'];
                    console.log('done openid discovery');

                    $http.get(that.openIdKeysUri).success(function(jwks) {
                        that.openIdKeys = {};
                        jwks['keys'].forEach(function(k) {
                            that.openIdKeys[k.kid] = k
                        });
                        callback();
                    })
                });
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

            this.checkCredentials = function() {
                if (!this.getToken('id')) {
                    console.log('no id_token');
                    return false;
                }
                if (!this.verifyToken('id')) {
                    console.log('stale id token');
                    return false;
                }
                console.log('found valid id token');
                return true;
            }

            this.authHeaderOpenId = function() {
                return 'Bearer ' + this.getToken('access');
            }

            this.updateUserInfo = function() {
                const headers = new HttpHeaders({
                    'Authorization': this.authHeaderOpenId()
                });
                console.log('requested openid userinfo');
                return $http.get(that.openIdUserInfoUrl, {headers: headers})
                    .success(function(userInfo) {that.userInfo = userInfo})
                    .error(function() {
                        // TODO toastr error error.json().error || 'Server error'
                });
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

            this.saveToken = function(token, tokenType, isRefresh) {
                const expireDate = new Date().getTime() + (1000 * token.expires_in);

                if (!isRefresh || token.refresh_token) {
                    // Some OpenId providers give you a new token on refresh, some don't
                    this.setToken('refresh', token.refresh_token);
                }
                this.setToken('access', token.access_token);
                this.setToken('id', token.id_token);
                localStorage.setItem('token_type', tokenType);

                this.setupTokenRefreshTimer();

                // Clean these up since we don't need them anymore
                localStorage.removeItem('pkce_state');
                localStorage.removeItem('pkce_code_verifier');

                if (!isRefresh) {
                    window.location.href = redirectUrl;
                }
            }

            this.retrieveToken = function(code, tokenType) {
                const params = new URLSearchParams();
                params.append('grant_type', 'authorization_code');
                params.append('client_id', clientId);
                if (this.clientSecret) {
                    params.append('client_secret', clientSecret);
                }
                params.append('redirect_uri', redirectUrl);
                params.append('code', code);
                params.append('code_verifier', localStorage.getItem('pkce_code_verifier'));

                const headers = new HttpHeaders({'Content-type': 'application/x-www-form-urlencoded; charset=utf-8'});
                console.log(this.openIdTokenUrl);
                $http.post(this.openIdTokenUrl, params.toString(), {headers: headers})
                    .success(function(data) {
                        that.saveToken(data, tokenType, false)
                    }).error(function() {
                        // TODO Toastr
                        alert('Cannot retrieve token after login')
                }
                );
            }

            this.refreshToken = function() {
                if (this.hasValidRefreshToken()) {
                    const params = new URLSearchParams();
                    params.append('grant_type', 'refresh_token');
                    params.append('client_id', clientId);
                    if (clientSecret) {
                        params.append('client_secret', clientSecret);
                    }
                    params.append('refresh_token', this.getToken('refresh'));

                    const headers = new HttpHeaders({'Content-type': 'application/x-www-form-urlencoded; charset=utf-8'});
                    $http.post(this.openIdTokenUrl, params.toString(), {headers: headers})
                        .success(function(data) {
                                console.log('token refreshed');
                                that.saveToken(data, this.tokenType, true);
                                that.updateUserInfo();
                                that.isLoggedIn = true;
                            }
                        ).error(function() {
                            // TODO toastr 'Refresh unsuccessful'
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

            this.setupTokenRefreshTimer = function() {
                if (this.hasValidRefreshToken()) {
                    clearTimeout(this.previousTimer);
                    const accessToken = this.tokenPayload('id');
                    if (accessToken['exp'] > 0) {
                        const expiresIn = accessToken['exp'] * 1000 - Date.now() - 60000;
                        if (expiresIn > 60000) {
                            this.previousTimer = setTimeout(function(){that.refreshToken(), expiresIn});
                            console.log('token will refresh in ' + expiresIn + ' milliseconds');
                        } else {
                            this.previousTimer = null;
                            console.log('token will refresh now');
                            that.refreshToken();
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
                segments.forEach(function() {queryString[s[0]] = decodeURIComponent(s[1])});
                return queryString;
            }

            this.initOpenId(clientId, clientSecret, issuerUrl, redirectUrl, graphdbUrl, function() {
                that.isLoggedIn = that.checkCredentials();
                if (that.isLoggedIn) {
                    that.updateUserInfo();
                    that.setupTokenRefreshTimer();
                } else if (that.hasValidRefreshToken()) {
                    that.refreshToken();
                } else {
                    // possibly auth code flow
                    const s = that.parseQueryString(window.location.search.substring(1));
                    if (s.code) {
                        // Verify state matches what we set at the beginning
                        if (localStorage.getItem('pkce_state') !== s.state) {
                            alert('Invalid state');
                        } else {
                            that.retrieveToken(s.code, this.tokenType);
                        }
                    } else {
                        // possibly implicit flow
                        const q = that.parseQueryString(window.location.hash.substring(1));
                        if (q.id_token) {
                            that.saveToken(q, this.tokenType, false);
                        }
                    }
                }
            })

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

            this.getLoginUrl = function(state, code_challenge, flow) {
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

            this.loginOpenID = function() {
                // Create and store a random "state" value
                const state = this.generateRandomString();

                if (this.authFlow === 'code') {
                    localStorage.setItem('pkce_state', state);

                    // Create and store a new PKCE code_verifier (the plaintext random secret)
                    const code_verifier = that.generateRandomString();
                    localStorage.setItem('pkce_code_verifier', code_verifier);

                    // Hash and base64-urlencode the secret to use as the challenge
                    const code_challenge = that.pkceChallengeFromVerifier(code_verifier);

                    window.location.href = that.getLoginUrl(state, code_challenge, 'code');
                } else if (this.authFlow === 'implicit') {
                    localStorage.setItem('nonce', state);
                    window.location.href = that.getLoginUrl(state, '', 'token id_token');
                } else {
                    alert('Uknown auth flow: ' + this.authFlow)
                }
            }

            this.logoutOpenID = function() {
                this.isLoggedIn = false;
                this.userInfo = {};
                this.setToken('id', null);
                this.setToken('access', null);
                this.setToken('refresh', null);
            }


        }]);
