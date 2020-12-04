const filenamePattern = new RegExp('^[a-zA-Z0-9-_]+$');
const numberPattern = new RegExp('[0-9]');

const staticRulesets = [
    {id: 'empty', name: 'No inference'},
    {id: 'rdfs', name: 'RDFS'},
    {id: 'owl-horst', name: 'OWL-Horst'},
    {id: 'owl-max', name: 'OWL-Max'},
    {id: 'owl2-ql', name: 'OWL2-QL'},
    {id: 'owl2-rl', name: 'OWL2-RL'},
    {id: 'rdfs-optimized', name: 'RDFS (Optimized)'},
    {id: 'rdfsplus-optimized', name: 'RDFS-Plus (Optimized)'},
    {id: 'owl-horst-optimized', name: 'OWL-Horst (Optimized)'},
    {id: 'owl-max-optimized', name: 'OWL-Max (Optimized)'},
    {id: 'owl2-ql-optimized', name: 'OWL2-QL (Optimized)'},
    {id: 'owl2-rl-optimized', name: 'OWL2-RL (Optimized)'}
];

const ONTOP_REPO_PARAM_LABELS = {obdaFile: 'obda or r2rml file', owlFile: 'ontology file', propertiesFile: 'properties file', constraintFile: 'constraint file'};
const ONTOP_REPO_PARAMS = _.keys(ONTOP_REPO_PARAM_LABELS);
const REQUIRED_ONTOP_REPO_PARAMS = ['obdaFile', 'propertiesFile'];

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
    .controller('AddRepositoryCtrl', AddRepositoryCtrl)
    .controller('EditRepositoryCtrl', EditRepositoryCtrl)
    .controller('EditRepositoryFileCtrl', EditRepositoryFileCtrl)
    .controller('UploadRepositoryConfigCtrl', UploadRepositoryConfigCtrl);

const editFile = function(file, $modal, $scope, RepositoriesRestService, toastr) {

        const modalInstance = $modal.open({
            templateUrl: 'js/angular/templates/modal/editRepoFile.html',
            controller: 'EditRepositoryFileCtrl',
            resolve: {
                file: function () {
                    return $scope.repositoryInfo.params[file] ? $scope.repositoryInfo.params[file].value : '';
                }
            }
        });

        modalInstance.result.then(function (data) {
            // send data to backend
            RepositoriesRestService.updateRepositoryFileContent(data.fileLocation, data.content).success(function(data) {
                $scope.ontopRepoFileNames[file] = getFileName(data.fileLocation);
                $scope.repositoryInfo.params[file].value = data.fileLocation;
            }).error(function (data) {
                const msg = getError(data);
                toastr.error(msg, 'Error');
            })
        });
    }

