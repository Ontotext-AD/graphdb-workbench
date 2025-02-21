import {
    FILENAME_PATTERN,
    NUMBER_PATTERN,
    REPOSITORY_TYPES,
    STATIC_RULESETS
} from "./repository.constants";
import {decodeHTML} from "../../../app";
import './controllers/manage-remote-location-dialog.controller';
import {RemoteLocationType} from "../models/repository/remote-location.model";
import 'angular/rest/cluster.rest.service';

const ENTITY_INDEX_SIZE_MIN = 10000;

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
    if (!params) {
        return;
    }

    Object.keys(params).forEach(key => {
        const param = params[key];
        if (param && typeof param.value === 'string') {
            const possibleNumber = parseFloat(params[key].value);
            if (!isNaN(possibleNumber) && numberParamToErrorKey[key]) {
                params[key].value = Number.isInteger(possibleNumber) ? parseInt(param.value, 10) : possibleNumber;
                // internal prop to indicate number value and save extra checks
                param.isNumber = true;
            }
        }
    });
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

const numberParamToErrorKey = {
    queryLimitResults: 'invalid.query.limit',
    queryTimeout: 'invalid.query.timeout',
    validationResultsLimitTotal: 'invalid.validation.results.limit.total',
    validationResultsLimitPerConstraint: 'invalid.validation.results.limit.per.constraint',
    joinWorkerThreads: 'invalid.join.worker.threads',
    leftJoinWorkerThreads: 'invalid.left.join.worker.threads',
    unionWorkerThreads: 'invalid.union.worker.threads',
    boundJoinBlockSize: 'invalid.bound.join.block.size',
    entityIndexSize: 'invalid.entity.index.size',
};

const getNumberFormatError = function (params, $translate) {
    if (!params) {
        return '';
    }

    const errorEntry = Object.keys(params).find((key) => {
        const param = params[key];
        return param.isNumber && !NUMBER_PATTERN.test(param.value);
    });

    return errorEntry && numberParamToErrorKey[errorEntry]
        ? $translate.instant(numberParamToErrorKey[errorEntry])
        : '';
};

const getDocBase = function (productInfo) {
    return `https://graphdb.ontotext.com/documentation/${productInfo.productShortVersion}`;
};
const filterLocations = function (result) {
    return result.filter((location) => location.isGraphDBLocation() && !location.errorMsg && !location.degradedReason);
};

/**
 * Gets the remote locations that are error free, without degraded reason and is not of type Ontopic
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
    'ngFileUpload',
    'graphdb.framework.repositories.controllers.manage-remote-location-dialog',
    'graphdb.framework.rest.cluster.service'
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
    'LocalStorageAdapter', '$interval', '$translate', '$q', 'GuidesService', 'ClusterRestService'];

function LocationsAndRepositoriesCtrl($scope, $rootScope, $uibModal, toastr, $repositories, ModalService, AuthTokenService, LocationsRestService,
    LocalStorageAdapter, $interval, $translate, $q, GuidesService, ClusterRestService) {

    $scope.RemoteLocationType = RemoteLocationType;
    $scope.loader = true;
    $scope.isInCluster = false;
    /**
     * @type {RemoteLocationModel[]}
     */
    $scope.locations = [];

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

    function getAndSetClusterStatus() {
        ClusterRestService.getNodeStatus().then(() => {
            // If the endpoint returns a success response, that means we have a cluster
            $scope.isInCluster = true;
        }).catch((error) => {
            if (error.status === 404) {
                $scope.isInCluster = false;
            } else {
                console.error('An unexpected error occurred:', error);
            }
        });
    }

    $scope.getLocalLocation = (local, locationType) => {
        const remoteLocationModel = $scope.locations.filter((location) => {
            let locationTypeCheck = true;
            if (locationType) {
                locationTypeCheck = location.locationType === locationType;
            }
            return locationTypeCheck && location.local === local;
        });
        return remoteLocationModel;
    };

    $scope.hasAnyRemoteLocation = (local, locationTypes) => {
        return locationTypes.some((locationType) => $scope.getLocalLocation(local, locationType).length > 0);
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

    $scope.addLocation = () => {
       $scope.openRemoteLocationDialog();
    };

    $scope.editLocation = (remoteLocation) => {
        if (remoteLocation.locationType === undefined) {
            // for backward compatibility. The old instances this property not exist so we assume it is GraphDB instance.
            remoteLocation.locationType = RemoteLocationType.GRAPH_DB;
        }
        $scope.openRemoteLocationDialog(remoteLocation);
    };

    /**
     * Opens the location dialog.
     * @param {RemoteLocationModel} remoteLocation (optional) If a location is passed, the dialog will open for editing; otherwise, it will open for registering a new one.
     */
    $scope.openRemoteLocationDialog = (remoteLocation) => {
        $uibModal.open({
            templateUrl: 'js/angular/repositories/templates/manage-remote-location-dialog.template.html',
            windowClass: 'addLocationDialog',
            controller: 'ManageRemoteLocationDialogController',
            resolve: {
                data: () => {
                    return {
                        remoteLocation
                    };
                }
            }
        }).result.then((dataAddLocation) => {
                if (remoteLocation) {
                    $scope.editLocationHttp(dataAddLocation);
                } else {
                    $scope.addLocationHttp(dataAddLocation);
                }
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
    getAndSetClusterStatus();
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
    $scope.entityIndexSizeMin = ENTITY_INDEX_SIZE_MIN;

    $scope.loader = true;
    $scope.pageTitle = $translate.instant('view.create.repo.title');
    $scope.repositoryInfo = {
        id: '',
        params: {},
        title: '',
        type: '',
        location: ''
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
        $scope.isInvalidEntityIndexSizeMin = $scope.repositoryInfo.params.entityIndexSize?.value < ENTITY_INDEX_SIZE_MIN;
        const numberFormatError = getNumberFormatError($scope.repositoryInfo.params, $translate);

        if (isInvalidPieFile) {
            toastr.error($translate.instant('invalid.ruleset.file.error'));
        } else if ($scope.isInvalidRepoName) {
            toastr.error($translate.instant('wrong.repo.name.error'));
        } else if ($scope.repositoryType === "fedx" && $scope.repositoryInfo.params.member.value.length === 0) {
            $scope.noMembersError();
        } else if (numberFormatError) {
            toastr.error(numberFormatError);
        } else if ($scope.isInvalidEntityIndexSizeMin){
            toastr.error($translate.instant('repo.error.entityIndex.min'));
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
    $scope.entityIndexSizeMin = ENTITY_INDEX_SIZE_MIN;

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
        $scope.isInvalidEntityIndexSizeMin = $scope.repositoryInfo.params.entityIndexSize?.value < ENTITY_INDEX_SIZE_MIN;
        const numberFormatError = getNumberFormatError($scope.repositoryInfo.params, $translate);
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
        } else if (numberFormatError) {
            toastr.error(numberFormatError);
        } else if ($scope.isInvalidEntityIndexSizeMin){
            toastr.error($translate.instant('repo.error.entityIndex.min'));
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
