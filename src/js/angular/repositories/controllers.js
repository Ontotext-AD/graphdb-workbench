import {
    FILENAME_PATTERN,
    NUMBER_PATTERN,
    REPOSITORY_TYPES,
    STATIC_RULESETS
} from "./repository.constants";
import {decodeHTML} from "../../../app";

export const getFileName = function (path) {
    let lastIdx = path.lastIndexOf('/');
    if (lastIdx === -1) {
        lastIdx = path.lastIndexOf('\\');
    }
    let name = path;
    if (lastIdx !== -1) {
        name = name.substring(lastIdx + 1);
    }
    return name;
};

const parseNumberParamsIfNeeded = function (params) {
    if (params) {
        if (params.queryTimeout) {
            params.queryTimeout.value = parseInt(params.queryTimeout.value);
        }
        if (params.queryLimitResults && params.validationResultsLimitTotal && params.validationResultsLimitPerConstraint) {
            // Parse parameters properly to number
            params.queryLimitResults.value = parseInt(params.queryLimitResults.value);
            params.validationResultsLimitTotal.value = parseInt(params.validationResultsLimitTotal.value);
            params.validationResultsLimitPerConstraint.value = parseInt(params.validationResultsLimitPerConstraint.value);
        } else if (params.leftJoinWorkerThreads && params.boundJoinBlockSize && params.joinWorkerThreads && params.unionWorkerThreads) {
            params.leftJoinWorkerThreads.value = parseInt(params.leftJoinWorkerThreads.value);
            params.boundJoinBlockSize.value = parseInt(params.boundJoinBlockSize.value);
            params.joinWorkerThreads.value = parseInt(params.joinWorkerThreads.value);
            params.unionWorkerThreads.value = parseInt(params.unionWorkerThreads.value);
        }
    }
};

const parseMemberParamIfNeeded = function (param) {
    if (param && param.member) {
        param.member.value = [];
    }
};

const getShaclOptionsClass = function () {
    const optionsModule = document.getElementById('shaclOptions');

    if (optionsModule) {
        const isAriaExpanded = optionsModule.getAttribute('aria-expanded');
        if (isAriaExpanded && isAriaExpanded === 'true') {
            return 'fa fa-angle-down';
        }
    }
    return 'fa fa-angle-right';
};

const validateNumberFields = function (params, invalidValues) {
    if (params.queryTimeout) {
        invalidValues.isInvalidQueryTimeout = !NUMBER_PATTERN.test(params.queryTimeout.value);
    }
    if (params.validationResultsLimitTotal && params.validationResultsLimitPerConstraint && params.queryLimitResults) {
        invalidValues.isInvalidValidationResultsLimitTotal = !NUMBER_PATTERN.test(params.validationResultsLimitTotal.value);
        invalidValues.isInvalidValidationResultsLimitPerConstraint = !NUMBER_PATTERN.test(params.validationResultsLimitPerConstraint.value);
        invalidValues.isInvalidQueryLimit = !NUMBER_PATTERN.test(params.queryLimitResults.value);
    } else if (params.leftJoinWorkerThreads && params.boundJoinBlockSize && params.joinWorkerThreads
        && params.unionWorkerThreads) {
        invalidValues.isInvalidLeftJoinWorkerThreads = !NUMBER_PATTERN.test(params.leftJoinWorkerThreads.value);
        invalidValues.isInvalidBoundJoinBlockSize = !NUMBER_PATTERN.test(params.boundJoinBlockSize.value);
        invalidValues.isInvalidJoinWorkerThreads = !NUMBER_PATTERN.test(params.joinWorkerThreads.value);
        invalidValues.isInvalidUnionWorkerThreads = !NUMBER_PATTERN.test(params.unionWorkerThreads.value);
    }
};

const getInvalidParameterErrorMessage = function (param, $translate) {
    if (param === "isInvalidQueryLimit") {
        return $translate.instant('invalid.query.limit');
    } else if (param === "isInvalidQueryTimeout") {
        return $translate.instant('invalid.query.timeout');
    } else if (param === "isInvalidValidationResultsLimitTotal") {
        return $translate.instant('invalid.validation.results.limit.total');
    } else if (param === "isInvalidValidationResultsLimitPerConstraint") {
        return $translate.instant('invalid.validation.results.limit.per.constraint');
    } else if (param === "isInvalidJoinWorkerThreads") {
        return $translate.instant('invalid.join.worker.threads');
    } else if (param === "isInvalidLeftJoinWorkerThreads") {
        return $translate.instant('invalid.left.join.worker.threads');
    } else if (param === "isInvalidUnionWorkerThreads") {
        return $translate.instant('invalid.union.worker.threads');
    } else if (param === "isInvalidBoundJoinBlockSize") {
        return $translate.instant('invalid.bound.join.block.size');
    }
};

