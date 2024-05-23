import * as angular from 'angular';
import decodeHTML from "../../utils/html-utils";

angular
    .module('graphdb.framework.impex.import.controllers.file-override-confirmation', [])
    .controller('FileOverrideConfirmationController', FileOverrideConfirmationController);

FileOverrideConfirmationController.$inject = ['$scope', '$uibModalInstance', '$translate', '$sce', 'duplicatedFiles'];

function FileOverrideConfirmationController($scope, $uibModalInstance, $translate, $sce, duplicatedFiles) {

    // =========================
    // Public variables
    // =========================

    $scope.message = $sce.trustAsHtml(decodeHTML($translate.instant('import.user_data.duplicates_confirmation.message', {duplicatedFiles: duplicatedFiles})));

    // =========================
    // Public functions
    // =========================

    $scope.cancel = () => {
        $uibModalInstance.dismiss();
    };

    $scope.keepBoth = () => {
        $uibModalInstance.close({
            overwrite: false
        });
    };

    $scope.overwrite = () => {
        $uibModalInstance.close({
            overwrite: true
        });
    };
}
