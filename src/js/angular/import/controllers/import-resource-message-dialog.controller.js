angular
    .module('graphdb.framework.impex.import.controllers.import-resource-message-dialog', [])
    .controller('ImportResourceMessageDialogController', ImportResourceMessageDialogController);

ImportResourceMessageDialogController.$inject = ['$scope', '$uibModalInstance', '$translate', 'toastr', 'message'];

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
                console.error('Could not copy text: ', err);
            });
    };
}
