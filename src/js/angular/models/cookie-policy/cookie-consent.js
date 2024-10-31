/**
 * Class representing cookie consent settings.
 */
export class CookieConsent {
    /**
     * Initializes the CookieConsent instance with default values.
     * @constructor
     */
    constructor() {
        /**
         * @property {boolean} policyAccepted - Indicates if the user has accepted the overall cookie policy.
         */
        this.policyAccepted = false;

        /**
         * @property {boolean} statistic - Consent status for statistic cookies.
         */
        this.statistic = false;

        /**
         * @property {boolean} thirdParty - Consent status for third-party cookies.
         */
        this.thirdParty = false;

        /**
         * @property {number} updatedAt - Unix timestamp of the last consent update (milliseconds since epoch).
         */
        this.updatedAt = Date.now();
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

    /**
     * Retrieves the current consent settings.
     * @return {Object} An object containing the current acceptance status for the cookie policy, consents for statistic and third-party cookies, and the `updatedAt` timestamp.
     */
    getConsent() {
        return {
            policyAccepted: this.policyAccepted,
            statistic: this.statistic,
            thirdParty: this.thirdParty,
            updatedAt: this.updatedAt
        };
    }

    /**
     * Creates a CookieConsent instance from a JSON object.
     * If the JSON object has missing values, default values are applied:
     * - `policyAccepted` defaults to `false`.
     * - `statistic` and `thirdParty` cookies default to `true`.
     * - `updatedAt` defaults to the current timestamp.
     *
     * Only properties explicitly set in the JSON object are used to overwrite the defaults.
     *
     * @param {Object} json - The JSON object to initialize the CookieConsent instance.
     * @param {boolean} [json.policyAccepted=false] - Whether the overall cookie policy has been accepted.
     * @param {boolean} [json.statistic=true] - Consent status for statistic cookies.
     * @param {boolean} [json.thirdParty=true] - Consent status for third-party cookies.
     * @param {number} [json.updatedAt=Date.now()] - The timestamp of the last consent update.
     * @return {CookieConsent} A new CookieConsent instance with values set from the JSON object or defaults applied.
     */
    static fromJSON(json) {
        // Start with a CookieConsent instance with initial default values
        const consent = new CookieConsent().setPolicyAccepted(false).setStatisticConsent(true).setThirdPartyConsent(true);

        if (json) {
            consent.policyAccepted = json.policyAccepted !== undefined ? json.policyAccepted : consent.policyAccepted;
            consent.statistic = json.statistic !== undefined ? json.statistic : consent.statistic;
            consent.thirdParty = json.thirdParty !== undefined ? json.thirdParty : consent.thirdParty;
            consent.updatedAt = json.updatedAt !== undefined ? json.updatedAt : consent.updatedAt;
        }

        return consent;
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
