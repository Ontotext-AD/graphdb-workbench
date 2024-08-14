import 'angular/chatgpt/controllers/ttyg-view.controller';

const modules = [
    'toastr',
    'graphdb.framework.utils.localstorageadapter'
];

angular
    .module('graphdb.framework.chatgpt.controllers', modules)
    .controller('AgentSettingsDialogCtrl', AgentSettingsDialogCtrl);

AgentSettingsDialogCtrl.$inject = ['$scope', '$translate', '$uibModalInstance', 'data'];

function AgentSettingsDialogCtrl($scope, $translate, $uibModalInstance, data) {
    $scope.dialogTitle = $translate.instant('ttyg.settings.title');

    $scope.save = function () {
        if ($scope.form.$valid) {
            const askSettings = {
                queryTemplate: JSON.parse($scope.queryTemplate),
                groundTruths: $scope.groundTruths.split("\n"),
                topK: $scope.topK,
                echoVectorQuery: $scope.echoVectorQuery
            };
            $uibModalInstance.close({
                askSettings,
                connectorID: $scope.connectorID
            });
        }
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };

    $scope.connectorID = data.connectorID;
    $scope.queryTemplate = JSON.stringify(data.askSettings.queryTemplate, null, '  ');
    $scope.topK = data.askSettings.topK;
    $scope.echoVectorQuery = data.askSettings.echoVectorQuery;
    $scope.groundTruths = data.askSettings.groundTruths
        .map((s) => s.trim())
        .filter((s) => s !== '')
        .join("\n");
}
