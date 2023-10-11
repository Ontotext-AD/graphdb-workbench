describe('$openIDAuth tests', function () {
    let $openIDAuth, $httpBackend, $window, AuthTokenService;

    const graphdbUrl = 'http://localhost:7200/';
    let openIdConfig;

    // Key to validate the JWT token
    const keys = {
        "keys": [
            {
                "kty": "RSA",
                "e": "AQAB",
                "kid": "MWkSafGRr5govQkOM5tUhuFkXVeoCPgS9PARGoV4qSc",
                "n": "mIz7_vY4QN3ovMNXvIcMFUvP9-oDWLwzc3Sq_G0SroYIc6ZoFcI_uKSfdkG_jsLHB2WiRs" +
                    "X77RSgn000OWEB5esF4ghBFaij28k-w3xQzHCmq8GUfQQJY5uPg6-6MB0CMcXHBcR9MdpzB" +
                    "smu4IObRJJ2Gag9jAk7TbaDLdvouKIvtFfGbFipTqx2d18Hr13RLz5n3R4U0nvt-_-d9eaH" +
                    "2VTNE2nr8OuyaisGGfaWNf3Z80CWO4YWj9dOM37anx-lSESR0W45xCc9aTLju2jgJh-sAMo" +
                    "aI7pnkT9NPNiYeeCCBEvyI3lH9llG_7NI2bSjNFR5VIUvBrwr990I4IgudQ"
            }
        ]
    };

    // This token expires on Tue Dec 31 2030 19:49:41 GMT+0200
    const jwtToken = 'eyJraWQiOiJNV2tTYWZHUnI1Z292UWtPTTV0VWh1RmtYVmVvQ1BnUzlQQVJHb1Y0cVNjIiwi' +
        'YWxnIjoiUlMyNTYifQ.eyJ1c2VybmFtZSI6InRlc3RAZXhhbXBsZS5jb20iLCJpc3MiOiJodHRwOi8vYWNjb' +
        '3VudHMuZXhhbXBsZS5jb20iLCJzdWIiOiIxNWQ5ZGI2Yy1kMGQwLTQ0MTMtYWY0NS0yMmYwYTE3YjJlYzQiL' +
        'CJhdWQiOiJteSBjbGllbnQiLCJpYXQiOjE2MDkzNTg3OTUsImV4cCI6MTkyNDk3Nzk5NX0.C3WHTZ5D5bZI9' +
        '8dGCLaVN0eZrFT6NDEpYp3ZbUt4RGWpZorR_l9WLw3t19KEyAW2TIqhRNtbLKj5TGT9qPjarwMFDh8j7LiYw' +
        'OLuJoJSprT2qH3-1kPV2a-uK_e0yN29wzd6uItv6g6gA1r3lo64D529eRI_6bHe86DLb82IJgWdCkQYJtunl' +
        'EqhpezCASaLx5ydj5Kwjr6QEYkAt4gegWCN3JfiqygM_Z3JtgDSb1B2t_D7RXW9uqi7FyNvdtaBhJgvRgnie' +
        'xX24VIS2FQZgXoXDaG2h032HCLB-gwVW5jzda97Xy7Ya6YIVgKfo7bbn2puDTVkaVf4RfZrlCyg2w';
    // Non-JWT (opaque) token. Access and refresh tokens can be opaque.
    const nonJwtToken = 'b3BhcXVlLW5vbi1qd3QtdG9rZW4';
    const idToken = jwtToken;
    let accessToken = jwtToken;
    const refreshToken = nonJwtToken;

    let tokenEndpointExpectsRefresh;

    beforeEach(angular.mock.module('graphdb.framework.core.services.openIDService', function($provide) {
        $provide.value("$window", {
            // Mocked $window whose location is a copy of window.location so we can test
            // href changes and prevent the browser from actually navigating to the OpenID endpoints
            location: angular.extend({}, window.location)
        });
    }));

    beforeEach(angular.mock.inject(function (_$openIDAuth_, _$httpBackend_, _$window_, _AuthTokenService_) {
        // The injector unwraps the underscores (_) from around the parameter names when matching
        $openIDAuth = _$openIDAuth_;
        $httpBackend = _$httpBackend_;
        $window = _$window_;
        AuthTokenService = _AuthTokenService_;

        // The client ID and the issuer need to stay the same as the JWT token contains them
        // and they are used for validation.
        openIdConfig = {
            clientId: 'my client',
            issuer: 'http://accounts.example.com',
            tokenType: 'access',
            tokenAudience: 'my client',
            tokenIssuer: 'http://accounts.example.com',
            oidcAuthorizationEndpoint: 'http://accounts.example.com/authorize',
            oidcTokenEndpoint: 'http://accounts.example.com/token',
            oidcEndSessionEndpoint: 'http://accounts.example.com/logout',
            oidcJwksUri: 'http://accounts.example.com/jwks',
            proxyOidc: false,
            oidcScopesSupported: ['openid', 'profile'],
            authFlow: 'code',
            authorizeParameters: ''
        };

        // OpenID service is very chatty, no need for that here.
        // Comment out if any of the tests are failing to help you debug it.
        spyOn(console, 'log');
    }));

    afterEach(function () {
        $openIDAuth.softLogout();
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    function initOpenId(expectedLoginState, expectedJustLoggedIn) {
        let successCalled = false;
        let errorCalled = false;
        let justLoggedIn = false;

        errorCalled = successCalled = false;
        $openIDAuth.initOpenId(openIdConfig, graphdbUrl,
            function (p) {
                successCalled = true;
                justLoggedIn = !!p;
            },
            function () {
                errorCalled = true;
            });
        $httpBackend.flush();
        expect(successCalled).toBe(expectedLoginState);
        expect(justLoggedIn).toBe(expectedJustLoggedIn);
        expect(errorCalled).toBe(!expectedLoginState);
    }

    function expectEmptyTokens() {
        expect($openIDAuth.getToken('id')).toBeNull();
        expect($openIDAuth.verifyToken('id')).toBe(false);
        expect($openIDAuth.getToken('access')).toBeNull();
        expect($openIDAuth.verifyToken('access')).toBe(false);
        expect($openIDAuth.getToken('refresh')).toBeNull();
        expect($openIDAuth.hasValidRefreshToken()).toBe(false);
        expect($openIDAuth.isLoggedIn).toBe(false);
    }

    function expectValidTokens() {
        expect($openIDAuth.getToken('id')).toBe(idToken);
        expect($openIDAuth.verifyToken('id')).toBe(true);
        expect($openIDAuth.getToken('access')).toBe(accessToken);
        expect($openIDAuth.verifyToken('access')).toBe(true);
        if ($openIDAuth.supportsOfflineAccess && openIdConfig.authFlow !== 'implicit') {
            // Note: implicit doesn't return a refresh token even if requested
            expect($openIDAuth.getToken('refresh')).toBe(refreshToken);
            expect($openIDAuth.hasValidRefreshToken()).toBe(true);
        } else {
            expect($openIDAuth.getToken('refresh')).toBeNull();
            expect($openIDAuth.hasValidRefreshToken()).toBe(false);
        }
        expect($openIDAuth.isLoggedIn).toBe(true);
        expect($openIDAuth.authHeaderGraphDB())
            .toBe('Bearer ' + (openIdConfig.tokenType === 'id' ? idToken : accessToken));
    }

    function mockTokenEndpoint() {
        const tokens = {
            access_token: accessToken,
            id_token: idToken
        };
        if ($openIDAuth.supportsOfflineAccess) {
            tokens.refresh_token = refreshToken;
        }
        $httpBackend.when('POST', openIdConfig.proxyOidc ? 'rest/openid/token' : 'http://accounts.example.com/token')
            .respond(function(method, url, data, headers, params) {
                let expectedData;
                if (tokenEndpointExpectsRefresh) {
                    expectedData = 'grant_type=refresh_token&client_id=my%20client&refresh_token=' + refreshToken;
                } else {
                    expectedData = 'grant_type=authorization_code&client_id=my%20client' +
                        '&redirect_uri=http%3A%2F%2Flocalhost%3A7200%2F&code=secret';
                    if (openIdConfig.authFlow === 'code') {
                        expectedData += '&code_verifier=' + $openIDAuth.getStorageItem('pkce_code_verifier');
                    }
                }
                expect(data).toBe(expectedData);

                return [200, tokens];
            });
    }

    function mockLogin() {
        // Modify certain $window.location properties to simulate a redirect back from the OpenID provider
        if (openIdConfig.tokenType === 'id') {
            accessToken = nonJwtToken;
        }
        if (openIdConfig.authFlow === 'code' || openIdConfig.authFlow === 'code_no_pkce') {
            $window.location.search = '?code=secret';
            if (openIdConfig.authFlow === 'code') {
                $window.location.search += '&state=' + $openIDAuth.getStorageItem('pkce_state');
            }
            tokenEndpointExpectsRefresh = false;
            mockTokenEndpoint();
        } else if (openIdConfig.authFlow === 'implicit') {
            $window.location.pathname = '?access_token=' + accessToken + '&id_token=' + idToken;
        }
    }

    function resetLoginMocks() {
        $window.location = angular.extend({}, window.location);
    }

    function runLoginTest(extraConfig, expectedUrl) {
        Object.assign(openIdConfig, extraConfig);
        $httpBackend.when('GET', openIdConfig.proxyOidc ? 'rest/openid/jwks' : 'http://accounts.example.com/jwks')
            .respond(200, keys);

        // We start with a clean state, no tokens
        console.log('$openIDAuth initial state');
        initOpenId(false, false);
        expectEmptyTokens();
        expect(AuthTokenService.OPENID_CONFIG.supportsOfflineAccess)
            .toBe(openIdConfig.oidcScopesSupported.includes('offline_access'));
        expect($openIDAuth.getScope())
            .toBe(AuthTokenService.OPENID_CONFIG.supportsOfflineAccess ? 'openid offline_access' : 'openid');
        expect($openIDAuth.getLoginUrl('some state/foo', 'some challenge/bar',
            graphdbUrl, openIdConfig)).toBe(expectedUrl);

        // Simulate login redirect
        console.log('$openIDAuth login');
        $openIDAuth.login(openIdConfig, graphdbUrl);
        expect($window.location.href).toStartWith('http://accounts.example.com/authorize?');

        // Perform login (simulated redirect back to us with the tokens or code)
        // Init should now pick up the tokens from $window.location or via the token endpoint
        mockLogin();
        initOpenId(true, true);
        expectValidTokens();

        // Remove the mocks that simulate login
        resetLoginMocks();

        // Calling init again should detect that we are already logged in
        console.log('$openIDAuth state with login');
        initOpenId(true, false);
        expectValidTokens();

        // Simulate expired token
        $openIDAuth.setToken('id', nonJwtToken);
        if ($openIDAuth.supportsOfflineAccess && openIdConfig.authFlow !== 'implicit') {
            // There is a refresh token, new tokens will be requested
            console.log('$openIDAuth expired login with refresh');
            tokenEndpointExpectsRefresh = true;
            initOpenId(true, false);
            expectValidTokens();
        } else {
            // No refresh token, reverting to no login state
            console.log('$openIDAuth expired login without refresh');
            $openIDAuth.setToken('id', nonJwtToken);
            initOpenId(false, false);
            expectEmptyTokens();
        }

        // Finally logout and make sure it's clean after it
        console.log('$openIDAuth hard logout');
        $openIDAuth.hardLogout(graphdbUrl); // This will invoke softLogout() too
        expect($window.location.href)
            .toBe('http://accounts.example.com/logout?client_id=my%20client&post_logout_redirect_uri=http%3A%2F%2Flocalhost%3A7200%2F');
        expectEmptyTokens();
    }

    it('Login via code', function () {
        runLoginTest({},
            'http://accounts.example.com/authorize?response_type=code&' +
            'scope=openid&client_id=my%20client&' +
            'redirect_uri=http%3A%2F%2Flocalhost%3A7200%2F&' +
            'state=some%20state%2Ffoo&code_challenge=some%20challenge%2Fbar&' +
            'code_challenge_method=S256');
    });

    it('Login via code with refresh', function () {
        runLoginTest({
                oidcScopesSupported: ['openid', 'profile', 'offline_access']
            },
            'http://accounts.example.com/authorize?response_type=code&' +
            'scope=openid%20offline_access&client_id=my%20client&' +
            'redirect_uri=http%3A%2F%2Flocalhost%3A7200%2F&' +
            'state=some%20state%2Ffoo&code_challenge=some%20challenge%2Fbar&' +
            'code_challenge_method=S256');
    });

    it('Login via code with authorize parameters', function () {
        runLoginTest({
                authorizeParameters: 'foo=bar%20baz'
            },
            'http://accounts.example.com/authorize?response_type=code&' +
            'scope=openid&client_id=my%20client&' +
            'redirect_uri=http%3A%2F%2Flocalhost%3A7200%2F&' +
            'state=some%20state%2Ffoo&code_challenge=some%20challenge%2Fbar&' +
            'code_challenge_method=S256&foo=bar%20baz');
    });

    it('Login via code with proxyOidc', function () {
        runLoginTest({
                proxyOidc: true
            },
            'http://accounts.example.com/authorize?response_type=code&' +
            'scope=openid&client_id=my%20client&' +
            'redirect_uri=http%3A%2F%2Flocalhost%3A7200%2F&' +
            'state=some%20state%2Ffoo&code_challenge=some%20challenge%2Fbar&' +
            'code_challenge_method=S256');
    });

    it('Login via code with id token', function () {
        runLoginTest({
                tokenType: 'id'
            },
            'http://accounts.example.com/authorize?response_type=code&' +
            'scope=openid&client_id=my%20client&' +
            'redirect_uri=http%3A%2F%2Flocalhost%3A7200%2F&' +
            'state=some%20state%2Ffoo&code_challenge=some%20challenge%2Fbar&' +
            'code_challenge_method=S256');
    });

    it('Login via code_no_pkce', function () {
        runLoginTest({
                authFlow: 'code_no_pkce'
            },
            'http://accounts.example.com/authorize?response_type=code&' +
            'scope=openid&client_id=my%20client&' +
            'redirect_uri=http%3A%2F%2Flocalhost%3A7200%2F');
    });

    it('Login via code_no_pkce with refresh', function () {
        runLoginTest({
                authFlow: 'code_no_pkce',
                oidcScopesSupported: ['openid', 'profile', 'offline_access']
            },
            'http://accounts.example.com/authorize?response_type=code&' +
            'scope=openid%20offline_access&client_id=my%20client&' +
            'redirect_uri=http%3A%2F%2Flocalhost%3A7200%2F');
    });

    it('Login via code_no_pkce with authorize parameters', function () {
        runLoginTest({
                authFlow: 'code_no_pkce',
                authorizeParameters: 'foo=bar%20baz'
            },
            'http://accounts.example.com/authorize?response_type=code&' +
            'scope=openid&client_id=my%20client&' +
            'redirect_uri=http%3A%2F%2Flocalhost%3A7200%2F&foo=bar%20baz');
    });

    it('Login via implicit', function () {
        runLoginTest({
                authFlow: 'implicit'
            },
            'http://accounts.example.com/authorize?response_type=token%20id_token&' +
            'scope=openid&client_id=my%20client&' +
            'redirect_uri=http%3A%2F%2Flocalhost%3A7200%2F&' +
            'nonce=some%20state%2Ffoo');
    });

    it('Login via implicit with refresh', function () {
        runLoginTest({
                authFlow: 'implicit',
                oidcScopesSupported: ['openid', 'profile', 'offline_access']
            },
            'http://accounts.example.com/authorize?response_type=token%20id_token&' +
            'scope=openid%20offline_access&client_id=my%20client&' +
            'redirect_uri=http%3A%2F%2Flocalhost%3A7200%2F&' +
            'nonce=some%20state%2Ffoo');
    });

    it('Login via implicit with authorize parameters', function () {
        runLoginTest({
                authFlow: 'implicit',
                authorizeParameters: 'foo=bar%20baz'
            },
            'http://accounts.example.com/authorize?response_type=token%20id_token&' +
            'scope=openid&client_id=my%20client&' +
            'redirect_uri=http%3A%2F%2Flocalhost%3A7200%2F&' +
            'nonce=some%20state%2Ffoo&foo=bar%20baz');
    });

    it('Login via implicit with id token', function () {
        runLoginTest({
                authFlow: 'implicit',
                tokenType: 'id'
            },
            'http://accounts.example.com/authorize?response_type=token%20id_token&' +
            'scope=openid&client_id=my%20client&' +
            'redirect_uri=http%3A%2F%2Flocalhost%3A7200%2F&' +
            'nonce=some%20state%2Ffoo');
    });

    it('parseQueryString', function () {
        const parsed = $openIDAuth.parseQueryString('access_token=token%20moken&' +
            'id_token=my%20id&code=some%2Fsecret%20code&' +
            'state=some%20state%2Ffoo&foo=bar%20baz');
        expect(parsed).toEqual({
            access_token: 'token moken',
            code: 'some/secret code',
            id_token: 'my id',
            state: 'some state/foo',
            foo: 'bar baz'
        });
    });

    it('generateRandomString', function () {
        const string1 = $openIDAuth.generateRandomString();
        const string2 = $openIDAuth.generateRandomString();
        // Currently the random string is 56 characters corresponding to 28 random bytes
        // encoded as a hex string.
        expect(string1.length).toBe(56);
        expect(string2.length).toBe(56);
        expect(string1).not.toBe(string2);
    });

    it('pkceChallengeFromVerifier', function () {
        // PKCE challenge is the SHA-256 of the provided string, encoded using base64
        expect($openIDAuth.pkceChallengeFromVerifier('5b32248aead429d927f7cf4f9746798aed2a4aaf24a79180f30aec79'))
            .toBe('Xnfs_tQAVGZUxjPW_XvgJ0i1vE_e2nTOy23estfaxa0');
    });

    it('non-JWT token validity', function () {
        $openIDAuth.setToken('id', nonJwtToken);
        expect($openIDAuth.verifyToken('id')).toBe(false);

        $openIDAuth.setToken('access', nonJwtToken);
        expect($openIDAuth.verifyToken('access')).toBe(true);
    });
});
