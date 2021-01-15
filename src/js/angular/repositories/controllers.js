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
    if (params && params.queryTimeout && params.queryLimitResults) {
        // Parse both parameters properly to number
        params.queryTimeout.value = parseInt(params.queryTimeout.value);
        params.queryLimitResults.value = parseInt(params.queryLimitResults.value);
    }
}

const getShaclOptionsClass = function () {
    let optionsModule = document.getElementById('shaclOptions');

    if (optionsModule) {
        let isAriaExpanded = optionsModule.getAttribute('aria-expanded');
        if (isAriaExpanded && isAriaExpanded === 'true') {
            return 'fa fa-angle-down';
        }
    }
    return 'fa fa-angle-right';
}

const filenamePattern = new RegExp('^[a-zA-Z0-9-_]+$');
const numberPattern = new RegExp('[0-9]');

const validateNumberFields = function (params, invalidValues) {
    if (params.queryTimeout && params.queryLimitResults) {
        invalidValues.isInvalidQueryTimeout = !numberPattern.test(params.queryTimeout.value);
        invalidValues.isInvalidQueryLimit = !numberPattern.test(params.queryLimitResults.value);
    }
}

const staticRulesets = [
    {id: 'empty', name: 'No inference'},
    {id: 'rdfs-optimized', name: 'RDFS (Optimized)'},
    {id: 'rdfs', name: 'RDFS'},
    {id: 'rdfsplus-optimized', name: 'RDFS-Plus (Optimized)'},
    {id: 'owl-horst-optimized', name: 'OWL-Horst (Optimized)'},
    {id: 'owl-horst', name: 'OWL-Horst'},
    {id: 'owl2-ql-optimized', name: 'OWL2-QL (Optimized)'},
    {id: 'owl2-ql', name: 'OWL2-QL'},
    {id: 'owl-max-optimized', name: 'OWL-Max (Optimized)'},
    {id: 'owl-max', name: 'OWL-Max'},
    {id: 'owl2-rl-optimized', name: 'OWL2-RL (Optimized)'},
    {id: 'owl2-rl', name: 'OWL2-RL'},

];

const REPOSITORY_TYPES = {free: 'free', eeWorker: 'worker', eeMaster: 'master', ontop: 'ontop', se: 'se'};
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

