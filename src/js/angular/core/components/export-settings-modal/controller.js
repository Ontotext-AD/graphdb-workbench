import {find} from "lodash";

angular
    .module('graphdb.framework.core.components.export-settings-modal', [])
    .controller('ExportSettingsCtrl', ExportSettingsCtrl);

ExportSettingsCtrl.$inject = ['$scope', '$uibModalInstance'];
export function ExportSettingsCtrl($scope, $uibModalInstance) {
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
    $scope.defaultMode = find($scope.JSONLDModes, {name: "expanded"});
    $scope.currentMode = $scope.defaultMode;
    $scope.link = null;

    $scope.setJSONLDSettingsToLocalStorage = function (formName, formLink, link) {
        localStorage.setItem(jsonldExportSettings, JSON.stringify({
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

    const jsonldExportSettings = 'ls.jsonld-export-settings';

    const init = function () {
        if (localStorage.getItem(jsonldExportSettings)) {
            $scope.currentMode = find($scope.JSONLDModes, {name: JSON.parse(localStorage.getItem(jsonldExportSettings)).jsonldFormName});
            $scope.link = JSON.parse(localStorage.getItem(jsonldExportSettings)).jsonldLink;
        }
    };

    init();
}
