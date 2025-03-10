const BASIC_STEP = {
    title: '',
    content: '',
    elementSelector: undefined,
    placement: 'bottom',
    url: undefined,
    type: 'read-only-element',
    maxWaitTime: 3,
    canBePaused: true,
    onNextClick: undefined,
    onNextValidate: () => Promise.resolve(true),
    onPreviousClick: undefined,
    skipPoint: false,
    class: ''
};

/**
 * This function will be called before show a step. Step will be shown after promise is resolve. It waits element of step to be visible on the page.
 * @param {*} services
 * @param {string} elementSelector
 * @param {number} maxWaitTime
 * @return {function(): *}
 */
const beforeShowPromise = (services, elementSelector, maxWaitTime) => {
    return () => {
        return services.GuideUtils.waitFor(elementSelector, maxWaitTime)
            .catch((error) => {
                // error is caught just to show notification in generic way.
                services.toastr.error(services.$translate.instant('guide.unexpected.error.message'));
                // throw the error, otherwise guide will continue with the next step.
                throw error;
            });
    };
};

PluginRegistry.add('guide.step', [
    {
        // An element which is expected to be clicked. If onNextClick is not defined, it will automatically click on the element on next button press
        guideBlockName: 'clickable-element',
        getStep: (options, services) => {
            const notOverridable = {
                type: 'clickable'
            };

            const stepDescription = angular.extend({}, BASIC_STEP, {
                advanceOn: {
                    selector: options.clickableElementSelector || options.elementSelector,
                    event: 'click'
                },
                initPreviousStep: services.GuideUtils.defaultInitPreviousStep
            }, options, notOverridable);

            if (!stepDescription.beforeShowPromise) {
                stepDescription.beforeShowPromise = beforeShowPromise(services, stepDescription.elementSelector, stepDescription.maxWaitTime);
            }
            return stepDescription;
        }
    },
    {
        // An element which is expected to be focused. It allows user interaction.
        guideBlockName: 'focus-element',
        getStep: (options, services) => {
            const stepDescription = angular.extend({}, BASIC_STEP, {
                initPreviousStep: services.GuideUtils.defaultInitPreviousStep
            }, options);

            if (!stepDescription.beforeShowPromise) {
                stepDescription.beforeShowPromise = beforeShowPromise(services, stepDescription.elementSelector, stepDescription.maxWaitTime);
            }
            return stepDescription;
        }
    },
    {
        // An element which is expected to be focused, but interactions are disabled.
        guideBlockName: 'read-only-element',
        getStep: (options, services) => {
            const notOverridable = {
                type: 'readonly'
            };
            const stepDescription = angular.extend({}, BASIC_STEP, {
                    initPreviousStep: services.GuideUtils.defaultInitPreviousStep
                },
                options, notOverridable);
            if (!stepDescription.beforeShowPromise) {
                stepDescription.beforeShowPromise = beforeShowPromise(services, stepDescription.elementSelector, stepDescription.maxWaitTime);
            }
            return stepDescription;
        }
    },
    {
        guideBlockName: 'input-element',
        getStep: (options, services) => {
            const notOverridable = {
                type: 'input'
            };
            const stepDescription = angular.extend({}, BASIC_STEP, {
                initPreviousStep: services.GuideUtils.defaultInitPreviousStep
            }, options, notOverridable);
            if (!stepDescription.beforeShowPromise) {
                stepDescription.beforeShowPromise = beforeShowPromise(services, stepDescription.elementSelector, stepDescription.maxWaitTime);
            }
            return stepDescription;
        }
    },
    {
        guideBlockName: 'info-message',
        getStep: (options, services) => {
            const notOverridable = {
                type: 'readonly'
            };
            return angular.extend({}, BASIC_STEP, {
                initPreviousStep: services.GuideUtils.defaultInitPreviousStep
            }, options, notOverridable);
        }
    },
    {
        guideBlockName: 'hold-and-wait-until-hidden',
        getStep: (options, services) => {
            const notOverridable = {
                type: 'readonly'
            };
            return angular.extend({}, BASIC_STEP, {
                initPreviousStep: services.GuideUtils.defaultInitPreviousStep,
                disablePreviousFlow: true,
                onNextValidate: () => Promise.resolve(!services.GuideUtils.isVisible(options.elementSelectorToWait))
            }, options, notOverridable);
        }
    },
    {
        guideBlockName: 'hold-and-wait-until-shown',
        getStep: (options, services) => {
            const notOverridable = {
                type: 'readonly'
            };
            return angular.extend({}, BASIC_STEP, {
                initPreviousStep: services.GuideUtils.defaultInitPreviousStep,
                disablePreviousFlow: true,
                onNextValidate: () => Promise.resolve(services.GuideUtils.isVisible(options.elementSelectorToWait))
            }, options, notOverridable);
        }
    },
    {
        guideBlockName: 'wait-for-element-to-hide',
        getStep: (options, services) => {
            return angular.extend({}, BASIC_STEP, {
                initPreviousStep: services.GuideUtils.defaultInitPreviousStep,
                beforeShowPromise: () => services.GuideUtils.waitUntilHidden(options.elementSelectorToHide, options.timeToWait || 2),
                show: (guide) => () => {
                    // Using a timeout because the library executes async logic
                    setTimeout(() => guide.next())
                }
            }, options);
        }
    },
    {
        guideBlockName: 'wait-for-element-to-show',
        getStep: (options, services) => {
            return angular.extend({}, BASIC_STEP, {
                initPreviousStep: services.GuideUtils.defaultInitPreviousStep,
                beforeShowPromise: () => services.GuideUtils.getOrWaitFor(options.elementSelectorToShow, options.timeToWait || 2),
                show: (guide) => () => {
                    // Using a timeout because the library executes async logic
                    setTimeout(() => guide.next())
                }
            }, options);
        }
    },
    {
        guideBlockName: 'guide-end',
        getStep: (options, services) => {
            const notOverridable = {
                type: 'readonly',
                title: options.title || 'guide.step_plugin.guide-ended.title',
                content: options.content || 'guide.step_plugin.guide-ended.content',
                lastStep: true,
                show: (guide) => () => {
                    guide.options.confirmCancel = false;
                },
                hide: (guide) => () => {
                    guide.options.confirmCancel = true;
                }
            };
            return angular.extend({}, BASIC_STEP, {
                initPreviousStep: services.GuideUtils.defaultInitPreviousStep
            }, options, notOverridable);
        }
    }
]);
