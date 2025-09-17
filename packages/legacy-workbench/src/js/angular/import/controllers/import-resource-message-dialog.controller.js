import {LoggerProvider} from "../../core/services/logger-provider";

angular
    .module('graphdb.framework.impex.import.controllers.import-resource-message-dialog', [])
    .controller('ImportResourceMessageDialogController', ImportResourceMessageDialogController);

ImportResourceMessageDialogController.$inject = ['$scope', '$uibModalInstance', '$translate', 'toastr', 'message'];

const logger = LoggerProvider.logger;

function ImportResourceMessageDialogController($scope, $uibModalInstance, $translate, toastr, message) {
    $scope.message = message;


    $scope.close = () => {
        $uibModalInstance.dismiss();
    };

    $scope.copyToClipboard = () => {
        navigator.clipboard.writeText($scope.message)
            .then(() => {
                toastr.success($translate.instant('import.help.messages.copied_to_clipboard'));
                $scope.close();
            }, (err) => {
                logger.error('Could not copy text: ', err);
            });
    };
}
