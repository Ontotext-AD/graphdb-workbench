import 'angular/rest/plugins.rest.service';
import 'angular/rest/aclmanagement.rest.service';
import {mapAclRulesResponse} from "../rest/mappers/aclmanagement-mapper";
import {isEqual} from 'lodash';
import {mapNamespacesResponse} from "../rest/mappers/namespaces-mapper";

const modules = [
    'graphdb.framework.rest.plugins.service',
    'graphdb.framework.rest.aclmanagement.service'
];

angular
    .module('graphdb.framework.aclmanagement.controllers', modules)
    .controller('AclManagementCtrl', AclManagementCtrl);

AclManagementCtrl.$inject = ['$scope', '$location', 'toastr', 'AclManagementRestService', '$repositories', '$translate', 'ModalService', 'RDF4JRepositoriesRestService', 'AutocompleteRestService'];

function AclManagementCtrl($scope, $location, toastr, AclManagementRestService, $repositories, $translate, ModalService, RDF4JRepositoriesRestService, AutocompleteRestService) {

    $scope.contextValue = undefined;

    //
    // Private fields
    //

    /**
     * Holds a list of event handler subscriptions which to be cleaned up on page leave.
     * @type {*[]}
     */
    const subscriptions = [];

    //
    // Public fields
    //

    /**
     * The model for the rule editing form.
     * @type {Object} The edited rule form model.
     */
    $scope.ruleData = {};

    /**
     * Flag controlling the loading indicator while some http operation is in progress.
     * @type {boolean}
     */
    $scope.loading = false;

    /**
     * Namespaces model loaded in advance and passed to all autocomplete fields.
     * @type {{uri: string, prefix: string}[]}
     */
    $scope.namespaces = [];

    /**
     * A list with ACL rules that will be managed in this view.
     * @type {undefined|ACListModel}
     */
    $scope.rulesModel = undefined;

    /**
     * A copy of the model needed for revert or dirty check operations.
     * @type {undefined}
     */
    $scope.rulesModelCopy = undefined;

    /**
     * The index of the rule which is currently moved up/down.
     * @type {undefined|number}
     */
    $scope.selectedRule = undefined;

    /**
     * The index of a rule which is opened for edit or create.
     * @type {undefined|number}
     */
    $scope.editedRuleIndex = undefined;

    /**
     * A copy of the currently edited rule. This is used for reverting an edited rule.
     * @type {undefined|ACRuleModel}
     */
    $scope.editedRuleCopy = undefined;

    /**
     * Flag showing if currently edited rule is a new one or not.
     * @type {boolean}
     */
    $scope.isNewRule = false;

    /**
     * Flag showing if the model has been changed. This controls the action buttons availability and prevents leaving
     * the page without confirmation when the model has changes.
     * @type {boolean}
     */
    $scope.modelIsDirty = false;

    //
    // Public functions
    //

    /**
     * Adds a new rule at a given index in the rulesModel.
     * @param {number} index
     */
    $scope.addRule = (index) => {
        $scope.rulesModel.addRule(index);
        $scope.editedRuleIndex = index;
        $scope.isNewRule = true;
        setModelDirty();
    };

    /**
     * Edits a rule at a given index.
     * @param {number} index
     */
    $scope.editRule = (index) => {
        $scope.editedRuleIndex = index;
        $scope.isNewRule = false;
        $scope.editedRuleCopy = $scope.rulesModel.getRuleCopy(index);
        setModelDirty();
    };

    /**
     * Deletes a rule at a given index.
     * @param {number} index
     */
    $scope.deleteRule = (index) => {
        ModalService.openConfirmation(
            $translate.instant('common.confirm'),
            $translate.instant('acl_management.rulestable.messages.delete_rule_confirmation', {index}),
            () => {
                $scope.rulesModel.removeRule(index);
                setModelDirty();
            });
    };

    /**
     * Saves a rule at a given index in the rulesModel.
     */
    $scope.saveRule = () => {
        if ($scope.rulesModel.isRuleDuplicated($scope.editedRuleIndex)) {
            notifyDuplication();
            return;
        }
        $scope.editedRuleIndex = undefined;
        $scope.isNewRule = false;
        setModelDirty();
    };

    /**
     * Cancels the editing operation of a rule at a given index.
     * @param {number} index
     */
    $scope.cancelEditing = (index) => {
        if ($scope.isNewRule) {
            $scope.rulesModel.removeRule(index);
            $scope.isNewRule = false;
        } else {
            $scope.rulesModel.replaceRule(index, $scope.editedRuleCopy);
            $scope.editedRuleCopy = undefined;
        }
        $scope.editedRuleIndex = undefined;
        setModelDirty();
    };

    /**
     * Moves a rule on the given index in the rulesModel one position up by swapping it with the rule above.
     * @param {number} index
     */
    $scope.moveUp = (index) => {
        $scope.rulesModel.moveUp(index);
        $scope.selectedRule = index - 1;
        setModelDirty();
    };

    /**
     * Moves a rule on the given index in the rulesModel one position down by swapping it with the rule below.
     * @param {number} index
     */
    $scope.moveDown = (index) => {
        $scope.rulesModel.moveDown(index);
        $scope.selectedRule = index + 1;
        setModelDirty();
    };

    /**
     * Saves the entire ACL list into the DB.
     */
    $scope.saveAcl = () => {
        $scope.loading = true;
        updateAcl()
            .then(fetchAcl)
            .catch((data) => {
                const msg = getError(data);
                toastr.error(msg, $translate.instant('acl_management.errors.updating_rules'));
            })
            .finally(() => {
                $scope.loading = false;
            });
    };

    /**
     * Performs a complete revert of the ACL list by reloading it from the DB.
     */
    $scope.cancelAclSave = () => {
        ModalService.openConfirmation(
            $translate.instant('common.confirm'),
            $translate.instant('acl_management.rulestable.messages.revert_acl_list'),
            () => {
                loadRules();
                toastr.success($translate.instant('acl_management.rulestable.messages.rules_reverted'));
            });
    };

    //
    // Private functions
    //

    const fetchAcl = () => {
        const repositoryId = getActiveRepositoryId();
        return AclManagementRestService.getAcl(repositoryId).then((response) => {
            $scope.rulesModel = mapAclRulesResponse(response);
            $scope.rulesModelCopy = mapAclRulesResponse(response);
            setModelDirty();
        }).catch((data) => {
            const msg = getError(data);
            toastr.error(msg, $translate.instant('acl_management.errors.loading_rules'));
        });
    };

    const updateAcl = () => {
        const repositoryId = getActiveRepositoryId();
        return AclManagementRestService.updateAcl(repositoryId, $scope.rulesModel.toJSON())
            .then(() => {
                toastr.success($translate.instant('acl_management.rulestable.messages.rules_updated'));
            });
    };

    /**
     * Loads ACL if there is an active repository.
     */
    const loadRules = () => {
        if (getActiveRepositoryId()) {
            $scope.loading = true;
            fetchAcl().finally(() => {
                $scope.loading = false;
            });
        }
    };

    const resetPageState = () => {
        loadRules();
        $scope.editedRuleIndex = undefined;
        $scope.modelIsDirty = false;
        $scope.editedRuleCopy = undefined;
    };

    /**
     * Updates the modelIsDirty flag by comparing the model with its copy created after it was loaded initially.
     */
    const setModelDirty = () => {
        $scope.modelIsDirty = !isEqual($scope.rulesModel, $scope.rulesModelCopy);
    };

    /**
     * Gets the currently active repository id.
     * @return {string}
     */
    const getActiveRepositoryId = () => {
        return $repositories.getActiveRepository();
    };

    const notifyDuplication = () => {
        toastr.error($translate.instant('acl_management.errors.duplicated_rules'));
    };

    const loadNamespaces = () => {
        RDF4JRepositoriesRestService.getNamespaces($repositories.getActiveRepository())
            .then(mapNamespacesResponse)
            .then((namespacesModel) => {
                $scope.namespaces = namespacesModel;
            })
            .catch((response) => {
                const msg = getError(response);
                toastr.error(msg, $translate.instant('error.getting.namespaces.for.repo'));
            });
    };

    /**
     * Should warn the user if he tries to close the browser tab while there are unsaved changes.
     * @param {{returnValue: boolean}} event
     */
    const beforeUnloadHandler = (event) => {
        if ($scope.modelIsDirty) {
            event.returnValue = true;
        }
    };

    /**
     * Cleanup all subscriptions and listeners.
     */
    const unsubscribeListeners = () => {
        window.removeEventListener('beforeunload', beforeUnloadHandler);
        subscriptions.forEach((subscription) => subscription());
    };

    /**
     * Handles location change and asks the user to confirm if there are unsaved changes in the model.
     * @param {Object} event
     * @param {string} newPath
     */
    const locationChangedHandler = (event, newPath) => {
        if ($scope.modelIsDirty) {
            event.preventDefault();
            ModalService.openSimpleModal({
                title: $translate.instant('common.confirm'),
                message: $translate.instant('acl_management.rulestable.messages.unsaved_changes_confirmation'),
                warning: true
            }).result.then(function () {
                unsubscribeListeners();
                const baseLen = $location.absUrl().length - $location.url().length;
                const path = newPath.substring(baseLen);
                $location.path(path);
            }, function () {});
        }
    };

    const checkAutocompleteStatus = () => {
        $scope.getAutocompletePromise = AutocompleteRestService.checkAutocompleteStatus();
    };

    /**
     * Initialized the view controller.
     */
    const init = () => {
        loadNamespaces();
        subscriptions.push($scope.$on('autocompleteStatus', checkAutocompleteStatus));
        // Watching for repository changes and reload the rules, because they are stored per repository and reset page state.
        subscriptions.push($scope.$watch(getActiveRepositoryId, resetPageState));
        // Watching for url changes
        subscriptions.push($scope.$on('$locationChangeStart', locationChangedHandler));
        // Watching for component destroy
        subscriptions.push($scope.$on('$destroy', unsubscribeListeners));
        // Listening for event fired when browser window is going to be closed
        window.addEventListener('beforeunload', beforeUnloadHandler);
    };

    init();
}
