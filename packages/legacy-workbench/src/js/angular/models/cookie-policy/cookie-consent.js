/**
 * Class representing cookie consent settings.
 */
export class CookieConsent {
    /**
     * Initializes the CookieConsent instance with optional values.
     * If a value is not provided, it remains undefined.
     * @constructor
     * @param {boolean} [policyAccepted] - Indicates if the user has accepted the overall cookie policy.
     * @param {boolean} [statistic] - Consent status for statistic cookies.
     * @param {boolean} [thirdParty] - Consent status for third-party cookies.
     * @param {number} [updatedAt] - Unix timestamp of the last consent update (milliseconds since epoch).
     */
    constructor(policyAccepted, statistic, thirdParty, updatedAt) {
        this.policyAccepted = policyAccepted;
        this.statistic = statistic;
        this.thirdParty = thirdParty;
        this.updatedAt = updatedAt;
    }

    /**
     * Sets the overall cookie policy acceptance status.
     * @param {boolean} consent - The user's decision for the entire cookie policy.
     * @return {CookieConsent} Returns the instance to allow chaining.
     */
    setPolicyAccepted(consent) {
        this.policyAccepted = consent;
        this.updateTimestamp();
        return this;
    }

    /**
     * Sets the consent for statistic cookies.
     * @param {boolean} consent - The user's consent decision for statistic cookies.
     * @return {CookieConsent} Returns the instance to allow chaining.
     */
    setStatisticConsent(consent) {
        this.statistic = consent;
        this.updateTimestamp();
        return this;
    }

    /**
     * Sets the consent for third-party cookies.
     * @param {boolean} consent - The user's consent decision for third-party cookies.
     * @return {CookieConsent} Returns the instance to allow chaining.
     */
    setThirdPartyConsent(consent) {
        this.thirdParty = consent;
        this.updateTimestamp();
        return this;
    }

    /**
     * Updates the `updatedAt` timestamp to the current date and time.
     * @private
     */
    updateTimestamp() {
        this.updatedAt = Date.now();
    }

    getPolicyAccepted() {
        return this.policyAccepted;
    }

    getStatisticConsent() {
        return this.statistic;
    }

    getThirdPartyConsent() {
        return this.thirdParty;
    }

    /**
     * Retrieves the current consent settings.
     * @return {Object} An object containing the current acceptance status for the cookie policy, consents for statistic and third-party cookies, and the `updatedAt` timestamp.
     */
    toJSON() {
        return {
            policyAccepted: this.policyAccepted,
            statistic: this.statistic,
            thirdParty: this.thirdParty,
            updatedAt: this.updatedAt
        };
    }

    /**
     * Creates a CookieConsent instance from a JSON object.
     * If values are missing in the JSON object, they will remain undefined.
     *
     * @param {Object} json - The JSON object to initialize the CookieConsent instance.
     * @param {boolean} [json.policyAccepted] - Whether the overall cookie policy has been accepted.
     * @param {boolean} [json.statistic] - Consent status for statistic cookies.
     * @param {boolean} [json.thirdParty] - Consent status for third-party cookies.
     * @param {number} [json.updatedAt] - The timestamp of the last consent update.
     * @return {CookieConsent} A new CookieConsent instance with values set from the JSON object.
     */
    static fromJSON(json) {
        return new CookieConsent(
            json && json.policyAccepted,
            json && json.statistic,
            json && json.thirdParty,
            json && json.updatedAt
        );
    }
}

/**
 * Enum for consent types.
 * Provides standardized property names for different cookie consent options.
 * @readonly
 * @enum {string}
 */
export const ConsentTypes = {
    STATISTIC: 'statistic',
    THIRD_PARTY: 'thirdParty'
};
