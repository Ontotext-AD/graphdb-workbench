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
    disablePreviousFlow: true,
    onNextValidate: () => Promise.resolve(true),
    onPreviousClick: undefined,
    skipPoint: false,
    class: '',
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

const createCopyToInputListener = (elementSelector, text) => {
    return (event) => {
        event.preventDefault();
        const inputElement = document.querySelector(elementSelector);
        inputElement.value = text;
    };
};

/**
 * List of common DOM events to consider for interaction control.
 * @type {string[]}
 */
const COMMON_DOM_EVENTS = [
    'click',
    'dblclick',
    'keydown',
    'keypress',
    'keyup',
    'input',
    'submit',
    'scroll',
    'wheel',
];
const SCROLL_EVENTS = ['scroll', 'wheel'];

/**
 * Configures an element interactability, by consuming events and preventing them from propagating.
 * This allows to keep scrolling, while disallowing interaction with other elements
 * (such as clicking buttons).
 * @param {string[]} allowedEvents - List of event types to allow.
 * @param interactable - true to make the element interactable, false to make it non interactable
 * @param elementSelector - the elementSelector
 * @param services - The services object
 */
const _configureInteractions = (allowedEvents, interactable, elementSelector, services) => () => {
    if (!elementSelector) {
        return;
    }

    services.GuideUtils.getOrWaitFor(elementSelector)
        .then((element) => {
            const eventsToPrevent = COMMON_DOM_EVENTS.filter((event) => !allowedEvents.includes(event));
            if (interactable) {
                eventsToPrevent.forEach((event) => element.removeEventListener(event, preventDefault, true));
            } else {
                eventsToPrevent.forEach((event) => element.addEventListener(event, preventDefault, true));
            }
        });
};

/**
 * Enables all interactions on the specified element.
 *
 * @param {string} elementSelector - A CSS selector identifying the target element.
 * @param {Object} services - An object containing utility services, including GuideUtils.
 */
const allowAll = (elementSelector, services) => _configureInteractions([], true, elementSelector, services);

/**
 * Restricts the specified element to only process events listed in <code>allowedEvents</code>.
 *
 * @param {string[]} allowedEvents - An array of event types that should remain enabled.
 * @param {string} elementSelector - A CSS selector identifying the target element.
 * @param {Object} services - An object containing utility services, including GuideUtils.
 */
const allowEvents = (allowedEvents, elementSelector, services) => _configureInteractions(allowedEvents, false, elementSelector, services);

/**
 * Prevents the default action of an event and stops its propagation.
 * @param {Event} event - The event to prevent.
 */
const preventDefault = (event) => {
    event.preventDefault();
    event.stopPropagation();
};