const checkInvalidValues = function (invalidValues, $translate) {
    const invalidValuesKeys = Object.keys(invalidValues);
    const invalidValuesVal = Object.values(invalidValues);

    for (let i = 0; i < invalidValuesKeys.length; i++) {
        if (invalidValuesVal[i]) {
            return getInvalidParameterErrorMessage(invalidValuesKeys[i], $translate);
        }
    }
    return '';
};

const getDocBase = function (productInfo) {
    return `https://graphdb.ontotext.com/documentation/${productInfo.productShortVersion}`;
};
const filterLocations = function (result) {
    return result.filter((location) => !location.errorMsg && !location.degradedReason);
};

/**
 * Gets the remote locations that are error free and without degraded reason
 * @param {*} $repositories the repositories service
 * @return {[] | Promise} returns the locations as array or a promise of the array
 */
const getFilteredLocations = function ($repositories) {
    // Don't allow the user to create repository on location with error or degradeded reason
    return $repositories.getLocations().then((locations) => filterLocations(locations));
};

const modules = [
    'ngCookies',
    'ui.bootstrap',
    'graphdb.framework.core.services.repositories',
    'graphdb.framework.utils.localstorageadapter',
    'toastr',
    'ngFileUpload'
];

angular.module('graphdb.framework.repositories.controllers', modules)
    .controller('LocationsAndRepositoriesCtrl', LocationsAndRepositoriesCtrl)
    .controller('AddLocationCtrl', AddLocationCtrl)
    .controller('EditLocationCtrl', EditLocationCtrl)
    .controller('ChooseRepositoryCtrl', ChooseRepositoryCtrl)
    .controller('AddRepositoryCtrl', AddRepositoryCtrl)
    .controller('EditRepositoryCtrl', EditRepositoryCtrl)
    .controller('EditRepositoryFileCtrl', EditRepositoryFileCtrl)
    .controller('UploadRepositoryConfigCtrl', UploadRepositoryConfigCtrl);

LocationsAndRepositoriesCtrl.$inject = ['$scope', '$rootScope', '$uibModal', 'toastr', '$repositories', 'ModalService', 'AuthTokenService', 'LocationsRestService',
    'LocalStorageAdapter', '$interval', '$translate', '$q', 'GuidesService'];

