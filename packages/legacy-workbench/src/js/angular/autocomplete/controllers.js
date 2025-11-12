import 'angular/rest/autocomplete.rest.service';
import {mapNamespacesResponse} from "../rest/mappers/namespaces-mapper";
import {decodeHTML} from "../../../app";
import 'angular/core/directives/validate-url.directive';
import {AutocompleteContextService, LicenseContextService, service} from "@ontotext/workbench-api";

const modules = [
    'toastr',
    'graphdb.framework.rest.autocomplete.service',
    'graphdb.framework.core.directives.validate-url'
];

angular
    .module('graphdb.framework.autocomplete.controllers', modules)
    .controller('AutocompleteCtrl', AutocompleteCtrl)
    .controller('AddLabelCtrl', AddLabelCtrl);

AutocompleteCtrl.$inject = [
    '$scope',
    '$interval',
    'toastr',
    '$repositories',
    '$uibModal',
    '$timeout',
    'RDF4JRepositoriesRestService',
    'UriUtils',
    'AutocompleteService',
    '$translate',
    'WorkbenchContextService'];

function AutocompleteCtrl(
    $scope,
    $interval,
    toastr,
    $repositories,
    $uibModal,
    $timeout,
    RDF4JRepositoriesRestService,
    UriUtils,
    AutocompleteService,
    $translate,
    WorkbenchContextService) {

    // =========================
    // Private variables
    // =========================
    const licenseContextService = service(LicenseContextService);
    let timer;

    function cancelTimer() {
        if (timer) {
            $interval.cancel(timer);
        }
    }

    $scope.pluginName = 'autocomplete';

    $scope.setPluginIsActive = function (isPluginActive) {
        $scope.pluginIsActive = isPluginActive;
    };

    const refreshEnabledStatus = function () {
        AutocompleteService.checkAutocompleteStatus()
            .then((autocompleteEnabled) => {
                $scope.autocompleteEnabled = autocompleteEnabled;
                WorkbenchContextService.setAutocompleteEnabled(autocompleteEnabled);
            })
            .catch((error) => {
                toastr.error(getError(error));
            });
    };

    const refreshIndexIRIs = function () {
        AutocompleteService.refreshIndexIRIs()
            .success(function (data) {
                $scope.shouldIndexIRIs = data;
            }).error(function (data) {
            toastr.error(getError(data));
        });
    };

    const refreshIndexStatus = function () {
        AutocompleteService.refreshIndexStatus()
            .success(function (data) {
                $scope.indexStatus = data;
            })
            .error(function (data) {
                toastr.error(getError(data));
            });
    };

    const refreshLabelConfig = function () {
        AutocompleteService.refreshLabelConfig()
            .success(function (data) {
                $scope.labelConfig = data;
            }).error(function (data) {
            toastr.error(getError(data));
        });
    };

    const validateAndNormalizeLabelIri = function (label, namespaces) {
        const labelIriText = UriUtils.expandPrefix(label.labelIri.toString(), namespaces);

        if (UriUtils.isValidIri(label, labelIriText) && labelIriText !== "") {
            label.labelIri = labelIriText;
            return true;
        }

        return false;
    }

    function showInvalidIriError(labelIri) {
        const errorMessage = decodeHTML(
            $translate.instant('not.valid.iri', { value: labelIri.toString() })
        );
        toastr.error(errorMessage);
    }

    function handleLabelConfigResponse(promise) {
        promise
            .then(() => {
                refreshLabelConfig();
                refreshIndexStatus();
            })
            .catch((error) => {
                toastr.error(getError(error));
            })
            .finally(() => {
                $scope.setLoader(false);
            });
    }

    const addLabelConfig = function (updatedLabel) {
        $scope.setLoader(true, $translate.instant('autocomplete.update'));

        if (validateAndNormalizeLabelIri(updatedLabel, $scope.namespaces)) {
            const response = AutocompleteService.addLabelConfig(updatedLabel);
            handleLabelConfigResponse(response);
        } else {
            showInvalidIriError(updatedLabel.labelIri);
            $scope.setLoader(false);
        }
    };

    const editLabelConfig = function (updatedLabel, originalLabel) {
        $scope.setLoader(true, $translate.instant('autocomplete.update'));

        if (validateAndNormalizeLabelIri(updatedLabel, $scope.namespaces)) {
            const response = AutocompleteService.editLabelConfig(updatedLabel, originalLabel);
            handleLabelConfigResponse(response);
        } else {
            showInvalidIriError(updatedLabel.labelIri);
            $scope.setLoader(false);
        }
    };

    const removeLabelConfig = function (label) {
        $scope.setLoader(true, $translate.instant('autocomplete.update'));

        AutocompleteService.removeLabelConfig(label)
            .success(function () {
                refreshLabelConfig();
                refreshIndexStatus();
            }).error(function (data) {
            toastr.error(getError(data));
        }).finally(function () {
            $scope.setLoader(false);
        });
    };

    $scope.checkForPlugin = function () {
        $scope.pluginFound = false;

        $scope.setLoader(true);

        AutocompleteService.checkForPlugin()
            .success(function (data) {
                $scope.pluginFound = data === true;
                if ($scope.pluginFound) {
                    loadNamespaces();
                    refreshEnabledStatus();
                    refreshIndexIRIs();
                    refreshIndexStatus();
                    refreshLabelConfig();
                } else {
                    $scope.autocompleteEnabled = false;
                    $scope.loading = false;
                }
            }).error(function (data) {
            toastr.error(getError(data));
        }).finally(function () {
            $scope.setLoader(false);
        });
    };

    const pullStatus = function () {
        timer = $interval(function () {
            $scope.$broadcast('checkIsActive');
            if ($scope.autocompleteEnabled) {
                refreshIndexStatus();
            }
        }, 5000);
    };

    $scope.$on("$destroy", function () {
        cancelTimer();
    });

    const canEnableAutocomplete = () => {
        return licenseContextService.getLicenseSnapshot().valid &&
            $repositories.getActiveRepository() &&
            !$repositories.isActiveRepoOntopType() &&
            !$repositories.isActiveRepoFedXType();
    };

    const init = function() {
        if (!canEnableAutocomplete()) {
            return;
        }
        $scope.checkForPlugin();
        pullStatus();
    };

    $scope.setLoader = function (loader, message) {
        $timeout.cancel($scope.loaderTimeout);
        if (loader) {
            $scope.loaderTimeout = $timeout(function () {
                $scope.loader = loader;
                $scope.loaderMessage = message;
            }, 300);
        } else {
            $scope.loader = false;
        }
    };

    $scope.getLoaderMessage = function () {
        return $scope.loaderMessage || $translate.instant('common.loading');
    };

    $scope.toggleAutocomplete = function () {
        const newValue = !$scope.autocompleteEnabled;
        $scope.setLoader(true, newValue ? $translate.instant('autocomplete.enabling') : $translate.instant('autocomplete.disabling'));

        AutocompleteService.toggleAutocomplete(newValue)
            .success(function () {
                refreshEnabledStatus();
                refreshIndexStatus();
                service(AutocompleteContextService).updateAutocompleteEnabled(newValue);
            }).error(function (data) {
            toastr.error(getError(data));
        }).finally(function () {
            $scope.setLoader(false);
        });
    };

    $scope.toggleIndexIRIs = function () {
        $scope.setLoader(true, ($translate.instant('autocomplete.index.iri')));

        AutocompleteService.toggleIndexIRIs(!$scope.shouldIndexIRIs)
            .success(function () {
                refreshIndexIRIs();
                refreshIndexStatus();
            }).error(function (data) {
            toastr.error(getError(data));
        }).finally(function () {
            $scope.setLoader(false);
        });
    };

    $scope.buildIndex = function () {
        $scope.setLoader(true, $translate.instant('autocomplete.index.build'));

        AutocompleteService.buildIndex()
            .success(function () {
                $scope.indexStatus = 'BUILDING';
            }).error(function (data) {
            toastr.error(getError(data));
        }).finally(function () {
            $scope.setLoader(false);
        });
    };

    $scope.interruptIndexing = function () {
        $scope.setLoader(true, $translate.instant('index.interrupt'));

        AutocompleteService.interruptIndexing()
            .success(function () {
                refreshIndexStatus();
            }).error(function (data) {
            toastr.error(getError(data));
        }).finally(function () {
            $scope.setLoader(false);
        });
    };

    $scope.getDegradedReason = function () {
        return $repositories.getDegradedReason();
    };

    $scope.addLabel = function () {
        $scope.editLabel({labelIri: '', languages: ''}, true);
    };

    $scope.editLabel = function (label, isNew) {
        const handleResult = isNew
            ? (result) => addLabelConfig(result.updated)
            : (result) => editLabelConfig(result.updated, result.original);

        $uibModal.open({
            templateUrl: 'js/angular/autocomplete/templates/modal/add-label.html',
            controller: 'AddLabelCtrl',
            resolve: {
                data: function () {
                    return {
                        label: label,
                        isNew: isNew
                    };
                }
            }
        }).result.then(handleResult);
    };

    $scope.removeLabel = function (label) {
        removeLabelConfig(label);
    };

    $scope.$on('repositoryIsSet', function () {
        cancelTimer();
        if (!canEnableAutocomplete()) {
            return;
        }
        $scope.checkForPlugin();
        pullStatus();
    });

    const loadNamespaces = () => {
        RDF4JRepositoriesRestService.getNamespaces($repositories.getActiveRepository())
            .then(mapNamespacesResponse)
            .then((namespacesModel) => {
                $scope.namespaces = namespacesModel;
            })
            .catch((response) => {
                const msg = getError(response);
                toastr.error(msg, $translate.instant('error.getting.namespaces.for.repo'));
            });
    };

    init();
}

AddLabelCtrl.$inject = ['$scope', '$uibModalInstance', '$timeout', 'data'];

function AddLabelCtrl($scope, $uibModalInstance, $timeout, data) {
    $scope.label = _.cloneDeep(data.label);
    $scope.originalLabel = _.cloneDeep(data.label);
    $scope.isNew = data.isNew;

    $scope.ok = function () {
        if ($scope.form.$valid) {
            $uibModalInstance.close({
                original: $scope.originalLabel,
                updated: $scope.label
            });
        }
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };

    $scope.setTemplate = function (iri) {
        $scope.label.labelIri = iri;
        $timeout(function () {
            $('#wb-autocomplete-languages').focus();
        }, 0);
    };
}
