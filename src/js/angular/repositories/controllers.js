import {
    FILENAME_PATTERN,
    NUMBER_PATTERN,
    REPOSITORY_TYPES,
    STATIC_RULESETS
} from "./repository.constants";
import {decodeHTML} from "../../../app";

export const getFileName = function(path) {
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
}

const parseMemberParamIfNeeded = function(param) {
    if (param && param.member) {
        param.member.value = [];
    }
}

const getShaclOptionsClass = function () {
    const optionsModule = document.getElementById('shaclOptions');

    if (optionsModule) {
        const isAriaExpanded = optionsModule.getAttribute('aria-expanded');
        if (isAriaExpanded && isAriaExpanded === 'true') {
            return 'fa fa-angle-down';
        }
    }
    return 'fa fa-angle-right';
}

const validateNumberFields = function (params, invalidValues) {
    if (params.queryTimeout) {
        invalidValues.isInvalidQueryTimeout = !NUMBER_PATTERN.test(params.queryTimeout.value);
    }
    if (params.validationResultsLimitTotal && params.validationResultsLimitPerConstraint && params.queryLimitResults) {
        invalidValues.isInvalidValidationResultsLimitTotal = !NUMBER_PATTERN.test(params.validationResultsLimitTotal.value);
        invalidValues.isInvalidValidationResultsLimitPerConstraint = !NUMBER_PATTERN.test(params.validationResultsLimitPerConstraint.value);
        invalidValues.isInvalidQueryLimit = !NUMBER_PATTERN.test(params.queryLimitResults.value);
    }
    else if (params.leftJoinWorkerThreads && params.boundJoinBlockSize && params.joinWorkerThreads
        && params.unionWorkerThreads) {
        invalidValues.isInvalidLeftJoinWorkerThreads = !NUMBER_PATTERN.test(params.leftJoinWorkerThreads.value);
        invalidValues.isInvalidBoundJoinBlockSize = !NUMBER_PATTERN.test(params.boundJoinBlockSize.value);
        invalidValues.isInvalidJoinWorkerThreads = !NUMBER_PATTERN.test(params.joinWorkerThreads.value);
        invalidValues.isInvalidUnionWorkerThreads = !NUMBER_PATTERN.test(params.unionWorkerThreads.value);
    }
}

