import 'angular/rest/autocomplete.rest.service';

const modules = [
    'toastr',
    'graphdb.framework.rest.autocomplete.service'
];

angular
    .module('graphdb.framework.autocomplete.controllers', modules)
    .controller('AutocompleteCtrl', AutocompleteCtrl)
    .controller('AddLabelCtrl', AddLabelCtrl);

AutocompleteCtrl.$inject = ['$scope', '$interval', 'toastr', '$repositories', '$licenseService', '$uibModal', '$timeout', 'RDF4JRepositoriesRestService', 'UriUtils', 'AutocompleteRestService', '$autocompleteStatus', '$translate'];

function AutocompleteCtrl($scope, $interval, toastr, $repositories, $licenseService, $uibModal, $timeout, RDF4JRepositoriesRestService, UriUtils, AutocompleteRestService, $autocompleteStatus, $translate) {

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
        AutocompleteRestService.checkAutocompleteStatus()
            .success(function (data) {
                $scope.autocompleteEnabled = data;
                $autocompleteStatus.setAutocompleteStatus(data);
            }).error(function (data) {
            toastr.error(getError(data));
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
        const labelIriText = label.labelIri;
        label.labelIri = UriUtils.expandPrefix(label.labelIri, $scope.namespaces);
        if (UriUtils.isValidIri(label, label.labelIri) && label.labelIri !== "") {
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
            toastr.error($translate.instant('not.valid.iri', {value: labelIriText}));
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
                    initNamespaces();
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

    const initNamespaces = function () {
        RDF4JRepositoriesRestService.getNamespaces($scope.getActiveRepository())
            .success(function (data) {
                const nss = _.map(data.results.bindings, function (o) {
                    return {'uri': o.namespace.value, 'prefix': o.prefix.value};
                });
                $scope.namespaces = _.sortBy(nss, function (n) {
                    return n.uri.length;
                });
            }).error(function (data) {
            toastr.error($translate.instant('get.namespaces.error.msg', {error: getError(data)}));
        });
    };

    init();
}

AddLabelCtrl.$inject = ['$scope', '$uibModalInstance', '$timeout', 'data'];

function AddLabelCtrl($scope, $uibModalInstance, $timeout, data) {
    $scope.label = angular.copy(data.label);
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
