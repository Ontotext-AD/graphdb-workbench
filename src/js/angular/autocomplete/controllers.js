import 'angular/rest/autocomplete.rest.service';
import {mapNamespacesResponse} from "../rest/mappers/namespaces-mapper";
import {decodeHTML} from "../../../app";

const modules = [
    'toastr',
    'graphdb.framework.rest.autocomplete.service'
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
    '$licenseService',
    '$uibModal',
    '$timeout',
    'RDF4JRepositoriesRestService',
    'UriUtils',
    'AutocompleteRestService',
    'AutocompleteService',
    '$translate',
    'WorkbenchContextService'];

function AutocompleteCtrl(
    $scope,
    $interval,
    toastr,
    $repositories,
    $licenseService,
    $uibModal,
    $timeout,
    RDF4JRepositoriesRestService,
    UriUtils,
    AutocompleteRestService,
    AutocompleteService,
    $translate,
    WorkbenchContextService) {

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
                WorkbenchContextService.setAutocompleteEnabled(!$repositories.isActiveRepoFedXType() && $licenseService.isLicenseValid() && autocompleteEnabled);
            })
            .catch((error) => {
                toastr.error(getError(error));
            });
    };

    const refreshIndexIRIs = function () {
        AutocompleteRestService.refreshIndexIRIs()
            .success(function (data) {
                $scope.shouldIndexIRIs = data;
            }).error(function (data) {
            toastr.error(getError(data));
        });
    };

    const refreshIndexStatus = function () {
        AutocompleteRestService.refreshIndexStatus()
            .success(function (data) {
                $scope.indexStatus = data;
            })
            .error(function (data) {
                toastr.error(getError(data));
            });
    };

    const refreshLabelConfig = function () {
        AutocompleteRestService.refreshLabelConfig()
            .success(function (data) {
                $scope.labelConfig = data;
            }).error(function (data) {
            toastr.error(getError(data));
        });
    };

    const addLabelConfig = function (label) {
        $scope.setLoader(true, $translate.instant('autocomplete.update'));
        let labelIriText = label.labelIri.toString();
        labelIriText = UriUtils.expandPrefix(labelIriText, $scope.namespaces);
        if (UriUtils.isValidIri(label, labelIriText) && labelIriText !== "") {
            label.labelIri = labelIriText;
            AutocompleteRestService.addLabelConfig(label)
                .success(function () {
                    refreshLabelConfig();
                    refreshIndexStatus();
                }).error(function (data) {
                toastr.error(getError(data));
            }).finally(function () {
                $scope.setLoader(false);
            });
        } else {
            const errorMessage = decodeHTML($translate.instant('not.valid.iri', {value: label.labelIri.toString()}));
            toastr.error(errorMessage);
            $scope.setLoader(false);
        }
    };

    const removeLabelConfig = function (label) {
        $scope.setLoader(true, $translate.instant('autocomplete.update'));

        AutocompleteRestService.removeLabelConfig(label)
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

        AutocompleteRestService.checkForPlugin()
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

    const init = function() {
        if (!$licenseService.isLicenseValid() ||
            !$repositories.getActiveRepository() ||
            $repositories.isActiveRepoOntopType() ||
            $repositories.isActiveRepoFedXType()) {
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

        AutocompleteRestService.toggleAutocomplete(newValue)
            .success(function () {
                refreshEnabledStatus();
                refreshIndexStatus();
            }).error(function (data) {
            toastr.error(getError(data));
        }).finally(function () {
            $scope.setLoader(false);
        });
    };

    $scope.toggleIndexIRIs = function () {
        $scope.setLoader(true, ($translate.instant('autocomplete.index.iri')));

        AutocompleteRestService.toggleIndexIRIs(!$scope.shouldIndexIRIs)
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

        AutocompleteRestService.buildIndex()
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

        AutocompleteRestService.interruptIndexing()
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
        const modalInstance = $uibModal.open({
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
        });

        modalInstance.result.then(function (label) {
            addLabelConfig(label);
        });
    };

    $scope.removeLabel = function (label) {
        removeLabelConfig(label);
    };

    $scope.$on('repositoryIsSet', function () {
        cancelTimer();
        if (!$licenseService.isLicenseValid() ||
            !$repositories.getActiveRepository() ||
            $repositories.isActiveRepoOntopType() ||
            $repositories.isActiveRepoFedXType()) {
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
    $scope.isNew = data.isNew;

    $scope.ok = function () {
        if ($scope.form.$valid) {
            $uibModalInstance.close($scope.label);
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
