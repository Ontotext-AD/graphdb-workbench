import {getFileName} from "./controllers";

angular
    .module('graphdb.framework.repositories.ontop-repo.directive', [])
    .directive('ontopRepo', ontopRepoDirective);

ontopRepoDirective.$inject = ['$modal', 'RepositoriesRestService', 'toastr', 'Upload', 'ModalService'];

function ontopRepoDirective($modal, RepositoriesRestService, toastr, Upload, ModalService) {
    return {
        restrict: 'E',
        scope: false,
        templateUrl: 'js/angular/repositories/templates/ontop-repo.html',

        link: linkFunc
    };

    function linkFunc($scope) {

        $scope.selectedDriver = {
            driverType: "generic",
            driverName: "Generic JDBC Driver",
            jdbc: {
                hostName: "",
                port: "",
                databaseName: "",
                userName: "",
                password: "",
                driverClass: "",
                url: ""
            },
            urlTemplate: "",
            downloadDriverUrl: ""
        };
        $scope.ontopRepoFileNames = {};
        $scope.supportedDriversData = [];
        $scope.ontopRepoFileLabels =
            {propertiesFile: 'JDBC properties', obdaFile: 'OBDA or R2RML', owlFile: 'ontology file', constraintFile: 'constraint file'};
        $scope.ontopRepoFiles = Object.keys($scope.ontopRepoFileLabels);
        $scope.ontopRepoFiles.forEach(function(key) {
            if ($scope.repositoryInfo.params[key]) {
                $scope.ontopRepoFileNames[key] = $scope.repositoryInfo.params[key].value;
            }
        });
        $scope.supportedDriverLabels = {hostName: 'Hostname', port: "Port", databaseName: 'Database name',
                                        userName: 'Username', password: 'Password', driverClass: 'Driver class', url: 'URL'};
        $scope.propertiesFileParams = Object.keys($scope.supportedDriverLabels);
        $scope.classAvailable = false;
        $scope.genericDriverType = 'generic';
        $scope.propertiesFile = 'propertiesFile';

        const REQUIRED_ONTOP_REPO_PARAMS = [$scope.propertiesFile, 'obdaFile'];
        const REQUIRED_PROPERTIES_FIELD_PARAMS = ['hostName', 'databaseName', 'userName'];

        function getSupportedDriversData() {
            return RepositoriesRestService.getSupportedDriversData()
                .success(function (response) {
                    $scope.supportedDriversData = response;
                }).error(function (response) {
                    const msg = getError(response);
                    toastr.error(msg, 'Error');
                });
        }

        $scope.getDriverType = function (driverType) {
            let found = $scope.supportedDriversData.find(driver => driver.driverType === driverType);
            $scope.selectedDriver.driverType = found.driverType;
            $scope.selectedDriver.jdbc.driverClass = found.driverClass;
            $scope.selectedDriver.jdbc.url = found.urlTemplate;
            $scope.selectedDriver.urlTemplate = found.urlTemplate;
            $scope.selectedDriver.downloadDriverUrl = found.downloadDriverUrl;
            $scope.classAvailable = found.classAvailable;
            // Call concatURL with proper labelName to apply changes to url field
            $scope.concatURL('hostName', $scope);
        }

        $scope.isReadOnly = function (labelName) {
            return labelName === 'driverClass' || labelName === 'url';
        }

        $scope.editFile = function(file) {
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
                RepositoriesRestService.updateRepositoryFileContent(data.fileLocation, data.content).success(function(result) {
                    $scope.ontopRepoFileNames[file] = getFileName(result.fileLocation);
                    $scope.repositoryInfo.params[file].value = result.fileLocation;
                }).error(function (error) {
                    const msg = getError(error);
                    toastr.error(msg, 'Error');
                })
            });
        }

        $scope.uploadOntopRepoFile = function(files, param) {
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
        }

        $scope.concatURL = function(labelName) {
            if (labelName === 'hostName' || labelName === 'port' || labelName === 'databaseName') {
                let result = $scope.selectedDriver.urlTemplate;
                if ($scope.selectedDriver.jdbc.hostName) {
                    if ($scope.selectedDriver.jdbc.port) {
                        result = result.replace('{hostport}',
                            $scope.selectedDriver.jdbc.hostName + ':' + $scope.selectedDriver.jdbc.port);
                    } else {
                        result = result.replace('{hostport}', $scope.selectedDriver.jdbc.hostName);
                    }
                }

                if ($scope.selectedDriver.jdbc.databaseName) {
                    result = result.replace('{database}', $scope.selectedDriver.jdbc.databaseName);
                }

                $scope.selectedDriver.jdbc.url = result;
            }
        }

        $scope.getInputType = function (labelName) {
            switch (labelName) {
                case 'password':
                    return 'password';
                case 'port':
                    return 'number';
                default:
                    return 'text';
            }
        }

        $scope.checkForRequiredOntopFiles = function () {
            // Should guarantee that code will be executed in sequential manner,
            // because properties file is not created yet
            return updateProperties()
                .then(function () {
                    const missingRequired = REQUIRED_ONTOP_REPO_PARAMS.filter(function (requiredFile) {
                        return !$scope.repositoryInfo.params[requiredFile].value;
                    });
                    if (missingRequired.length > 0) {
                        toastr.error('Missing required ontop repo file');
                        return Promise.reject('Missing required ontop repo file');
                    }
                });
        }

        function loadPropertiesFile() {
            RepositoriesRestService.loadPropertiesFile($scope.repositoryInfo.params[$scope.propertiesFile].value)
                .success(function (driverData) {
                    let found = $scope.supportedDriversData.find(driver => driver.driverClass === driverData.driverClass);
                    // If driver class is not found means that the selected driver is a GENERIC ONE
                    if (found) {
                        $scope.selectedDriver.driverType = found.driverType;
                        $scope.selectedDriver.jdbc.hostName = driverData.hostName;
                        $scope.selectedDriver.jdbc.port = parseInt(driverData.port);
                        $scope.selectedDriver.jdbc.databaseName = driverData.databaseName;
                        $scope.selectedDriver.jdbc.userName = driverData.userName;
                        $scope.selectedDriver.jdbc.password = driverData.password;
                        $scope.selectedDriver.jdbc.driverClass = driverData.driverClass;
                        $scope.selectedDriver.jdbc.url = driverData.url;
                        $scope.selectedDriver.urlTemplate = found.urlTemplate;
                        $scope.selectedDriver.downloadDriverUrl = found.downloadDriverUrl;
                        $scope.classAvailable = found.classAvailable;
                    }
                }).error(function (data) {
                const msg = getError(data);
                toastr.error(msg, 'Error');
                $scope.uploadFileLoader = false;
            });
        }

        $scope.validateOntopPropertiesConnection = function () {
            updateProperties()
                .then(function () {
                    RepositoriesRestService.validateOntopPropertiesConnection($scope.repositoryInfo.params.propertiesFile)
                        .success(function () {
                            toastr.success('Connection is successful');
                        }).error(function (data) {
                        const msg = getError(data);
                        toastr.error(msg, 'Failed to connect');
                    });
                });
        }

        $scope.isOntopRepoFileUploaded = function() {
            return $scope.repositoryInfo.params.propertiesFile &&
                $scope.repositoryInfo.params.propertiesFile.value.length > 0
        };

        function missingRequiredField() {
            let missing = REQUIRED_PROPERTIES_FIELD_PARAMS
                .filter(function (requiredField) {
                    return !$scope.selectedDriver.jdbc[requiredField]
                });
            if (missing.length > 0) {
                toastr.error('Missing required field');
                return true;
            }
            return false;
        }

        function updateProperties() {
            if ($scope.selectedDriver.driverType !== $scope.genericDriverType) {
                if (missingRequiredField()) {
                    return Promise.reject('Missing required field');
                }
                return updatePropertiesFile();
            }
            return Promise.resolve();
        }

        function updatePropertiesFile() {
            $scope.uploadFileLoader = true;
            return RepositoriesRestService
                .updatePropertiesFile($scope.repositoryInfo.params[$scope.propertiesFile].value, $scope.selectedDriver.jdbc)
                .success(function (data) {
                    $scope.ontopRepoFileNames[$scope.propertiesFile] = getFileName(data.fileLocation);
                    $scope.repositoryInfo.params[$scope.propertiesFile].value = data.fileLocation;
                    $scope.uploadFileLoader = false;
                }).error(function (data) {
                    const msg = getError(data);
                    toastr.error(msg, 'Error');
                    $scope.uploadFileLoader = false;
                });
        }

        $scope.isRequiredOntopRepoFile = function(file) {
            return REQUIRED_ONTOP_REPO_PARAMS.indexOf(file) > -1;
        };

        $scope.isRequiredField = function (field) {
            return REQUIRED_PROPERTIES_FIELD_PARAMS.indexOf(field) > -1;
        }

        $scope.editOntopRepo = function () {
            $scope.checkForRequiredOntopFiles()
                .then(function () {
                    $scope.editRepository();
                }).catch(function (err) {
                // The catch block is empty, because error is handled in promise
            });
        }

        $scope.createOntopRepo = function () {
            if (!$scope.repositoryInfo.id) {
                toastr.error('Repository ID cannot be empty');
                return;
            }

            $scope.checkForRequiredOntopFiles()
                .then(function () {
                    $scope.createRepo();
                }).catch(function (err) {
                // The catch block is empty, because error is handled in promise
            });
        };

        $scope.goBackToPrevious = function () {
            $scope.goBackToPreviousLocation();
        }

        getSupportedDriversData()
            .then(function () {
                if ($scope.editRepoPage) {
                    loadPropertiesFile();
                }
            });
    }
}
