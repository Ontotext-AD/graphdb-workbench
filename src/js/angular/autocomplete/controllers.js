import 'angular/rest/autocomplete.rest.service';

const modules = [
    'toastr',
    'graphdb.framework.rest.autocomplete.service'
];

angular
    .module('graphdb.framework.autocomplete.controllers', modules)
    .controller('AutocompleteCtrl', AutocompleteCtrl)
    .controller('AddLabelCtrl', AddLabelCtrl);

AutocompleteCtrl.$inject = ['$scope', '$interval', 'toastr', '$repositories', '$modal', '$timeout', 'AutocompleteRestService'];

function AutocompleteCtrl($scope, $interval, toastr, $repositories, $modal, $timeout, AutocompleteRestService) {

    const refreshEnabledStatus = function () {
        AutocompleteRestService.checkAutocompleteStatus()
            .success(function (data) {
                $scope.autocompleteEnabled = data;
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
        $scope.setLoader(true, 'Updating label config...');

        AutocompleteRestService.addLabelConfig(label)
            .success(function () {
                refreshLabelConfig();
                refreshIndexStatus();
            }).error(function (data) {
                toastr.error(getError(data));
            }).finally(function () {
                $scope.setLoader(false);
            });
    };

    const removeLabelConfig = function (label) {
        $scope.setLoader(true, 'Updating label config...');

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

    const checkForPlugin = function () {
        $scope.pluginFound = false;

        if (!$repositories.getActiveRepository()) {
            return;
        }

        $scope.setLoader(true);

        AutocompleteRestService.checkForPlugin()
            .success(function (data) {
                $scope.pluginFound = data === true;
                if ($scope.pluginFound) {
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
        const timer = $interval(function () {
            if ($scope.autocompleteEnabled) {
                refreshIndexStatus();
            }
        }, 5000);

        $scope.$on("$destroy", function () {
            $interval.cancel(timer);
        });
    };

    const init = function() {
        if ($repositories.getActiveRepository()) {
            checkForPlugin();
        }

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
        return $scope.loaderMessage || 'Loading...';
    };

    $scope.toggleAutocomplete = function () {
        const newValue = !$scope.autocompleteEnabled;
        $scope.setLoader(true, newValue ? 'Enabling autocomplete...' : 'Disabling autocomplete...');

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
        $scope.setLoader(true, 'Setting index IRIs...');

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
        $scope.setLoader(true, 'Requesting index build...');

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
        $scope.setLoader(true, 'Interrupting index...');

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
        const modalInstance = $modal.open({
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
        if (!$repositories.getActiveRepository()) {
            return;
        }
        checkForPlugin();
    });

    init();
}

AddLabelCtrl.$inject = ['$scope', '$modalInstance', '$timeout', 'data'];

function AddLabelCtrl($scope, $modalInstance, $timeout, data) {
    $scope.label = angular.copy(data.label);
    $scope.isNew = data.isNew;

    $scope.ok = function () {
        if ($scope.form.$valid) {
            $modalInstance.close($scope.label);
        }
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };

    $scope.setTemplate = function (iri) {
        $scope.label.labelIri = iri;
        $timeout(function () {
            $('#wb-autocomplete-languages').focus();
        }, 0);
    };
}
