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
     * @param guideId - a unique ID that identifies the guide.
     * @param stepsDescriptions - array with core steps. Format of a step is:
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
     * @param startStepId - start step id.
     * @param clearHistory - if true will clear guide step history.
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
    }

    /**
     * Starts guide from the step where it was paused.
     */
    this.resumeGuide = (guideId, stepsDescriptions, startStepId) => {
        LocalStorageAdapter.set(GUIDE_PAUSE, false);
        this.startGuide(guideId, stepsDescriptions, startStepId, false);
    }

    this.isActive = () => {
        return Shepherd.activeTour && !this.isPaused();
    };

    this.isPaused = () => {
        return LocalStorageAdapter.get(GUIDE_PAUSE) === 'true';
    };

    this.getGuideId = () => {
        return LocalStorageAdapter.get(GUIDE_ID);
    }

    this.getCurrentStepId = () => {
        return LocalStorageAdapter.get(GUIDE_CURRENT_STEP_ID);
    }

    this.subscribeToGuideCancel = (oncancel) => {
        if (angular.isFunction(oncancel)) {
            this.onCancel = oncancel;
        }
    }

    this.subscribeToGuidePause = (onPause) => {
        if (angular.isFunction(onPause)) {
            this.onPause = onPause;
        }
    }

    /**
     * Creates a guide.
     * @param guideId - a unique ID that identifies the guide.
     * @returns {Shepherd.Tour} - created guide.
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
    }

    /**
     * Transforms <code>stepsDescriptions</code> to Shepherd Tour steps and add it to <code>guide<code>.
     * @param guide - the guide.
     * @param stepsDescriptions - array with steps descriptions. The format of a description is:
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
     *         element can be persist when guide is paused. For example if step is "Click on sub menu "Repositories" of menu "Setup""
     *     </li>
     *     <li>
     *         <b>onNextClick</b> - function which will be executed when nex button is clicked.
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

        // Chek if stepsDescriptions has more than 2 elements. This mean there are middle steps. The middle steps have previous and next steps.
        if (stepsDescriptions.length > 2) {
            // Process all steps without first and last one.
            for (let index = 1; index < stepsDescriptions.length - 1; index++) {
                guide.addStep(this._getMiddleStep(guide, stepsDescriptions, index));
            }
        }

        // Check if stepsDescriptions more than 1 element, this mean that we have process last step. The last step has no next step.
        if (stepsDescriptions.length > 1) {
            guide.addStep(this._getLastStep(guide, stepsDescriptions));
        }
    }

    /**
     * Starts <code>guide</code> from <code>startStepId</code>
     * @param guide - the guid to be started.
     * @param startStepId - star step id. If it is not present the <code>guide</code> will be started from beginning.
     * @private
     */
    this._startGuide = (guide, startStepId) => {
        LocalStorageAdapter.remove(GUIDE_PAUSE);

        let stepIndex = guide.steps.findIndex((value => value.options.id === startStepId));
        if (stepIndex < 0) {
            stepIndex = 0;
        }
        const step = guide.steps[stepIndex];
        const url = step.options.url;
        if (!!url) {
            $location.url(url);
            $route.reload();
        }

        if (!!step.options.attachTo) {
            GuideUtils.waitFor(step.options.attachTo.element, step.options.maxWaitTime)
                .then(() => guide.show(stepIndex))
                .catch(error => {
                    toastr.error($translate.instant('guide.start.unexpected.error.message'));
                });
        } else {
            guide.show(stepIndex);
        }
    }

    this._subscribeToGuideCanceled = () => {
        if (!this.guideCancelSubscription) {
            this.guideCancelSubscription = Shepherd.on('cancel', () => {
                this._clearLocaleStorage();
                if (this.onCancel) {
                    this.onCancel();
                }
            });
        }
    }

    /**
     * Creates first step from <code>stepsDescriptions</code>.
     * @param guide - the guide.
     * @param stepsDescriptions - array with descriptions of steps.
     * @returns the first step.
     * @private
     */
    this._getFirstStep = function (guide, stepsDescriptions) {
        const nextStepDescription = stepsDescriptions.length > 1 ? stepsDescriptions[1] : undefined;
        return this._toGuideStep(guide, undefined, stepsDescriptions[0], nextStepDescription);
    }

    /**
     * Creates middle step from <code>stepsDescriptions</code>.
     * @param guide - the guide.
     * @param stepsDescriptions - array with descriptions of steps.
     * @param indexOfProcessedStep - index of step which have to be created.
     * @returns the created step.
     * @private
     */
    this._getMiddleStep = (guide, stepsDescriptions, indexOfProcessedStep) => {
        return this._toGuideStep(guide, stepsDescriptions[indexOfProcessedStep - 1], stepsDescriptions[indexOfProcessedStep], stepsDescriptions[indexOfProcessedStep + 1]);
    }

    /**
     * Creates last step from <code>stepsDescriptions</code>.
     * @param guide - the guide.
     * @param stepsDescriptions - array with descriptions of steps.
     * @returns the last step.
     * @private
     */
    this._getLastStep = (guide, stepsDescriptions) => {
        return this._toGuideStep(guide, stepsDescriptions[stepsDescriptions.length - 2], stepsDescriptions[stepsDescriptions.length - 1]);
    }

    /**
     * Converts <code>currentStepDescription</code> to Shepherd Tour step.
     * @param guide - the guide.
     * @param previousStepDescription - the previous step description.
     * @param currentStepDescription - processed step description.
     * @param nextStepDescription - the next step description.
     * @returns created step.
     * @private
     */
    this._toGuideStep = (guide, previousStepDescription, currentStepDescription, nextStepDescription) => {
        const step = this._toBaseGuideStep($translate, currentStepDescription, () => this._updateLocalStorage());
        const buttons = [];
        if (previousStepDescription) {
            buttons.push(this._getPreviousButton(guide));
        }
        if (!!nextStepDescription) {
            buttons.push(this._getNextButton(guide, currentStepDescription, nextStepDescription));
        }
        buttons.push(this._getPauseButton(guide));

        if (currentStepDescription.skipPoint) {
            buttons.push(this._getSkipButton(guide, previousStepDescription, currentStepDescription, nextStepDescription))
        }
        step.buttons = buttons;
        return step;
    }

    this._getPauseButton = (guide) => {
        return this._getButton($translate.instant('pause.btn'), () => this._pauseGuide(guide), true);
    }

    this._getSkipButton = (guide, previousStepDescription, currentStepDescription, nextStepDescription) => {
        return this._getButton($translate.instant('skip.btn'), () => this._skipSteps(guide), true);
    }

    this._skipSteps = (guide) => {
        const currentStep = guide.getCurrentStep();
        const currentStepIndex = guide.steps.findIndex(step => currentStep.id === step.id);
        this._startGuide(guide, this._getNextSkipPointId(guide.steps, currentStepIndex));
    }

    this._getNextSkipPointId = (steps, currentStepIndex) => {
        for (let index = currentStepIndex + 1; index < steps.length; index++) {
            const step = steps.at(index);
            if (step.options.skipPoint) {
                return step.id;
            }
        }
        // if there isn't next step with skipPoint set to true, then return last step id.
        return steps.at(steps.length - 1).id;
    }

    /**
     * Pauses current ran guide.
     */
    this._pauseGuide = (guide) => {
        guide.hide();
        this._saveStep(this._getStepWhichCanBePaused(guide.steps, guide.getCurrentStep().id));
        LocalStorageAdapter.set(GUIDE_PAUSE, true);
        if (this.onPause()) {
            this.onPause();
        }
    }

    this._getStepWhichCanBePaused = (steps, stepId) => {
        const index = steps.findIndex(step => step.id === stepId);
        const step = steps[index];
        if (step.options.canBePaused) {
            return step;
        }
        if (index > 0) {
            return this._getStepWhichCanBePaused(steps, steps[index - 1].id);
        }
        return undefined;
    }

    /**
     * Creates a previous button.
     * @param guide - the guide.
     * @param previousStepDescription - previous step description.
     * @param currentStepDescription - processed step description.
     * @returns created step.
     * @private
     */
    this._getPreviousButton = (guide, previousStepDescription, currentStepDescription) => {
        const text = $translate.instant('previous.btn');
        const action = this._getPreviousButtonAction(guide);
        return this._getButton(text, action);
    }

    this._getPreviousButtonAction = (guide) => {
        return () => {
            const nextStepId = this._getPreviousStepIdFromHistory();
            let nextStep;

            if (nextStepId === -1) {
                nextStep = guide.steps.at(0);
            } else {
                nextStep = guide.steps.find(step => step.options.id === nextStepId);
            }

            const currentStep = guide.getCurrentStep();

            if (angular.isFunction(currentStep.options.onPreviousClick)) {
                const onPreviousResult = currentStep.options.onPreviousClick(guide);
                if (onPreviousResult instanceof Promise) {
                    onPreviousResult.catch(error => {
                        toastr.error($translate.instant('guide.unexpected.error.message'));
                        guide.hide();
                    });
                }
            } else if (nextStep.options.forceReload || nextStep.options.url && nextStep.options.url !== currentStep.options.url) {
                $location.path(nextStep.options.url);
            }

            currentStep.hide();
            guide.show(nextStep.id);
        }
    }

    /**
     * Creates a next button.
     * @param guide - the guide.
     * @param currentStepDescription - processed step description.
     * @param nextStepDescription - next step description.
     * @returns created step.
     * @private
     */
    this._getNextButton = (guide, currentStepDescription, nextStepDescription) => {
        const text = $translate.instant('next.btn');
        const action = _getNextButtonAction(guide, currentStepDescription, nextStepDescription);
        return this._getButton(text, action);
    }

    const _getNextButtonAction = (guide, currentStepDescription, nextStepDescription) => {
        return () => {
            let valid = true;
            if (angular.isFunction(currentStepDescription.onNextValidate)) {
                valid = currentStepDescription.onNextValidate(currentStepDescription);
            }
            if (valid) {
                if (angular.isFunction(currentStepDescription.onNextClick)) {
                    const onNextResult = currentStepDescription.onNextClick(guide, currentStepDescription);
                    if (onNextResult instanceof Promise) {
                        onNextResult.catch(error => {
                            toastr.error($translate.instant('guide.unexpected.error.message'));
                            guide.hide();
                        });
                    }
                } else {
                    if (nextStepDescription.forceReload || nextStepDescription.url && nextStepDescription.url !== currentStepDescription.url) {
                        $location.path(nextStepDescription.url);
                    }
                    guide.next();
                }
            }
        }
    }

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
        const currentStepIndex = activeTour.steps.findIndex(step => step.id === currentStep.id);

        const lastSavedStepId = this.getCurrentStepId();
        const lastSavedStepIndex = activeTour.steps.findIndex(step => step.id === lastSavedStepId);

        // If current step index is greatest than last saved step index this means that next button was clicked.
        if (currentStepIndex > lastSavedStepIndex) {
            this._addStepToHistory(currentStep);
        } else if (lastSavedStepIndex > currentStepIndex) {
            this._removeLastStepFromHistory();
        }

        this._saveStep(currentStep);
    }

    this._saveStep = (step) => {
        if (!!step) {
            LocalStorageAdapter.set(GUIDE_ID, step.tour.options.name);
            LocalStorageAdapter.set(GUIDE_CURRENT_STEP_ID, step.options.id);
        }
    }

    this._addStepToHistory = (step) => {
        const history = this._getHistory();
        history.push(step.options.id);
        LocalStorageAdapter.set(GUIDE_STEP_HISTORY, history);
    }

    this._getHistory = () => {
        let stepHistory = LocalStorageAdapter.get(GUIDE_STEP_HISTORY);
        if (stepHistory) {
            return stepHistory;
        }
        return [];
    }

    this._removeLastStepFromHistory = () => {
        const history = this._getHistory();
        history.splice(history.length - 1, 1);
        LocalStorageAdapter.set(GUIDE_STEP_HISTORY, history);
    }

    this._getPreviousStepIdFromHistory = () => {
        const history = this._getHistory();
        if (history.length > 1) {
            return history.at(history.length - 2);
        }
        return -1;
    }

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
     * Creates a Shepherd Tour step and fill it with base properties from <code>stepDescription</code>.
     * @param $translate
     * @param stepDescription - step description. The format of a description is:
     * @param onShow - function which will be executed when popup dialog shown.
     * @returns created step.
     * @private
     */
    this._toBaseGuideStep = ($translate, stepDescription, onShow) => {
        let attachTo;
        if (!!stepDescription.elementSelector) {
            attachTo = {
                element: stepDescription.elementSelector,
                on: stepDescription.placement
            }
        }

        const title = GuideUtils.unescapeHtml(GuideUtils.translateLocalMessage($translate, stepDescription.title, stepDescription));

        // Adds " - n/N" to titles if the step is part of a multistep process,
        // where n is the current step number and N is the total number of steps
        let extraTitle = '';
        if (stepDescription.stepsTotalN > 1) {
            const progress = document.createElement('span');
            progress.setAttribute('tooltip', $translate.instant('guide.block.progress.tooltip', {action: title}));
            progress.setAttribute('tooltip-placement', 'bottom');
            progress.setAttribute('tooltip-trigger', 'mouseenter');
            progress.setAttribute('tooltip-append-to-body', 'false');
            progress.innerText = $translate.instant('guide.block.progress', {n: stepDescription.stepN + 1, nn: stepDescription.stepsTotalN});
            extraTitle = '&nbsp;&mdash;&nbsp;' + progress.outerHTML;
        }

        const content = this._toParagraph(GuideUtils.unescapeHtml(GuideUtils.translateLocalMessage($translate, stepDescription.content, stepDescription)));

        let extraContent = '';
        if (stepDescription.extraContent) {
            extraContent = GuideUtils.translateLocalMessage($translate, stepDescription.extraContent, stepDescription);
            extraContent = $interpolate(extraContent)(stepDescription);
            extraContent = this._toParagraph(extraContent, stepDescription.extraContentClass);
        }

        const clickable = stepDescription.type !== 'readonly';

        const extraPadding = stepDescription.extraPadding ? stepDescription.extraPadding : 0;

        return {
            id: stepDescription.id,
            title: title + extraTitle,
            text: content + extraContent,
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
            classes: 'guide-dialog',
            beforeShowPromise: stepDescription.beforeShowPromise,
            canClickTarget: clickable,
            keyboardNavigation: false,
            skipPoint: stepDescription.skipPoint,
            onPreviousClick: stepDescription.onPreviousClick,
            when: {
                show: () => {
                    onShow();

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
                }
            }
        };
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
        progressText.setAttribute('tooltip', $translate.instant('guide.total.progress.tooltip'));
        progressText.setAttribute('tooltip-placement', 'left');
        progressText.setAttribute('tooltip-trigger', 'mouseenter');
        progressText.setAttribute('tooltip-append-to-body', 'false');
        progress.appendChild(progressText);

        content.appendChild(progress);
    };

    this._addTypeIcon = (currentStepElement, stepDescription) => {
        let iconName;
        let iconTooltip;
        switch (stepDescription.type) {
            case 'clickable':
                iconName = 'focus';
                iconTooltip = 'mouse'
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
        typeIcon.setAttribute('tooltip', $translate.instant('guide.step-type.' + iconTooltip));
        typeIcon.setAttribute('tooltip-placement', 'bottom-right');
        typeIcon.setAttribute('tooltip-trigger', 'mouseenter');
        typeIcon.setAttribute('tooltip-append-to-body', 'false');

        angular.element(currentStepElement.querySelector('.shepherd-header')).prepend(typeIcon);
    };

    /**
     * Created a base button.
     * @param text - the text of button.
     * @param isSecondary - if true will be styled as secondary button.
     * @param action - to be executed when button is clicked.
     * @returns created button.
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
    }
}
