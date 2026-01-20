import 'angular/core/services';
import {RuntimeConfigurationContextService, service} from '@ontotext/workbench-api';

angular
    .module('graphdb.framework.webapi', [])
    .controller('WebApiCtrl', WebApiCtrl);

WebApiCtrl.$inject = ['$scope'];

function WebApiCtrl($scope) {
    const runtimeConfigurationContextService = service(RuntimeConfigurationContextService);

    const subscriptions = [];

    const iframe = document.getElementById('webapi_frame');
    if (!iframe) {
        // If the template changes or the element isn't present, avoid throwing and breaking navigation.
        return;
    }

    iframe.style.display = 'none';

    // =========================
    // Private functions
    // =========================
    const getIframeDocument = () => {
        // Access may throw depending on iframe origin.
        return iframe.contentDocument || iframe.contentWindow?.document;
    };

    const syncStyles = () => {
        try {
            const iframeDoc = getIframeDocument();
            if (!iframeDoc?.documentElement) {
                return;
            }

            const rootStyles = getComputedStyle(document.documentElement);
            const iframeRoot = iframeDoc.documentElement;

            for (const prop of rootStyles) {
                if (!prop.startsWith('--gw-')) {
                    continue;
                }

                const value = rootStyles.getPropertyValue(prop);
                if (iframeRoot.style.getPropertyValue(prop) !== value) {
                    iframeRoot.style.setProperty(prop, value);
                }
            }

            iframe.style.display = 'block';
        } catch (e) {
            // If we can't access the iframe (cross-origin), avoid breaking navigation.
            // Show it anyway to avoid leaving the UI blank.
            iframe.style.display = 'block';
            console.error('Cannot access iframe styles:', e);
        }
    };

    let themeChangeUnsubscribe;

    const handleIframeLoad = () => {
        // Subscribe to theme changes when the iframe loads.
        // This prevents subscribing before the iframe document is available.
        // Also syncs immediately on subscription.
        if (typeof themeChangeUnsubscribe === 'function') {
            themeChangeUnsubscribe();
        }
        themeChangeUnsubscribe = runtimeConfigurationContextService.onThemeModeChanged(syncStyles);
    };

    const removeAllListeners = () => {
        subscriptions.forEach((subscription) => {
            try {
                subscription();
            } catch {
                // Ignore cleanup errors.
            }
        });
    };

    const destroyHandler = () => {
        iframe.removeEventListener('load', handleIframeLoad);

        if (typeof themeChangeUnsubscribe === 'function') {
            themeChangeUnsubscribe();
            themeChangeUnsubscribe = undefined;
        }

        removeAllListeners();
    };

    // =========================
    // Event handlers
    // =========================
    iframe.addEventListener('load', handleIframeLoad);

    const iframeLoadUnsubscribe = () => {
        iframe.removeEventListener('load', handleIframeLoad);
    };
    subscriptions.push(iframeLoadUnsubscribe);

    $scope.$on('$destroy', destroyHandler);
}
