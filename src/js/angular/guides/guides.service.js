import 'angular/utils/local-storage-adapter';
import 'angular/guides/tour-lib-services/shepherd.service';
import {GuideUtils} from "./guide-utils";
import {YasguiComponentDirectiveUtil} from "../core/directives/yasgui-component/yasgui-component-directive.util";

const modules = [
    'graphdb.framework.guides.shepherd.services'
];

angular
    .module('graphdb.framework.guides.services', modules)
    .service('GuidesService', GuidesService);


GuidesService.$inject = ['$http', '$rootScope', '$translate', '$interpolate', 'ShepherdService', '$repositories', 'toastr', '$location', '$route', '$timeout'];

/**
 * Service for interaction with guide functionality. A guide is described as sequence of steps.
 * A step can have one or more other steps. Everyone step is implemented as plugin with name 'guide.step'.
 * There is two kind of steps:
 * <ul>
 *     <li>Core steps</li>
 *     <li>Complex step</li>
 * </ul>
 *
 * A core step is smallest step which describes a interaction with Workbench. For example the step "Click on button Import from main menu".
 * The description of such step is in format JSON object:
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
 *       forceReload: boolean,
 *       onNextClick: function,
 *       onNextValidate: function
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
 *     <li><b>forceReload</b> - if true will reload page no matter that step is on same page.
 *     <li>
 *         <b>onNextClick</b> - function which will be executed when nexButton is clicked. Usual it implements click on the element of the step.
 *     </li>
 *     <li>
 *         <b>onNextValidate</b> - function that determines if clicking the next button advances the step.
 *     </li>
 * </ul>
 * The core steps are the steps passed to some tour library services. Currently we use {@see ShepherdService}. They are created from plugins
 * described in guides/steps/core directory. Format of a such plugin is:
 * <pre>
 *     {
 *         guideBlockName: string,
 *         getStep: function
 *     }
 * </pre>
 *
 * <ul>
 *     <li>
 *         <b>guideBlockName</b> - unique name of the plugin.
 *     </li>
 *     <li>
 *         <b>getStep</b> - function which returns a json which describe a core step.
 *     </li>
 * </ul>
 *
 *
 * A complex step is a sequence of steps described an action. Fro example click on sub menu. First have to click on main-menu and
 * after that on sub menu. They are created from plugins described in guides/steps/complex directory. Format of a such plugin is:
 * {
 *     guideBlockName: string,
 *     getSteps: function
 * }
 *
 * <ul>
 *     <li>
 *         <b>guideBlockName</b> - unique name of the plugin.
 *     </li>
 *     <li>
 *         <b>getSteps</b> function which returns a json array with description of other complex plugins or core steps.
 *     </li>
 * </ul>
 *
 * @param {*} $http - the http client.
 * @param {*} $rootScope - the rootScope.
 * @param {*} $translate - the translation service.
 * @param {*} $interpolate - the interpolation service.
 * @param {*} ShepherdService - service (wrapper) of library  <a href="https://shepherdjs.dev/docs/">shepherd</a>.
 * @param {*} $repositories - the repositories service.
 * @param {*} toastr
 * @param {*} $location
 * @param {*} $route
 * @param {*} $timeout
 * @constructor
 */
