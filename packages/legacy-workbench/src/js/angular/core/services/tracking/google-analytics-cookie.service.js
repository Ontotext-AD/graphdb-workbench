// The prefix of all GA cookies
const GA_COOKIE_NAME_PREFIX = '_ga';

angular.module('graphdb.framework.core.services.googleAnalyticsCookieService', [])
    .service('GoogleAnalyticsCookieService', ['$window', '$document', 'CookieService', GoogleAnalyticsCookieService]);

function GoogleAnalyticsCookieService($window, $document, CookieService) {
    /**
     * Adds the Google Tag Manager (GTM) script to the document's head if it is not already present.
     * This function creates a new script element for GTM and appends it to the document's head.
     * @private
     */
    const setIfAbsent = () => {
        if (!gtmScriptExists()) {
            const dataLayerScript = $document[0].createElement('script');
            dataLayerScript.text = "(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start': new Date().getTime(),event:'gtm.js'}); var f=d.getElementsByTagName(s)[0], j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:''; j.async=true; j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl; f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','GTM-WBP6C6Z4');";
            $document[0].getElementsByTagName('head')[0].appendChild(dataLayerScript);
        }
    };

    /**
     * Checks if a Google Tag Manager (GTM) script is already present in the document.
     *
     * When the GTM script is injected, it dynamically adds additional scripts depending on how many tags
     * are configured within your GTM container. These scripts are usually inserted into the `<head>` section,
     * but it’s better to search through the entire document to ensure all related GTM scripts are found.
     *
     * This function searches through all `<script>` elements in the document and returns `true` if any script
     * has a `src` attribute that contains 'googletagmanager'. It returns `false` otherwise.
     *
     * @return {boolean} - Returns `true` if a GTM script is found, otherwise `false`.
     * @private
     */
    const gtmScriptExists = () => {
        const scripts = $document[0].getElementsByTagName('script');
        return Array.from(scripts).some((script) => script.src && script.src.includes('googletagmanager'));
    };


    const remove = () => {
        if (gtmScriptExists()) {
            removeGoogleAnalyticsScripts();
        }

        removeGoogleAnalyticsCookies();
    };

    /**
     * Disables the Google Tag Manager (GTM) by preventing any further events from being pushed to the `dataLayer`.
     * This function also removes all existing GTM script elements from the document's head and body.
     *
     * Since this is a Single Page Application (SPA), removing and re-adding scripts must happen dynamically without
     * reloading the window. This method is used to remove GTM scripts when tracking is disallowed, rather than
     * performing a page reload, which is generally avoided
     *
     * 1. Disables the `dataLayer.push` method to prevent further GTM events from being tracked.
     * 2. Searches for and removes any `<script>` elements that include 'googletagmanager' in their `src` or script content.
     *
     * @private
     */
    const removeGoogleAnalyticsScripts = () => {
        if ($window.dataLayer) {
            $window.dataLayer.push = function () {
                return null;
            };
        }

        const scripts = $document[0].getElementsByTagName('script');
        const regex = /googletagmanager/i;

        // Iterate through all script elements and remove those that match the regex.
        for (let i = scripts.length - 1; i >= 0; i--) {
            if (scripts[i].src && regex.test(scripts[i].src)) {
                scripts[i].parentNode.removeChild(scripts[i]);
            } else if (regex.test(scripts[i].text)) {
                scripts[i].parentNode.removeChild(scripts[i]);
            }
        }

        if ($window.google_tag_manager) {
            delete $window.google_tag_manager;
        }
        if (window.google_tag_data) {
            delete $window.google_tag_data;
        }
    };

    /**
     * Retrieves all cookies with a specified prefix and removes each of them.
     *
     * @param {string} prefix - The prefix to filter cookies by.
     */
    const removeGoogleAnalyticsCookies = () => {
        const allCookies = CookieService.getAll();
        for (const [key, _] of Object.entries(allCookies)) {
            if (key.startsWith(GA_COOKIE_NAME_PREFIX)) {
                CookieService.remove(key);
            }
        }
    };

    return {
        setIfAbsent,
        remove
    };
}
