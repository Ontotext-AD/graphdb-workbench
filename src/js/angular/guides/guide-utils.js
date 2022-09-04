const GuideUtils = (function () {

    const clickOnElement = function (elementSelector) {
        return () => waitFor(elementSelector)
            .then(element => {
                element.click();
            }).catch(() => {
                // nothing to do element is not visible or clickable
            });
    }

    const clickOnGuideElement = function (elementSelector, postSelector) {
        return GuideUtils.clickOnElement(GuideUtils.getGuideElementSelector(elementSelector, postSelector));
    }

    /**
     * Waits element to be present.
     * @param selector - selector of element looking for.
     * @param checkVisibility - if true will wait to become visible. Default value is true
     * @param timeoutInSeconds - max time to waite in second. Default value is 1 second.
     * @returns {Promise}
     */
    const waitFor = function (selector, timeoutInSeconds, checkVisibility = true) {
        return new Promise(function (resolve, reject) {
            let iteration = timeoutInSeconds * 1000 | 1000;
            const waitTime = 100;
            const elementExist = setInterval(() => {
                try {
                    let element = document.querySelector(selector);
                    if (element != null) {
                        if (!checkVisibility || angular.element(element).is(':visible')) {
                            clearInterval(elementExist);
                            setTimeout(() => {
                                resolve(angular.element(element));
                            }, 0)
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
                        }
                    }
                } catch (error) {
                    clearInterval(elementExist);
                    console.log('Error when processing selector: ' + selector);
                    console.log(error);
                    reject();
                }
            }, waitTime);
        });
    };

    const isVisible = function (selector) {
        const element = document.querySelector(selector);
        return element && angular.element(element).is(':visible');
    }

    const isGuideElementVisible = function (guideSelectorValue) {
        return this.isVisible(getGuideElementSelector(guideSelectorValue));
    }

    const getGuideElementSelector = function (guideSelectorValue, postSelector) {
        return `[guide-selector="${guideSelectorValue}"]${postSelector ? postSelector : ''}`
    }

    /**
     * Returns a function that returns a promise that will resolve when the D3 library force layout
     * settles (reaches an alpha value below the given threshold) or when the maximum wait time
     * passes. Useful in 'beforeShowPromise' of a step.
     * @param scope scope where the d3alpha property is set
     * @param timeoutInSeconds maximum wait time for the alpha value to settle, the default is 2 seconds
     * @param alphaThreshold alpha value threshold, the default is 0.02
     * @returns {function(): Promise<unknown>}
     */
    const awaitAlphaDropD3 = function (scope, timeoutInSeconds = 2, alphaThreshold = 0.02) {
        return () => new Promise(function(resolve) {
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
            }, 300); // give it some time to spin up
        });
    };

    /**
     * Expands a graph visualization node by firing a custom event to the visual graph code.
     * @param elementSelector the node to expand
     */
    const graphVizExpandNode = function (elementSelector) {
        const element = d3.select(elementSelector);
        const evt = new CustomEvent("gdb-expand-node", {detail: element.datum()});
        element.node().dispatchEvent(evt);
    };

    /**
     * Opens the visual graph node info panel by firing a custom event to the visual graph code.
     * @param elementSelector the node to show the info for
     */
    const graphVizShowNodeInfo = function (elementSelector) {
        const element = d3.select(elementSelector);
        const evt = new CustomEvent("gdb-show-node-info", {detail: element.datum()});
        element.node().dispatchEvent(evt);
    };

    /**
     * Validates that the provided selector (to a input element) contains the expected user input.
     * @param elementSelector a selector to an input element
     * @param expectedInput the expected user input
     * @param applyInput if true and the input element is empty, the supplied expected user input
     * will be entered into the input element; true by default
     * @returns {boolean} true if the input element is exactly equal to the expected user input,
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
     * @param $translate the $translation service
     * @param message the message to translate
     * @param parameters parameters to pass to the translation service
     * @returns {*}
     */
    const translateLocalMessage = ($translate, message, parameters) => {
        const lang = $translate.use();
        let translated;
        if (angular.isObject(message)) {
            translated = message[lang];
            if (!translated) {
                translated = message['en'];
            }
        } else {
            translated = $translate.instant(message, parameters);
        }
        return translated;
    };

    /**
     * Unescape string with HTML Entities: &lt;, &gt; etc.
     * @param escapedHtml - escaped string. For example: "Click on menu &lt;b&gt;Import&lt;/b&gt;."
     * @returns {string} - unescaped string. For example: "Click on menu <b>Import</b>."
     */
    const unescapeHtml = (escapedHtml) => {
        const div = document.createElement('div');
        div.innerHTML = escapedHtml;
        return div.innerText;
    };

    /**
     * Shows a toast with error that advancing to the next step isn't possible.
     * @param toastr the toast service
     * @param $translate the translation service
     * @param message the message to show in the toast
     * @param parameters parameters to pass to the translation service
     */
    const noNextErrorToast = (toastr, $translate, message, parameters) => {
        toastr.error(unescapeHtml(translateLocalMessage($translate, message, parameters)),
            unescapeHtml(translateLocalMessage($translate, 'guide.validate.no-next', parameters)),
            {allowHtml: true});
    };

    /**
     * Returns a function that returns a promise that will resolve when the supplied time passes.
     * Useful in 'beforeShowPromise' of a step to delay things when there is no better way to sync.
     * @param delay the time to wait in milliseconds
     * @returns {function(): Promise<unknown>}
     */
    const deferredShow = (delay) => {
        return () => new Promise(function (resolve) {
            setTimeout(() => {
                resolve();
            }, delay);
        });
    };


    return {
        waitFor,
        clickOnElement,
        clickOnGuideElement,
        getGuideElementSelector,
        isVisible,
        isGuideElementVisible,
        awaitAlphaDropD3,
        graphVizExpandNode,
        graphVizShowNodeInfo,
        validateTextInput,
        translateLocalMessage,
        unescapeHtml,
        noNextErrorToast,
        deferredShow
    };
})();

export {
    GuideUtils
};