function LocationsAndRepositoriesCtrl($scope, $rootScope, $uibModal, toastr, $repositories, ModalService, AuthTokenService, LocationsRestService,
    LocalStorageAdapter, $interval, $translate, $q, GuidesService) {
    $scope.loader = true;

    $scope.isLocationInactive = function (location) {
        return !location.active || !$scope.hasActiveLocation();
    };

    const getLocationsAbortRequestPromise = $q.defer();
    //Get locations
    function getLocations() {
        return $repositories.getLocations(getLocationsAbortRequestPromise)
            .then((locations) => {
                $scope.locations = locations;
                return locations;
            })
            .finally(() => $scope.loader = false);
    }

    $scope.hasActiveLocation = function () {
        return $repositories.hasActiveLocation();
    };

    $scope.getActiveLocation = function () {
        return $repositories.getActiveLocation();
    };

    $scope.getLocationError = function () {
        return $repositories.getLocationError();
    };

    $scope.getDegradedReason = function () {
        return $repositories.getDegradedReason();
    };

    $scope.getRepositories = function () {
        return $repositories.getRepositories();
    };

    $scope.isRepoActive = function (repo) {
        return $repositories.isRepoActive(repo);
    };

    //Delete location
    $scope.deleteLocation = function (uri) {
        ModalService.openSimpleModal({
            title: $translate.instant('location.confirm.detach'),
            message: $translate.instant('location.confirm.detach.warning', {uri: uri}),
            warning: true
        }).result
            .then(function () {
                $scope.loader = true;
                $repositories.deleteLocation(uri).finally(() => getLocations());
            });
    };

    //Add new location
    $scope.addLocationHttp = function (dataAddLocation) {
        $scope.loader = true;
        LocationsRestService.addLocation(dataAddLocation)
            .success(function () {
                //Reload locations and repositories
                $repositories.init();
            })
            .error(function (data) {
                const msg = getError(data);
                toastr.error(msg, $translate.instant('common.error'));
            })
            .finally(() => getLocations());
    };

    $scope.addLocation = function () {
        $uibModal.open({
            templateUrl: 'js/angular/templates/modal/add-location.html',
            windowClass: 'addLocationDialog',
            controller: 'AddLocationCtrl'
        }).result
            .then(function (dataAddLocation) {
                $scope.addLocationHttp(dataAddLocation);
            });
    };

    //Edit location
    $scope.editLocationHttp = function (dataEditLocation) {
        $scope.loader = true;
        LocationsRestService.editLocation(dataEditLocation)
            .success(function () {
                //Reload locations and repositories
                $repositories.init();
            })
            .error(function (data) {
                const msg = getError(data);
                toastr.error(msg, $translate.instant('common.error'));
            })
            .finally(() => getLocations());
    };

    $scope.editLocation = function (location) {
        const modalInstance = $uibModal.open({
            templateUrl: 'js/angular/templates/modal/edit-location.html',
            controller: 'EditLocationCtrl',
            resolve: {
                location: function () {
                    return location;
                }
            }
        });

        modalInstance.result.then(function (dataEditLocation) {
            $scope.editLocationHttp(dataEditLocation);
        }, function () {
        });
    };

    //Change repository
    $scope.setRepository = function (repo) {
        $repositories.setRepository(repo);
    };

    //Delete repository
    $scope.deleteRepository = function (repository) {
        ModalService.openSimpleModal({
            title: $translate.instant('common.confirm.delete'),
            message: decodeHTML($translate.instant('delete.repo.warning.msg', {repositoryId: repository.id})),
            warning: true
        }).result
            .then(function () {
                $scope.loader = true;
                $repositories.deleteRepository(repository)
                    .finally(() => {
                        getLocations();
                        $scope.loader = false;
                    });
                removeCachedGraphsOnDelete(repository);
            });
    };

    $scope.restartRepository = function (repository) {
        ModalService.openSimpleModal({
            title: $translate.instant('confirm.restart.repo'),
            message: decodeHTML($translate.instant('confirm.restart.repo.warning.msg', {repositoryId: repository.id})),
            warning: true
        }).result
            .then(function () {
                $scope.loader = true;
                $repositories.restartRepository(repository).finally(() => getLocations());
            });
    };

    $scope.toggleDefaultRepository = function (repositoryId) {
        if ($scope.getDefaultRepository() === repositoryId) {
            // unset
            $repositories.setDefaultRepository(null);
        } else {
            // set
            $repositories.setDefaultRepository(repositoryId);
        }
    };

    $scope.getDefaultRepository = function () {
        return $repositories.getDefaultRepository();
    };

    /* Unused, data urls don't behave well in all browsers, avoid them when possible
     $scope.getRepoTurtleConfig = function (repository) {
     function downloadRepoConfig(repoTurtleConfig, repository) {
     $('.download-turtle-config')
     .mouseup(function () {
     $(this)
     .attr('href', repoTurtleConfig)
     .attr('download', repository.id + '-config.ttl')
     });
     }

     $repositories.getRepositoryTurtleConfig(repository)
     .success(function (response) {
     var repoTurtleConfigDownload = 'data:application/octet-stream;charset=utf-8;base64,'
     + btoa(unescape(encodeURIComponent(response)));
     downloadRepoConfig(repoTurtleConfigDownload, repository);
     })
     .error(function () {
     toastr.error('Error getting repository configuration for '' + repository.id + ''');
     });
     };
     */

    $scope.getRepositoryDownloadLink = function (repository) {
        let url = `rest/repositories/${repository.id}${(repository.type === REPOSITORY_TYPES.ontop ? '/download-zip'
            : '/download-ttl')}?location=${repository.location}`;
        const token = AuthTokenService.getAuthToken();
        if (token) {
            url = `${url}&authToken=${encodeURIComponent(token)}`;
        }
        return url;
    };

    ///Copy to clipboard popover options
    $scope.copyToClipboard = function (uri) {
        ModalService.openCopyToClipboardModal(uri);
    };

    $scope.fromFile = function () {
        const modalInstance = $uibModal.open({
            templateUrl: 'js/angular/templates/modal/upload-repository-config.html',
            controller: 'UploadRepositoryConfigCtrl'
        });
        modalInstance.result.then(function () {
            $repositories.init();
        });
    };

    //Delete repository
    $scope.openActiveLocationSettings = function () {
        $uibModal.open({
            templateUrl: 'js/angular/settings/modal/location-settings.html',
            controller: 'ActiveLocationSettingsCtrl'
        });
    };

    getLocations();
    const timer = $interval(function () {
        if (GuidesService.isActive() && !$rootScope.guidePaused) {
            // Don't refresh list while a guide is active
            return;
        }

        // Update repositories state
        $repositories.initQuick();
        getLocations();
    }, 5000);

    $scope.$on('$destroy', function () {
        $interval.cancel(timer);
        // If there is a getLocations request in progress, abort it so the service can properly clear flags
        if (getLocationsAbortRequestPromise) {
            getLocationsAbortRequestPromise.resolve();
        }
    });

    function removeCachedGraphsOnDelete(repo) {
        const cashedDependenciesGraphPrefix = `dependencies-selectedGraph-${repo.id}`;
        const cashedClassHierarchyGraphPrefix = `classHierarchy-selectedGraph-${repo.id}`;
        angular.forEach(LocalStorageAdapter.keys(), function (key) {
            // remove everything but the hide prefixes setting, it should always persist
            if (key.startsWith(cashedClassHierarchyGraphPrefix) || key.startsWith(cashedDependenciesGraphPrefix)) {
                LocalStorageAdapter.remove(key);
            }
        });
    }

    $scope.getRepositoriesFromLocation = function (locationId) {
        return $repositories.getRepositoriesFromLocation(locationId);
    };
}