PluginRegistry.add('guide.step', [
    {
        // An element which is expected to be clicked. If onNextClick is not defined, it will automatically click on the element on next button press
        guideBlockName: 'clickable-element',
        getStep: (options, services) => {
            const notOverridable = {
                type: 'clickable',
            };

            const stepDescription = angular.extend({}, BASIC_STEP, {
                advanceOn: {
                    selector: options.clickableElementSelector || options.elementSelector,
                    event: 'click',
                },
                initPreviousStep: services.GuideUtils.defaultInitPreviousStep,
            }, options, notOverridable);

            if (!stepDescription.beforeShowPromise) {
                stepDescription.beforeShowPromise = beforeShowPromise(services, stepDescription.elementSelector, stepDescription.maxWaitTime);
            }
            return stepDescription;
        },
    },
    {
        // An element which is expected to be focused. It allows user interaction.
        guideBlockName: 'focus-element',
        getStep: (options, services) => {
            const stepDescription = angular.extend({}, BASIC_STEP, {
                initPreviousStep: services.GuideUtils.defaultInitPreviousStep,
            }, options);

            if (!stepDescription.beforeShowPromise) {
                stepDescription.beforeShowPromise = beforeShowPromise(services, stepDescription.elementSelector, stepDescription.maxWaitTime);
            }
            return stepDescription;
        },
    },
    {
        // An element which is expected to be focused, but interactions are disabled.
        guideBlockName: 'read-only-element',
        getStep: (options, services) => {
            const notOverridable = {
                type: 'readonly',
            };
            const stepDescription = angular.extend({}, BASIC_STEP, {
                    initPreviousStep: services.GuideUtils.defaultInitPreviousStep,
                },
                options, notOverridable);
            if (!stepDescription.beforeShowPromise) {
                stepDescription.beforeShowPromise = beforeShowPromise(services, stepDescription.elementSelector, stepDescription.maxWaitTime);
            }
            return stepDescription;
        },
    },
    {
        guideBlockName: 'scroll-only-element',
        getStep: (options, services) => {
            const stepDescription = {
                ...BASIC_STEP,
                initPreviousStep: services.GuideUtils.defaultInitPreviousStep,
                show: () => allowEvents(SCROLL_EVENTS, options.elementSelector, services),
                hide: () => allowAll(options.elementSelector, services),
                ...options,
            };
            if (!stepDescription.beforeShowPromise) {
                stepDescription.beforeShowPromise = beforeShowPromise(services, stepDescription.elementSelector, stepDescription.maxWaitTime);
            }
            return stepDescription;
        },
    },
    {
        guideBlockName: 'input-element',
        getStep: (options, services) => {
            const notOverridable = {
                type: 'input',
            };
            const stepDescription = angular.extend({}, BASIC_STEP, {
                initPreviousStep: services.GuideUtils.defaultInitPreviousStep,
            }, options, notOverridable);
            if (!stepDescription.beforeShowPromise) {
                stepDescription.beforeShowPromise = beforeShowPromise(services, stepDescription.elementSelector, stepDescription.maxWaitTime);
            }
            return stepDescription;
        },
    },
    {
        guideBlockName: 'copy-text-element',
        getSteps: (options, services) => {
            const $translate = services.$translate;
            const GuideUtils = services.GuideUtils;

            const text = options.text;
            const code = document.createElement('code');
            code.innerText = text;

            const copy = document.createElement('button');
            const copyToInputQueryButtonClass = 'guide-copy-to-input-query-button';
            copy.className = `btn btn-sm btn-secondary ${copyToInputQueryButtonClass}`;
            copy.innerText = $translate.instant('guide.step_plugin.core-steps.copy-text-element.copy-to-input');


            let stepHTMLElement;
            const copyToInputListener = createCopyToInputListener(GuideUtils.getElementSelector(options.elementSelector), text);

            return [
                {
                    guideBlockName: 'input-element',
                    options: {
                        ...options,
                        content: 'guide.step_plugin.core-steps.copy-text-element.content',
                        textAsHtmlCodeElement: '<div class="shepherd-code">' + code.outerHTML + copy.outerHTML + '</div>',
                        show: (_guide) => () => {
                            stepHTMLElement = _guide.currentStep.el.querySelector(`.${copyToInputQueryButtonClass}`);
                            stepHTMLElement.addEventListener('click', copyToInputListener);
                        },
                        hide: () => () => {
                            if (stepHTMLElement) {
                                stepHTMLElement.removeEventListener('click', copyToInputListener);
                            }
                        },
                    },
                },
            ];
        },
    },
    {
        guideBlockName: 'info-message',
        getStep: (options, services) => {
            const notOverridable = {
                type: 'readonly',
            };
            return angular.extend({}, BASIC_STEP, {
                initPreviousStep: services.GuideUtils.defaultInitPreviousStep,
            }, options, notOverridable);
        },
    },
    {
        guideBlockName: 'hold-and-wait-until-hidden',
        getStep: (options, services) => {
            return angular.extend({}, BASIC_STEP, {
                initPreviousStep: services.GuideUtils.defaultInitPreviousStep,
                onNextValidate: () => Promise.resolve(!services.GuideUtils.isVisible(options.elementSelectorToWait)),
                show: () => allowEvents(SCROLL_EVENTS, options.elementSelector, services),
                hide: () => allowAll(options.elementSelector, services),
            }, options);
        },
    },
    {
        guideBlockName: 'hold-and-wait-until-shown',
        getStep: (options, services) => {
            const notOverridable = {
                type: 'readonly',
            };
            return angular.extend({}, BASIC_STEP, {
                initPreviousStep: services.GuideUtils.defaultInitPreviousStep,
                onNextValidate: () => Promise.resolve(services.GuideUtils.isVisible(options.elementSelectorToWait)),
            }, options, notOverridable);
        },
    },
    {
        guideBlockName: 'wait-for-element-to-hide',
        getStep: (options, services) => {
            return angular.extend({}, BASIC_STEP, {
                initPreviousStep: services.GuideUtils.defaultInitPreviousStep,
                beforeShowPromise: (guide) => services.GuideUtils.waitUntilHidden(options.elementSelectorToHide, options.timeToWait || 2)
                    .catch(() => {
                        services.ShepherdService._abortGuide(guide);
                    }),
                show: (guide) => () => {
                    // Using a timeout because the library executes async logic
                    setTimeout(() => guide.next());
                },
            }, options);
        },
    },
    {
        guideBlockName: 'wait-for-element-to-show',
        getStep: (options, services) => {
            return angular.extend({}, BASIC_STEP, {
                initPreviousStep: services.GuideUtils.defaultInitPreviousStep,
                beforeShowPromise: (guide) => services.GuideUtils.getOrWaitFor(options.elementSelectorToShow, options.timeToWait || 2)
                    .catch(() => {
                        services.ShepherdService._abortGuide(guide);
                    }),
                show: (guide) => () => {
                    // Using a timeout because the library executes async logic
                    setTimeout(() => guide.next());
                },
            }, options);
        },
    },
    {
        guideBlockName: 'guide-end',
        getStep: (options, services) => {
            const notOverridable = {
                type: 'readonly',
                title: options.title || 'guide.step_plugin.guide-ended.title',
                content: options.content || 'guide.step_plugin.guide-ended.content',
                lastStep: true,
            };
            return angular.extend({}, BASIC_STEP, {
                initPreviousStep: services.GuideUtils.defaultInitPreviousStep,
            }, options, notOverridable);
        },
    },
]);
