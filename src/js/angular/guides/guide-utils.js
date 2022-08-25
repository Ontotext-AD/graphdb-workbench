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
    return {
        waitFor,
        clickOnElement,
        clickOnGuideElement,
        getGuideElementSelector,
        isVisible,
        isGuideElementVisible
    };
})();

export {
    GuideUtils
};
