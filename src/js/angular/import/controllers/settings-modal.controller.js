angular
    .module('graphdb.framework.impex.import.controllers.settings-modal', [])
    .controller('SettingsModalController', SettingsModalController);

SettingsModalController.$inject = ['$scope', '$uibModalInstance', 'toastr', 'UriUtils', 'settings', 'hasParserSettings', 'defaultSettings', 'isMultiple', '$translate'];

function SettingsModalController($scope, $uibModalInstance, toastr, UriUtils, settings, hasParserSettings, defaultSettings, isMultiple, $translate) {

    // =========================
    // Public variables
    // =========================

    $scope.settings = settings;
    $scope.hasParserSettings = hasParserSettings;
    $scope.isMultiple = isMultiple;
    $scope.enableReplace = !!($scope.settings.replaceGraphs && $scope.settings.replaceGraphs.length);
    $scope.showAdvancedSettings = false;

    // =========================
    // Public functions
    // =========================

    $scope.hasError = function (error, input) {
        return _.find(error, function (o) {
            return input === o['$name'];
        });
    };

    $scope.ok = function () {
        // resets the validity of a field only used for temporary things
        $scope.settingsForm.replaceGraph.$setValidity('replaceGraph', true);

        if ($scope.settingsForm.$valid) {
            fixSettings();
            $uibModalInstance.close($scope.settings);
        }
    };

    $scope.cancel = function () {
        fixSettings();
        $uibModalInstance.dismiss($scope.settings);
    };

    $scope.reset = function () {
        $scope.settings = _.cloneDeep(defaultSettings);
        $scope.target = 'data';
    };

    $scope.addReplaceGraph = function (graph) {
        let valid = true;
        if (graph !== 'default') {
            valid = UriUtils.isValidIri(graph, graph.toString());
        }
        $scope.settingsForm.replaceGraph.$setTouched();
        $scope.settingsForm.replaceGraph.$setValidity('replaceGraph', valid);

        if ($scope.settingsForm.replaceGraph.$valid) {
            $scope.settings.replaceGraphs = $scope.settings.replaceGraphs || [];
            if (_.indexOf($scope.settings.replaceGraphs, graph) === -1) {
                $scope.replaceGraph = '';
                $scope.settings.replaceGraphs.push(graph);
            } else {
                toastr.warning($translate.instant('import.graph.already.in.list'));
            }
        }
    };

    $scope.checkEnterReplaceGraph = function (event, graph) {
        if (event.keyCode === 13) {
            event.preventDefault();
            $scope.addReplaceGraph(graph);
        }
    };

    $scope.switchParserSettings = function () {
        $scope.showAdvancedSettings = !$scope.showAdvancedSettings;
    };

    // =========================
    // Private functions
    // =========================

    const fixSettings = function () {
        if ($scope.target === 'default') {
            $scope.settings.context = 'default';
        } else if ($scope.target === 'data') {
            $scope.settings.context = '';
        }
        if ($scope.enableReplace) {
            if ($scope.target === 'default' || $scope.target === 'named') {
                $scope.settings.replaceGraphs = [$scope.settings.context];
            }
        } else {
            $scope.settings.replaceGraphs = [];
        }
    };

    // =========================
    // Initialization
    // =========================

    const init = function () {
        if ($scope.settings.context) {
            if ($scope.settings.context === 'default') {
                $scope.target = 'default';
                $scope.settings.context = '';
            } else {
                $scope.target = 'named';
            }
        } else {
            $scope.target = 'data';
        }
    };
    init();
}