LocationsAndRepositoriesCtrl.$inject = ['$scope', '$modal', 'toastr', '$repositories', 'ModalService', '$jwtAuth', 'LocationsRestService', 'LocalStorageAdapter', '$interval'];
function LocationsAndRepositoriesCtrl($scope, $modal, toastr, $repositories, ModalService, $jwtAuth, LocationsRestService, LocalStorageAdapter, $interval) {
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

    //Delete location
    $scope.deleteLocation = function (uri) {
        ModalService.openSimpleModal({
            title: 'Confirm detach',
            message: 'Are you sure you want to detach the location \'' + uri + '\'?',
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
                toastr.error(msg, 'Error');

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
                toastr.error(msg, 'Error');

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

    $scope.activateLocationRequest = function (location) {
        $scope.loader = true;
        const data = {
            'uri': location.uri
        };
        LocationsRestService.enableLocation(data)
            .success(function () {
                $repositories.setRepository('');
                $repositories.init();
            }).error(function (data) {
                const msg = getError(data);
                toastr.error(msg, 'Error');
                document.getElementById('switch-' + location.$$hashKey).checked = false;
            });
    };

    //Activate location
    $scope.activateLocation = function (location) {
        //This has to be fixed
        // if (document.getElementById('switch-' + location.$$hashKey).checked == true) {
        //     return;
        // }
        if ($scope.hasActiveLocation()) {
            ModalService.openSimpleModal({
                title: 'Confirm location change',
                message: 'Are you sure you want to change the location?',
                warning: true
            }).result
                .then(function () {
                    $scope.activateLocationRequest(location);
                }, function () {
                    document.getElementById('switch-' + location.$$hashKey).checked = false;
                });
        } else {
            $scope.activateLocationRequest(location);
        }
    };

    //Change repository
    $scope.setRepository = function (id) {
        $repositories.setRepository(id);
    };

    //Delete repository
    $scope.deleteRepository = function (repositoryId) {
        ModalService.openSimpleModal({
            title: 'Confirm delete',
            message: `<p>Are you sure you want to delete the repository <strong>${repositoryId}</strong>?</p>
                      <p><span class="icon-2x icon-warning" style="color: #d54a33"/>
                            All data in the repository will be lost.</p>`,
            warning: true
        }).result
            .then(function () {
                $scope.loader = true;
                $repositories.deleteRepository(repositoryId);
                removeCachedGraphsOnDelete(repositoryId);
            });
    };

    $scope.restartRepository = function (repositoryId) {
        ModalService.openSimpleModal({
            title: 'Confirm restart',
            message: `<p>Are you sure you want to restart the repository <strong>${repositoryId}</strong>?</p>
                        <p><span class="icon-2x icon-warning" style="color: #d54a33"/>
                            The repository will be shut down immediately and all running queries
                            and updates will be cancelled.</p>`,
            warning: true
        }).result
            .then(function () {
                $scope.loader = true;
                $repositories.restartRepository(repositoryId);
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
        let url = 'rest/repositories/' + repository.id + (repository.type === REPOSITORY_TYPES.ontop ? '/downloadZip': '/download');
        const token = $jwtAuth.getAuthToken();
        if (token) {
            url = url + '?authToken=' + encodeURIComponent(token);
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

    function removeCachedGraphsOnDelete(repoId) {
        const cashedDependenciesGraphPrefix = `dependencies-selectedGraph-${repoId}`;
        const cashedClassHierarchyGraphPrefix = `classHierarchy-selectedGraph-${repoId}`;
        angular.forEach(LocalStorageAdapter.keys(), function (key) {
            // remove everything but the hide prefixes setting, it should always persist
            if (key.startsWith(cashedClassHierarchyGraphPrefix) || key.startsWith(cashedDependenciesGraphPrefix)) {
                LocalStorageAdapter.remove(key);
            }
        });
    }

}

UploadRepositoryConfigCtrl.$inject = ['$scope', '$modalInstance', 'Upload', 'toastr'];

function UploadRepositoryConfigCtrl($scope, $modalInstance, Upload, toastr) {
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
                    toastr.error(msg, 'Error');
                    $scope.uploadFileLoader = false;
                });
        }
    };
    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
}

AddLocationCtrl.$inject = ['$scope', '$modalInstance', 'toastr', 'productInfo'];

function AddLocationCtrl($scope, $modalInstance, toastr, productInfo) {

    $scope.newLocation = {
        'uri': '',
        'authType': 'none',
        'username': '',
        'password': '',
        'active': false
    };
    $scope.docBase = 'https://graphdb.ontotext.com/documentation/' + productInfo.productShortVersion
        + '/' + productInfo.productType;

    $scope.isValidLocation = function () {
        return ($scope.newLocation.uri.length < 6 ||
            $scope.newLocation.uri.indexOf('http:') === 0 || $scope.newLocation.uri.indexOf('https:') === 0)
            && $scope.newLocation.uri.indexOf('/repositories') <= -1;
    };

    $scope.ok = function () {
        if (!$scope.newLocation) {
            toastr.error('Location cannot be empty');
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
    $scope.docBase = 'https://graphdb.ontotext.com/documentation/' + productInfo.productShortVersion
        + '/' + productInfo.productType;

    $scope.ok = function () {
        $modalInstance.close($scope.editedLocation);
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
}

ChooseRepositoryCtrl.$inject = ['$scope', '$location', 'isEnterprise', 'isFreeEdition'];
function ChooseRepositoryCtrl($scope, $location, isEnterprise, isFreeEdition) {
    $scope.pageTitle = 'Choose repository';
    $scope.repositoryTypes = REPOSITORY_TYPES;
    $scope.isEnterprise = isEnterprise;
    $scope.isFreeEdition = isFreeEdition;

    $scope.chooseRepositoryType = function (repoType) {
        $location.path($location.path() + '/' + repoType);
    };
}

AddRepositoryCtrl.$inject = ['$scope', 'toastr', '$repositories', '$location', 'Upload', 'isEnterprise', 'isFreeEdition', '$routeParams', 'RepositoriesRestService'];

function AddRepositoryCtrl($scope, toastr, $repositories, $location, Upload, isEnterprise, isFreeEdition, $routeParams, RepositoriesRestService) {
    $scope.rulesets = staticRulesets.slice();
    $scope.repositoryTypes = REPOSITORY_TYPES;
    $scope.params = $routeParams;
    $scope.repositoryType = $routeParams.repositoryType;

    $scope.loader = true;
    $scope.pageTitle = 'Create Repository';
    $scope.repositoryInfo = {
        id: '',
        params: {},
        title: '',
        type: ''
    };

    $scope.isEnterprise = isEnterprise;
    $scope.isFreeEdition = isFreeEdition;
    $scope.invalidValues = {
        isInvalidQueryTimeout: false,
        isInvalidQueryLimit: false
    };

    function isValidEERepository(repositoryType) {
        return $scope.isEnterprise && (repositoryType === REPOSITORY_TYPES.eeMaster
            || repositoryType === REPOSITORY_TYPES.eeWorker);
    }

    function isValidSERepository(repositoryType) {
        return !$scope.isFreeEdition && !$scope.isEnterprise && repositoryType === REPOSITORY_TYPES.se;
    }

    function isValidFRRepository(repositoryType) {
        return $scope.isFreeEdition && repositoryType === REPOSITORY_TYPES.free;
    }
    function isValidOntopRepository(repositoryType) {
        return repositoryType === REPOSITORY_TYPES.ontop;
    }

    function isRepositoryTypeValid(repositoryType) {
        return isValidEERepository(repositoryType) || isValidSERepository(repositoryType)
            || isValidFRRepository(repositoryType) || isValidOntopRepository(repositoryType);
    }

    function setPageTitle(repositoryType) {
        switch (repositoryType) {
            case REPOSITORY_TYPES.free:
                $scope.pageTitle = 'Create GraphDB Free repository';
                break;
            case REPOSITORY_TYPES.eeWorker:
                $scope.pageTitle = 'Create GraphDB EE Worker repository';
                break;
            case REPOSITORY_TYPES.eeMaster:
                $scope.pageTitle = 'Create GraphDB EE Master repository';
                break;
            case REPOSITORY_TYPES.se:
                $scope.pageTitle = 'Create GraphDB SE repository';
                break;
            case REPOSITORY_TYPES.ontop:
                $scope.pageTitle = 'Create Ontop Virtual SPARQL repository';
                break;
        }
    }

    $scope.getConfig = function (repoType) {
        RepositoriesRestService.getRepositoryConfiguration(repoType).success(function (data) {
            $scope.repositoryInfo.params = data.params;
            $scope.repositoryInfo.type = data.type;
            parseNumberParamsIfNeeded($scope.repositoryInfo.params);
            $scope.loader = false;
        }).error(function (data) {
            const msg = getError(data);
            toastr.error(msg, 'Error');
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
                url: 'rest/repositories/uploadRuleSet',
                data: {ruleset: $scope.uploadFile}
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
                toastr.error(msg, 'Error');
                $scope.uploadFile = '';
                $scope.uploadFileLoader = false;
            });
        }
    };

    $scope.formError = function () {
        toastr.error('There is an error in the form!');
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
            toastr.success('The repository ' + $scope.repositoryInfo.id + ' has been created.');
            $repositories.init($scope.goBackToPreviousLocation);
        }).error(function (data) {
            const msg = getError(data);
            toastr.error(msg, 'Error');
            $scope.loader = false;
        });
    };

    $scope.createRepo = function () {
        if (!$scope.repositoryInfo.id) {
            toastr.error('Repository ID cannot be empty');
            return;
        }

        $scope.isInvalidRepoName = !filenamePattern.test($scope.repositoryInfo.id);
        validateNumberFields($scope.repositoryInfo.params, $scope.invalidValues);

        if (isInvalidPieFile) {
            toastr.error('Invalid rule-set file. Please upload a valid one.');
        } else if (!$scope.isInvalidRepoName && !$scope.isInvalidQueryLimit && !$scope.isInvalidQueryTimeout) {
            $scope.createRepoHttp();
        } else {
            $scope.formError();
        }
    };

    $scope.rulesetWarning = function () {
        const pp = $scope.repositoryInfo.params;
        if (pp === undefined || pp.ruleset === undefined || pp.disableSameAs === undefined) {
            return '';
        }

        if (pp.ruleset.value.indexOf('owl') === 0 && pp.disableSameAs.value === 'true') {
            return 'Disabling owl:sameAs for this ruleset may cause incomplete inference with owl:sameAs statements.';
        } else if (pp.ruleset.value.indexOf('rdfs') === 0 && pp.disableSameAs.value === 'false') {
            return 'This ruleset does not need owl:sameAs, consider disabling it.';
        } else if (pp.ruleset.value === $scope.rulesetPie) {
            return 'This custom ruleset may or may not depend on owl:sameAs.';
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
}

EditRepositoryFileCtrl.$inject = ['$scope', '$modalInstance', 'RepositoriesRestService', 'file', 'toastr'];

function EditRepositoryFileCtrl($scope, $modalInstance, RepositoriesRestService, file, toastr) {

    if (file) {
        RepositoriesRestService.getRepositoryFileContent(file).success(function (data) {
            $scope.fileContent = data;
        }).error(function (data) {
            const msg = getError(data);
            toastr.error(msg, 'Error');
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

EditRepositoryCtrl.$inject = ['$scope', '$routeParams', 'toastr', '$repositories', '$location', 'ModalService', 'isEnterprise', 'isFreeEdition', 'RepositoriesRestService'];

function EditRepositoryCtrl($scope, $routeParams, toastr, $repositories, $location, ModalService, isEnterprise, isFreeEdition, RepositoriesRestService) {

    $scope.rulesets = staticRulesets.slice();
    $scope.repositoryTypes = REPOSITORY_TYPES;

    //TODO
    $scope.editRepoPage = true;
    $scope.canEditRepoId = false;
    $scope.params = $routeParams;
    $scope.loader = true;
    $scope.isEnterprise = isEnterprise;
    $scope.isFreeEdition = isFreeEdition;
    $scope.repositoryInfo = {};
    $scope.repositoryInfo.id = $scope.params.repositoryId;
    $scope.repositoryInfo.restartRequested = false;
    $scope.repositoryType = '';
    $scope.saveRepoId = $scope.params.repositoryId;
    $scope.pageTitle = 'Edit Repository: ' + $scope.params.repositoryId;
    $scope.invalidValues = {
        isInvalidQueryTimeout: false,
        isInvalidQueryLimit: false
    };
    $scope.hasActiveLocation = function () {
        return $repositories.hasActiveLocation();
    };

    $scope.$watch($scope.hasActiveLocation, function () {
        if ($scope.hasActiveLocation) {
            RepositoriesRestService.getRepository($scope.repositoryInfo.id)
                .success(function (data) {
                    if (angular.isDefined(data.params.ruleset)) {
                        let ifRulesetExists = false;
                        angular.forEach($scope.rulesets, function (item) {
                            if (item.id === data.params.ruleset.value) {
                                ifRulesetExists = true;
                            }
                        });
                        if (data.params.ruleset && ifRulesetExists) {
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
                        toastr.error('<b>System</b> repository can\'t be edited', 'Error', {allowHtml: true});
                        $scope.loader = false;
                        $location.path('repository');
                    } else {
                        const msg = getError(data);
                        toastr.error(msg, 'Error');
                        $scope.loader = false;
                    }
                });
        }
    });

    $scope.setRepositoryType = function (type) {
        $scope.repositoryType = type;
    };

    $scope.formError = function () {
        toastr.error('There is an error in the form!');
    };

    $scope.editRepoHttp = function () {
        $scope.loader = true;
        RepositoriesRestService.editRepository($scope.repositoryInfo.saveId, $scope.repositoryInfo)
            .success(function () {
                toastr.success('The repository ' + $scope.repositoryInfo.saveId + ' has been edited.');
                $repositories.init($scope.goBackToPreviousLocation);
                if ($scope.repositoryInfo.saveId === $scope.repositoryInfo.id && $scope.repositoryInfo.restartRequested) {
                    $repositories.restartRepository($scope.repositoryInfo.id);
                }
            }).error(function (data) {
            const msg = getError(data);
            toastr.error(msg, 'Error');
            $scope.loader = false;
        });
    };

    $scope.editRepository = function () {
        $scope.isInvalidRepoName = !filenamePattern.test($scope.repositoryInfo.id);
        validateNumberFields($scope.repositoryInfo.params, $scope.invalidValues);
        let modalMsg = `Save changes to repository <strong>${$scope.repositoryInfo.id}</strong>?<br><br>`;
        if ($scope.repositoryInfo.saveId !== $scope.repositoryInfo.id) {
            modalMsg += `<span class="icon-2x icon-warning" style="color: #d54a33"/>
                        The repository will be stopped and renamed.`;
        } else if ($scope.repositoryInfo.restartRequested) {
            modalMsg += `<span class="icon-2x icon-warning" style="color: #d54a33"/>
                        The repository will be restarted.`;
        } else {
            modalMsg += `<span class="icon-2x icon-warning" style="color: #d54a33"/>
                        Repository restart required for changes to take effect.`;
        }
        if (!$scope.isInvalidRepoName && !$scope.isInvalidQueryTimeout && !$scope.isInvalidQueryLimit) {
            ModalService.openSimpleModal({
                title: 'Confirm save',
                message: modalMsg,
                warning: true
            }).result
                .then(function () {
                    $scope.editRepoHttp();
                });
        } else {
            $scope.formError();
        }
    }

    $scope.editRepositoryId = function () {
        let msg = '<p>Changing the repository ID is a dangerous operation since it renames the repository folder and enforces repository shutdown.</p>';
        if ($scope.isEnterprise) {
            msg += '<p>If your repository is in a cluster, it is your responsibility to update the cluster after renaming.</p>';
        }
        ModalService.openSimpleModal({
            title: 'Confirm enable edit',
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
