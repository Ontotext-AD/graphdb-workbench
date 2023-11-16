import {getFileName} from "./controllers";
import {OntopFileType} from "../../../models/ontop/ontop-file-type";
import {OntopConnectionInformation} from "../../../models/ontop/ontop-connection-information";
import {OntopFileInfo} from "../../../models/ontop/ontop-file-info";
import {OntopRepositoryError} from "../../../models/ontop/ontop-repository-error";
import {OntopDriverData} from "../../../models/ontop/ontop-driver-data";
import {JdbcDriverType} from "../../../models/ontop/jdbc-driver-type";

// A link to Ontop's website with all Ontop configuration keys
const ONTOP_PROPERTIES_LINK = 'https://ontop-vkg.org/guide/advanced/configuration.html';

angular
    .module('graphdb.framework.repositories.ontop-repo.directive', [])
    .directive('ontopRepo', ontopRepoDirective);

ontopRepoDirective.$inject = ['$uibModal', 'RepositoriesRestService', 'toastr', 'Upload', '$translate'];

function ontopRepoDirective($uibModal, RepositoriesRestService, toastr, Upload, $translate) {
    return {
        restrict: 'E',
        scope: false,
        templateUrl: 'js/angular/repositories/templates/ontop-repo.html',

        link: linkFunc
    };

    function linkFunc($scope) {
        const HOME_KEY = 36;
        const END_KEY = 35;
        const LEFT_ARROW = 37;
        const RIGHT_ARROW = 39;
        const BACKSPACE = 8;
        const KEY_C = 67;
        const KEY_A = 65;
        $scope.isGenericDriver = true;
        $scope.defaultUrlTemplate = 'jdbc:database://localhost:port/database_name';
        $scope.ontopProperiesLink = ONTOP_PROPERTIES_LINK;
        $scope.ontopFileType = OntopFileType;

        /**
         * Holds reference to selected driver.
         *
         * @type {OntopDriverData}
         */
        $scope.selectedDriver = new OntopDriverData();

        /**
         * Holds all supported jdbc drivers.
         * @type {OntopDriverData[]}
         */
        $scope.supportedDriversData = [];
        $scope.formData = {
            connectionInformation: new OntopConnectionInformation(),
            settings: {
                additionalProperties: '',
                /**
                 * Holds information about repository files.
                 */
                ontopFiles: []
            }
        };

        // =========================
        // Public functions
        // =========================

        /**
         * Changes selected driver and updates url field.
         * @param {string} driverType - the type of driver.
         */
        $scope.selectDriver = (driverType) => {
            $scope.selectedDriver = $scope.supportedDriversData.find((driver) => driver.driverType === driverType);
            $scope.isGenericDriver = OntopDriverData.isGenericDriver($scope.selectedDriver.driverType);
            if ($scope.editRepoPage && $scope.currentOntopRepoInfo && $scope.currentOntopRepoInfo.connectionInformation.driverType === driverType) {
                $scope.formData = _.cloneDeep($scope.currentOntopRepoInfo);
            } else {
                clearFormData();
                $scope.formData.connectionInformation.driverType = $scope.selectedDriver.driverType;
            }
            $scope.formData.connectionInformation.driverClass = $scope.selectedDriver.driverClass;
            $scope.updateUrl();
        };

        /**
         * Finds ontop file depends on file type <code>ontopFileType</code>
         * @param {OntopFileType} ontopFileType - the type of searched ontop file.
         * @return {OntopFileInfo} found ontop file.
         */
        $scope.getOntopFileInfo = (ontopFileType) => {
            return $scope.formData.settings.ontopFiles.find((ontopFileInfo) => ontopFileType === ontopFileInfo.type);
        };

        $scope.getHostNameLabel = () => {
            const hostNameLabel = OntopDriverData.isSnowflakeDriver($scope.selectedDriver.driverType) ? 'ontop.repo.database.snowflake.host_name' : 'ontop.repo.database.host_name';
            return $translate.instant(hostNameLabel) + '*';
        };

        $scope.getDatabaseNameLabel = () => {
            let dataBaseNameLabelKey = '';
            switch ($scope.selectedDriver.driverType) {
                case JdbcDriverType.SNOWFLAKE:
                    dataBaseNameLabelKey = 'ontop.repo.database.warehouse.database_name';
                    break;
                case JdbcDriverType.DATABRICKS:
                    dataBaseNameLabelKey = 'ontop.repo.database.http_path.database_name';
                    break;
                case JdbcDriverType.DREMIO:
                    dataBaseNameLabelKey = 'ontop.repo.database.schema.database_name';
                    break;
                default:
                    dataBaseNameLabelKey = 'ontop.repo.database.database_name';
            }
            return $translate.instant(dataBaseNameLabelKey);
        };

        /**
         * Updates value of <code>$scope.formData.connectionInformation.url</code> depends on other connection information: Host name, Port...
         */
        $scope.updateUrl = () => {
            const templateUrl = calculateTemplateUrl() || '';
            $scope.formData.connectionInformation.url = templateUrl + $scope.formData.connectionInformation.urlUserInput;
        };

        /**
         * Checks if test connection can be executed.
         * @return {boolean} true if all needed data is filled by the user.
         */
        $scope.isTestConnectionDisabled = () => {
            const connectionInformation = $scope.formData.connectionInformation;
            const selectedDriver = $scope.selectedDriver;
            if (!connectionInformation.driverClass || !connectionInformation.url || selectedDriver.portRequired && !connectionInformation.port) {
                return true;
            }
            return !OntopDriverData.isGenericDriver(selectedDriver.driverType) && (!connectionInformation.hostName || !connectionInformation.databaseName);
        };

        /**
         * Performs a test connection.
         */
        $scope.testConnection = () => {
            validateHostName()
                .then(validatePort)
                .then(validateDatabaseName)
                .then(validateDriverClass)
                .then(validateUrl)
                .then(updatePropertiesFile)
                .then(() => RepositoriesRestService.validateOntopPropertiesConnection($scope.repositoryInfo))
                .then(() => toastr.success($translate.instant('ontop.repo.successful.connection.msg')))
                .catch((error) => {
                    if (error instanceof OntopRepositoryError) {
                        toastr.error(error.message);
                    } else {
                        showErrorMsg($translate.instant('ontop.repo.failed.to.connect'), error);
                    }
                });
        };

        /**
         * Updates the file with type <code>ontopFileType</code>.
         *
         * @param {OntopFileInfo} ontopFileInfo
         */
        $scope.editFile = (ontopFileInfo) => {

            const fileName = $scope.repositoryInfo.params[ontopFileInfo.type].label;
            const title = $translate.instant('update.file.edit.content.header', {fileName});
            const modalInstance = $uibModal.open({
                templateUrl: 'js/angular/templates/modal/editRepoFile.html',
                controller: 'EditRepositoryFileCtrl',
                windowClass: 'update-ontop-repo-dialog',
                resolve: {
                    file: () => {
                        const ontopFile = $scope.repositoryInfo.params[ontopFileInfo.type];
                        return ontopFile ? ontopFile.value : '';
                    },
                    dialogTitle: () => {
                        return title;
                    }
                }
            });

            modalInstance.result.then((data) => {
                // send data to backend
                RepositoriesRestService.updateRepositoryFileContent(data.fileLocation, data.content, $scope.repositoryInfo.location)
                    .success((result) => {
                        ontopFileInfo.fileName = getFileName(result.fileLocation);
                        $scope.repositoryInfo.params[ontopFileInfo.type].value = result.fileLocation;
                    }).error((error) => {
                    showErrorMsg($translate.instant('common.error'), error);
                });
            });
        };

        $scope.uploadOntopFile = (files, ontopFileInfo) => {
            if (files && files.length) {
                const uploadFile = files[0];
                ontopFileInfo.loading = true;
                const uploadData = {
                    url: 'rest/repositories/file/upload',
                    data: {file: uploadFile, location: $scope.repositoryInfo.location}
                };
                Upload.upload(uploadData)
                    .success((data) => {
                        if (!data.success) {
                            toastr.error(data.errorMessage);
                        } else {
                            ontopFileInfo.fileName = uploadFile.name;
                            $scope.repositoryInfo.params[ontopFileInfo.type].value = data.fileLocation;
                        }
                    })
                    .error((data) => {
                        showErrorMsg($translate.instant('common.error'), data);
                        $scope.uploadFile = '';
                    })
                    .finally(() => {
                        ontopFileInfo.loading = false;
                    });
            }
        };

        $scope.updateOntopRepo = () => {
            const createOrUpdate = $scope.editRepoPage ? $scope.editRepository : $scope.createRepo;
            validateRepositoryId()
                .then(validateHostName)
                .then(validatePort)
                .then(validateDatabaseName)
                .then(validateDriverClass)
                .then(validateUrl)
                .then(validateOntopFiles)
                .then(updatePropertiesFile)
                .then(createOrUpdate)
                .catch((error) => {
                    if (error instanceof OntopRepositoryError) {
                        toastr.error(error.message);
                    } else {
                        console.log(error);
                    }
                });
        };

        /**
         * Some databases expect additional properties than hostname, port, database name in order to establish the connection.
         * So url is not readonly and user can modify it. Every driver instead generic one has template tha can't be changed by the user, it
         * is filled automatically when user writes hostname, port, and database name.
         *
         * This function prevent modification of driver template.
         *
         * @param {*} event - event fired by key down.
         */
        $scope.onKeyDownInUrlInput = (event) => {
            const keyCode = event.keyCode;
            // We don't prevent event if user clicked on left, right arrow, home or end key,
            // the client can move cursor without matter where the cursor is.
            if (keyCode === LEFT_ARROW || keyCode === RIGHT_ARROW || keyCode === HOME_KEY || keyCode === END_KEY) {
                return;
            }

            const templateUrl = calculateTemplateUrl();
            // If templateUrl is empty this means that chosen driver is generic or user is not filled hostname, port, or database name.
            // So user can type any characters into url input.
            if (!templateUrl) {
                return;
            }

            // Allows user to select all and copy the url value regardless that cursor position is in url template area.
            // event.metaKey -> Mac support
            const ctrlDown = event.ctrlKey || event.metaKey;
            if (ctrlDown && KEY_A === keyCode || ctrlDown && KEY_C === keyCode) {
                return;
            }

            const cursorPosition = event.target.selectionStart;

            if (keyCode === BACKSPACE && cursorPosition - 1 < templateUrl.length) {
                event.preventDefault();
                event.stopPropagation();
            }

            if (cursorPosition < templateUrl.length) {
                // If templateUrl is not empty and cursor is in the middle of it, we will prevent the event and not allow to modify the url.
                event.preventDefault();
                event.stopPropagation();
            }

            // If templateUrl is not empty and cursor is after it, the user can write any character into the url input.
        };

        $scope.onKeyUpInUrlInput = () => {
            extractExtraUrl();
        };

        // =========================
        // Private functions
        // =========================

        /**
         * Extracts manual user input from url input element.
         */
        const extractExtraUrl = () => {
            const templateUrl = calculateTemplateUrl();
            if (templateUrl) {
                if ($scope.formData.connectionInformation.url.startsWith(templateUrl)) {
                    // If templateUrl is not empty and url input value starts with the templateUrl, the text entered by user is part after the templateUrl.
                    $scope.formData.connectionInformation.urlUserInput = $scope.formData.connectionInformation.url.substring(templateUrl.length);
                } else {
                    // If templateUrl is not empty and url input value don't start with the templateUrl, all url is entered by the user.
                    $scope.formData.connectionInformation.urlUserInput = $scope.formData.connectionInformation.url;
                }
            } else {
                // If templateUrl is empty this means that chosen driver is generic or user is not filled hostname, port, or database name.
                // So all characters in url input are entered by user.
                $scope.formData.connectionInformation.urlUserInput = $scope.formData.connectionInformation.url;
            }
        };

        const calculateTemplateUrl = () => {
            if (OntopDriverData.isSnowflakeDriver($scope.selectedDriver.driverType)) {
                return calculateSnowflakeTemplateUrl();
            }
           return calculateDefaultTemplateUrl();
        };

        const calculateSnowflakeTemplateUrl = () => {
            let url = $scope.selectedDriver.urlTemplate;
            const connectionInformation = $scope.formData.connectionInformation;

            if (connectionInformation.hostName) {
                url = url.replace('{identifier}', connectionInformation.hostName);
            }

            if (connectionInformation.port) {
                url = url.replace('.snowflakecomputing.com/?', `.snowflakecomputing.com:${connectionInformation.port}/?`);
            }

            if (connectionInformation.databaseName) {
                url = url.replace('{database}', connectionInformation.databaseName);
            }
            return url;
        };

        const calculateDefaultTemplateUrl = () => {
            let url = $scope.selectedDriver.urlTemplate;
            const connectionInformation = $scope.formData.connectionInformation;
            if (connectionInformation.hostName) {
                if (connectionInformation.port) {
                    url = url.replace('{hostport}', `${connectionInformation.hostName}:${connectionInformation.port}`);
                } else {
                    url = url.replace('{hostport}', `${connectionInformation.hostName}`);
                }
            }
            if (connectionInformation.databaseName) {
                url = url.replace('{database}', connectionInformation.databaseName);
            }
            return url;
        };

        const loadSupportedDriversData = () => {
            return RepositoriesRestService.getSupportedDriversData($scope.repositoryInfo)
                .success((response) => {
                    $scope.supportedDriversData = response;
                }).error((response) => {
                    showErrorMsg($translate.instant('common.error'), response);
                });
        };

        const setLoading = (loading) => {
            $scope.formData.settings.ontopFiles.forEach((ontopFile) => {
                ontopFile.loading = loading;
            });
        };

        const loadPropertiesFile = () => {
            setLoading(true);
            RepositoriesRestService.loadPropertiesFile($scope.repositoryInfo.params.propertiesFile.value, $scope.repositoryInfo.location, $scope.selectedDriver.driverType)
                .success((driverData) => {
                    let driver = $scope.supportedDriversData.find((driver) => driver.driverClass === driverData.driverClass);
                    // If driver not found this means that driver is generic.
                    // If the driver is found, but the data returned by the server does not contain a hostname,
                    // it means that the driver class (which we support) is filled in as the driver class of a generic type.
                    if (!driver || !driverData.hostName) {
                        driver = $scope.supportedDriversData.find((driver) => OntopDriverData.isGenericDriver(driver.driverType));
                    }
                    $scope.selectDriver(driver.driverType);
                    $scope.formData.connectionInformation.driverType = driver.driverType;
                    $scope.formData.connectionInformation.driverClass = driverData.driverClass;
                    $scope.formData.connectionInformation.password = driverData.password;
                    $scope.formData.connectionInformation.username = driverData.userName;
                    $scope.formData.connectionInformation.url = driverData.url;
                    $scope.formData.settings.additionalProperties = driverData.additionalProperties;

                    if (!OntopDriverData.isGenericDriver(driver.driverType)) {
                        $scope.formData.connectionInformation.hostName = driverData.hostName;
                        $scope.formData.connectionInformation.databaseName = driverData.databaseName;
                        $scope.formData.connectionInformation.port = driverData.port ? parseInt(driverData.port, 10) : undefined;
                    }

                    extractExtraUrl();
                    $scope.updateUrl();

                    Object.values(OntopFileType)
                        .forEach((ontopFileType) => {
                            const ontopFileInfo = $scope.repositoryInfo.params[ontopFileType];
                            const ontopFile = $scope.getOntopFileInfo(ontopFileType);
                            if (ontopFileInfo) {
                                ontopFile.fileName = getFileName(ontopFileInfo.value);
                            }
                        });
                    $scope.currentOntopRepoInfo = _.cloneDeep($scope.formData);
                })
                .error((data) => {
                    showErrorMsg($translate.instant('common.error'), data);
                })
                .finally(() => {
                    setLoading(false);
                });
        };

        const updatePropertiesFile = () => {
            setLoading(true);
            const connectionInformation = $scope.formData.connectionInformation;

            const jdbc = {
                hostName: connectionInformation.hostName,
                port: connectionInformation.port,
                databaseName: connectionInformation.databaseName,
                userName: connectionInformation.username,
                password: connectionInformation.password,
                driverClass: connectionInformation.driverClass,
                url: connectionInformation.url,
                additionalProperties: $scope.formData.settings.additionalProperties
            };

            return RepositoriesRestService
                .updatePropertiesFile($scope.repositoryInfo.params.propertiesFile.value, jdbc, $scope.repositoryInfo.location, $scope.selectedDriver.driverType)
                .success((data) => {
                    $scope.repositoryInfo.params.propertiesFile.value = data.fileLocation;
                }).error((data) => {
                    showErrorMsg($translate.instant('common.error'), data);
                })
                .finally(() => setLoading(false));
        };

        const showErrorMsg = (title, data) => {
            const msg = getError(data);
            toastr.error(msg, title);
        };

        const validateHostName = () => {
            if (!OntopDriverData.isGenericDriver($scope.selectedDriver.driverType)) {
                if (!$scope.formData.connectionInformation.hostName) {
                    return Promise.reject(new OntopRepositoryError($translate.instant('missing.required.field', {fieldName: $translate.instant('ontop.repo.database.host_name')})));
                }
            }
            return Promise.resolve();
        };

        const validateDatabaseName = () => {
            if (!OntopDriverData.isGenericDriver($scope.selectedDriver.driverType)) {
                if (!$scope.formData.connectionInformation.databaseName) {
                    return Promise.reject(new OntopRepositoryError($translate.instant('missing.required.field', {fieldName: $translate.instant('ontop.repo.database.database_name')})));
                }
            }
            return Promise.resolve();
        };

        const validateDriverClass = () => {
            if (!$scope.formData.connectionInformation.driverClass) {
                return Promise.reject(new OntopRepositoryError($translate.instant('missing.required.field', {fieldName: $translate.instant('ontop.repo.database.driver_class')})));
            }
            return Promise.resolve();
        };

        const validateUrl = () => {
            if (!$scope.formData.connectionInformation.url) {
                return Promise.reject(new OntopRepositoryError($translate.instant('missing.required.field', {fieldName: $translate.instant('ontop.repo.database.url')})));
            }
            return Promise.resolve();
        };

        const validateRepositoryId = () => {
            if (!$scope.repositoryInfo.id) {
                return Promise.reject(new OntopRepositoryError($translate.instant('empty.repoid.warning')));
            }
            return Promise.resolve();
        };

        const validateOntopFiles = () => {
            if (!$scope.getOntopFileInfo(OntopFileType.OBDA).fileName) {
                return Promise.reject(new OntopRepositoryError($translate.instant('ontop.repo.missing.required.file', {fileName: $scope.repositoryInfo.params[OntopFileType.OBDA].label})));
            }
            return Promise.resolve();
        };

        const validatePort = () => {
            if ($scope.selectedDriver.portRequired && !$scope.formData.connectionInformation.port) {
                return Promise.reject(new OntopRepositoryError($translate.instant('missing.required.field', {fieldName: $translate.instant('ontop.repo.database.port')})));
            }
            return Promise.resolve();
        };

        const clearFormData = () => {
            $scope.formData = {
                connectionInformation: new OntopConnectionInformation(),
                settings: {
                    additionalProperties: '',
                    ontopFiles: []
                }
            };

            Object.values(OntopFileType)
                .forEach((ontopFileType) => {
                    const ontopFileInfo = new OntopFileInfo(ontopFileType);
                    $scope.formData.settings.ontopFiles.push(ontopFileInfo);
                });

            $scope.getOntopFileInfo(OntopFileType.OBDA).required = true;
        };

        // =========================
        // Initialize component data
        // =========================
        loadSupportedDriversData()
            .then(() => {
                if ($scope.editRepoPage) {
                    loadPropertiesFile();
                } else {
                    $scope.selectDriver(JdbcDriverType.GENERIC);
                }
            });
    }
}