function GuidesService($http, $rootScope, $translate, $interpolate, ShepherdService, $repositories, toastr, $location, $route, $timeout) {

    this.guideResumeSubscription = undefined;
    this.languageChangeSubscription = undefined;
    this.guideCancelSubscription = undefined;

    this.init = () => {
        this._subscribeToGuideResumed();
        this._subscribeToGuideCancel();
        this._subscribeToGuidePause();
    };

    /**
     * Creates a guide and start it from <code>startStepId</code>. Steps of starting guids are:
     * <ol>
     *     <li>Cancels currently ran guid if any;</li>
     *     <li>Reads guide description from <code>guide</code>;</li>
     *     <li>Converts complex step sequence to core steps sequence;</li>
     *     <li>Starts guide from step with id <code>startStepId.</code>
     * </ol>
     * @param {*} guide - the guide to start as an object.
     * @param {*} startStepId
     */
    this.startGuide = (guide, startStepId) => {
        if (guide && guide.options && guide.options.repositoryIdBase) {
            // repositoryIdBase in the options can be used as a template to find a free repository ID.
            // For example, setting repositoryIdBase to 'myrepo' will find the first free ID from:
            // - myrepo
            // - myrepo2
            // - myrepo3 and so on
            const repos = $repositories.getRepositories();
            guide.options.repositoryId = guide.options.repositoryIdBase;
            for (let i = 2; repos.find((repo) => repo.id === guide.options.repositoryId); i++) {
                guide.options.repositoryId = guide.options.repositoryIdBase + i;
            }

            guide.options.translatedGuideName = GuideUtils.translateLocalMessage($translate, $interpolate, guide.guideName, {});
            guide.options.translatedGuideDescription = GuideUtils.translateLocalMessage($translate, $interpolate, guide.guideDescription, {});
        }

        const stepsDescriptions = this._toStepsDescriptions(guide);

        // Add id to everyone step
        for (let index = 0; index < stepsDescriptions.length; index++) {
            stepsDescriptions[index].id = index;
        }

        if (angular.isDefined(startStepId)) {
            ShepherdService.resumeGuide(guide.guideId, stepsDescriptions, startStepId);
        } else {
            ShepherdService.startGuide(guide.guideId, stepsDescriptions, startStepId);
        }

        $rootScope.$broadcast('guideStarted');
    };

    /**
     * Fetches list with all available guides.
     * @return {Promise<[]>} array with guides descriptions. A guide description have to be:
     * <pre>
     *     {
     *         name: string,
     *         title: string,
     *         guideFileName: string
     *     }
     * </pre>
     *  <ul>
     *      <li><b>name</b> - name of a guide, it have to be unique;</li>
     *      <li><b>title</b> - title of a guide. It will be shown in the pages;</li>
     *      <li><b>guideFileName</b> - path to guide description file.</li>
     *  </ul>
     */
    this.getGuides = () => {
        return new Promise((resolve) => {
            $http.get(GuideUtils.GUIDES_LIST_URL)
                .success(function (data) {
                    angular.forEach(data, (guide, index) => {
                        if (guide.guideId === undefined) {
                            // Ideally we want our guides to have stable IDs but it's not a big deal
                            // if they don't have one - so just generate it in that case
                            guide.guideId = index;
                        }
                    });
                    resolve(data);
                });
        });
    };

    /**
     * Returns true if a guide is currently active (even if paused).
     * @return {boolean}
     */
    this.isActive = () => {
        return ShepherdService.isActive();
    };

    /**
     * Converts guide steps (array with complex steps) to array with core steps.
     * @param {*} guide - a guide description:
     *
     * <pre>
     *     {
     *       tutorialName: string,
     *       options: {
     *       ....
     *       },
     *       steps: [
     *         {
     *           guideBlockName: string,
     *           options: {
     *             fileName: string
     *          }
     *          ...
     *          ]
     *        }
     * </pre>
     *  <ul>
     *      <li>
     *          <b>guideBlockName</b> - unique name of the plugin.
     *      </li>
     *      <li>
     *         <b>options</b> - options of the steps. For example the name of the rdf file which have to be imported.
     *     </li>
     *  </ul>
     *
     * @return arrays with core steps extracted from all 'guide.step' plugins registered in <code>data</code>. Format of a step
     * description is:
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
     *         <b>onNextValidate</b> - function that determines whether clicking the next button advances the step.
     *     </li>
     *     <li>
     *         <b>onPreviousClick</b> - function which will be executed when previous button is clicked.
     *     </li>
     *     <li>
     *         <b>beforeShowPromise</b> - a function that returns a promise. When the promise resolves, the rest of the show code for the step will execute.
     *         Default implementation is wait <code>maxWaitTime</code> element with <code>elementSelector</code> to be visible.
     *     </li>
     * </ul>
     * @return {[]}
     * @private
     */
    this._toStepsDescriptions = (guide) => {
        if (!guide) {
            return [];
        }
        let coreSteps = [];
        guide.steps.forEach((step) => {
            coreSteps = coreSteps.concat(this._getSteps(step, guide.options));
        });
        return coreSteps;
    };

    /**
     * Converts a complex step to array with core steps.
     * @param {*} complexStep - a complex or core step description. Format of the description is:
     * <pre>
     *     {
     *         guideBlockName: string,
     *         options: {}
     *     }
     * </pre>
     *  <ul>
     *      <li>
     *          <b>guideBlockName</b> - unique name of the plugin.
     *      </li>
     *      <li>
     *         <b>options</b> - options of the steps. For example the name of the rdf file which have to be imported.
     *     </li>
     *  </ul>
     * @param {*}parentOptions - options passed from parent.
     * @return {*[]} - an array with core steps.
     * @private
     */
    this._getSteps = (complexStep, parentOptions) => {
        const services = {$translate, $interpolate, GuideUtils, $rootScope, toastr, $location, $route, $timeout, ShepherdService, $repositories, YasguiComponentDirectiveUtil};
        let steps = [];
        if (angular.isArray(complexStep)) {
            complexStep.forEach((stepDescription) => {
                steps = steps.concat(this._getSteps(stepDescription, angular.extend({}, complexStep.options, parentOptions)));
            });
        } else {
            const predefinedStepDescription = PluginRegistry.get('guide.step').find(((predefinedStep) => predefinedStep.guideBlockName === complexStep.guideBlockName));
            if (predefinedStepDescription) {
                const options = angular.extend({}, predefinedStepDescription.options, complexStep.options, parentOptions);
                if (predefinedStepDescription.getSteps) {
                    steps = steps.concat(this._getSteps(_.cloneDeep(predefinedStepDescription.getSteps(options, services)), parentOptions));
                } else if (predefinedStepDescription.getStep) {
                    steps.push(_.cloneDeep(predefinedStepDescription.getStep(options, services)));
                } else {
                    steps = steps.concat(this._getSteps(_.cloneDeep(predefinedStepDescription, predefinedStepDescription.options), parentOptions));
                }
            }
        }
        steps.forEach((step, index) => {
            step.stepN = index;
            step.stepsTotalN = steps.length;
            if (!step.title && step.mainAction) {
                step.title = 'guide.step-action.' + step.mainAction;
            }
        });
        return steps;
    };

    /**
     * Subscribes to guide resume event. When event occurred the guide will be start from the step where the guide was paused.
     *
     * @private
     */
    this._subscribeToGuideResumed = () => {
        if (!this.guideResumeSubscription) {
            this.guideResumeSubscription = $rootScope.$on('guideResume', () => {
                const currentGuideId = ShepherdService.getGuideId();
                this.getGuides()
                    .then((guides) => {
                        const currentGuide = guides.find((guide) => guide.guideId === currentGuideId);
                        const currentStepId = ShepherdService.getCurrentStepId();
                        this.startGuide(currentGuide, currentStepId);
                    });
            });
        }
    };

    this._subscribeToGuideCancel = () => {
        ShepherdService.subscribeToGuideCancel(() => $rootScope.$broadcast('guideReset'));
    };

    this._subscribeToGuidePause = () => {
        ShepherdService.subscribeToGuidePause(() => $rootScope.$broadcast('guidePaused'));
    };
}
