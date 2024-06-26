angular
    .module('graphdb.framework.core.components.export-settings-modal', [
        'graphdb.framework.utils.localstorageadapter'
    ])
    .controller('ExportSettingsCtrl', ExportSettingsCtrl);

ExportSettingsCtrl.$inject = ['$scope', '$uibModalInstance', 'LocalStorageAdapter', 'LSKeys', 'format'];
export function ExportSettingsCtrl($scope, $uibModalInstance, LocalStorageAdapter, LSKeys, format) {
    $scope.JSONLDModes = [
        {name: "framed", link: "http://www.w3.org/ns/json-ld#framed"},
        {name: "expanded", link: "http://www.w3.org/ns/json-ld#expanded"},
        {name: "flattened", link: "http://www.w3.org/ns/json-ld#flattened"},
        {name: "compacted", link: "http://www.w3.org/ns/json-ld#compacted"}
    ];

    $scope.JSONLDModesNames = $scope.JSONLDModes.reduce(function (acc, cur) {
        acc[cur.name] = cur.name;
        return acc;
    }, {});

    $scope.JSONLDFramedModes = [$scope.JSONLDModesNames.framed];
    $scope.JSONLDContextModes = [$scope.JSONLDModesNames.compacted, $scope.JSONLDModesNames.flattened];
    $scope.defaultMode = $scope.JSONLDModes.find((mode) => mode.name === 'expanded');
    $scope.currentMode = $scope.defaultMode;
    $scope.link = null;
    $scope.fileFormat = format.toLowerCase();
    $scope.setJSONLDSettingsToLocalStorage = function (formName, formLink, link) {
        LocalStorageAdapter.set(LSKeys.JSONLD_EXPORT_SETTINGS, JSON.stringify({
            jsonldFormName: formName,
            jsonldFormLink: formLink,
            jsonldLink: link
        }));
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss();
    };

    $scope.reset = function () {
        $scope.currentMode = $scope.defaultMode;
        $scope.link = "";
        $scope.setJSONLDSettingsToLocalStorage($scope.currentMode.name, $scope.currentMode.link, $scope.link);
    };

    $scope.clearLinkInput = function () {
        $scope.link = "";
        $scope.setJSONLDSettingsToLocalStorage($scope.currentMode.name, $scope.currentMode.link, $scope.link);
    };

    $scope.exportJsonLD = function () {
        $scope.setJSONLDSettingsToLocalStorage($scope.currentMode.name, $scope.currentMode.link, $scope.link);
        $uibModalInstance.close({
            currentMode: $scope.currentMode,
            link: $scope.link
        });
    };

    const init = function () {
        const jsonldSettingsModel = LocalStorageAdapter.get(LSKeys.JSONLD_EXPORT_SETTINGS);
        if (jsonldSettingsModel) {
            $scope.currentMode = $scope.JSONLDModes.find((mode) => mode.name === jsonldSettingsModel.jsonldFormName);
            $scope.link = jsonldSettingsModel.jsonldLink;
        }
    };

    init();
}
