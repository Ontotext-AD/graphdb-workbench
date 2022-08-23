import 'angular/utils/local-storage-adapter';
import 'angular/guides/tour-lib-services/shepherd.service';
import {GuideUtils} from "./guide-utils";

const modules = [
    'graphdb.framework.guides.shepherd.services'
];

angular
    .module('graphdb.framework.guides.services', modules)
    .service('GuidesService', GuidesService);


GuidesService.$inject = ['$http', '$rootScope', '$translate', 'ShepherdService'];

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
 *       onNextClick: function
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
 * @param $http - the http client.
 * @param $rootScope - the rootScope.
 * @param $translate - the translation service.
 * @param ShepherdService - service (wrapper) of library  <a href="https://shepherdjs.dev/docs/">shepherd</a>.
 * @constructor
 */
function GuidesService($http, $rootScope, $translate, ShepherdService) {

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
     *     <li>Loads guide description from <code>guideFileName</code>;</li>
     *     <li>Converts complex step sequence to core steps sequence;</li>
     *     <li>Starts guide from step with id <code>startStepId.</code>
     * </ol>
     * @param guideFileName - path to guide description file.
     * @param startStepId
     */
    this.startGuide = (guideFileName, startStepId) => {
        this.cancelGuide();
        this.loadGuide(guideFileName)
            .then(guide => {
                return this._toStepsDescriptions(guide);
            })
            .then(stepsDescriptions => {
                if (!!startStepId) {
                    ShepherdService.resumeGuide(guideFileName, stepsDescriptions, startStepId);
                } else {
                    ShepherdService.startGuide(guideFileName, stepsDescriptions, startStepId);
                }
            });
    }

    /**
     * Cancel the currently started guide if any.
     */
    this.cancelGuide = () => {
        ShepherdService.cancel();
    }

    /**
     * Fetches guide description with name <code>guideFileName</code> from the server.
     *
     * @param guideFileName - path to guide description file.
     * @returns {Promise<[]>} - array with steps descriptions. Format of steps description:
     *
     * <pre>
     *     {
     *       tutorialName: string,
     *       options: {
     *          ......
     *          },
     *          steps: [
     *          ...
     *          ]
     *        }
     * </pre>
     *
     * <ul>
     *     <li>
     *         <b>guideName</b> - guide name (optional).
     *     </li>
     *     <li>
     *         <b>options</b> - global options of the guide.
     *     </li>
     * </ul>
     */
    this.loadGuide = (guideFileName) => {
        return new Promise(resolve => {
            $http.get(`guides/${guideFileName}`)
                .success(function (data) {
                    resolve(data);
                });
        });
    }

    /**
     * Fetches list with all available guides.
     * @returns {Promise<[]>} array with guides descriptions. A guide description have to be:
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
        return new Promise(resolve => {
            $http.get(`guides/guides.json`)
                .success(function (data) {
                    resolve(data);
                });
        });
    }

    /**
     * Fetches guide translation file for locale <code>locale</code>.
     * @returns {Promise<{}>}
     */
    this.getTranslation = () => {
        return new Promise(resolve => {
            $http.get(`guides/i18n/locale-${$translate.use()}.json`)
                .success(function (data) {
                    resolve(data);
                });
        });
    }

    /**
     * Converts guide steps (array with complex steps) to array with core steps.
     * @param guide - a guide description:
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
     * @returns arrays with core steps extracted from all 'guide.step' plugins registered in <code>data</code>. Format of a step
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
     *       onNextClick: function
     *       onPreviousClick: function
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
     *         <b>onPreviousClick</b> - function which will be executed when previous button is clicked.
     *     </li>
     * </ul>
     * @private
     */
    this._toStepsDescriptions = (guide) => {
        if (!guide) {
            return [];
        }
        let coreSteps = [];
        guide.steps.forEach(step => {
            coreSteps = coreSteps.concat(this._getSteps(step, guide.options));
        });

        // Add id to everyone step
        for (let index = 0; index < coreSteps.length; index++) {
            coreSteps[index].id = index;
        }
        return coreSteps;
    }

    /**
     * Converts a complex step to array with core steps.
     * @param complexStep - a complex or core step description. Format of the description is:
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
     * @param parentOptions - options passed from parent.
     * @returns {*[]} - an array with core steps.
     * @private
     */
    this._getSteps = (complexStep, parentOptions) => {
        let steps = [];
        if (angular.isArray(complexStep)) {
            complexStep.forEach(stepDescription => {
                steps = steps.concat(this._getSteps(stepDescription, angular.extend({}, complexStep.options, parentOptions)));
            });
        } else {
            const predefinedStepDescription = PluginRegistry.get('guide.step').find((predefinedStep => predefinedStep.guideBlockName === complexStep.guideBlockName));
            if (predefinedStepDescription) {
                const options = angular.extend({}, predefinedStepDescription.options, complexStep.options, parentOptions);
                if (!!predefinedStepDescription.getSteps) {
                    steps = steps.concat(this._getSteps(angular.copy(predefinedStepDescription.getSteps(options, GuideUtils)), parentOptions));
                } else if (!!predefinedStepDescription.getStep) {
                    steps.push(angular.copy(predefinedStepDescription.getStep(options)));
                } else {
                    steps = steps.concat(this._getSteps(angular.copy(predefinedStepDescription, predefinedStepDescription.options), parentOptions));
                }
            }
        }
        return steps;
    }

    /**
     * Subscribes to guide resume event. When event occurred the guide will be start from the step where the guide was paused.
     *
     * @private
     */
    this._subscribeToGuideResumed = () => {
        if (!this.guideResumeSubscription) {
            this.guideResumeSubscription = $rootScope.$on('guideResume', () => {
                const guideFileName = ShepherdService.getGuideFileName();
                const currentStepId = ShepherdService.getCurrentStepId();
                this.startGuide(guideFileName, currentStepId);
            });
        }
    };

    this._subscribeToGuideCancel = () => {
        ShepherdService.subscribeToGuideCancel(() => $rootScope.$broadcast('guideReset'));
    }

    this._subscribeToGuidePause = () => {
        ShepherdService.subscribeToGuidePause(() => $rootScope.$broadcast('guidePaused'));
    }
}
