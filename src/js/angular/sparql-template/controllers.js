import 'angular/core/services';
import 'angular/core/services/repositories.service';
import 'angular/rest/monitoring.rest.service';
import 'angular/utils/notifications';
import 'angular/utils/uri-utils';
import 'angular/core/directives/core-error/core-error.directive';
import {decodeHTML} from "../../../app";
import {DEFAULT_SPARQL_QUERY, SparqlTemplateInfo} from "../models/sparql-template/sparql-template-info";
import {SparqlTemplateError} from "../models/sparql-template/sparql-template-error";
import {YasqeMode} from "../models/ontotext-yasgui/yasqe-mode";
import {RenderingMode} from "../models/ontotext-yasgui/rendering-mode";
import {
    DISABLE_YASQE_BUTTONS_CONFIGURATION,
    YasguiComponentDirectiveUtil
} from "../core/directives/yasgui-component/yasgui-component-directive.util";

const modules = [
    'ui.bootstrap',
    'graphdb.framework.core.services.repositories',
    'graphdb.framework.rest.monitoring.service',
    'toastr',
    'graphdb.framework.core.directives.core-error'
];

angular.module('graphdb.framework.sparql-template.controllers', modules, [
    'graphdb.framework.utils.notifications'
])
    .controller('SparqlTemplatesCtrl', SparqlTemplatesCtrl)
    .controller('SparqlTemplateCreateCtrl', SparqlTemplateCreateCtrl);

SparqlTemplatesCtrl.$inject = ['$scope', '$repositories', 'SparqlTemplatesRestService', 'toastr', 'ModalService', '$licenseService', '$translate'];

function SparqlTemplatesCtrl($scope, $repositories, SparqlTemplatesRestService, toastr, ModalService, $licenseService, $translate) {

    $scope.pluginName = 'sparql-template';

    $scope.setPluginIsActive = function (isPluginActive) {
        $scope.pluginIsActive = isPluginActive;
    };

    $scope.getSparqlTemplates = function () {
        // Only do this if there is an active repo that isn't an Ontop repo.
        // Ontop repos doesn't support update operations.
        if ($licenseService.isLicenseValid() &&
            $repositories.getActiveRepository()
            && !$repositories.isActiveRepoOntopType()
            && !$repositories.isActiveRepoFedXType()) {
            SparqlTemplatesRestService.getSparqlTemplates($repositories.getActiveRepository()).success(function (data) {
                $scope.sparqlTemplateIds = data;
            }).error(function (data) {
                const msg = getError(data);
                toastr.error(msg, $translate.instant('sparql.template.get.templates.error'));
            });
        } else {
            $scope.sparqlTemplateIds = [];
        }
    };

    $scope.$watch(function () {
        return $repositories.getActiveRepository();
    }, function () {
        $scope.getSparqlTemplates();
    });

    $scope.deleteTemplate = function (templateID) {
        ModalService.openSimpleModal({
            title: $translate.instant('common.warning'),
            message: $translate.instant('sparql.template.delete.template.warning', {templateID: templateID}),
            warning: true
        }).result
            .then(function () {
                SparqlTemplatesRestService.deleteSparqlTemplate(templateID, $repositories.getActiveRepository())
                    .success(function () {
                        toastr.success(templateID, $translate.instant('sparql.template.delete.template.success'));
                        $scope.getSparqlTemplates();
                    }).error(function (e) {
                    toastr.error(getError(e), $translate.instant('sparql.template.delete.template.failure', {templateID: templateID}));
                });
            });
    };
}

SparqlTemplateCreateCtrl.$inject = [
    '$scope',
    '$rootScope',
    '$location',
    'toastr',
    '$repositories',
    '$window',
    '$timeout',
    '$interval',
    'SparqlTemplatesRestService',
    'RDF4JRepositoriesRestService',
    'UriUtils',
    'ModalService',
    '$translate',
    '$q',
    'GlobalEmitterBuss',
    '$languageService'];

