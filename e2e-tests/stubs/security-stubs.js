export class SecurityStubs {

    static spyOnAuthenticatedUser() {
        cy.intercept('/rest/security/authenticated-user').as('get-authenticated-user')
    }

    static stubUserSecurity(infer = true, sameAs = true, userName = 'admin') {
        cy.intercept(`rest/security/users/${userName}`, (req) => {
            req.reply(SecurityStubs.getAdminResponse(infer, sameAs));
        }).as('security-get-admin');
    }

    static stubInferAndSameAsDefaults() {
        cy.intercept('rest/security/all', (req) => {
            req.reply(SecurityStubs.getResponseSecurityEnabled());
        }).as('security-all');
    }

    static stubUpdateUserData(userName) {
        cy.intercept('PATCH', `/rest/security/users/${userName}`, {
            statusCode: 200,
            body: {}
        }).as('updateUser');
    }

    static stubGetAdminUser() {
        cy.intercept('GET', 'rest/security/users/admin', {
            fixture: '/security/get-admin-user.json',
            statusCode: 200
        }).as('getAdminUser');
    }

    /**
     * Disables the globally configured interceptor for the GET request to get the admin user.
     * This is useful when you want to test the real response from the server.
     *
     * This should be called in each test where you want to test the real response.
     */
    static resetGetAdminUserStub() {
        cy.intercept('GET', 'rest/security/users/admin', (req) => {
                req.reply((res) => {
                    res.send({});
                });
            }
        ).as('getAdminUser');
    }

    static getAdminResponse(infer, sameAs) {
        return {
            "username": "admin",
            "password": "",
            "grantedAuthorities": [
                "ROLE_ADMIN"
            ],
            "appSettings": {
                "DEFAULT_INFERENCE": infer,
                "DEFAULT_VIS_GRAPH_SCHEMA": true,
                "DEFAULT_SAMEAS": sameAs,
                "IGNORE_SHARED_QUERIES": false,
                "EXECUTE_COUNT": true
            },
            "dateCreated": 1663139335552
        };
    }

    static getResponseSecurityEnabled() {
        return {
            "freeAccess": {
                "enabled": false,
                "authorities": [],
                "appSettings": {
                    "DEFAULT_INFERENCE": true,
                    "DEFAULT_VIS_GRAPH_SCHEMA": true,
                    "DEFAULT_SAMEAS": true,
                    "IGNORE_SHARED_QUERIES": false,
                    "EXECUTE_COUNT": true
                }
            },
            "overrideAuth": {
                "enabled": false,
                "authorities": [
                    "ROLE_REPO_MANAGER",
                    "ROLE_MONITORING",
                    "ROLE_USER"
                ],
                "appSettings": {
                    "DEFAULT_INFERENCE": true,
                    "DEFAULT_VIS_GRAPH_SCHEMA": true,
                    "DEFAULT_SAMEAS": true,
                    "IGNORE_SHARED_QUERIES": false,
                    "EXECUTE_COUNT": true
                }
            },
            "methodSettings": {},
            "enabled": false,
            "passwordLoginEnabled": true,
            "hasExternalAuth": false,
            "authImplementation": "Local",
            "openIdEnabled": false
        };
    }
}