const getInvalidParameterErrorMessage = function(param, $translate) {
    if(param === "isInvalidQueryLimit") {
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
}

const checkInvalidValues = function(invalidValues, $translate) {
    let invalidValuesKeys = Object.keys(invalidValues);
    let invalidValuesVal = Object.values(invalidValues);

    for (let i = 0; i < invalidValuesKeys.length; i++) {
        if (invalidValuesVal[i]) {
            return getInvalidParameterErrorMessage(invalidValuesKeys[i], $translate);
        }
    }
    return '';
}

const getDocBase = function (productInfo) {
    return `https://graphdb.ontotext.com/documentation/${productInfo.productShortVersion}/${productInfo.productType}`;
}
const filterLocations =  function (result) {
    return result.filter(location => !location.errorMsg && !location.degradedReason);
}
const getLocations = function ($repositories) {
    // Don't allow the user to create repository on location with error or degradeded reason
    const result = $repositories.getLocations();
    if (Array.isArray(result)) {
        return filterLocations(result);
    } else {
        result.success(function (locations) {
            return filterLocations(locations);
        })
    }
}

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

LocationsAndRepositoriesCtrl.$inject = ['$scope', '$modal', 'toastr', '$repositories', 'ModalService', '$jwtAuth', 'LocationsRestService', 'LocalStorageAdapter', '$interval', '$translate'];
function LocationsAndRepositoriesCtrl($scope, $modal, toastr, $repositories, ModalService, $jwtAuth, LocationsRestService, LocalStorageAdapter, $interval, $translate) {
    $scope.loader = true;

    $scope.isLocationInactive = function (location) {
        return !location.active || !$scope.hasActiveLocation();
    };

    //Get locations //TODO
    $scope.getLocations = function () {
        return $repositories.getLocations();
    };

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

    $scope.getLocationsLabels = function () {
        let locationsLabels = '';
        $repositories.getLocations().forEach(location => {
            locationsLabels += `${location.label}, `;
        })
        return locationsLabels;
    };

    $scope.isRepoActive = function (repo) {
        return $repositories.isRepoActive(repo);
    }

    //Delete location
    $scope.deleteLocation = function (uri) {
        ModalService.openSimpleModal({
            title: $translate.instant('location.confirm.detach'),
            message: $translate.instant('location.confirm.detach.warning', {uri: uri}),
            warning: true
        }).result
            .then(function () {
                $scope.loader = true;
                $repositories.deleteLocation(uri);
            });
    };

    //Add new location

    $scope.addLocationHttp = function (dataAddLocation) {
        $scope.loader = true;
        LocationsRestService.addLocation(dataAddLocation)
            .success(function (data) {
                $scope.locations = data;
                //Reload locations and repositories
                $repositories.init();
            })
            .error(function (data) {
                const msg = getError(data);
                toastr.error(msg, $translate.instant('common.error'));

                $scope.loader = false;
            });
    };

    $scope.addLocation = function () {
        $modal.open({
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
            .success(function (data) {
                $scope.locations = data;
                //Reload locations and repositories
                $repositories.init();
            }).error(function (data) {
                const msg = getError(data);
                toastr.error(msg, $translate.instant('common.error'));

                $scope.loader = false;
            });
    };

    $scope.editLocation = function (location) {
        const modalInstance = $modal.open({
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
                $repositories.deleteRepository(repository);
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
                $repositories.restartRepository(repository);
            });
    }

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
        let url = `rest/repositories/${repository.id}${(repository.type === REPOSITORY_TYPES.ontop ? '/download-zip': '/download-ttl')}?location=${repository.location}`;
        const token = $jwtAuth.getAuthToken();
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
        const modalInstance = $modal.open({
            templateUrl: 'js/angular/templates/modal/upload-repository-config.html',
            controller: 'UploadRepositoryConfigCtrl'
        });
        modalInstance.result.then(function () {
            $repositories.init();
        });
    };

    //Delete repository
    $scope.openActiveLocationSettings = function () {
        $modal.open({
            templateUrl: 'js/angular/settings/modal/location-settings.html',
            controller: 'ActiveLocationSettingsCtrl'
        });
    };

    const timer = $interval(function () {
        // Update repositories state
        $repositories.initQuick();
    }, 5000);

    $scope.$on('$destroy', function () {
        $interval.cancel(timer);
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
    }
}

UploadRepositoryConfigCtrl.$inject = ['$scope', '$modalInstance', 'Upload', 'toastr', '$translate'];

function UploadRepositoryConfigCtrl($scope, $modalInstance, Upload, toastr, $translate) {
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
                    $modalInstance.close();
                })
                .error(function (data) {
                    const msg = getError(data);
                    toastr.error(msg, $translate.instant('common.error'));
                    $scope.uploadFileLoader = false;
                });
        }
    };
    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
}

AddLocationCtrl.$inject = ['$scope', '$modalInstance', 'toastr', 'productInfo', '$translate'];

function AddLocationCtrl($scope, $modalInstance, toastr, productInfo, $translate) {

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
        $modalInstance.close($scope.newLocation);
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
}

EditLocationCtrl.$inject = ['$scope', '$modalInstance', 'location', 'productInfo'];

