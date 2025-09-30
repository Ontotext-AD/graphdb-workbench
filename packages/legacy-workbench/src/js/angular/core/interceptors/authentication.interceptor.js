import 'angular/core/services';
import {RepositoryStorageService, ServiceProvider} from "@ontotext/workbench-api";

angular.module('graphdb.framework.core.interceptors.authentication', [
    'ngCookies',
])
    .factory('$authenticationInterceptor', ['AuthTokenService', 'LocalStorageAdapter', 'LSKeys',
        function(AuthTokenService, LocalStorageAdapter, LSKeys) {
            return {
                'request': function(config) {
                    const headers = config.headers || {};

                    // When using OpenID, during authentication process, the additional headers modification must be skipped
                    const openIdKeysUri = AuthTokenService.OPENID_CONFIG.openIdKeysUri;
                    const openIdTokenUrl = AuthTokenService.OPENID_CONFIG.openIdTokenUrl;

                    if (openIdKeysUri && openIdTokenUrl) {
                        const openIDUrls = [openIdKeysUri, openIdTokenUrl];
                        const isOpenIdUrl = openIDUrls.some((url) => config.url && config.url.indexOf(url) > -1);
                        if (isOpenIdUrl) {
                            return config;
                        }
                    }

                    // Angular doesn't send this header by default, and we need it to detect XHR requests
                    // so that we don't advertise Basic auth with them.
                    headers['X-Requested-With'] = 'XMLHttpRequest';
                    const token = AuthTokenService.getAuthToken();
                    if (token) {
                        // If a token is present, add it to the headers under the 'Authorization' key.
                        // However, adding this 'Authorization' header can break Kerberos authentication.
                        // Kerberos does not use tokens for authentication; it relies on ticket-based
                        // authentication via SPNEGO (Simple and Protected GSSAPI Negotiation Mechanism).
                        // If 'Authorization' is set with a token, the server may prioritize it over
                        // Kerberos, causing the Kerberos authentication to fail.
                        headers.Authorization = AuthTokenService.getAuthToken();
                    }

                    if (!headers['X-GraphDB-Repository']) {
                        const repositoryReference = ServiceProvider.get(RepositoryStorageService).getRepositoryReference();

                        headers['X-GraphDB-Repository'] = repositoryReference.id || undefined;
                        headers['X-GraphDB-Repository-Location'] = repositoryReference.location || undefined;
                    }

                    config.headers = headers;
                    return config;
                },
            };
        }]);