function SparqlTemplateCreateCtrl(
    $scope,
    $rootScope,
    $location,
    toastr,
    $repositories,
    $window,
    $timeout,
    $interval,
    SparqlTemplatesRestService,
    RDF4JRepositoriesRestService,
    UriUtils,
    ModalService,
    $translate,
    $q,
    GlobalEmitterBuss,
    $languageService) {

    $scope.initialQuery = DEFAULT_SPARQL_QUERY;
    $scope.sparqlTemplateInfo = new SparqlTemplateInfo($scope.initialQuery);
    $scope.title = '';
    $scope.saveOrUpdateExecuted = false;
    $scope.isDirty = false;
    $scope.language = $languageService.getLanguage();
    $scope.canEditActiveRepo = false;

    // This flag is used to prevent loading of the yasgui on consecutive repository change events after
    // the first.
    let initialRepoInitialization = true;


    // =========================
    // Public functions
    // =========================
    $scope.saveTemplate = function () {
        $scope.saveOrUpdateExecuted = true;

        if (!isQueryDirty()) {
            goToSparqlTemplatesView();
        }

        const saveOrUpdate = $scope.sparqlTemplateInfo.isNewTemplate ? save : update;

        validateTemplateId($scope.sparqlTemplateInfo)
            .then(getQuery)
            .then(validateQuery)
            .then(validateQueryMode)
            .then(saveOrUpdate)
            .then(goBack)
            .catch((error) => {
                if (!(error instanceof SparqlTemplateError)) {
                    console.log(error);
                }
            });
    };

    $scope.isTemplateIdValid = (templateID) => {
        return UriUtils.isValidIri(templateID, templateID.toString());
    };

    $scope.markDirty = () => {
        $scope.isDirty = true;
    };

    $scope.markPristine = () => {
        $scope.isDirty = false;
    };

    // =========================
    // Private functions
    // =========================
    const init = (prefixes, initialQuery = DEFAULT_SPARQL_QUERY) => {
        $scope.sparqlTemplateInfo.query = initialQuery;
        $scope.sparqlTemplateInfo.templateID = extractTemplateIdFromUri();
        $scope.sparqlTemplateInfo.isNewTemplate = !$scope.sparqlTemplateInfo.templateID;
        updateTitle();
        $scope.yasguiConfig = {
            showEditorTabs: false,
            showToolbar: false,
            showResultTabs: false,
            showYasqeActionButtons: false,
            showYasqeResizer: false,
            yasqeActionButtons: DISABLE_YASQE_BUTTONS_CONFIGURATION,
            showQueryButton: false,
            initialQuery: $scope.sparqlTemplateInfo.query,
            componentId: 'sparql-template',
            prefixes: prefixes,
            render: RenderingMode.YASQE,
            maxPersistentResponseSize: 0,
            yasqeMode: $scope.canEditActiveRepo ? YasqeMode.WRITE : YasqeMode.PROTECTED
        };
    };

    /**
     * Saves the SPARQL template described in <code>templateInfo</code>.
     * @param {SparqlTemplateInfo} templateInfo - holds information about template.
     * @return {Promise<SparqlTemplateInfo>}
     */
    const save = (templateInfo) => {
        return checkIfTemplateExists(templateInfo)
            .then(confirmSaveAction)
            .then(saveNewTemplate);
    };

    /**
     * Checks if template with <code>templateInfo.templateID</code> exist.
     * @param {SparqlTemplateInfo} templateInfo - holds information about template.
     * @return {Promise<SparqlTemplateInfo>}
     */
    const checkIfTemplateExists = (templateInfo) => {
        return SparqlTemplatesRestService.getSparqlTemplates($repositories.getActiveRepository())
            .then(function (response) {
                templateInfo.templateExist = response.data.find((templateId) => templateId === $scope.sparqlTemplateInfo.templateID);
                return templateInfo;
            }).catch(function (data) {
                const msg = getError(data);
                toastr.error(msg, $translate.instant('sparql.template.get.templates.error'));
                return Promise.reject(new SparqlTemplateError('Failed to retrieve sparql templates.'));
            });
    };

    /**
     * Checks if yasque query is changed.
     * @param {SparqlTemplateInfo} templateInfo - holds information about template.
     * @return {Promise<SparqlTemplateInfo>}
     */
    const validateQuery = (templateInfo) => {
        return getOntotextYasgui().isQueryValid()
            .then((valid) => {
                templateInfo.isValidQuery = valid;
                if (!templateInfo.isValidQuery) {
                    return Promise.reject(new SparqlTemplateError('Invalid query.'));
                }
                return templateInfo;
            });
    };

    const isQueryDirty = () => {
        return $scope.sparqlTemplateInfo.isNewTemplate || $scope.isDirty;
    };

    /**
     * Displays a confirmation dialog and asks the user to confirm the save operation.
     * @param {SparqlTemplateInfo} templateInfo - holds information about template.
     * @return {Promise<SparqlTemplateInfo>}
     */
    const confirmSaveAction = (templateInfo) => {
        return new Promise((resolve, reject) => {
            if (templateInfo.templateExist) {
                const modalMsg = decodeHTML($translate.instant('sparql.template.existing.template.error', {templateID: templateInfo.templateID}));
                const title = $translate.instant('common.confirm.save');
                openConfirmDialog(title, modalMsg, () => resolve(templateInfo), () => reject(new SparqlTemplateError('Save not confirmed.')));
            } else {
                resolve(templateInfo);
            }
        });
    };

    /**
     * Calls save SPARQL template server endpoint.
     * @param {SparqlTemplateInfo} templateInfo - holds information about template.
     * @return {Promise<SparqlTemplateInfo>}
     */
    function saveNewTemplate(templateInfo) {
        return SparqlTemplatesRestService.createSparqlTemplate(templateInfo, $repositories.getActiveRepository())
            .then(function () {
                templateInfo.isNewTemplate = false;
                $scope.markPristine();
                toastr.success(templateInfo.templateID, $translate.instant('save.sparql.template.success.msg'));
                return templateInfo;
            }).catch(function (data) {
                const message = getError(data);
                toastr.error(message, $translate.instant('save.sparql.template.failure.msg', {templateID: templateInfo.templateID}));
                return Promise.reject(new SparqlTemplateError(`Failed to save the new template: ${templateInfo.templateID}`));
            });
    }

    /**
     * Updates the SPARQL template described in <code>templateInfo</code>.
     * @param {SparqlTemplateInfo} templateInfo - holds information about template.
     * @return {Promise<SparqlTemplateInfo>}
     */
    const update = (templateInfo) => {
        return SparqlTemplatesRestService.updateSparqlTemplate(templateInfo, $repositories.getActiveRepository())
            .then(function () {
                templateInfo.isNewTemplate = false;
                $scope.markPristine();
                toastr.success($scope.sparqlTemplateInfo.templateID, $translate.instant('update.sparql.template.success.msg'));
                return templateInfo;
            }).catch(function (data) {
                const message = getError(data);
                toastr.error(message, $translate.instant('save.sparql.template.failure.msg', {templateID: templateInfo.templateID}));
                return Promise.reject(new SparqlTemplateError(`Failed to update the template: ${templateInfo.templateID}`));
            });
    };

    /**
     * Fetches the query from "ontotext-yasgui" and updates the <code>templateInfo</code>.
     * @param {SparqlTemplateInfo} templateInfo - holds information about template.
     * @return {Promise<SparqlTemplateInfo>}
     */
    const getQuery = (templateInfo) => {
        return getOntotextYasgui().getQuery()
            .then((query) => {
                templateInfo.query = query;
                return templateInfo;
            });
    };

    /**
     * Checks if query mode is valid. The mode have to be "update".
     * @param {SparqlTemplateInfo} templateInfo - holds information about template.
     * @return {Promise<SparqlTemplateInfo>}
     */
    const validateQueryMode = (templateInfo) => {
        return getOntotextYasgui().getQueryMode()
            .then((queryMode) => {
                templateInfo.isValidQueryMode = 'update' === queryMode;

                if (!templateInfo.isValidQueryMode) {
                    return Promise.reject(new SparqlTemplateError('Query mode is not valid.'));
                }
                return templateInfo;
            });
    };

    /**
     * Checks if template id is valid.
     * @param {SparqlTemplateInfo} templateInfo - holds information about template.
     * @return {Promise<SparqlTemplateInfo>}
     */
    const validateTemplateId = (templateInfo) => {
        return new Promise((resolve, reject) => {
            if (!templateInfo.templateID) {
                reject(new SparqlTemplateError('A required template identifier is missing.'));
                return;
            }

            templateInfo.isValidTemplateId = $scope.isTemplateIdValid(templateInfo.templateID);

            if (!templateInfo.isValidTemplateId) {
                reject(new SparqlTemplateError('Template identifier is not valid.'));
                return;
            }

            resolve(templateInfo);
        });
    };

    /**
     * go to previous page.
     */
    const goBack = () => {
        // Added timeout a success message to be shown.
        setTimeout(function () {
            goToSparqlTemplatesView();
        }, 1000);

    };

    const extractTemplateIdFromUri = () => {
        const hash = $location.hash() || '';
        return ($location.search().templateID || '') + (hash ? (`#${hash}`) : '');
    };

    const updateTitle = () => {
        $scope.title = ($scope.sparqlTemplateInfo.templateID ? $translate.instant('edit') : $translate.instant('common.create.btn')) + ' ' + $translate.instant('view.sparql.template.title');
    };

    const goToSparqlTemplatesView = () => {
        $location.url('/sparql-templates');
    };


    const setLoader = (isRunning, loaderMessage) => {
        $scope.queryIsRunning = isRunning;
        $scope.loaderMessage = $scope.queryIsRunning ? loaderMessage : '';
    };

    const getOntotextYasgui = () => {
        return YasguiComponentDirectiveUtil.getOntotextYasguiElement('#query-editor');
    };

    const openConfirmDialog = (title, message, onConfirm, onCancel) => {
        ModalService.openSimpleModal({
            title,
            message,
            warning: true
        }).result.then(function () {
            if (angular.isFunction(onConfirm)) {
                onConfirm();
            }
        }, function () {
            if (angular.isFunction(onCancel)) {
                onCancel();
            }
        });
    };

    // =========================
    // Subscriptions handlers
    // =========================
    const languageChangedHandler = () => {
        $scope.language = $languageService.getLanguage();
        updateTitle();
    };

    const repositoryWillChangedHandler = (eventData) => {
        return new Promise(function (resolve) {

            if ($scope.sparqlTemplateInfo.isNewTemplate) {
                resolve(eventData);
                return;
            }

            const onConfirm = () => {
                $scope.isDirty = false;
                goToSparqlTemplatesView();
                resolve(eventData);
            };

            if ($scope.isDirty) {
                const onCancel = () => {
                    eventData.cancel = true;
                    resolve(eventData);
                };
                const title = $translate.instant('common.confirm');
                const message = $translate.instant('jdbc.warning.unsaved.changes');
                openConfirmDialog(title, message, onConfirm, onCancel);
            } else {
                onConfirm();
            }
        });
    };

    const removeAllListeners = () => {
        window.removeEventListener('beforeunload', beforeunloadHandler);
        subscriptions.forEach((subscription) => subscription());
    };

    const locationChangedHandler = (event, newPath) => {
        if ($scope.isDirty) {
            event.preventDefault();
            const title = $translate.instant('common.confirm');
            const message = $translate.instant('jdbc.warning.unsaved.changes');
            const onConfirm = () => {
                removeAllListeners();
                const baseLen = $location.absUrl().length - $location.url().length;
                const path = newPath.substring(baseLen);
                $location.path(path);
            };
            openConfirmDialog(title, message, onConfirm);
        } else {
            removeAllListeners();
        }
    };

    const beforeunloadHandler = (event) => {
        if ($scope.isDirty) {
            event.returnValue = true;
        }
    };

    const repositoryChangedHandler = (activeRepo) => {
        if (activeRepo) {
            $scope.canEditActiveRepo = $scope.canWriteActiveRepo();
            if (initialRepoInitialization) {
                loadOntotextYasgui();
                initialRepoInitialization = false;
            } else {
                goToSparqlTemplatesView();
            }
        }
    };

    const queryChangeHandler = (evt, queryState) => {
        if (queryState.dirty) {
            $scope.markDirty();
        } else {
            $scope.markPristine();
        }
    };

    // =========================
    // Subscriptions
    // =========================
    const subscriptions = [];
    subscriptions.push($scope.$on('queryChanged', queryChangeHandler));
    subscriptions.push($rootScope.$on('$translateChangeSuccess', languageChangedHandler));
    subscriptions.push($scope.$on('$locationChangeStart', locationChangedHandler));
    subscriptions.push(GlobalEmitterBuss.subscribe('repositoryWillChangeEvent', repositoryWillChangedHandler));
    subscriptions.push($scope.$on('$destroy', removeAllListeners));
    // Prevent go out of the current page? check
    window.addEventListener('beforeunload', beforeunloadHandler);

    /**
     * Starts loading of needed data and process the view.
     */
    const loadOntotextYasgui = () => {
        const loadMessage = `${$translate.instant('common.refreshing.namespaces')}. ${$translate.instant('common.extra.message')}`;

        setLoader(true, loadMessage);
        $scope.sparqlTemplateInfo.templateID = extractTemplateIdFromUri();
        const activeRepository = $repositories.getActiveRepository();
        if ($scope.sparqlTemplateInfo.templateID) {
            Promise.all([$repositories.getPrefixes(activeRepository), SparqlTemplatesRestService.getSparqlTemplate($scope.sparqlTemplateInfo.templateID, activeRepository)])
                .then(([prefixes, templateContent]) => init(prefixes, templateContent.data))
                .finally(() => setLoader(false));
        } else {
            $repositories.getPrefixes(activeRepository)
                .then((prefixes) => init(prefixes))
                .finally(() => setLoader(false));
        }
    };

    // Wait until the active repository object is set, otherwise "canWriteActiveRepo()" may return a wrong result and the "ontotext-yasgui"
    // readOnly configuration may be incorrect.
    subscriptions.push($scope.$watch($scope.getActiveRepositoryObject, repositoryChangedHandler));
}
