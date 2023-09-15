import 'angular/rest/plugins.rest.service';
import 'angular/rest/aclmanagement.rest.service';
import {mapAclRulesResponse} from "../rest/mappers/aclmanagement-mapper";
import {ACListModel} from "./model";

const modules = [
    'graphdb.framework.rest.plugins.service',
    'graphdb.framework.rest.aclmanagement.service'
];

angular
    .module('graphdb.framework.aclmanagement.controllers', modules)
    .controller('AclManagementCtrl', AclManagementCtrl);

AclManagementCtrl.$inject = ['$scope', 'toastr', 'AclManagementRestService', '$repositories', '$translate'];

function AclManagementCtrl($scope, toastr, AclManagementRestService, $repositories, $translate) {

    //
    // Public fields
    //

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
     * A copy of the list with ACL rules that will be managed in this view. This is needed for restoring functionality.
     * @type {undefined|ACListModel}
     */
    $scope.rulesModelCopy = undefined;

    /**
     * The index of the rule which is currently moved up/down.
     * @type {undefined|number}
     */
    $scope.selectedRule = undefined;

    //
    // Public functions
    //

    /**
     * Adds a new rule at a given index.
     * @param {number} index
     */
    $scope.addRule= (index) => {
        // TODO: implement
    };

    /**
     * Edits a rule at a given index.
     * @param {number} index
     */
    $scope.editRule= (index) => {
        // TODO: implement
    };

    /**
     * Deletes a rule at a given index.
     * @param {number} index
     */
    $scope.deleteRule= (index) => {
        // TODO: implement
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

    //
    // Private functions
    //

    const loadRules = () => {
        if ($repositories.getActiveRepository()) {
            $scope.loading = true;
            const repositoryId = getActiveRepository();
            AclManagementRestService.getRules(repositoryId).success((response) => {
                $scope.rulesModel = mapAclRulesResponse(response);
                $scope.rulesModelCopy = new ACListModel([...$scope.rulesModel.aclRules]);
            }).error((data) => {
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
     * TODO: later when we have the create/edit operations we would need a confirmation before repo change in order to prevent data loss for the user.
     */
    $scope.$watch(function () {
        return $repositories.getActiveRepository();
    }, function () {
        loadRules();
    });

    //
    // initialization
    //
    const init = () => {
        loadRules();
    };

    init();
}
