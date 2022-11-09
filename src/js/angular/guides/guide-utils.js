const GuideUtils = (function () {
    const GUIDES_LIST_URL = '/rest/guides';
    const GUIDES_DOWNLOAD_URL = '/rest/guides/download/';

    const clickOnElement = function (elementSelector) {
        return () => waitFor(elementSelector)
            .then((element) => element.click());
    };

    const clickOnGuideElement = function (elementSelector, postSelector) {
        return GuideUtils.clickOnElement(GuideUtils.getGuideElementSelector(elementSelector, postSelector));
    };

    /**
     * Waits element to be present.
     * @param {string} elementSelector - selector of element looking for.
     * @param {number} timeoutInSeconds - max time to waite in second. Default value is 1 second.
     * @param {boolean} checkVisibility - if true will wait to become visible. Default value is true
     * @return {Promise}
     */
    const waitFor = function (elementSelector, timeoutInSeconds = 1, checkVisibility = true) {
        const selector = getElementSelector(elementSelector);
        return new Promise(function (resolve, reject) {
            let iteration = timeoutInSeconds * 1000 | 1000;
            const waitTime = 100;
            const elementExist = setInterval(() => {
                try {
                    const element = document.querySelector(selector);
                    if (element != null) {
                        if (!checkVisibility || angular.element(element).is(':visible')) {
                            clearInterval(elementExist);
                            setTimeout(() => {
                                resolve(angular.element(element));
                            }, 0);
                        } else {
                            iteration -= waitTime;
                            if (iteration < 0) {
                                clearInterval(elementExist);
                                console.log('Element is not visible: ' + selector);
                                reject();
                            }
                        }
                    } else {
                        iteration -= waitTime;
                        if (iteration < 0) {
                            clearInterval(elementExist);
                            console.log('Element is not found: ' + selector);
                            reject();
                        }
                    }
                } catch (error) {
                    clearInterval(elementExist);
                    console.log('Error when processing selector: ' + selector);
                    console.log(error);
                    reject(error);
                }
            }, waitTime);
        });
    };

    const isVisible = function (selector) {
        const element = document.querySelector(selector);
        return element && angular.element(element).is(':visible');
    };

    const isGuideElementVisible = function (guideSelectorValue) {
        return isVisible(getGuideElementSelector(guideSelectorValue));
    };

    const getGuideElementSelector = function (guideSelectorValue, postSelector) {
        return `[guide-selector="${guideSelectorValue}"] ${postSelector ? postSelector : ''}`;
    };

    /**
     * Returns a function that returns a promise that will resolve when the D3 library force layout
     * settles (reaches an alpha value below the given threshold) or when the maximum wait time
     * passes. Useful in 'beforeShowPromise' of a step.
     * @param {string | null} elementSelector - a node selector.
     * @param {*}scope scope where the d3alpha property is set
     * @param {number} timeoutInSeconds maximum wait time for the alpha value to settle, the default is 2 seconds
     * @param {number} alphaThreshold alpha value threshold, the default is 0.02
     * @return {function(): Promise<unknown>}
     */
    const awaitAlphaDropD3 = function (elementSelector, scope, timeoutInSeconds = 2, alphaThreshold = 0.02) {
        return () => new Promise(function(resolve) {
            if (isVisible(elementSelector)) {
                resolve();
                return;
            }
            setTimeout(() => {
                let iteration = timeoutInSeconds * 1000;
                const waitTime = 100;
                const alphaCheck = setInterval(() => {
                    const alpha = scope.d3alpha;
                    if (alpha < alphaThreshold) {
                        // D3 settled below the given alpha threshold => OK
                        clearInterval(alphaCheck);
                        resolve();
                    } else {
                        iteration -= waitTime;
                        if (iteration < 0) {
                            // Timeout waiting for D3 to settle reached => also OK
                            clearInterval(alphaCheck);
                            resolve();
                        }
                    }
                }, waitTime);
            }, 150); // give it some time to spin up
        });
    };

    /**
     * Expands a graph visualization node by firing a custom event to the visual graph code.
     * @param {string} elementSelector the node to expand
     */
    const graphVizExpandNode = function (elementSelector) {
        const element = d3.select(elementSelector);
        const evt = new CustomEvent("gdb-expand-node", {detail: element.datum()});
        element.node().dispatchEvent(evt);
    };

    /**
     * Opens the visual graph node info panel by firing a custom event to the visual graph code.
     * @param {string} elementSelector the node to show the info for
     */
    const graphVizShowNodeInfo = function (elementSelector) {
        const element = d3.select(elementSelector);
        const evt = new CustomEvent("gdb-show-node-info", {detail: element.datum()});
        element.node().dispatchEvent(evt);
    };

    /**
     * Focuses a class in the class hierarchy view by firing a custom event.
     * @param {string} elementSelector the node to focus
     */
    const classHierarchyFocus = function (elementSelector) {
        const element = d3.select(elementSelector);
        const evt = new CustomEvent("gdb-focus", {detail: element.datum()});
        element.node().dispatchEvent(evt);
    };

    /**
     * Zooms to a class in the class hierarchy view by firing a custom event.
     * @param {string} elementSelector the node to zoom to
     */
    const classHierarchyZoom = function (elementSelector) {
        const element = d3.select(elementSelector);
        const evt = new CustomEvent("gdb-zoom", {detail: element.datum()});
        element.node().dispatchEvent(evt);
    };

    /**
     * Validates that the provided selector (to a input element) contains the expected user input.
     * @param {*}elementSelector a selector to an input element
     * @param {*}expectedInput the expected user input
     * @param {*}applyInput if true and the input element is empty, the supplied expected user input
     * will be entered into the input element; true by default
     * @return {boolean} true if the input element is exactly equal to the expected user input,
     * false otherwise
     */
    const validateTextInput = function (elementSelector, expectedInput, applyInput = true) {
        const input = $(elementSelector).val();
        if (input === '' && applyInput) {
            $(elementSelector).val(expectedInput);
            $(elementSelector).trigger('change');
            return true;
        } else {
            // TODO: show toast error when the input isn't the expected input
            return input === expectedInput;
        }
    };

    /**
     * Translates a message, where the message can be a message ID (in most cases) or an object that
     * supplies the translations for each language.
     * @param {*}$translate the $translation service
     * @param {*}$interpolate the $interpolate service
     * @param {string} message the message to translate
     * @param {*}parameters parameters to pass to the translation service
     * @return {string}
     */
    const translateLocalMessage = ($translate, $interpolate, message, parameters) => {
        const lang = $translate.use();
        let translated;
        if (angular.isObject(message)) {
            translated = message[lang];
            if (!translated) {
                translated = message['en'];
            }
            translated = $interpolate(translated)(parameters);
        } else {
            // $translate.instant() garbles HTML, so we need to ungarble it
            translated = unescapeHtml($translate.instant(message, parameters));
        }
        return translated;
    };

    /**
     * Unescape string with HTML Entities: &lt;, &gt; etc.
     * @param {string} escapedHtml - escaped string. For example: "Click on menu &lt;b&gt;Import&lt;/b&gt;."
     * @return {string} - unescaped string. For example: "Click on menu <b>Import</b>."
     */
    const unescapeHtml = (escapedHtml) => {
        const div = document.createElement('div');
        div.innerHTML = escapedHtml;
        return div.innerText;
    };

    /**
     * Shows a toast with error that advancing to the next step isn't possible.
     * @param {*}toastr the toast service
     * @param {*}$translate the translation service
     * @param {*}$interpolate the interpolation service
     * @param {string} message the message to show in the toast
     * @param{*}parameters parameters to pass to the translation service
     */
    const noNextErrorToast = (toastr, $translate, $interpolate, message, parameters) => {
        toastr.error(unescapeHtml(translateLocalMessage($translate, $interpolate, message, parameters)),
            unescapeHtml(translateLocalMessage($translate, $interpolate, 'guide.validate.no-next', parameters)),
            {allowHtml: true});
    };

    /**
     * Returns a function that returns a promise that will resolve when the supplied time passes.
     * Useful in 'beforeShowPromise' of a step to delay things when there is no better way to sync.
     * @param {number} delay the time to wait in milliseconds
     * @return {function(): Promise<unknown>}
     */
    const deferredShow = (delay) => {
        return () => new Promise(function (resolve) {
            setTimeout(() => {
                resolve();
            }, delay);
        });
    };

    const scrollToTop = () => {
        window.scrollTo(0, 0);
    };

    const removeWhiteSpaces = (value) => {
        return value.replace(/\s+/g, '');
    };

    /**
     * Constructs a download URL for the downloadable resource described by the provided step's
     * options.
     * @param {*}options the options of the step
     * @return {string} the download URL
     */
    const toResourceDownloadUrl = (options) => {
        return GUIDES_DOWNLOAD_URL + options.resourcePath + '/' + options.resourceFile;
    };

    const getSparqlEditorSelector = (postSelector) => {
        if (postSelector) {
            return getGuideElementSelector('queryEditor', '.CodeMirror-code ' + postSelector);
        }
        return getGuideElementSelector('queryEditor', '.CodeMirror-code');
    };

    const getSparqlResultsSelector = (postSelector) => {
        return getGuideElementSelector('yasrResults', postSelector);
    };

    const getSparqlResultsSelectorForIri = (iri) => {
        return getSparqlResultsSelector("a[title='" + iri + "']");
    };

    const getSparqlResultsSelectorForRow = (row) => {
        return getSparqlResultsSelector('tbody tr:nth-child(' + row + ')');
    };

    const isChecked = (selector) => {
        return angular.element(selector).is(':checked');
    };

    const isGuideElementChecked = (selector, postSelect) => {
        return isChecked(GuideUtils.getGuideElementSelector('autocompleteCheckbox', postSelect));
    };

    const defaultInitPreviousStep = (services, stepId) => new Promise(function (resolve, reject) {
        const previousStep = services.ShepherdService.getPreviousStepFromHistory(stepId);
        if (previousStep) {
            previousStep.options.initPreviousStep(services, previousStep.options.id)
                .then(() => resolve())
                .catch((error) => reject(error));
        } else {
            resolve();
        }
    });

    const getElementSelector = (elementSelector) => {
        return angular.isFunction(elementSelector) ? elementSelector() : elementSelector;
    };

    /**
     * Executes a sparql query.
     * @param {*} $location - the locations service.
     * @param {*} $route
     * @param {string} query - sparql query to be executed.
     * @param {boolean} reload - if true sparql page will be loaded before execution of query.
     * @return {Promise<unknown>}
     */
    const executeSparqlQuery = ($location, $route, query, reload = false) => new Promise((resolve, reject) => {
        if (reload) {
            $location.url('/sparql');
            $route.reload();
            waitFor(getSparqlEditorSelector())
                .then(() => {
                    waitFor('.no-query-run')
                        .then(() => {
                            window.editor.setValue(query);
                            clickOnGuideElement('runSparqlQuery')()
                                .then(() => resolve())
                                .catch((error) => reject(error));
                        })
                        .catch((error) => reject(error));
                })
                .catch((error) => reject(error));
        } else {
            window.editor.setValue(query);
            clickOnGuideElement('runSparqlQuery')()
                .then(() => resolve())
                .catch((error) => reject(error));
        }
    });

    return {
        GUIDES_LIST_URL,
        GUIDES_DOWNLOAD_URL,
        waitFor,
        clickOnElement,
        clickOnGuideElement,
        getGuideElementSelector,
        isVisible,
        isGuideElementVisible,
        awaitAlphaDropD3,
        graphVizExpandNode,
        graphVizShowNodeInfo,
        classHierarchyFocus,
        classHierarchyZoom,
        validateTextInput,
        translateLocalMessage,
        unescapeHtml,
        noNextErrorToast,
        deferredShow,
        scrollToTop,
        removeWhiteSpaces,
        toResourceDownloadUrl,
        getSparqlEditorSelector,
        getSparqlResultsSelector,
        getSparqlResultsSelectorForIri,
        getSparqlResultsSelectorForRow,
        isChecked,
        isGuideElementChecked,
        defaultInitPreviousStep,
        getElementSelector,
        executeSparqlQuery
    };
})();

export {
    GuideUtils
};