const uploadRepoFile = function (files, param, Upload, $scope) {
    if (files && files.length) {
        $scope.uploadFile = files[0];
        $scope.uploadFileLoader = true;
        Upload.upload({
            url: 'rest/repositories/uploadFile',
            data: {uploadFile: $scope.uploadFile}
        })
            .success(function (data) {
                if (!data.success) {
                    toastr.error(data.errorMessage);
                } else {
                    $scope.ontopRepoFileNames[param] = $scope.uploadFile.name;
                    $scope.repositoryInfo.params[param].value = data.fileLocation;
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

const getFileName = function(path) {
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

LocationsAndRepositoriesCtrl.$inject = ['$scope', '$modal', 'toastr', '$repositories', 'ModalService', '$jwtAuth', 'LocationsRestService', 'LocalStorageAdapter'];
function LocationsAndRepositoriesCtrl($scope, $modal, toastr, $repositories, ModalService, $jwtAuth, LocationsRestService, LocalStorageAdapter) {
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
            message: 'Are you sure you want to delete the repository \'' + repositoryId + '\'?' +
            '<p>All data in the repository will be lost.</p>',
            warning: true
        }).result
            .then(function () {
                $scope.loader = true;
                $repositories.deleteRepository(repositoryId);
                removeCachedGraphsOnDelete(repositoryId);
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
        let url = 'rest/repositories/' + repository.id + (repository.type === 'ontop' ? '/downloadZip': '/download');
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

    $repositories.init();

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

AddLocationCtrl.$inject = ['$scope', '$modalInstance'];

function AddLocationCtrl($scope, $modalInstance) {

    $scope.advanced = false;
    $scope.newLocation = {
        'uri': '',
        'username': '',
        'password': '',
        'active': false
    };
    $scope.switchAdvanced = function () {
        $scope.advanced = !$scope.advanced;
    };

    $scope.isValidLocation = function () {
        return ($scope.newLocation.uri.length < 6 ||
            $scope.newLocation.uri.indexOf('http:') === 0 || $scope.newLocation.uri.indexOf('https:') === 0)
            && $scope.newLocation.uri.indexOf('/repositories') <= -1;
    };

    $scope.ok = function () {
        $modalInstance.close($scope.newLocation);
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
}

EditLocationCtrl.$inject = ['$scope', '$modalInstance', 'location'];

function EditLocationCtrl($scope, $modalInstance, location) {

    $scope.editedLocation = angular.copy(location);
    $scope.ok = function () {
        $modalInstance.close($scope.editedLocation);
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
}

AddRepositoryCtrl.$inject = ['$scope', 'toastr', '$repositories', '$location', 'Upload', 'isEnterprise', 'isFreeEdition', '$routeParams', 'RepositoriesRestService', '$modal'];

function AddRepositoryCtrl($scope, toastr, $repositories, $location, Upload, isEnterprise, isFreeEdition, $routeParams, RepositoriesRestService, $modal) {

    $scope.rulesets = staticRulesets.slice();

    $scope.loader = true;
    $scope.pageTitle = 'Create Repository';
    $scope.repositoryInfo = {
        id: '',
        params: {},
        title: '',
        type: ''
    };

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

    $scope.ontopRepoFiles = ONTOP_REPO_PARAMS;
    $scope.ontopRepoFileLabels = ONTOP_REPO_PARAM_LABELS;

    $scope.isRequiredOntopRepoFile = function(file) {
        return REQUIRED_ONTOP_REPO_PARAMS.indexOf(file) > -1;
    };
    $scope.ontopRepoFileNames = {};


    $scope.uploadOntopRepoFile = function(files, param) {
        uploadRepoFile(files, param, Upload, $scope);
    };

    $scope.isOntopRepoFileUploaded = function() {
        return $scope.repositoryInfo.params.propertiesFile &&
                $scope.repositoryInfo.params.propertiesFile.value.length > 0
    };

    $scope.validateOntopPropertiesConnection = function() {
        RepositoriesRestService.validateOntopPropertiesConnection($scope.repositoryInfo.params.propertiesFile).success(function () {
            toastr.success('Connection is successful');
        }).error(function (data) {
            const msg = getError(data);
            toastr.error(msg, 'Failed to connect');
        });
    }

    $scope.isEnterprise = isEnterprise;
    $scope.isFreeEdition = isFreeEdition;

    $scope.getConfig = function (repoType) {
        RepositoriesRestService.getRepositoryConfiguration(repoType).success(function (data) {
            $scope.repositoryInfo.params = data.params;
            $scope.repositoryInfo.type = data.type;
            $scope.loader = false;
        }).error(function (data) {
            const msg = getError(data);
            toastr.error(msg, 'Error');
            $scope.loader = false;
        });
    };

    if ($scope.isEnterprise) {
        $scope.getConfig('worker');
    } else if ($scope.isFreeEdition) {
        $scope.getConfig('free');
    } else {
        $scope.getConfig('se');
    }

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
            toastr.error('Repository id cannot be empty');
            return;
        }
        if ($scope.repositoryInfo.type === 'ontop') {
            const missingRequired = REQUIRED_ONTOP_REPO_PARAMS.filter(function(requiredFile) {
               return !$scope.repositoryInfo.params[requiredFile].value;
            });
            if (missingRequired.length > 0) {
                toastr.error('Missing required ontop repo file');
                return;
            }
        }
        $scope.isInvalidRepoName = !filenamePattern.test($scope.repositoryInfo.id);
        const repoParams = $scope.repositoryInfo.params;
        if (repoParams.entityIndexSize && repoParams.queryLimitResults && repoParams.queryTimeout) {
            $scope.isInvalidEntityIndexSize = !numberPattern.test($scope.repositoryInfo.params.entityIndexSize.value);
            $scope.isInvalidQueryTimeout = !numberPattern.test($scope.repositoryInfo.params.queryTimeout.value);
            $scope.isInvalidQueryLimit = !numberPattern.test($scope.repositoryInfo.params.queryLimitResults.value);
        }
        if (isInvalidPieFile) {
            toastr.error('Invalid rule-set file. Please upload a valid one.');
        } else if (!$scope.isInvalidRepoName && !$scope.isInvalidEntityIndexSize && !$scope.isInvalidQueryLimit && !$scope.isInvalidQueryTimeout) {
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

    $scope.editFile = function(file) {
        editFile(file, $modal, $scope, RepositoriesRestService, toastr);
    };

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

EditRepositoryCtrl.$inject = ['$scope', '$routeParams', 'toastr', '$repositories', '$location', 'ModalService', 'isEnterprise', 'isFreeEdition', 'RepositoriesRestService', '$modal', 'Upload'];

function EditRepositoryCtrl($scope, $routeParams, toastr, $repositories, $location, ModalService, isEnterprise, isFreeEdition, RepositoriesRestService, $modal, Upload) {

    $scope.rulesets = staticRulesets.slice();

    //TODO
    $scope.editRepoPage = true;
    $scope.canEditRepoId = false;
    $scope.params = $routeParams;
    $scope.loader = true;
    $scope.isEnterprise = isEnterprise;
    $scope.isFreeEdition = isFreeEdition;
    $scope.repositoryInfo = {};
    $scope.repositoryInfo.id = $scope.params.repositoryId;
    $scope.saveRepoId = $scope.params.repositoryId;
    $scope.pageTitle = 'Edit Repository: ' + $scope.params.repositoryId;
    $scope.hasActiveLocation = function () {
        return $repositories.hasActiveLocation();
    };

    $scope.ontopRepoFiles = ONTOP_REPO_PARAMS;
    $scope.ontopRepoFileLabels = ONTOP_REPO_PARAM_LABELS;
    $scope.isRequiredOntopRepoFile = function(file) {
        return REQUIRED_ONTOP_REPO_PARAMS.indexOf(file) > -1;
    };
    $scope.ontopRepoFileNames = {};

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
                    $scope.repositoryInfo.saveId = $scope.saveRepoId;
                    $scope.loader = false;
                    $scope.ontopRepoFiles.forEach(function(key) {
                        if ($scope.repositoryInfo.params[key]) {
                            $scope.ontopRepoFileNames[key] = $scope.repositoryInfo.params[key].value;
                        }
                    });
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

    $scope.formError = function () {
        toastr.error('There is an error in the form!');
    };

    $scope.editRepoHttp = function () {
        $scope.loader = true;
        RepositoriesRestService.editRepository($scope.repositoryInfo.saveId, $scope.repositoryInfo)
            .success(function () {
                toastr.success('The repository ' + $scope.repositoryInfo.saveId + ' has been edited.');
                $repositories.init($scope.goBackToPreviousLocation);
            }).error(function (data) {
                const msg = getError(data);
                toastr.error(msg, 'Error');
                $scope.loader = false;
            });
    };

    $scope.editRepository = function () {
        $scope.isInvalidRepoName = !filenamePattern.test($scope.repositoryInfo.id);
        if ($scope.repositoryInfo.type != 'ontop') {
            $scope.isInvalidEntityIndexSize = !numberPattern.test($scope.repositoryInfo.params.entityIndexSize.value);
            $scope.isInvalidQueryTimeout = !numberPattern.test($scope.repositoryInfo.params.queryTimeout.value);
            $scope.isInvalidQueryLimit = !numberPattern.test($scope.repositoryInfo.params.queryLimitResults.value);
        }
        if (!$scope.isInvalidRepoName) {
            ModalService.openSimpleModal({
                title: 'Confirm edit',
                message: (($scope.repositoryInfo.saveId !== $scope.repositoryInfo.id) ? ' You are changing the repository id. Are you sure?' :
                    'Save changes to this repository?<br><br><span class="icon-warning" style="color: #d54a33"> Restart of GraphDB needed!</span>'),
                warning: true
            }).result
                .then(function () {
                    $scope.editRepoHttp();
                });
        } else {
            $scope.formError();
        }
    };

    $scope.editRepositoryId = function () {
        let msg = 'Changing the repository id is a dangerous operation since it moves the repository folder. Also, it may be slow due to reinitialisation of the repository.';
        if ($scope.isEnterprise) {
            msg += 'If your repository is in a cluster, it is your responsibility to update the cluster after renaming.';
        }
        ModalService.openSimpleModal({
            title: 'Confirm enable edit',
            message: msg + ' Are you sure you want to enable repository id editing?',
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

    $scope.editFile = function(file) {
        editFile(file, $modal, $scope, RepositoriesRestService, toastr);
    };

    $scope.uploadOntopRepoFile = function(files, param) {
        uploadRepoFile(files, param, Upload, $scope);
    };

    $scope.isOntopRepoFileUploaded = function() {
        return $scope.repositoryInfo.params.propertiesFile &&
                $scope.repositoryInfo.params.propertiesFile.value.length > 0
    };

    $scope.validateOntopPropertiesConnection = function() {
        RepositoriesRestService.validateOntopPropertiesConnection($scope.repositoryInfo.params.propertiesFile).success(function () {
            toastr.success('Connection is successful');
        }).error(function (data) {
            const msg = getError(data);
            toastr.error(msg, 'Failed to connect');
        });
    }

}
