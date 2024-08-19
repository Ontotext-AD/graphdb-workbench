import {decodeHTML} from "../../../../app";

angular
    .module('graphdb.framework.aclmanagement.controllers.prefix-role-options.controller', [])
    .controller('PrefixRoleOptionsCtrl', PrefixRoleOptionsCtrl);

PrefixRoleOptionsCtrl.$inject = ['$scope', '$uibModalInstance', '$sce', '$translate'];

function PrefixRoleOptionsCtrl($scope, $uibModalInstance, $sce, $translate) {
    $scope.message = $sce.trustAsHtml(decodeHTML($translate.instant('acl_management.rulestable.prefix_dialog.warning_text')));

    $scope.keepPrefix = function () {
        $uibModalInstance.close({keep: true});
    };

    $scope.removePrefix = function () {
        $uibModalInstance.close({keep: false});
    };
}
