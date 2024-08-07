import {TABS} from "../services/import-context.service";
import {Operation} from "./import-view.controller";
angular
    .module('graphdb.framework.impex.import.controllers.settings-modal', [])
    .controller('SettingsModalController', SettingsModalController);


export const SettingsModalActions = {
    UPLOAD_ONLY: 'upload_only',
    UPLOAD_AND_IMPORT: 'upload_and_import',
    CANCEL: 'cancel',
    CANCEL_IMPORT: 'cancel_import'
};

// TODO: combine all model parameters into one object!!!
SettingsModalController.$inject = ['$scope', '$uibModalInstance', 'toastr', 'UriUtils', '$translate', 'dialogModel'];

function SettingsModalController($scope, $uibModalInstance, toastr, UriUtils, $translate, dialogModel) {

    // =========================
    // Public variables
    // =========================

    $scope.settings = dialogModel.settings;
    $scope.hasParserSettings = dialogModel.hasParserSettings;
    $scope.isMultiple = dialogModel.isMultiple;
    $scope.enableReplace = !!($scope.settings.replaceGraphs && $scope.settings.replaceGraphs.length);
    $scope.showAdvancedSettings = false;
    $scope.activeTab = dialogModel.activeTab;
    $scope.userTabId = TABS.USER;
    $scope.isUploadOperation = dialogModel.operation === Operation.UPLOAD;

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
            $uibModalInstance.close(getDismissModel(SettingsModalActions.UPLOAD_AND_IMPORT));
        }
    };

    $scope.cancel = function () {
        fixSettings();
        $uibModalInstance.dismiss(getDismissModel(SettingsModalActions.CANCEL));
    };

    $scope.onlyUpload = function () {
        fixSettings();
        $uibModalInstance.dismiss(getDismissModel(SettingsModalActions.UPLOAD_ONLY));
    };

    $scope.cancelImport = function () {
        fixSettings();
        $uibModalInstance.dismiss(getDismissModel(SettingsModalActions.CANCEL_IMPORT));
    };

    $scope.close = function () {
        fixSettings();
        $uibModalInstance.dismiss(getDismissModel(SettingsModalActions.CANCEL));
    };

    $scope.reset = function () {
        $scope.settings = _.cloneDeep(dialogModel.defaultSettings);
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

    /**
     * Returns the model for the dismiss action.
     * @param {string} action The action to be performed.
     * @return {{settings: *, action}}
     */
    const getDismissModel = function (action) {
        return {
            settings: $scope.settings,
            action
        };
    };

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


