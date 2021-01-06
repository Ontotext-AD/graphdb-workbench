export const ONTOP_TYPE = 'ontop';
export const GENERIC_DRIVER_TYPE = 'generic';
export const PROPERTIES_FILE = 'propertiesFile';
export const ONTOP_REPO_PARAM_LABELS = {propertiesFile: 'JDBC properties', obdaFile: 'OBDA or R2RML', owlFile: 'ontology file', constraintFile: 'constraint file'};
export const ONTOP_REPO_PARAMS = _.keys(ONTOP_REPO_PARAM_LABELS);
export const REQUIRED_ONTOP_REPO_PARAMS = [PROPERTIES_FILE, 'obdaFile'];
export const SUPPORTED_DRIVER_LABELS = {hostName: 'Hostname', port: "Port", databaseName: 'Database name',
                                        userName: 'Username', password: 'Password', driverClass: 'Driver class', url: 'URL'};
export const PROPERTIES_FILE_PARAMS = _.keys(SUPPORTED_DRIVER_LABELS);
export const REQUIRED_PROPERTIES_FIELD_PARAMS = ['hostName', 'databaseName', 'userName'];

export const DEFAULT_SELECTED_DRIVER = {
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
}

export const getSupportedDriversData = function ($scope, RepositoriesRestService, toastr) {
    return RepositoriesRestService.getSupportedDriversData()
        .success(function (response) {
            $scope.supportedDriversData = response;
        }).error(function (response) {
        const msg = getError(response);
        toastr.error(msg, 'Error');
    });
}

export const getDriverType = function (driverType, $scope) {
    let found = $scope.supportedDriversData.find(driver => driver.driverType === driverType);
    $scope.selectedDriver.driverType = found.driverType;
    $scope.selectedDriver.jdbc.driverClass = found.driverClass;
    $scope.selectedDriver.jdbc.url = found.urlTemplate;
    $scope.selectedDriver.urlTemplate = found.urlTemplate;
    $scope.selectedDriver.downloadDriverUrl = found.downloadDriverUrl;
    $scope.isClassAvailable = found.isClassAvailable;
    // Call concatURL with proper labelName to apply changes to url field
    concatURL('hostName', $scope);
}

export const isReadOnly = function (labelName) {
    return labelName === 'driverClass' || labelName === 'url';
}

export const editFile = function(file, $modal, $scope, RepositoriesRestService, toastr) {
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

export const uploadRepoFile = function (files, param, Upload, $scope, toastr) {
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

export const concatURL = function(labelName, $scope) {
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

export const getInputType = function (labelName) {
    switch (labelName) {
        case 'password':
            return 'password';
        case 'port':
            return 'number';
        default:
            return 'text';
    }
}

export const checkForRequiredOntopFiles = function ($scope, RepositoriesRestService, toastr) {
    if ($scope.repositoryInfo.type === ONTOP_TYPE) {
        // Should guarantee that code will be executed in sequential manner,
        // because properties file is not created yet
        return Promise.resolve(updateProperties($scope, RepositoriesRestService, toastr))
            .then(function () {
                const missingRequired = REQUIRED_ONTOP_REPO_PARAMS.filter(function (requiredFile) {
                    return !$scope.repositoryInfo.params[requiredFile].value;
                });
                if (missingRequired.length > 0) {
                    toastr.error('Missing required ontop repo file');
                    throw new Error('Missing required ontop repo file');
                }
            }).catch(function (err) {
                // Rethrow the error in order to stop execution of the code in createRepo method afterwards
                throw new Error(err);
            });
    }
}

export const loadPropertiesFile = function ($scope, RepositoriesRestService, toastr) {
    RepositoriesRestService.loadPropertiesFile($scope.repositoryInfo.params[PROPERTIES_FILE].value)
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
                $scope.isClassAvailable = found.isClassAvailable;
            }
        }).error(function (data) {
        const msg = getError(data);
        toastr.error(msg, 'Error');
        $scope.uploadFileLoader = false;
    });
}

export const validateOntopPropertiesConnection = function ($scope, RepositoriesRestService, toastr) {
    return Promise.resolve(updateProperties($scope, RepositoriesRestService, toastr))
        .then(function () {
            RepositoriesRestService.validateOntopPropertiesConnection($scope.repositoryInfo.params.propertiesFile).success(function () {
                toastr.success('Connection is successful');
            }).error(function (data) {
                const msg = getError(data);
                toastr.error(msg, 'Failed to connect');
            });
        }).catch(function (err) {});
}

export const isOntopRepoFileUploaded = function($scope) {
    return $scope.repositoryInfo.params.propertiesFile &&
        $scope.repositoryInfo.params.propertiesFile.value.length > 0
};

const missingRequiredField = function ($scope, toastr) {
    let missing = REQUIRED_PROPERTIES_FIELD_PARAMS
        .filter(function (requiredField) {
            return !$scope.selectedDriver.jdbc[requiredField]
        });
    if (missing.length > 0) {
        toastr.error('Missing required field');
        return false;
    }
    return true;
}

const updateProperties = function($scope, RepositoriesRestService, toastr) {
    if ($scope.selectedDriver.driverType !== GENERIC_DRIVER_TYPE) {
        if (!missingRequiredField($scope, toastr)) {
            throw new Error('Missing required field');
        }
        return updatePropertiesFile($scope, RepositoriesRestService);
    }
}

const updatePropertiesFile = function ($scope, RepositoriesRestService, toastr) {
    $scope.uploadFileLoader = true;
    return RepositoriesRestService.updatePropertiesFile($scope.repositoryInfo.params[PROPERTIES_FILE].value, $scope.selectedDriver.jdbc)
        .success(function (data) {
            $scope.ontopRepoFileNames[PROPERTIES_FILE] = getFileName(data.fileLocation);
            $scope.repositoryInfo.params[PROPERTIES_FILE].value = data.fileLocation;
            $scope.uploadFileLoader = false;
        }).error(function (data) {
            const msg = getError(data);
            toastr.error(msg, 'Error');
            $scope.uploadFileLoader = false;
        });
}
