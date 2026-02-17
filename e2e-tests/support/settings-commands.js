/**
 * Sets the default user settings for the admin user, including cookie consent.
 * @param {CookieConsent} cookieConsent - The value to set for cookie consent.
 * - policyAccepted: boolean indicating whether the cookie policy has been accepted.
 * - statistic: boolean indicating consent for statistical cookies.
 * - thirdParty: boolean indicating consent for third-party cookies.
 * - updatedAt: epoch timestamp of last update in seconds.
 */
Cypress.Commands.add('setDefaultUserData', (cookieConsent) => {
    const defaultUserSettings = {
        'COOKIE_CONSENT': cookieConsent,
        'DEFAULT_SAMEAS': true,
        'DEFAULT_INFERENCE': true,
        'EXECUTE_COUNT': true,
        'IGNORE_SHARED_QUERIES': false,
        'DEFAULT_VIS_GRAPH_SCHEMA': true
    };
    cy.request({
        method: 'PATCH',
        url: `rest/security/users/${encodeURIComponent('admin')}`,
        body: {
            "appSettings": defaultUserSettings,
            'password': 'root'
        }
    }).then((response) => {
        cy.waitUntil(() => response && response.status === 200); // 201 Created
    });
});

/**
 * Sets the cookie consent in user settings for the admin user.
 * @param {CookieConsent} cookieConsent - The value to set for cookie consent.
 * - policyAccepted: boolean indicating whether the cookie policy has been accepted.
 * - statistic: boolean indicating consent for statistical cookies.
 * - thirdParty: boolean indicating consent for third-party cookies.
 * - updatedAt: epoch timestamp of last update in seconds.
 */
Cypress.Commands.add('setCookieConsent', (cookieConsent ) => {
    const defaultUserSettings = {
        'COOKIE_CONSENT': cookieConsent
    };
    cy.request({
        method: 'PATCH',
        url: `rest/security/users/${encodeURIComponent('admin')}`,
        body: {
            "appSettings": defaultUserSettings,
            'password': 'root'
        }
    }).then((response) => {
        cy.waitUntil(() => response && response.status === 200); // 201 Created
    });
});
