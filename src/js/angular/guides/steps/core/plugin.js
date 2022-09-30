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
    onNextValidate: undefined,
    onPreviousClick: undefined,
    skipPoint: false
};

/**
 * This function will be call before show a step. Step will shown after promise is resolve. It waits element of step to be visible on the page.
 * @param maxWaitTime
 * @param services
 * @param elementSelector
 * @returns {function(): *}
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
    }
}

PluginRegistry.add('guide.step', [
    {
        guideBlockName: 'clickable-element',
        getStep: (options, services) => {
            const notOverridable = {
                type: 'clickable',
            };

            const stepDescription = angular.extend({}, BASIC_STEP, {
                advanceOn: {
                    selector: options.elementSelector,
                    event: 'click'
                },
            }, options, notOverridable);

            if (!stepDescription.beforeShowPromise) {
                stepDescription.beforeShowPromise = beforeShowPromise(services, stepDescription.elementSelector, stepDescription.maxWaitTime);
            }
            return stepDescription;
        }
    },
    {
        guideBlockName: 'read-only-element',
        getStep: (options, services) => {
            const notOverridable = {
                type: 'readonly',
            };
            const stepDescription = angular.extend({}, BASIC_STEP, options, notOverridable);
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
                type: 'input',
            };
            const stepDescription = angular.extend({}, BASIC_STEP, options, notOverridable);
            if (!stepDescription.beforeShowPromise) {
                stepDescription.beforeShowPromise = beforeShowPromise(services, stepDescription.elementSelector, stepDescription.maxWaitTime);
            }
            return stepDescription;
        }
    },
    {
        guideBlockName: 'info-message',
        getStep: (options) => {
            const notOverridable = {
                type: 'readonly',
            };
            return angular.extend({}, BASIC_STEP, options, notOverridable);
        }
    },
    {
        guideBlockName: 'guide-end',
        getStep: (options) => {
            const notOverridable = {
                type: 'readonly'
            };
            return angular.extend({}, BASIC_STEP, options, {
                title: 'guide.step_plugin.guide-ended.title',
                content: 'guide.step_plugin.guide-ended.content',
                show: (guide) => () => {
                    guide.options.confirmCancel = false;
                },
                hide: (guide) => () => {
                    guide.options.confirmCancel = true;
                }
            }, notOverridable);
        }
    }
]);
