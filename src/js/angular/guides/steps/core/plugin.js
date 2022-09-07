const BASIC_STEP = {
    'title': '',
    'content': '',
    'elementSelector': undefined,
    'placement': 'bottom',
    'url': undefined,
    'type': 'read-only-element',
    'maxWaitTime': 3,
    'canBePaused': true,
    'onNextClick': undefined,
    'onNextValidate': undefined,
    'onPreviousClick': undefined
};

/**
 * This function will be call before show a step. Step will shown after promise is resolve. It waits element of step to be visible on the page.
 * @param maxWaitTime
 * @param GuideUtils
 * @param elementSelector
 * @returns {function(): *}
 */
const beforeShowPromise = (GuideUtils, elementSelector, maxWaitTime) => {
    return () => {
        return GuideUtils.waitFor(elementSelector, maxWaitTime);
    }
}

PluginRegistry.add('guide.step', [
    {
        'guideBlockName': 'clickable-element',
        'getStep': (options, GuideUtils) => {
            const notOverridable = {
                'type': 'clickable',
            };

            const stepDescription = angular.extend({}, BASIC_STEP, {
                'advanceOn': {
                    selector: options.elementSelector,
                    event: 'click'
                },
            }, options, notOverridable);

            if (!stepDescription.beforeShowPromise) {
                stepDescription.beforeShowPromise = beforeShowPromise(GuideUtils, stepDescription.elementSelector, stepDescription.maxWaitTime);
            }
            return stepDescription;
        }
    },
    {
        'guideBlockName': 'read-only-element',
        'getStep': (options, GuideUtils) => {
            const notOverridable = {
                'type': 'readonly',
            };
            const stepDescription = angular.extend({}, BASIC_STEP, options, notOverridable);
            if (!stepDescription.beforeShowPromise) {
                stepDescription.beforeShowPromise = beforeShowPromise(GuideUtils, stepDescription.elementSelector, stepDescription.maxWaitTime);
            }
            return stepDescription;
        }
    },
    {
        'guideBlockName': 'input-element',
        'getStep': (options, GuideUtils) => {
            const notOverridable = {
                'type': 'readonly',
            };
            const stepDescription = angular.extend({}, BASIC_STEP, options, notOverridable);
            if (!stepDescription.beforeShowPromise) {
                stepDescription.beforeShowPromise = beforeShowPromise(GuideUtils, stepDescription.elementSelector, stepDescription.maxWaitTime);
            }
            return stepDescription;
        }
    },
    {
        'guideBlockName': 'info-message',
        'getStep': (options, GuideUtils) => {
            const notOverridable = {
                'type': 'readonly',
            };
            return angular.extend({}, BASIC_STEP, options, notOverridable);
        }
    },
    {
        'guideBlockName': 'guide-end',
        'getStep': (options, GuideUtils) => {
            const notOverridable = {
                'type': 'readonly'
            };
            const step = angular.extend({}, BASIC_STEP, options, notOverridable);
            step.title = 'guide.step_plugin.guide-ended.title';
            step.content = 'guide.step_plugin.guide-ended.content';
            return step;
        }
    }
]);
