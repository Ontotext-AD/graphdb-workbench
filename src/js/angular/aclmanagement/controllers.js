import 'angular/rest/plugins.rest.service';
import 'angular/rest/aclmanagement.rest.service';
import {mapAclRulesResponse} from "../rest/mappers/aclmanagement-mapper";

const modules = [
    'graphdb.framework.rest.plugins.service',
    'graphdb.framework.rest.aclmanagement.service'
];

angular
    .module('graphdb.framework.aclmanagement.controllers', modules)
    .controller('AclManagementCtrl', AclManagementCtrl);

AclManagementCtrl.$inject = ['$scope', 'toastr', 'AclManagementRestService', '$repositories', '$translate', 'ModalService'];

function AclManagementCtrl($scope, toastr, AclManagementRestService, $repositories, $translate, ModalService) {

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
     * A list with ACL rules that will be managed in this view.
     * @type {undefined|ACListModel}
     */
    $scope.rulesModel = undefined;

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

    //
    // Public functions
    //

    /**
     * Adds a new rule at a given index in the rulesModel.
     * @param {number} index
     */
    $scope.addRule= (index) => {
        $scope.rulesModel.addRule(index);
        $scope.editedRuleIndex = index;
        $scope.isNewRule = true;
    };

    /**
     * Edits a rule at a given index.
     * @param {number} index
     */
    $scope.editRule= (index) => {
        $scope.editedRuleIndex = index;
        $scope.isNewRule = false;
        $scope.editedRuleCopy = $scope.rulesModel.getRule(index)
    };

    /**
     * Deletes a rule at a given index.
     * @param {number} index
     */
    $scope.deleteRule= (index) => {
        ModalService.openConfirmation(
            $translate.instant('common.confirm'),
            $translate.instant('acl_management.rulestable.messages.delete_rule_confirmation', {index}),
            () => {
                $scope.rulesModel.removeRule(index);
            });
    };

    /**
     * Saves a rule at a given index in the rulesModel.
     */
    $scope.saveRule= () => {
        $scope.editedRuleIndex = undefined;
        $scope.isNewRule = false;
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
    };

    /**
     * Moves a rule on the given index in the rulesModel one position up by swapping it with the rule above.
     * @param {number} index
     */
    $scope.moveUp = (index) => {
        $scope.rulesModel.moveUp(index);
        $scope.selectedRule = index - 1;
    };

    /**
     * Moves a rule on the given index in the rulesModel one position down by swapping it with the rule below.
     * @param {number} index
     */
    $scope.moveDown = (index) => {
        $scope.rulesModel.moveDown(index);
        $scope.selectedRule = index + 1;
    };

    /**
     * Saves the entire ACL list into the DB.
     */
    $scope.saveAcl = () => {
        $scope.loading = true;
        const repositoryId = getActiveRepository();
        AclManagementRestService.updateAcl(repositoryId, $scope.rulesModel.toJSON()).then(() => {
            toastr.success($translate.instant('acl_management.rulestable.messages.rules_updated'));
        })
        .catch((data) => {
            const msg = getError(data);
            toastr.error(msg, $translate.instant('acl_management.errors.updating_rules'));
        }).finally(() => {
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

    const loadRules = () => {
        if ($repositories.getActiveRepository()) {
            $scope.loading = true;
            const repositoryId = getActiveRepository();
            AclManagementRestService.getAcl(repositoryId).then((response) => {
                $scope.rulesModel = mapAclRulesResponse(response);
            }).catch((data) => {
                const msg = getError(data);
                toastr.error(msg, $translate.instant('acl_management.errors.loading_rules'));
            }).finally(() => {
                $scope.loading = false;
            });
        }
    };

    const getActiveRepository = () => {
        return $repositories.getActiveRepository();
    };

    /**
     * Watching for repository changes and reload the rules, because they are stored per repository.
     */
    $scope.$watch(function () {
        return $repositories.getActiveRepository();
    }, function () {
        loadRules();
    });
}
