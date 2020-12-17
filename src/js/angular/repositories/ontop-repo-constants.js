export const GENERIC_DRIVER_TYPE = 'generic';
export const PROPERTIES_FILE = 'propertiesFile';
export const ONTOP_REPO_PARAM_LABELS = {propertiesFile: 'JDBC properties', obdaFile: 'OBDA or R2RML', owlFile: 'ontology file', constraintFile: 'constraint file'};
export const ONTOP_REPO_PARAMS = _.keys(ONTOP_REPO_PARAM_LABELS);
export const REQUIRED_ONTOP_REPO_PARAMS = [PROPERTIES_FILE, 'obdaFile'];
export const SUPPORTED_DRIVER_LABELS = {hostName: 'Hostname', port: "Port", databaseName: 'Database name',
                                        userName: 'Username', password: 'Password', driverClass: 'Driver class', url: 'URL'};
export const PROPERTIES_FILE_PARAMS = _.keys(SUPPORTED_DRIVER_LABELS);
export const REQUIRED_PROPERTIES_FIELD_PARAMS = ['hostName', 'userName'];

export const getDriverType = function (driverType, $scope) {
    let found = $scope.supportedDriversData.find(driver => driver.driverType === driverType);
    $scope.selectedDriver.driverType = found.driverType;
    $scope.selectedDriver.hostName = "";
    $scope.selectedDriver.databaseName = "";
    $scope.selectedDriver.userName = "";
    $scope.selectedDriver.password = "";
    $scope.selectedDriver.driverClass = found.driverClass;
    $scope.selectedDriver.urlStart = found.urlStart;
    $scope.selectedDriver.url = found.urlStart;
    $scope.selectedDriver.downloadDriverUrl = found.downloadDriverUrl;
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
        RepositoriesRestService.updateRepositoryFileContent(data.fileLocation, data.content).success(function(data) {
            $scope.ontopRepoFileNames[file] = getFileName(data.fileLocation);
            $scope.repositoryInfo.params[file].value = data.fileLocation;
        }).error(function (data) {
            const msg = getError(data);
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
        let port = $scope.selectedDriver.port ? (':' + $scope.selectedDriver.port) : '';
        let separator = $scope.selectedDriver.driverType === 'oracle' ? ':' : '/';
        let database = $scope.selectedDriver.databaseName ? (separator + $scope.selectedDriver.databaseName) : '';
        $scope.selectedDriver.url = $scope.selectedDriver.urlStart + $scope.selectedDriver.hostName + port + database;
    }
}

export const isDriverClassOnClasspath = function ($scope, RepositoriesRestService, toastr) {
    RepositoriesRestService.isDriverOnClasspath($scope.selectedDriver.driverClass)
        .success(function (found) {
            $scope.isOnClasspath = found;
        }).error(function (data) {
        const msg = getError(data);
        toastr.error(msg, 'Error');
    });
}