UploadRepositoryConfigCtrl.$inject = ['$scope', '$uibModalInstance', 'Upload', 'toastr', '$translate'];

function UploadRepositoryConfigCtrl($scope, $uibModalInstance, Upload, toastr, $translate) {
    $scope.upload = function (files) {
        if (files && files.length) {
            $scope.uploadFile = files[0];
        }
    };
    $scope.ok = function () {
        if ($scope.uploadFile) {
            $scope.uploadFileLoader = true;
            Upload.upload({
                url: 'rest/repositories',
                method: 'POST',
                data: {config: $scope.uploadFile}
            })
                .success(function () {
                    $scope.uploadFileLoader = false;
                    $uibModalInstance.close();
                })
                .error(function (data) {
                    const msg = getError(data);
                    toastr.error(msg, $translate.instant('common.error'));
                    $scope.uploadFileLoader = false;
                });
        }
    };
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
}

AddLocationCtrl.$inject = ['$scope', '$uibModalInstance', 'toastr', 'productInfo', '$translate'];

function AddLocationCtrl($scope, $uibModalInstance, toastr, productInfo, $translate) {

    $scope.newLocation = {
        'uri': '',
        'authType': 'none',
        'username': '',
        'password': '',
        'active': false
    };
    $scope.docBase = getDocBase(productInfo);

    $scope.isValidLocation = function () {
        return ($scope.newLocation.uri.length < 6 ||
                $scope.newLocation.uri.indexOf('http:') === 0 || $scope.newLocation.uri.indexOf('https:') === 0)
            && $scope.newLocation.uri.indexOf('/repositories') <= -1;
    };

    $scope.ok = function () {
        if (!$scope.newLocation) {
            toastr.error($translate.instant('location.cannot.be.empty.error'));
            return;
        }
        $uibModalInstance.close($scope.newLocation);
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
}

EditLocationCtrl.$inject = ['$scope', '$uibModalInstance', 'location', 'productInfo'];

function EditLocationCtrl($scope, $uibModalInstance, location, productInfo) {

    $scope.editedLocation = _.cloneDeep(location);
    $scope.docBase = getDocBase(productInfo);

    $scope.ok = function () {
        $uibModalInstance.close($scope.editedLocation);
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
}

ChooseRepositoryCtrl.$inject = ['$scope', '$location'];

function ChooseRepositoryCtrl($scope, $location) {
    $scope.repositoryTypes = REPOSITORY_TYPES;
    $scope.chooseRepositoryType = function (repoType) {
        $location.path(`${$location.path()}/${repoType}`);
    };
}

AddRepositoryCtrl.$inject = ['$rootScope', '$scope', 'toastr', '$repositories', '$location', '$timeout', 'Upload', '$routeParams',
    'RepositoriesRestService', '$translate'];

function AddRepositoryCtrl($rootScope, $scope, toastr, $repositories, $location, $timeout, Upload, $routeParams, RepositoriesRestService, $translate) {
    $scope.rulesets = STATIC_RULESETS.slice();
    $scope.repositoryTypes = REPOSITORY_TYPES;
    $scope.params = $routeParams;
    $scope.repositoryType = $routeParams.repositoryType;
    $scope.enable = true;

    $scope.loader = true;
    $scope.pageTitle = $translate.instant('view.create.repo.title');
    $scope.repositoryInfo = {
        id: '',
        params: {},
        title: '',
        type: '',
        location: ''
    };

    $scope.invalidValues = {
        isInvalidQueryTimeout: false,
        isInvalidQueryLimit: false,
        isInvalidLeftJoinWorkerThreads: false,
        isInvalidBoundJoinBlockSize: false,
        isInvalidJoinWorkerThreads: false,
        isInvalidUnionWorkerThreads: false,
        isInvalidValidationResultsLimitPerConstraint: false,
        isInvalidValidationResultsLimitTotal: false
    };

    getFilteredLocations($repositories)
        .then((locations) => {
            $scope.locations = locations;
        });

    $scope.changedLocation = function () {
        $scope.$broadcast('changedLocation');
    };

    function isValidEERepository(repositoryType) {
        return $scope.isEnterprise() && (repositoryType === REPOSITORY_TYPES.graphdbRepo);
    }

    function isValidSERepository(repositoryType) {
        return !$scope.isFreeEdition() && !$scope.isEnterprise() && repositoryType === REPOSITORY_TYPES.graphdbRepo;
    }

    function isValidFRRepository(repositoryType) {
        return $scope.isFreeEdition() && repositoryType === REPOSITORY_TYPES.graphdbRepo;
    }

    function isValidOntopRepository(repositoryType) {
        return repositoryType === REPOSITORY_TYPES.ontop;
    }

    function isValidFedXRepository(repositoryType) {
        return repositoryType === REPOSITORY_TYPES.fedx;
    }

    function isRepositoryTypeValid(repositoryType) {
        return isValidEERepository(repositoryType) || isValidSERepository(repositoryType)
            || isValidFRRepository(repositoryType) || isValidOntopRepository(repositoryType)
            || isValidFedXRepository(repositoryType);
    }

    function setPageTitle(repositoryType) {
        switch (repositoryType) {
            case REPOSITORY_TYPES.graphdbRepo:
                $scope.pageTitle = $translate.instant('view.create.repo.title', {repoType: 'GraphDB'});
                break;
            case REPOSITORY_TYPES.ontop:
                $scope.pageTitle = $translate.instant('view.create.repo.title', {repoType: 'Ontop Virtual SPARQL'});
                break;
            case REPOSITORY_TYPES.fedx:
                $scope.pageTitle = $translate.instant('view.create.repo.title', {repoType: 'FedX Virtual SPARQL'});
                break;
        }
    }

    $scope.getConfig = function (repoType) {
        RepositoriesRestService.getRepositoryConfiguration(repoType).then(function (resp) {
            const data = resp.data;
            $scope.repositoryInfo.params = data.params;
            $scope.repositoryInfo.type = data.type;
            parseNumberParamsIfNeeded($scope.repositoryInfo.params);
            parseMemberParamIfNeeded($scope.repositoryInfo.params);
            $scope.loader = false;
            // The clean way is the "autofocus" attribute and we use it but it doesn't seem to
            // work in all browsers because of the way dynamic content is handled so give it another
            // try here.
            $timeout(function () {
                // Focus the ID field
                angular.element(document).find('#id').focus();
            }, 50);
        }).catch(function (data) {
            const msg = getError(data);
            toastr.error(msg, $translate.instant('common.error'));
            $scope.loader = false;
        });
    };

    if ($scope.repositoryType && isRepositoryTypeValid($scope.repositoryType)) {
        $scope.repositoryInfo.type = $scope.repositoryType;
        $scope.getConfig($scope.repositoryType);
        setPageTitle($scope.repositoryType);
    } else {
        $location.path('/repository/create');
    }

    $scope.hasActiveLocation = function () {
        return $repositories.hasActiveLocation();
    };

    $scope.activeLocation = function () {
        return $repositories.getActiveLocation();
    };

    let isInvalidPieFile = false;
    $scope.uploadRuleset = function (files) {
        if (files && files.length) {
            $scope.uploadFile = files[0];
            $scope.uploadFileLoader = true;
            Upload.upload({
                url: 'rest/repositories/ruleset/upload',
                data: {ruleset: $scope.uploadFile, location: $scope.repositoryInfo.location}
            }).progress(function (evt) {
                /*						var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                 console.log('progress: ' + progressPercentage + '% ' + evt.config.file.name);*/
            }).success(function (data) {
                if (!data.success) {
                    toastr.error(data.errorMessage);
                    isInvalidPieFile = true;
                    $scope.uploadFile = '';
                } else {
                    isInvalidPieFile = false;
                    const fileName = $scope.uploadFile.name;
                    const newValue = {id: data.fileLocation, name: 'Custom: ' + fileName};
                    if ($scope.rulesetPie) {
                        // file was previously uploaded
                        $scope.rulesets[0] = newValue;
                    } else {
                        // file uploaded for the first time
                        $scope.rulesets.unshift(newValue);
                    }
                    $scope.rulesetPie = data.fileLocation;
                    $scope.rulesetPieFile = fileName;
                    $scope.repositoryInfo.params.ruleset.value = $scope.rulesetPie;
                }
                $scope.uploadFileLoader = false;
            }).error(function (data) {
                const msg = getError(data);
                toastr.error(msg, $translate.instant('common.error'));
                $scope.uploadFile = '';
                $scope.uploadFileLoader = false;
                isInvalidPieFile = true;
            });
        }
    };

    $scope.noMembersError = function () {
        toastr.error($translate.instant('fedx.create.repo.no.members.warning'));
    };

    $scope.goBackToPreviousLocation = function () {
        if (angular.isDefined($routeParams.previous)) {
            delete $location.$$search.previous;
            $location.path('/');
        } else {
            $location.path('/repository');
        }
    };

    $scope.createRepoHttp = function () {
        $scope.loader = true;
        RepositoriesRestService.createRepository($scope.repositoryInfo)
            .then(function () {
                toastr.success($translate.instant('created.repo.success.msg', {repoId: $scope.repositoryInfo.id}));
                return $repositories.init();
            })
            .then(() => $scope.goBackToPreviousLocation())
            .catch(function (error) {
                const msg = getError(error.data);
                toastr.error(msg, $translate.instant('common.error'));
            })
            .finally(() => {
                $scope.loader = false;
            });
    };

    $scope.createRepo = function () {
        if (!$scope.repositoryInfo.id) {
            toastr.error($translate.instant('empty.repoid.warning'));
            return;
        }

        $scope.isInvalidRepoName = !FILENAME_PATTERN.test($scope.repositoryInfo.id);
        validateNumberFields($scope.repositoryInfo.params, $scope.invalidValues);
        const invalidValues = checkInvalidValues($scope.invalidValues, $translate);

        if (isInvalidPieFile) {
            toastr.error($translate.instant('invalid.ruleset.file.error'));
        } else if ($scope.isInvalidRepoName) {
            toastr.error($translate.instant('wrong.repo.name.error'));
        } else if ($scope.repositoryType === "fedx" && $scope.repositoryInfo.params.member.value.length === 0) {
            $scope.noMembersError();
        } else if (invalidValues) {
            toastr.error(invalidValues);
        } else {
            $scope.createRepoHttp();
        }
    };

    $scope.rulesetWarning = function () {
        const pp = $scope.repositoryInfo.params;
        if (pp === undefined || pp.ruleset === undefined || pp.disableSameAs === undefined) {
            return '';
        }

        if (pp.ruleset.value.indexOf('owl') === 0 && pp.disableSameAs.value === 'true') {
            return $translate.instant('repoTooltips.rulesetWarnings.needsSameAs');
        } else if (pp.ruleset.value.indexOf('rdfs') === 0 && pp.disableSameAs.value === 'false') {
            return $translate.instant('repoTooltips.rulesetWarnings.doesntNeedSameAs');
        } else if (pp.ruleset.value === $scope.rulesetPie) {
            return $translate.instant('repoTooltips.rulesetWarnings.customRuleset');
        } else {
            return '';
        }
    };

    $scope.validateNumberInput = function () {
        validateNumberFields($scope.repositoryInfo.params, $scope.invalidValues);
    };

    $scope.getShaclOptionsClass = function () {
        return getShaclOptionsClass();
    };
    //TODO - check if repositoryID exist

    // Request auto-focus of the ID input when creating a repo (but not when editing)
    $scope.autofocusId = 'autofocus';

    const languageChangedSubscription = $rootScope.$on('$translateChangeSuccess', () => {
        setPageTitle($scope.repositoryType);
    });
    $scope.$on('$destroy', () => {
        languageChangedSubscription();
    });
}

EditRepositoryFileCtrl.$inject = ['$scope', '$uibModalInstance', 'RepositoriesRestService', 'file', 'toastr', '$translate', 'dialogTitle'];

function EditRepositoryFileCtrl($scope, $uibModalInstance, RepositoriesRestService, file, toastr, $translate, dialogTitle) {

    $scope.dialogTitle = dialogTitle ? dialogTitle : $translate.instant('update.file.content.header');
    if (file) {
        RepositoriesRestService.getRepositoryFileContent(file).success(function (data) {
            $scope.fileContent = data;
        }).error(function (data) {
            const msg = getError(data);
            toastr.error(msg, $translate.instant('common.error'));
        });
    }

    $scope.ok = function () {
        $uibModalInstance.close({
            content: $scope.fileContent,
            fileLocation: file
        });
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
}

EditRepositoryCtrl.$inject = ['$rootScope', '$scope', '$routeParams', 'toastr', '$repositories', '$location', 'ModalService', 'RepositoriesRestService',
    '$translate', 'MonitoringRestService'];

function EditRepositoryCtrl($rootScope, $scope, $routeParams, toastr, $repositories, $location, ModalService, RepositoriesRestService, $translate, MonitoringRestService) {

    $scope.rulesets = STATIC_RULESETS.slice();
    $scope.repositoryTypes = REPOSITORY_TYPES;

    $scope.editRepoPage = true;
    $scope.canEditRepoId = false;
    $scope.isRepoInCluster = true;
    $scope.params = $routeParams;
    $scope.loader = true;
    $scope.repositoryInfo = {};
    $scope.repositoryInfo.id = $scope.params.repositoryId;
    $scope.repositoryInfo.location = $scope.params.location;
    $scope.repositoryInfo.restartRequested = false;
    $scope.repositoryType = '';
    $scope.saveRepoId = $scope.params.repositoryId;
    $scope.pageTitle = $translate.instant('view.edit.repo.title', {repositoryId: $scope.params.repositoryId});
    $scope.invalidValues = {
        isInvalidQueryTimeout: false,
        isInvalidQueryLimit: false,
        isInvalidLeftJoinWorkerThreads: false,
        isInvalidBoundJoinBlockSize: false,
        isInvalidJoinWorkerThreads: false,
        isInvalidUnionWorkerThreads: false,
        isInvalidValidationResultsLimitPerConstraint: false,
        isInvalidValidationResultsLimitTotal: false
    };
    $scope.hasActiveLocation = function () {
        return $repositories.hasActiveLocation();
    };

    const loadRepositoryData = () => {
        return getFilteredLocations($repositories).then((locations) => {
            $scope.locations = locations;
            return RepositoriesRestService.getRepository($scope.repositoryInfo);
        });
    };

    const initView = (repositoryInfoResponse) => {
        const repositoryInfo = repositoryInfoResponse.data;
        if (angular.isDefined(repositoryInfo.params.ruleset)) {
            let ifRulesetExists = false;
            angular.forEach($scope.rulesets, function (item) {
                if (item.id === repositoryInfo.params.ruleset.value) {
                    ifRulesetExists = true;
                }
            });
            if (repositoryInfo.params.ruleset && !ifRulesetExists) {
                const name = getFileName(repositoryInfo.params.ruleset.value);
                $scope.rulesets.unshift({id: repositoryInfo.params.ruleset.value, name: 'Custom: ' + name});
            }
        }
        $scope.repositoryInfo = repositoryInfo;
        $scope.setRepositoryType(repositoryInfo.type);
        parseNumberParamsIfNeeded($scope.repositoryInfo.params);
        $scope.repositoryInfo.saveId = $scope.saveRepoId;
        $scope.loader = false;
    };

    $scope.$watch($scope.hasActiveLocation, function () {
        if ($scope.hasActiveLocation) {
            // Should get locations before getting repository info
            let repositoryInfoResponse;
            loadRepositoryData().then((repositoryInfo) => {
                repositoryInfoResponse = repositoryInfo;
                return MonitoringRestService.monitorActiveOperations($scope.repositoryInfo.id);
            }).then((monitoringResponse) => {
                $scope.isRepoInCluster = monitoringResponse.hasClusterOperation();
            }).catch((error) => {
                if (!repositoryInfoResponse) {
                    $scope.repositoryInfo = undefined;
                    return Promise.reject(error);
                }
                // the monitoring request failed, but we can still continue
                return Promise.resolve();
            }).then(() => {
                initView(repositoryInfoResponse);
            }).catch((response) => {
                const data = response.data;
                const status = response.status;
                const repositoryId = $routeParams.repositoryId;
                let toastrMsg;

                if (status === 404 && repositoryId !== 'system') {
                    toastrMsg = decodeHTML($translate.instant('edit.repo.error.not.exists', {repositoryId}));
                } else if (status === 404 && repositoryId === 'system') {
                    toastrMsg = decodeHTML($translate.instant('edit.system.repo.warning'));
                } else {
                    toastrMsg = getError(data);
                }

                toastr.error(toastrMsg, $translate.instant('common.error'), {allowHtml: true});

                if (status === 404) {
                    setTimeout(function () {
                        $scope.loader = false;
                        $location.path('repository');
                    }, 1000);
                } else {
                    $scope.loader = false;
                }
            });
        }
    });

    $scope.setRepositoryType = function (type) {
        $scope.repositoryType = type;
    };

    $scope.noMembersError = function () {
        toastr.error($translate.instant('fedx.create.repo.no.members.warning'));
    };

    $scope.editRepoHttp = function () {
        $scope.loader = true;
        RepositoriesRestService.editRepository($scope.repositoryInfo.saveId, $scope.repositoryInfo)
            .success(function () {
                toastr.success($translate.instant('edit.repo.success.msg', {saveId: $scope.repositoryInfo.saveId}));
                $repositories.init().finally(() => $scope.goBackToPreviousLocation());
                if ($scope.repositoryInfo.saveId === $scope.repositoryInfo.id && $scope.repositoryInfo.restartRequested) {
                    $repositories.restartRepository($scope.repositoryInfo);
                }
            }).error(function (data) {
            const msg = getError(data);
            toastr.error(msg, $translate.instant('common.error'));
            $scope.loader = false;
        });
    };

    $scope.editRepository = function () {
        $scope.isInvalidRepoName = !FILENAME_PATTERN.test($scope.repositoryInfo.id);
        validateNumberFields($scope.repositoryInfo.params, $scope.invalidValues);
        const invalidValues = checkInvalidValues($scope.invalidValues, $translate);
        let modalMsg = decodeHTML($translate.instant('edit.repo.save.changes.msg', {repoId: $scope.repositoryInfo.id}));
        if ($scope.repositoryInfo.saveId !== $scope.repositoryInfo.id) {
            modalMsg += decodeHTML($translate.instant('edit.repo.rename.changes.msg'));
        } else if ($scope.repositoryInfo.restartRequested) {
            modalMsg += decodeHTML($translate.instant('edit.repo.restart.requested.msg'));
        } else {
            modalMsg += decodeHTML($translate.instant('edit.repo.restart.needed.msg'));
        }
        if ($scope.isInvalidRepoName) {
            toastr.error($translate.instant('wrong.repo.name.error'));
        } else if ($scope.repositoryType === "fedx" && $scope.repositoryInfo.params.member.value.length === 0) {
            $scope.noMembersError();
        } else if (invalidValues) {
            toastr.error(invalidValues);
        } else {
            ModalService.openSimpleModal({
                title: $translate.instant('common.confirm.save'),
                message: modalMsg,
                warning: true
            }).result
                .then(function () {
                    $scope.editRepoHttp();
                });
        }
    };

    $scope.editRepositoryId = function () {
        if ($scope.isRepoInCluster) {
            return;
        }
        let msg = decodeHTML($translate.instant('edit.repo.id.warning.msg'));
        if ($scope.isEnterprise()) {
            msg += decodeHTML($translate.instant('edit.repo.id.cluster.warning.msg'));
        }
        ModalService.openSimpleModal({
            title: $translate.instant('confirm.enable.edit'),
            message: msg,
            warning: true
        }).result.then(function () {
            $scope.canEditRepoId = true;
        });
    };

    $scope.goBackToPreviousLocation = function () {
        if (angular.isDefined($routeParams.previous)) {
            delete $location.$$search.previous;
            $location.path('/');
        } else {
            $location.path('/repository');
        }
    };

    $scope.validateNumberInput = function () {
        validateNumberFields($scope.repositoryInfo.params, $scope.invalidValues);
    };

    $scope.getShaclOptionsClass = function () {
        return getShaclOptionsClass();
    };

    const languageChangedSubscription = $rootScope.$on('$translateChangeSuccess', () => {
        $scope.pageTitle = $translate.instant('view.edit.repo.title', {repositoryId: $scope.params.repositoryId});
    });
    $scope.$on('$destroy', () => {
        languageChangedSubscription();
    });
}