function EditLocationCtrl($scope, $modalInstance, location, productInfo) {

    $scope.editedLocation = angular.copy(location);
    $scope.docBase = getDocBase(productInfo);

    $scope.ok = function () {
        $modalInstance.close($scope.editedLocation);
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
}

ChooseRepositoryCtrl.$inject = ['$scope', '$location'];
function ChooseRepositoryCtrl($scope, $location) {
    $scope.repositoryTypes = REPOSITORY_TYPES;
    $scope.chooseRepositoryType = function (repoType) {
        $location.path(`${$location.path()}/${repoType}`);
    };
}

AddRepositoryCtrl.$inject = ['$scope', 'toastr', '$repositories', '$location', '$timeout', 'Upload', '$routeParams', 'RepositoriesRestService', '$translate'];

function AddRepositoryCtrl($scope, toastr, $repositories, $location, $timeout, Upload, $routeParams, RepositoriesRestService, $translate) {
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
        isInvalidJoinWorkerThreads : false,
        isInvalidUnionWorkerThreads : false,
        isInvalidValidationResultsLimitPerConstraint : false,
        isInvalidValidationResultsLimitTotal : false
    };

    $scope.locations = [];

    $scope.$watch($scope.hasActiveLocation, function () {
        if ($scope.hasActiveLocation) {
            $scope.locations = getLocations($repositories);
        }
    });

    $scope.changedLocation = function () {
        $scope.$broadcast('changedLocation');
    }

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
        RepositoriesRestService.getRepositoryConfiguration(repoType).success(function (data) {
            $scope.repositoryInfo.params = data.params;
            $scope.repositoryInfo.type = data.type;
            parseNumberParamsIfNeeded($scope.repositoryInfo.params);
            parseMemberParamIfNeeded($scope.repositoryInfo.params);
            $scope.loader = false;
            // The clean way is the "autofocus" attribute and we use it but it doesn't seem to
            // work in all browsers because of the way dynamic content is handled so give it another
            // try here.
            $timeout(function() {
                // Focus the ID field
                angular.element(document).find('#id').focus();
            }, 50);
        }).error(function (data) {
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
                } else {
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
        RepositoriesRestService.createRepository($scope.repositoryInfo).success(function () {
            toastr.success($translate.instant('created.repo.success.msg', {repoId: $scope.repositoryInfo.id}));
            $repositories.init($scope.goBackToPreviousLocation);
        }).error(function (data) {
            const msg = getError(data);
            toastr.error(msg, $translate.instant('common.error'));
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
    }

    $scope.getShaclOptionsClass = function () {
        return getShaclOptionsClass();
    }
    //TODO - check if repositoryID exist

    // Request auto-focus of the ID input when creating a repo (but not when editing)
    $scope.autofocusId = 'autofocus';
}

EditRepositoryFileCtrl.$inject = ['$scope', '$modalInstance', 'RepositoriesRestService', 'file', 'toastr', '$translate'];

function EditRepositoryFileCtrl($scope, $modalInstance, RepositoriesRestService, file, toastr, $translate) {

    if (file) {
        RepositoriesRestService.getRepositoryFileContent(file).success(function (data) {
            $scope.fileContent = data;
        }).error(function (data) {
            const msg = getError(data);
            toastr.error(msg, $translate.instant('common.error'));
        });
    }

    $scope.ok = function () {
        $modalInstance.close({
            content: $scope.fileContent,
            fileLocation: file
        });
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
}

EditRepositoryCtrl.$inject = ['$scope', '$routeParams', 'toastr', '$repositories', '$location', 'ModalService', 'RepositoriesRestService', '$translate'];

function EditRepositoryCtrl($scope, $routeParams, toastr, $repositories, $location, ModalService, RepositoriesRestService, $translate) {

    $scope.rulesets = STATIC_RULESETS.slice();
    $scope.repositoryTypes = REPOSITORY_TYPES;

    //TODO
    $scope.editRepoPage = true;
    $scope.canEditRepoId = false;
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
        isInvalidJoinWorkerThreads : false,
        isInvalidUnionWorkerThreads : false,
        isInvalidValidationResultsLimitPerConstraint : false,
        isInvalidValidationResultsLimitTotal : false
    };
    $scope.hasActiveLocation = function () {
        return $repositories.hasActiveLocation();
    };

    $scope.$watch($scope.hasActiveLocation, function () {
        if ($scope.hasActiveLocation) {
            // Should get locations before getting repository info
            $scope.locations = getLocations($repositories);
            RepositoriesRestService.getRepository($scope.repositoryInfo)
                .success(function (data) {
                    if (angular.isDefined(data.params.ruleset)) {
                        let ifRulesetExists = false;
                        angular.forEach($scope.rulesets, function (item) {
                            if (item.id === data.params.ruleset.value) {
                                ifRulesetExists = true;
                            }
                        });
                        if (data.params.ruleset && !ifRulesetExists) {
                            let name = getFileName(data.params.ruleset.value);
                            $scope.rulesets.unshift({id: data.params.ruleset.value, name: 'Custom: ' + name});
                        }
                    }
                    $scope.repositoryInfo = data;
                    $scope.setRepositoryType(data.type);
                    parseNumberParamsIfNeeded($scope.repositoryInfo.params);
                    $scope.repositoryInfo.saveId = $scope.saveRepoId;
                    $scope.loader = false;
                })
                .error(function (data, status) {
                    if (status === 404 && $routeParams.repositoryId !== 'system') {
                        toastr.error('Repo with name ' + '<b>' + $routeParams.repositoryId + '</b>' + ' doesn\'t exists', 'Error', {allowHtml: true});
                        $scope.loader = false;
                        $location.path('repository');
                    } else if (status === 404 && $routeParams.repositoryId === 'system') {
                        toastr.error($translate.instant('edit.system.repo.warning'), $translate.instant('common.error'), {allowHtml: true});
                        $scope.loader = false;
                        $location.path('repository');
                    } else {
                        const msg = getError(data);
                        toastr.error(msg, $translate.instant('common.error'));
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
                $repositories.init($scope.goBackToPreviousLocation);
                if ($scope.repositoryInfo.saveId === $scope.repositoryInfo.id && $scope.repositoryInfo.restartRequested) {
                    $repositories.restartRepository($scope.repositoryInfo.id);
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
        } else if(invalidValues) {
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
    }

    $scope.editRepositoryId = function () {
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
    }

    $scope.getShaclOptionsClass = function () {
        return getShaclOptionsClass();
    }
}
