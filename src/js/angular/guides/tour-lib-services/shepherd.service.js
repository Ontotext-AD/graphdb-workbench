import {GuideUtils} from "../guide-utils";
import Shepherd from "shepherd.js";

export const GUIDE_ID = 'shepherd.guide_id';
export const GUIDE_CURRENT_STEP_ID = 'shepherd.guide.current.step.id';
export const GUIDE_STEP_HISTORY = 'shepherd.guide.step.history';
export const GUIDE_PAUSE = 'shepherd.guide.pause';

const modules = ['graphdb.framework.utils.localstorageadapter'];

angular
    .module('graphdb.framework.guides.shepherd.services', modules)
    .service('ShepherdService', ShepherdService);
/**
 * Service (wrapper) of library  <a href="https://shepherdjs.dev/docs/">shepherd</a>.
 * @param $location
 * @param $translate
 * @param LocalStorageAdapter
 * @param $route
 * @constructor
 */
ShepherdService.$inject = ['$location', '$translate', 'LocalStorageAdapter', '$route', '$interpolate', 'toastr', '$compile'];

function ShepherdService($location, $translate, LocalStorageAdapter, $route, $interpolate, toastr, $compile) {
    this.guideCancelSubscription = undefined;
    this.onPause = () => {
    };
    this.onCancel = () => {
    };

    /**
     * Creates and starts a guide.
     * @param {string} guideId - a unique ID that identifies the guide.
     * @param {*} stepsDescriptions - array with core steps. Format of a step is:
     * <pre>
     *     {
     *       title: string,
     *       content: string,
     *       elementSelector: string,
     *       url: string,
     *       placement: string,
     *       type: string,
     *       maxWaitTime: number,
     *       canBePaused: boolean,
     *       onNextClick: function,
     *       onPreviousClick: function,
     *       beforeShowPromise: function
     *     }
     * </pre>
     *
     * <ul>
     *     <li>
     *         <b>title</b> - the title of the step. It will be shown as header of popover dialog;
     *     </li>
     *     <li>
     *         <b>content</b> - the content of the step. It will be shown as content of popover dialog;
     *     </li>
     *     <li>
     *         <b>elementSelector</b> - the selector of the element where popover dialog will be placed.
     *     </li>
     *     <li>
     *         <b>url</b> - the url of the page where the element is present;
     *     </li>
     *     <li>
     *         <b>placement</b> - where popover dialog to be placed. Possible values:
     *         <ul>
     *           <li>auto</li>
     *           <li>auto-start</li>
     *           <li>auto-end</li>
     *           <li>top</li>
     *           <li>top-start</li>
     *           <li>top-end</li>
     *           <li>bottom</li>
     *           <li>bottom-start</li>
     *           <li>bottom-end</li>
     *           <li>right</li>
     *           <li>right-start</li>
     *           <li>right-end</li>
     *           <li>left</li>
     *           <li>left-start</li>
     *           <li>left-end</li>
     *         </ul>
     *     </li>
     *     <li><b>type</b> - the type of step. Possible values:
     *       <ul>
     *           <li>
     *               <b>clickable-element</b> - the element is clickable like link, button... Client of workbench can click on this element.
     *           </li>
     *           <li>
     *               <b>read-only-element</b> - the element is readable. Client of workbench can only read this component.
     *           </li>
     *           <li>
     *               <b>input-element</b> - the element is some kind ot input like text, text area ... . Client of workbench can enter data in the element.
     *           </li>
     *        </ul>
     *     </li>
     *     <li>
     *         <b>maxWaitTime</b> - some element need more time to be present on the page. This is the max waiting time element to be visible
     *         on the page. Default value is 3 second.
     *     </li>
     *     <li>
     *         <b>canBePaused</b> - some element need user interaction with some other element on the page before appear. Step which uses such
     *         element can be persist when guide is paused. For example if step is "Click on sub menu "Repositories" of menu "Setup""
     *     </li>
     *     <li>
     *         <b>onNextClick</b> - a function which will be executed when nex button is clicked.
     *     </li>
     *     <li>
     *         <b>onPreviousClick</b> - a function which will be executed when previous button is clicked.
     *     </li>
     *     <li>
     *         <b>beforeShowPromise</b> - a function that returns a promise. When the promise resolves, the rest of the show code for the step will execute.
     *         Default implementation is wait <code>maxWaitTime</code> element with <code>elementSelector</code> to be visible.
     *     </li>
     *
     * </ul>
     * @param {string} startStepId - start step id.
     * @param {boolean} clearHistory - if true will clear guide step history.
     */
    this.startGuide = (guideId, stepsDescriptions, startStepId, clearHistory = true) => {
        if (clearHistory) {
            LocalStorageAdapter.remove(GUIDE_STEP_HISTORY);
        }

        if (!stepsDescriptions) {
            return;
        }
        const guide = this._createGuide(guideId);
        this._addGuideSteps(guide, stepsDescriptions);
        this._startGuide(guide, startStepId);
    };

    /**
     * Starts guide from the step where it was paused.
     * @param {string} guideId
     * @param {*} stepsDescriptions
     * @param {string} startStepId
     */
    this.resumeGuide = (guideId, stepsDescriptions, startStepId) => {
        LocalStorageAdapter.set(GUIDE_PAUSE, false);
        this.startGuide(guideId, stepsDescriptions, startStepId, false);
    };

    this.isActive = () => {
        return Shepherd.activeTour && !this.isPaused();
    };

    this.isPaused = () => {
        return LocalStorageAdapter.get(GUIDE_PAUSE) === 'true';
    };

    this.getGuideId = () => {
        return LocalStorageAdapter.get(GUIDE_ID);
    };

    this.getCurrentStepId = () => {
        return LocalStorageAdapter.get(GUIDE_CURRENT_STEP_ID);
    };

    this.subscribeToGuideCancel = (oncancel) => {
        if (angular.isFunction(oncancel)) {
            this.onCancel = oncancel;
        }
    };

    this.subscribeToGuidePause = (onPause) => {
        if (angular.isFunction(onPause)) {
            this.onPause = onPause;
        }
    };

    /**
     * Creates a guide.
     * @param {string} guideId - a unique ID that identifies the guide.
     * @return {Shepherd.Tour} - created guide.
     */
    this._createGuide = (guideId) => {
        this._subscribeToGuideCanceled();
        return new Shepherd.Tour({
            name: guideId,
            useModalOverlay: true,
            confirmCancel: true,
            confirmCancelMessage: $translate.instant('guide.confirm.cancel.message'),
            defaultStepOptions: {
                classes: 'shadow-md bg-purple-dark',
                scrollTo: true
            }
        });
    };

    /**
     * Transforms <code>stepsDescriptions</code> to Shepherd Tour steps and add it to <code>guide<code>.
     * @param {Shepherd.Tour} guide - the guide.
     * @param {*} stepsDescriptions - array with steps descriptions. The format of a description is:
     *
     * <pre>
     *     {
     *       title: string,
     *       content: string,
     *       elementSelector: string,
     *       url: string,
     *       placement: string,
     *       type: string,
     *       maxWaitTime: number,
     *       canBePaused: boolean,
     *       onNextClick: function,
     *       onNextValidate: function,
     *       onPreviousClick: function,
     *       beforeShowPromise: function
     *     }
     * </pre>
     *
     * <ul>
     *     <li>
     *         <b>title</b> - the title of the step. It will be shown as header of popover dialog;
     *     </li>
     *     <li>
     *         <b>content</b> - the content of the step. It will be shown as content of popover dialog;
     *     </li>
     *     <li>
     *         <b>elementSelector</b> - the selector of the element where popover dialog will be placed.
     *     </li>
     *     <li>
     *         <b>url</b> - the url of the page where the element is present;
     *     </li>
     *     <li>
     *         <b>placement</b> - where popover dialog to be placed. Possible values:
     *         <ul>
     *           <li>auto</li>
     *           <li>auto-start</li>
     *           <li>auto-end</li>
     *           <li>top</li>
     *           <li>top-start</li>
     *           <li>top-end</li>
     *           <li>bottom</li>
     *           <li>bottom-start</li>
     *           <li>bottom-end</li>
     *           <li>right</li>
     *           <li>right-start</li>
     *           <li>right-end</li>
     *           <li>left</li>
     *           <li>left-start</li>
     *           <li>left-end</li>
     *         </ul>
     *     </li>
     *     <li><b>type</b> - the type of step. Possible values:
     *       <ul>
     *           <li>
     *               <b>clickable-element</b> - the element is clickable like link, button... Client of workbench can click on this element.
     *           </li>
     *           <li>
     *               <b>read-only-element</b> - the element is readable. Client of workbench can only read this component.
     *           </li>
     *           <li>
     *               <b>input-element</b> - the element is some kind ot input like text, text area ... . Client of workbench can enter data in the element.
     *           </li>
     *        </ul>
     *     </li>
     *     <li>
     *         <b>maxWaitTime</b> - some element need more time to be present on the page. This is the max waiting time element to be visible
     *         on the page. Default value is 3 second.
     *     </li>
     *     <li>
     *         <b>canBePaused</b> - some element need user interaction with some other element on the page before appear. Step which uses such
     *         element can be persisted when guide is paused. For example if step is "Click on sub menu "Repositories" of menu "Setup""
     *     </li>
     *     <li>
     *         <b>onNextClick</b> - function which will be executed when next button is clicked.
     *     </li>
     *     <li>
     *         <b>onNextValidate</b> - function that determines whether pressing the next button advances the step
     *     </li>
     *      <li>
     *         <b>onPreviousClick</b> - function which will be executed when previous button is clicked.
     *     </li>
     *     <li>
     *         <b>beforeShowPromise</b> - a function that returns a promise. When the promise resolves, the rest of the show code for the step will execute.
     *         Default implementation is wait <code>maxWaitTime</code> element with <code>elementSelector</code> to be visible.
     *     </li>
     * </ul>
     */
    this._addGuideSteps = (guide, stepsDescriptions) => {
        // Check if stepsDescriptions is not empty. This mean there is first step. The first step has not previous one.
        if (stepsDescriptions.length > 0) {
            guide.addStep(this._getFirstStep(guide, stepsDescriptions));
        }

        // Check if stepsDescriptions has more than 2 elements. This mean there are middle steps. The middle steps have previous and next steps.
        if (stepsDescriptions.length > 2) {
            // Process all steps without first and last one.
            for (let index = 1; index < stepsDescriptions.length - 1; index++) {
                guide.addStep(this._getMiddleStep(guide, stepsDescriptions, index));
            }
        }

        // Check if stepsDescriptions more than 1 element, this mean that we have process last step. The last step has no next step.
        if (stepsDescriptions.length > 1) {
            guide.addStep(this._getLastStep(guide, stepsDescriptions[stepsDescriptions.length - 1]));
        }
    };

    /**
     * Starts <code>guide</code> from <code>startStepId</code>
     * @param {Shepherd.Tour} guide - the guid to be started.
     * @param {string} startStepId - star step id. If it is not present the <code>guide</code> will be started from beginning.
     * @private
     */
    this._startGuide = (guide, startStepId) => {
        LocalStorageAdapter.remove(GUIDE_PAUSE);

        let stepIndex = guide.steps.findIndex(((value) => value.options.id === startStepId));
        if (stepIndex < 0) {
            stepIndex = 0;
        }
        const step = guide.steps[stepIndex];
        const url = step.options.url;
        if (url && url !== $location.path()) {
            $location.url(url);
            $route.reload();
        }

        if (step.options.attachTo) {
            GuideUtils.waitFor(step.options.attachTo.element, step.options.maxWaitTime)
                .then(() => guide.show(stepIndex))
                .catch((error) => {
                    console.log(error);
                    toastr.error($translate.instant('guide.start.unexpected.error.message'));
                });
        } else {
            guide.show(stepIndex);
        }
    };

    this._subscribeToGuideCanceled = () => {
        if (!this.guideCancelSubscription) {
            this.guideCancelSubscription = Shepherd.on('cancel', () => {
                this._clearLocaleStorage();
                const currentStep = Shepherd.activeTour.getCurrentStep();
                if (currentStep && angular.isFunction(currentStep.hide)) {
                    // Some steps have state and when shepherd library hides them the "hide()" function is called. This function cleaned the state
                    // of the steps. When we are on step which has state and click on cancel button the library don't call this function.
                    // So we call it manually. For example see "select-repository" plugin it has listener which must be removed when step is hided.
                    currentStep.hide();
                }
                if (this.onCancel) {
                    this.onCancel();
                }
            });
        }
    };

    /**
     * Creates first step from <code>stepsDescriptions</code>.
     * @param {Shepherd.Tour} guide - the guide.
     * @param {*} stepsDescriptions - array with descriptions of steps.
     * @return {Shepherd.Step} the first step.
     * @private
     */
    this._getFirstStep = function (guide, stepsDescriptions) {
        const nextStepDescription = stepsDescriptions.length > 1 ? stepsDescriptions[1] : undefined;
        return this._toGuideStep(guide, undefined, stepsDescriptions[0], nextStepDescription);
    };

    /**
     * Creates middle step from <code>stepsDescriptions</code>.
     * @param {Shepherd.Tour} guide - the guide.
     * @param {*} stepsDescriptions - array with descriptions of steps.
     * @param {number} indexOfProcessedStep - index of step which have to be created.
     * @return {Shepherd.Step} the created step.
     * @private
     */
    this._getMiddleStep = (guide, stepsDescriptions, indexOfProcessedStep) => {
        let currentStep = stepsDescriptions[indexOfProcessedStep];
        if (currentStep.lastStep) {
            return this._getLastStep(guide, currentStep);
        }
        return this._toGuideStep(guide, stepsDescriptions[indexOfProcessedStep - 1], currentStep, stepsDescriptions[indexOfProcessedStep + 1]);
    };

    /**
     * Creates last step from <code>stepsDescriptions</code>.
     * @param {Shepherd.Tour} guide - the guide.
     * @param {*} lastStepDescription - description of last step.
     * @return {Shepherd.Step} the last step.
     * @private
     */
    this._getLastStep = (guide, lastStepDescription) => {
        const step = this._toGuideStep(guide, null, lastStepDescription);
        step.buttons.push(this._getBackToGuidesButton(guide));
        step.buttons.push(this._getCancelButton(guide));
        return step;
    };

    this._getBackToGuidesButton = (guide) => {
        return this._getButton($translate.instant('back.to.guides.btn'), () => this._backToGuidesButton(guide), true);
    };


    this._getCancelButton = (guide) => {
        return this._getButton($translate.instant('common.close'), () => this._cancelGuide(guide, false), true);
    };

    this._backToGuidesButton = (guide) => {
        $location.path("guides");
        this._cancelGuide(guide, false);
    };

    /**
     * Cancel the guide.
     * @param {Shepherd.Tour} guide
     * @param {boolean} confirmCancel
     * @private
     */
    this._cancelGuide = (guide, confirmCancel = true) => {
        guide.options.confirmCancel = confirmCancel;
        guide.cancel();

        if (this.onCancel()) {
            this.onCancel();
        }
    };

    /**
     * Converts <code>currentStepDescription</code> to Shepherd Tour step.
     * @param {Shepherd.Tour} guide - the guide.
     * @param {*} previousStepDescription - the previous step description.
     * @param {*} currentStepDescription - processed step description.
     * @param {*} nextStepDescription - the next step description.
     * @return {Shepherd.Step} created step.
     * @private
     */
    this._toGuideStep = (guide, previousStepDescription, currentStepDescription, nextStepDescription) => {
        const step = this._toBaseGuideStep(guide, $translate, currentStepDescription, () => this._updateLocalStorage());
        const buttons = [];
        if (currentStepDescription.skipPoint) {
            buttons.push(this._getSkipButton(guide));
        }

        if (!this._isDisablePreviousFlow(currentStepDescription) && previousStepDescription) {
            buttons.push(this._getPreviousButton(guide));
        }
        if (nextStepDescription) {
            buttons.push(this._getNextButton(guide, currentStepDescription, nextStepDescription));
        }

        step.buttons = buttons;
        return step;
    };

    this._getPauseButton = (guide) => {
        return this._getButton($translate.instant('pause.btn'), () => this._pauseGuide(guide), true);
    };

    this._getSkipButton = (guide) => {
        return this._getButton($translate.instant('skip.btn'), () => this._skipSteps(guide), true);
    };

    this._skipSteps = (guide) => {
        const currentStep = guide.getCurrentStep();
        const currentStepIndex = guide.steps.findIndex((step) => currentStep.id === step.id);
        this._startGuide(guide, this._getNextSkipPointId(guide.steps, currentStepIndex));
    };

    this._getNextSkipPointId = (steps, currentStepIndex) => {
        for (let index = currentStepIndex + 1; index < steps.length; index++) {
            const step = steps.at(index);
            if (step.options.skipPoint) {
                return step.id;
            }
        }
        // if there isn't next step with skipPoint set to true, then return last step id.
        return steps.at(steps.length - 1).id;
    };

    /**
     * Checks if the previous flow is disabled for the <code>stepDescription</code>.
     * @param {*} stepDescription - The step to be checked.
     * @return {boolean} - Returns true if the previous flow is disabled, otherwise false.
     * @private
     */
    this._isDisablePreviousFlow = (stepDescription) => {
        return angular.isDefined(stepDescription.disablePreviousFlow) ? stepDescription.disablePreviousFlow : false;
    }

    /**
     * Pauses current ran guide.
     * @param {Shepherd.Tour} guide
     * @private
     */
    this._pauseGuide = (guide) => {
        guide.hide();
        const step = this._getStepWhichCanBePaused(guide.steps, guide.getCurrentStep().id);
        this._saveStep(step);
        LocalStorageAdapter.set(GUIDE_PAUSE, true);

        // Remove all step from history which can be paused and are after the step on which guide will be paused.
        let stepHistoryCleaned = false;
        while (!stepHistoryCleaned) {
            const stepHistory = this._getHistory();
            if (stepHistory && stepHistory.length > 0 && stepHistory.at(stepHistory.length - 1) !== step.options.id) {
                this._removeLastStepFromHistory();
                continue;
            }
            stepHistoryCleaned = true;
        }

        if (this.onPause()) {
            this.onPause();
        }
    };

    this._getStepWhichCanBePaused = (steps, stepId) => {
        const index = steps.findIndex((step) => step.id === stepId);
        const step = steps[index];
        if (step.options.canBePaused) {
            return step;
        }
        if (index > 0) {
            return this._getStepWhichCanBePaused(steps, steps[index - 1].id);
        }
        return undefined;
    };

    /**
     * Creates a previous button.
     * @param {Shepherd.Tour} guide - the guide.
     * @return {*} created button.
     * @private
     */
    this._getPreviousButton = (guide) => {
        const text = $translate.instant('previous.btn');
        const action = this._getPreviousButtonAction(guide);
        return this._getButton(text, action);
    };

    this._getPreviousButtonAction = (guide) => {
        return () => {
            const nextStepId = this._getPreviousStepIdFromHistory();
            let nextStep;

            if (nextStepId === -1) {
                nextStep = guide.steps.at(0);
            } else {
                nextStep = guide.steps.find((step) => step.options.id === nextStepId);
            }

            const currentStep = guide.getCurrentStep();

            currentStep.hide();

            currentStep.options.initPreviousStep({GuideUtils, ShepherdService: this}, currentStep.options.id)
                .then(() => {
                    if (angular.isFunction(currentStep.options.onPreviousClick)) {
                        currentStep.options.onPreviousClick(guide)
                            .then((stopStepNavigation) => {
                                if (angular.isUndefined(stopStepNavigation) || stopStepNavigation === null || !stopStepNavigation) {
                                    currentStep.hide();
                                    guide.show(nextStep.id);
                                }
                            })
                            .catch((error) => {
                                console.log(error);
                                toastr.error($translate.instant('guide.unexpected.error.message'));
                                this._cancelGuide(guide, false);
                            });
                        return;
                    } else if (nextStep.options.forceReload || nextStep.options.url && nextStep.options.url !== currentStep.options.url) {
                        $location.path(nextStep.options.url);
                    }
                    currentStep.hide();
                    guide.show(nextStep.id);
                })
                .catch((error) => {
                    console.log(error);
                    toastr.error($translate.instant('guide.unexpected.error.message'));
                    this._cancelGuide(guide, false);
                });
        };
    };

    /**
     * Creates a next button.
     * @param {Shepherd.Tour} guide - the guide.
     * @param {*} currentStepDescription - processed step description.
     * @param {*} nextStepDescription - next step description.
     * @return {*} created step.
     * @private
     */
    this._getNextButton = (guide, currentStepDescription, nextStepDescription) => {
        const text = $translate.instant('next.btn');
        const action = _getNextButtonAction(guide, currentStepDescription, nextStepDescription);
        return this._getButton(text, action);
    };

    const _getNextButtonAction = (guide, currentStepDescription, nextStepDescription) => {
        return () => {
            currentStepDescription.onNextValidate(currentStepDescription)
                .then((valid) => {
                    if (valid) {
                        if (angular.isFunction(currentStepDescription.onNextClick)) {
                            const onNextResult = currentStepDescription.onNextClick(guide, currentStepDescription);
                            if (onNextResult instanceof Promise) {
                                onNextResult.catch((error) => {
                                    toastr.error($translate.instant('guide.unexpected.error.message'));
                                    this._cancelGuide(guide, false);
                                });
                            }
                        } else {
                            if (nextStepDescription.forceReload || nextStepDescription.url && nextStepDescription.url !== currentStepDescription.url) {
                                $location.path(nextStepDescription.url);
                            }
                            guide.next();
                        }
                    }
                });
        };
    };

    /**
     * Updates guide related values into local store.
     * @private
     */
    this._updateLocalStorage = () => {
        const activeTour = Shepherd.activeTour;
        if (!activeTour) {
            return;
        }
        const currentStep = activeTour.getCurrentStep();

        if (currentStep.options.skipFromHistory) {
            console.log('Current step: ', currentStep.options.skipFromHistory);
            return;
        }

        const currentStepIndex = activeTour.steps.findIndex((step) => step.id === currentStep.id);

        const lastSavedStepId = this.getCurrentStepId();
        const lastSavedStepIndex = activeTour.steps.findIndex((step) => step.id === lastSavedStepId);

        // If current step index is greater than last saved step index this means that next button was clicked.
        if (currentStepIndex > lastSavedStepIndex) {
            this._addStepToHistory(currentStep);
        } else if (lastSavedStepIndex > currentStepIndex) {
            this._removeLastStepFromHistory();
        }

        this._saveStep(currentStep);
    };

    this._saveStep = (step) => {
        if (step) {
            LocalStorageAdapter.set(GUIDE_ID, step.tour.options.name);
            LocalStorageAdapter.set(GUIDE_CURRENT_STEP_ID, step.options.id);
        }
    };

    this._addStepToHistory = (step) => {
        const history = this._getHistory();
        history.push(step.options.id);
        LocalStorageAdapter.set(GUIDE_STEP_HISTORY, history);
    };

    this._getHistory = () => {
        const stepHistory = LocalStorageAdapter.get(GUIDE_STEP_HISTORY);
        if (stepHistory) {
            return stepHistory;
        }
        return [];
    };

    this._removeLastStepFromHistory = () => {
        const history = this._getHistory();
        history.splice(history.length - 1, 1);
        LocalStorageAdapter.set(GUIDE_STEP_HISTORY, history);
    };

    this._getPreviousStepIdFromHistory = (stepId) => {
        const history = this._getHistory() || [];
        if (stepId) {
            const index = history.findIndex((historyStepId) => historyStepId === stepId);
            if (index > 0) {
                return history.at(index - 1);
            }
        } else {
            if (history.length > 1) {
                return history.at(history.length - 2);
            }
        }
        return -1;
    };

    this.getPreviousStepFromHistory = (stepId) => {
        const previousStepId = this._getPreviousStepIdFromHistory(stepId);
        return Shepherd.activeTour.steps.find((step) => step.id === previousStepId);
    };

    /**
     * Remove all related data to a guid from local store.
     * @private
     */
    this._clearLocaleStorage = () => {
        LocalStorageAdapter.remove(GUIDE_ID);
        LocalStorageAdapter.remove(GUIDE_PAUSE);
        LocalStorageAdapter.remove(GUIDE_CURRENT_STEP_ID);
        LocalStorageAdapter.remove(GUIDE_STEP_HISTORY);
    };

    /**
     *
     * Creates a Shepherd Tour step and fill it with base properties from <code>stepDescription</code>.
     * @param {Shepherd.Tour} guide
     * @param {*} $translate
     * @param {*} stepDescription
     * @param {function} onShow - function which will be executed when popup dialog shown.
     * @return {*}
     * @private
     */
    this._toBaseGuideStep = (guide, $translate, stepDescription, onShow) => {
        let attachTo;
        if (stepDescription.elementSelector) {
            attachTo = {
                element: stepDescription.elementSelector,
                on: stepDescription.placement
            };
        }

        const title = GuideUtils.unescapeHtml(GuideUtils.translateLocalMessage($translate, $interpolate, stepDescription.title, stepDescription));

        // Adds " - n/N" to titles if the step is part of a multistep process,
        // where n is the current step number and N is the total number of steps
        let extraTitle = '';
        if (stepDescription.stepsTotalN > 1) {
            const progress = document.createElement('span');
            progress.setAttribute('gdb-tooltip', $translate.instant('guide.block.progress.tooltip', {action: title}));
            progress.setAttribute('tooltip-placement', 'bottom');
            progress.innerText = $translate.instant('guide.block.progress', {
                n: stepDescription.stepN + 1,
                nn: stepDescription.stepsTotalN
            });
            extraTitle = '&nbsp;&mdash;&nbsp;' + progress.outerHTML;
        }

        const text = () => {
            const content = this._toParagraph(GuideUtils.translateLocalMessage($translate, $interpolate, stepDescription.content, stepDescription));

            let extraContent = '';
            if (stepDescription.extraContent) {
                extraContent = GuideUtils.translateLocalMessage($translate, $interpolate, stepDescription.extraContent, stepDescription);
                extraContent = this._toParagraph(extraContent, stepDescription.extraContentClass);
            }
            return content + extraContent;
        };

        const clickable = stepDescription.type !== 'readonly';

        const extraPadding = stepDescription.extraPadding ? stepDescription.extraPadding : 0;

        const step = {
            id: stepDescription.id,
            title: title + extraTitle,
            text,
            url: stepDescription.url,
            maxWaitTime: stepDescription.maxWaitTime,
            cancelIcon: {enabled: true},
            attachTo,
            modalOverlayOpeningPadding: extraPadding,
            modalOverlayOpeningRadius: 0,
            canBePaused: stepDescription.canBePaused,
            advanceOn: stepDescription.advanceOn,
            showOn: stepDescription.showOn,
            scrollToHandler: stepDescription.scrollToHandler,
            classes: 'guide-dialog ' + stepDescription.class,
            beforeShowPromise: this._getBeforeShowPromise(guide, stepDescription),
            canClickTarget: clickable,
            keyboardNavigation: false,
            skipPoint: stepDescription.skipPoint,
            skipFromHistory: stepDescription.skipFromHistory,
            onPreviousClick: stepDescription.onPreviousClick,
            initPreviousStep: stepDescription.initPreviousStep,
            forceReload: stepDescription.forceReload,
            when: {
                show: this._getShowFunction(guide, stepDescription, onShow)
            }
        };

        if (angular.isFunction(stepDescription.hide)) {
            step.when.hide = stepDescription.hide(guide, stepDescription);
        }

        return step;
    };

    this._getBeforeShowPromise = (guide, stepDescription) => {
        if (angular.isFunction(stepDescription.beforeShowPromise)) {
            return () => {
                return stepDescription.beforeShowPromise(guide, stepDescription);
            };
        }
    }

    this._getShowFunction = (guide, stepDescription, onShow) => {
        if (angular.isFunction(stepDescription.show)) {
            return () => {
                stepDescription.show(guide, stepDescription)();
                onShow();
                this._whenStepShow(stepDescription);
            };
        }

        return () => {
            onShow();
            this._whenStepShow(stepDescription);
        };
    };

    this._whenStepShow = (stepDescription) => {
        const currentStep = Shepherd.activeTour.getCurrentStep();
        const currentStepElement = currentStep.getElement();

        this._addTotalProgress(currentStep, currentStepElement);

        this._addTypeIcon(currentStepElement, stepDescription);

        // We have some Angular bits on the elements and this is needed to make them work
        const scope = angular.element(currentStepElement).scope();
        if (angular.isFunction(stepDescription.onScope)) {
            // Step definitions may want to add functions to the scope
            stepDescription.onScope(scope);
        }
        setTimeout(() => scope.$apply(() => $compile(currentStepElement)(scope)));
    };

    this._toParagraph = (text, textClass) => {
        if (text) {
            const p = document.createElement('p');
            if (textClass) {
                p.className = textClass;
            }
            p.innerHTML = text;
            return p.outerHTML;
        } else {
            return '';
        }
    };

    this._addTotalProgress = (currentStep, currentStepElement) => {
        const steps = Shepherd.activeTour.steps;
        const content = currentStepElement.querySelector('.shepherd-content');
        const progress = document.createElement('div');
        progress.className = 'shepherd-progress';
        const progressText = document.createElement('span');
        progressText.className = 'text-muted';
        progressText.innerText = $translate.instant('guide.total.progress', {n: steps.indexOf(currentStep) + 1, nn: steps.length});
        progressText.setAttribute('gdb-tooltip', $translate.instant('guide.total.progress.tooltip'));
        progressText.setAttribute('tooltip-placement', 'left');
        progress.appendChild(progressText);

        content.appendChild(progress);
    };

    this._addTypeIcon = (currentStepElement, stepDescription) => {
        let iconName;
        let iconTooltip;
        switch (stepDescription.type) {
            case 'clickable':
                iconName = 'focus';
                iconTooltip = 'mouse';
                break;
            case 'input':
                iconName = 'edit';
                iconTooltip = 'input';
                break;
            default:
                // handles 'readonly' and future types gracefully
                iconName = 'info';
                iconTooltip = 'info';
                break;
        }

        const typeIcon = document.createElement('span');
        typeIcon.className = 'shepherd-step-type icon-' + iconName + ' icon-1-25x';
        typeIcon.setAttribute('gdb-tooltip', $translate.instant('guide.step-type.' + iconTooltip));
        typeIcon.setAttribute('tooltip-placement', 'bottom-right');

        angular.element(currentStepElement.querySelector('.shepherd-header')).prepend(typeIcon);
    };

    /**
     * Created a base button.
     * @param {string} text - the text of button.
     * @param {function} action - to be executed when button is clicked.
     * @param {boolean} isSecondary - if true will be styled as secondary button.
     * @return {*} created button.
     */
    this._getButton = (text, action, isSecondary) => {
        const button = {
            text: text,
            classes: isSecondary ? 'btn btn-secondary' : 'btn btn-primary'
        };

        button.action = ($event) => {
            $event.stopPropagation();
            action();
        };

        return button;
    };
}
