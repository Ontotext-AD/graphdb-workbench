const GuideUtils = (function () {

    const clickOnElement = function (elementSelector) {
        return () => waitFor(elementSelector)
            .then(element => {
                element.click();
            }).catch(() => {
                // nothing to do element is not visible or clickable
            });
    }

    /**
     * Waits element to be present.
     * @param selector - selector of element looking for.
     * @param timeoutInSeconds - max time to waite in second. Default value is 1 second.
     * @returns {Promise}
     */
    const waitFor = function (selector, timeoutInSeconds) {
        return new Promise(function (resolve, reject) {
            let iteration = timeoutInSeconds * 1000 | 1000;
            const waitTime = 100;
            const elementExist = setInterval(() => {
                try {
                    let element = document.querySelector(selector);
                    if (element != null) {
                        clearInterval(elementExist);
                        if (angular.element(element).is(':visible')) {
                            resolve(element);
                        } else {
                            console.log('Element is not visible: ' + selector);
                            reject();
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
    return {
        waitFor,
        clickOnElement
    };
})();

export {
    GuideUtils
};
