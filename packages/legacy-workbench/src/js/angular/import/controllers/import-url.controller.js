angular
    .module('graphdb.framework.impex.import.controllers.import-url', [])
    .controller('ImportUrlController', ImportUrlController);

ImportUrlController.$inject = ['$scope', '$uibModalInstance', 'toastr'];

function ImportUrlController($scope, $uibModalInstance) {

    // =========================
    // Public variables
    // =========================

    $scope.importFormat = {name: 'Auto', type: ''};
    $scope.startImport = true;

    // =========================
    // Public functions
    // =========================

    $scope.cancel = function () {
        $uibModalInstance.dismiss();
    };

    $scope.ok = function () {
        $uibModalInstance.close({
            url: $scope.dataUrl,
            format: $scope.importFormat.type,
            startImport: $scope.startImport
        });
    };
}

