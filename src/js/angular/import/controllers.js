import 'angular/core/services';
import 'angular/utils/uri-utils';
import 'angular/rest/import.rest.service';
import 'angular/rest/upload.rest.service';
import 'angular/import/import-context.service';
import 'angular/import/import-view-storage.service';
import {FILE_STATUS} from "../models/import/file-status";
import {FileFormats} from "../models/import/file-formats";
import * as stringUtils from "../utils/string-utils";
import {FileUtils} from "../utils/file-utils";
import {DateUtils} from "../utils/date-utils";
import {toImportResource, toImportServerResource, toImportUserDataResource} from "../rest/mappers/import-mapper";
import {ImportResourceTreeElement} from "../models/import/import-resource-tree-element";
import {decodeHTML} from "../../../app";
import {FilePrefixRegistry} from "./file-prefix-registry";

const modules = [
    'ui.bootstrap',
    'toastr',
    'graphdb.framework.core.services.repositories',
    'graphdb.framework.utils.localstorageadapter',
    'graphdb.framework.utils.uriutils',
    'graphdb.framework.guides.services',
    'graphdb.framework.rest.import.service',
    'graphdb.framework.rest.upload.service',
    'graphdb.framework.core.directives',
    'graphdb.framework.importcontext.service',
    'graphdb.framework.import.importviewstorageservice'
];

const importViewModule = angular.module('graphdb.framework.impex.import.controllers', modules);

const OPERATION = {
    UPLOAD: 'upload',
    SERVER: 'server'
};

const TABS = {
    USER: 'user',
    SERVER:'server'
};

const USER_DATA_TYPE = {
    FILE: 'file',
    TEXT: 'text',
    URL: 'url'
};

importViewModule.controller('ImportViewCtrl', ['$scope', 'toastr', '$interval', '$repositories', '$uibModal', '$filter', '$jwtAuth', '$location', '$translate', 'LicenseRestService', 'GuidesService', 'ModalService', 'ImportRestService', 'ImportContextService', 'ImportViewStorageService',
    function ($scope, toastr, $interval, $repositories, $uibModal, $filter, $jwtAuth, $location, $translate, LicenseRestService, GuidesService, ModalService, ImportRestService, ImportContextService, ImportViewStorageService) {

        // =========================
        // Private variables
        // =========================

        const subscriptions = [];
        let listPollingHandler = null;
        const LIST_POLLING_INTERVAL = 4000;

        // =========================
        // Public variables
        // =========================

        $scope.files = []; // should be private
        $scope.fileChecked = {};
        $scope.checkAll = false;
        $scope.popoverTemplateUrl = 'settingsPopoverTemplate.html';
        $scope.fileQuery = '';
        $scope.fileFormatsExtended = FileFormats.getFileFormatsExtended();
        $scope.fileFormatsHuman = FileFormats.getFileFormatsHuman() + $translate.instant('import.gz.zip');
        $scope.textFileFormatsHuman = FileFormats.getTextFileFormatsHuman();
        $scope.maxUploadFileSizeMB = 0;
        $scope.serverImportTree = new ImportResourceTreeElement();
        $scope.userData = new ImportResourceTreeElement();

        // =========================
        // Public functions
        // =========================

        $scope.toTitleCase = (str) => stringUtils.toTitleCase(str);

        $scope.pollList = () => {
            listPollingHandler = $interval(() => {
                // Skip iteration if we are updating something
                if (!$scope.updating) {
                    $scope.updateList(false);
                }
            }, LIST_POLLING_INTERVAL);
        };

        $scope.getVisibleFiles = () => {
            return $filter('filter')($scope.files, {name: $scope.fileQuery, type: $scope.getTypeFilter()});
        };

        $scope.getTypeFilter = () => {
            if ($scope.viewType === 'server' && ($scope.showItems === 'file' || $scope.showItems === 'directory')) {
                return $scope.showItems;
            } else {
                return '';
            }
        };

        $scope.selectAllFiles = () => {
            $scope.getVisibleFiles().forEach(function (file) {
                $scope.fileChecked[file.name] = $scope.checkAll && $scope.importable(file);
            });
        };

        /**
         * Sets the settings for the given file and triggers import process.
         * TODO: this function should be refactored because it does too much.
         *
         * @param {string} fileName - Name of the file.
         * @param {boolean} withDefaultSettings - Whether to use default settings or not.
         * @param {string|undefined} format - Format of the file. This is applicable for single files only.
         * @param {Function|undefined} onImportRejectHandler - Function to call when import is rejected.
         */
        $scope.setSettingsFor = (fileName, withDefaultSettings, format, onImportRejectHandler = () => {}) => {
            $scope.settingsFor = fileName;
            $scope.settings = getSettingsFor(fileName, withDefaultSettings);
            if (fileName === "" ||
                format === "application/ld+json" ||
                format === "application/x-ld+ndjson" ||
                fileName.endsWith("jsonld") ||
                fileName.endsWith("zip") ||
                fileName.endsWith("gz") ||
                $scope.settings.type === "directory") {
                $scope.settings.hasContextLink = true;
                $scope.defaultSettings.hasContextLink = true;
            } else {
                $scope.settings.hasContextLink = false;
                $scope.defaultSettings.hasContextLink = false;
            }

            const options = {
                templateUrl: 'js/angular/import/templates/settingsModal.html',
                controller: 'SettingsModalCtrl',
                resolve: {
                    settings: function () {
                        return _.cloneDeep($scope.settings);
                    },
                    hasParserSettings: $scope.isLocalLocation,
                    defaultSettings: function () {
                        return $scope.defaultSettings;
                    },
                    isMultiple: function () {
                        return !fileName;
                    }
                },
                size: 'lg'
            };

            if (GuidesService.isActive()) {
                // Prevents closing dialog when user click outside the dialog.
                options.backdrop = 'static';
                options.keyboard = false;
            }

            $uibModal.open(options).result.then(
                (settings) => {
                    $scope.settings = settings;
                    if ($scope.settingsFor === '') {
                        $scope.importSelected();
                    } else {
                        $scope.importFile($scope.settingsFor, true);
                    }
                },
                (settings) => {
                    $scope.settings = settings;
                    if (onImportRejectHandler) {
                        onImportRejectHandler();
                    }
                });
        };

        /**
         * TODO: this is just some ugly proxy function. It should be refactored.
         * @param {string} fileName - Name of the file.
         * @param {boolean} withDefaultSettings - Whether to use default settings or not.
         * @param {boolean} startImport - Whether to start the import process or not.
         */
        $scope.updateImport = (fileName, withDefaultSettings, startImport) => {
            $scope.settingsFor = fileName;
            $scope.settings = getSettingsFor(fileName, withDefaultSettings);

            $scope.importFile(fileName, startImport);
        };

        $scope.stopImport = (file) => {
            ImportRestService.stopImport($repositories.getActiveRepository(), {name: file.name, type: file.type})
                .success(function () {
                    $scope.updateList();
                }).error(function (data) {
                toastr.warning($translate.instant('import.error.could.not.stop', {data: getError(data)}));
            });
        };

        $scope.importable = () => {
            return true;
        };

        $scope.hasImportable = () =>{
            return $scope.files.some((file) => $scope.importable(file));
        };

        $scope.showTable = () => {
            const showTable = $scope.files.length > 0 && ('user' === $scope.viewType || 'server' === $scope.viewType);
            if ($scope.checkAll) {
                $scope.switchBatch(true);
            }
            return showTable;
        };

        $scope.switchBatch = (all) => {
            if (all) {
                $scope.selectAllFiles();
            } else {
                if ($scope.checkAll) {
                    $scope.checkAll = false;
                }
            }
            $scope.batch = _.map(_.filter($scope.files, function (f) {
                return $scope.fileChecked[f.name] && $scope.importable(f);
            }), 'name').length > 0;
        };

        $scope.rebatch = () => {
            const newFileChecked = {};
            $scope.batch = false;
            _.each($scope.files, function (file) {
                newFileChecked[file.name] = $scope.fileChecked[file.name];
                $scope.batch |= $scope.fileChecked[file.name];
            });
            if (!$scope.batch) {
                $scope.checkAll = false;
            }
            $scope.fileChecked = newFileChecked;
        };

        $scope.getSelectedFiles = () => {
            return _.map(_.filter($scope.getVisibleFiles(), function (f) {
                return $scope.fileChecked[f.name] && $scope.importable(f);
            }), 'name');
        };

        $scope.importSelected = (overrideSettings) => {
            const selectedFileNames = $scope.getSelectedFiles();

            // Calls the REST API sequentially for the selected files
            const importNext = () => {
                const fileName = selectedFileNames.shift();
                if (fileName) {
                    if (overrideSettings) {
                        $scope.settings = getSettingsFor(fileName);
                    }
                    $scope.importFile(fileName, true, importNext);
                }
            };

            importNext();
        };

        $scope.resetStatus = (names) => {
            resetStatusOrRemoveEntry(names, false);
        };

        $scope.resetStatusSelected = () => {
            $scope.resetStatus($scope.getSelectedFiles());
        };

        $scope.isLocalLocation = () => {
            const location = $repositories.getActiveLocation();
            return location && location.local;
        };

        $scope.filterSettings = (fileName) => {
            let filtered = _.omitBy($scope.savedSettings[fileName], _.isNull);
            filtered = _.omit(filtered, ['repoLocationHash', 'status', 'message', 'name', 'data', 'type', 'format', 'fileNames', '$$hashKey']);
            return _.map(_.keys(filtered), function (key) {
                return [key, filtered[key]];
            });
        };

        $scope.getSettings = () => {
            if (!$scope.canWriteActiveRepo()) {
                return;
            }

            ImportRestService.getDefaultSettings($repositories.getActiveRepository())
                .success(function (data) {
                    $scope.defaultSettings = data;
                }).error(function (data) {
                toastr.warning($translate.instant('import.error.default.settings', {data: getError(data)}));
            });
        };

        $scope.pritifySettings = (settings) => {
            return JSON.stringify(settings, null, ' ');
        };

        $scope.updateList = (force) => {
            if (!$scope.canWriteActiveRepo()) {
                return;
            }
            if (!$($scope.tabId).is(':visible')) {
                return;
            }
            $scope.updateListHttp(force);
        };

        // This should be public because it's used by the upload and import controllers
        $scope.onRepositoryChange = () => {
            // Update restricted on repositoryIsSet
            $scope.setRestricted();
            if ($scope.isRestricted) {
                return;
            }
            $scope.updateList(true);
            $scope.getSettings();
        };

        $scope.onImport = (resource) => {
            $scope.setSettingsFor(resource.importResource.name, false, resource.importResource.format);
        };

        $scope.onDelete = (importResource) => {
            console.log('The resource ', importResource, 'have to be deleted');
        };

        /**
         * Triggers a remove operation in the backend for selected resources.
         * @param {ImportResourceTreeElement[]} selectedResources - The resources to be removed.
         */
        $scope.onRemove = (selectedResources) => {
            const resourceNames = selectedResources.map((resource) => resource.name);
            removeEntry(resourceNames);
        };

        $scope.onReset = (resources = []) => {
            resetStatusOrRemoveEntry(resources.map((resource) => resource.importResource.name), false);
        };

        $scope.importAll = (selectedResources, withoutChangingSettings) => {
            console.log('The resources ', selectedResources, ' have to be imported withoutChangingSettings: ' + withoutChangingSettings);
        };

        // =========================
        // Private functions
        // =========================

        /**
         * Opens a confirmation dialog to confirm the removal of the selected resources. If removal is confirmed, a
         * request is sent to the backend with the selected file names to be removed.
         * @param {string[]} names - The names of the resources to be removed.
         */
        const removeEntry = (names = []) => {
            const namesString = `<br/>${names.join('<br/>')}`;
            const message = decodeHTML($translate.instant('import.remove.confirm.msg', {name: namesString}));
            ModalService.openConfirmation(
                $translate.instant('common.confirm'),
                message,
                () => {
                    resetStatusOrRemoveEntry(names, true);
                });
        };

        const getSettingsFor = (fileName, withDefaultSettings) => {
            if (!withDefaultSettings && !_.isEmpty(fileName) && !_.isEmpty($scope.savedSettings[fileName])) {
                return $scope.savedSettings[fileName];
            } else {
                return _.cloneDeep($scope.defaultSettings);
            }
        };

        // TODO: temporary exposed in the scope because it is called via scope.parent from the child TabsCtrl which should be changed
        /**
         * @param {boolean} force - Force the files list to be replaced with the new data
         */
        $scope.updateListHttp = (force) => {
            const filesLoader = $scope.viewUrl === OPERATION.UPLOAD ? ImportRestService.getUploadedFiles : ImportRestService.getServerFiles;
            filesLoader($repositories.getActiveRepository()).success(function (data) {

                // Commented during development. When everything is ready this functionality have to change current one.
                if (TABS.SERVER === $scope.viewType) {
                    $scope.serverImportTree = toImportServerResource(toImportResource(data));
                } else if (TABS.USER === $scope.viewType) {
                    $scope.userData = toImportUserDataResource(toImportResource(data));
                }

                // reload all files
                if ($scope.files.length === 0 || force) {
                    $scope.files = data;
                    ImportContextService.updateFiles($scope.files);
                    $scope.files.forEach(function (f) {
                        if (!f.type) {
                            f.type = $scope.defaultType;
                        }
                    });
                    $scope.rebatch();
                } else {
                    // update the status of the files using the response from the server
                    $scope.files.forEach(function (f) {
                        const remoteStatus = _.find(data, _.matches({'name': f.name}));
                        if (f.status && remoteStatus) {
                            _.assign(f, remoteStatus);
                        }
                        if (!f.type) {
                            f.type = $scope.defaultType;
                        }
                    });
                }
                // Need new status here
                if (force && 'user' === $scope.viewType) {
                    $scope.files = _.filter($scope.files, function (f) {
                        return f.status !== undefined;
                    });
                    ImportContextService.updateFiles($scope.files);
                }
                $scope.showClearStatuses = _.filter($scope.files, function (file) {
                    return file.status === FILE_STATUS.DONE || file.status === FILE_STATUS.ERROR;
                }).length > 0;

                $scope.savedSettings = _.mapKeys(_.filter($scope.files, 'parserSettings'), 'name');
            }).error(function (data) {
                toastr.warning($translate.instant('import.error.could.not.get.files', {data: getError(data)}));
            }).finally(() => {
                $scope.loader = false;
            });
        };

        const resetStatusOrRemoveEntry = (names, remove) => {
            if (!names || names.length < 1) {
                return;
            }
            const resetService = $scope.viewUrl === OPERATION.UPLOAD ? ImportRestService.resetUserDataStatus : ImportRestService.resetServerFileStatus;
            resetService($repositories.getActiveRepository(), names, remove).success(function () {
                $scope.updateList(true);
            }).error(function (data) {
                toastr.warning($translate.instant('import.error.could.not.clear', {data: getError(data)}));
            });
        };

        const getAppData = () => {
            LicenseRestService.getInfo().success(function (data) {
                $scope.appData = {};
                $scope.appData.properties = {};
                for (let i = 0; i < data.length; i++) {
                    $scope.appData.properties[data[i].key] = {
                        source: data[i].source,
                        value: data[i].value
                    };
                }
                $scope.maxUploadFileSizeMB = FileUtils.convertBytesToMegabytes($scope.appData.properties['graphdb.workbench.maxUploadSize'].value);
            }).error(function (data) {
                const msg = getError(data);
                toastr.error(msg, $translate.instant('common.error'));
            });
        };

        const removeAllListeners = () => {
            subscriptions.forEach((subscription) => subscription());
        };

        const initPersistence = () => {
            ImportViewStorageService.initImportViewSettings();
        };

        const initSubscribtions = () => {
            subscriptions.push($scope.$on('repositoryIsSet', $scope.onRepositoryChange));
            subscriptions.push($scope.$on('$destroy', () => $interval.cancel(listPollingHandler)));
            $scope.$on('$destroy', removeAllListeners);
        };

        // =========================
        // Initialization
        // =========================

        // TODO: Beware that this init is called tree times due to the child controllers which extends this one. We should refactor this.
        const init = () => {
            initSubscribtions();
            getAppData();
            initPersistence();
        };
        init();
    }]);

importViewModule.controller('ImportCtrl', ['$scope', 'toastr', '$controller', '$translate', '$repositories', 'ImportRestService', function ($scope, toastr, $controller, $translate, $repositories, ImportRestService) {

    // =========================
    // Private variables
    // =========================

    // =========================
    // Public variables
    // =========================

    $scope.loader = true;
    angular.extend(this, $controller('ImportViewCtrl', {$scope: $scope}));
    $scope.viewUrl = OPERATION.SERVER;
    $scope.defaultType = 'server';
    $scope.tabId = '#import-server';
    $scope.showItems = 'all';

    // =========================
    // Public functions
    // =========================

    $scope.importSelected = function (overrideSettings) {
        const selectedFileNames = $scope.getSelectedFiles();
        importServerFiles(selectedFileNames, overrideSettings);
    };

    $scope.importFile = function (fileName) {
        importServerFiles([fileName]);
    };

    // =========================
    // Private functions
    // =========================

    const importServerFiles = function (selectedFileNames, overrideSettings) {
        if (!$scope.canWriteActiveRepo()) {
            return;
        }

        ImportRestService.importServerFiles(
            $repositories.getActiveRepository(),
            {importSettings: overrideSettings ? null : $scope.settings, fileNames: selectedFileNames}
        ).success(function () {
            $scope.updateList();
            $scope.batch = false;
            $scope.fileChecked = {};
        }).error(function (data) {
            toastr.error($translate.instant('import.could.not.send.file', {data: getError(data)}));
        });
    };

    // =========================
    // Initialization
    // =========================

    const init = function () {
        $scope.pollList();
        $scope.onRepositoryChange();
    };
    init();
}]);

importViewModule.controller('UploadCtrl', ['$scope', 'toastr', '$controller', '$uibModal', '$translate', '$repositories', 'ImportRestService', 'UploadRestService', 'ModalService', 'ImportContextService', function ($scope, toastr, $controller, $uibModal, $translate, $repositories, ImportRestService, UploadRestService, ModalService, ImportContextService) {

    // =========================
    // Private variables
    // =========================

    // =========================
    // Public variables
    // =========================

    $scope.loader = true;
    angular.extend(this, $controller('ImportViewCtrl', {$scope: $scope}));
    $scope.viewUrl = OPERATION.UPLOAD;
    $scope.defaultType = USER_DATA_TYPE.FILE;
    $scope.tabId = '#import-user';
    // A list with all files that were uploaded or currently selected for uploading by the user.
    // This list is being watched by the controller. When it finds a change, it updates the $scope.files and tries to
    // upload the new files.
    // This is similar to the $scope.files which is used for the table rendering, but the files in the later have
    // different nested models. See the watcher for more details.
    $scope.currentFiles = [];
    // A flag to indicate if the list is initialized for the first time on load. This is needed in order to prevent
    // the watcher for $scope.currentFiles to try to update the $scope.files and to re-upload them on load.
    let isFileListInitialized = false;
    $scope.pastedDataIdx = 1;
    // A registry to keep track of the current index for each file name. The registry is created on page load and
    // updated when a new file is selected by the user with the option to preserve the original file.
    const filesPrefixRegistry = new FilePrefixRegistry();
    // Keeps track of any subscription that needs to be removed when the controller is destroyed.
    const subscriptions = [];

    // =========================
    // Public functions
    // =========================

    $scope.importable = function () {
        return true;
    };

    $scope.fileSelected = function ($files, $file, $newFiles, $duplicateFiles, $invalidFiles) {
        notifyForTooLargeFiles($invalidFiles);
        const newFiles = $newFiles || [];
        // RDF4J does not support decompressing .bz2 files, so we want to reject importing them
        removeBZip2Files(newFiles);

        const duplicatedFiles = [];
        const uniqueFiles = [];
        newFiles.forEach((file) => {
            const isDuplicated = $scope.files.some((currentFile) => currentFile.name === file.name);
            if (isDuplicated) {
                duplicatedFiles.push(file);
            } else {
                uniqueFiles.push(file);
            }
        });

        if (duplicatedFiles.length > 0) {
            // ask the user if he wants to keep the original files or overwrite them.
            openDuplicatedFilesConfirmDialog(duplicatedFiles, uniqueFiles);
        } else {
            $scope.currentFiles = [...newFiles];
            isFileListInitialized = true;
        }
    };

    $scope.importFile = (fileName, startImport, nextCallback) => {
        const file = $scope.files.find((currentFile) => currentFile.name === fileName);
        if (!file) {
            toastr.warning($translate.instant('import.no.such.file', {name: fileName}));
        } else {
            if (file.type === USER_DATA_TYPE.TEXT) {
                importTextSnippet(file, startImport, nextCallback);
            } else if (file.type === USER_DATA_TYPE.URL) {
                importFromUrl(file, startImport, nextCallback);
            } else {
                uploadFile(file, startImport, nextCallback);
            }
        }
    };

    /**
     * Opens a modal dialog where the user can paste a rdf text snippet and import it.
     * @param {{object}|undefined} file
     */
    $scope.openTextSnippetDialog = (file) => {
        const scope = {};
        if (file) {
            scope.rdfText = file.data;
        }
        const modalInstance = $uibModal.open({
            templateUrl: 'js/angular/import/templates/textSnippet.html',
            controller: 'TextCtrl',
            resolve: {
                text: function () {
                    return file ? file.data : '';
                },
                format: function () {
                    return file ? file.format : 'text/turtle';
                }
            }
        });

        modalInstance.result.then((data) => {
            if (file) {
                if ((file.data !== data.text || file.format !== data.format) && file.status !== FILE_STATUS.NONE) {
                    file.status = FILE_STATUS.NONE;
                    file.message = $translate.instant('import.text.snippet.not.imported');
                }
                file.data = data.text;
                file.format = data.format;
                updateTextImport(file);
            } else {
                file = {type: 'text', name: 'Text snippet ' + DateUtils.formatCurrentDateTime(), format: data.format, data: data.text};
                $scope.files.unshift(file);
                $scope.updateImport(file.name, false, false);
            }
            if (data.startImport) {
                $scope.setSettingsFor(file.name, false, file.format);
            }
        });
    };

    $scope.rdfDataFromURL = function () {
        const modalInstance = $uibModal.open({
            templateUrl: 'js/angular/import/templates/urlImport.html',
            controller: 'UrlCtrl',
            scope: $scope
        });

        modalInstance.result.then(function (data) {
            // URL may already exist
            const existing = _.find($scope.files, {type: 'url', name: data.url});
            if (existing) {
                existing.format = data.format;
            } else {
                $scope.files.unshift({type: 'url', name: data.url, format: data.format, data: data.url});
            }
            $scope.updateImport(data.url, true, false);
            if (data.startImport) {
                $scope.setSettingsFor(data.url, true, data.format);
            }
        });
    };

    // =========================
    // Private functions
    // =========================

    const notifyForTooLargeFiles = (invalidFiles) => {
        if (invalidFiles.length > 0) {
            invalidFiles.forEach(function (file) {
                toastr.warning($translate.instant('import.large.file', {
                    name: file.name,
                    size: FileUtils.convertBytesToMegabytes(file.size)
                }));
            });
        }
    };

    const importTextSnippet = (file, startImport, nextCallback) => {
        $scope.settings.name = file.name;
        $scope.settings.type = file.type;
        $scope.settings.data = file.data;
        $scope.settings.format = file.format;
        file.status = FILE_STATUS.PENDING;

        const importer = startImport ? ImportRestService.importTextSnippet : ImportRestService.updateTextSnippet;
        importer($repositories.getActiveRepository(), $scope.settings)
            .success(function () {
                $scope.updateList();
            }).error(function (data) {
            toastr.error($translate.instant('import.could.not.send.data', {data: getError(data)}));
            file.status = FILE_STATUS.ERROR;
            file.message = getError(data);
        }).finally(nextCallback || function () {});
    };

    const updateTextImport = (settings) => {
        $scope.updating = true;
        ImportRestService.updateTextSnippet($repositories.getActiveRepository(), settings).success(function (data) {
            // its updated
        }).error(function (data) {
            toastr.error($translate.instant('import.could.not.update.text', {data: getError(data)}));
        }).finally(function () {
            $scope.updating = false;
        });
    };

    const importFromUrl = (file, startImport, nextCallback) => {
        $scope.settings.name = file.name;
        $scope.settings.type = file.type;
        $scope.settings.data = file.data;
        $scope.settings.format = file.format;
        file.status = FILE_STATUS.PENDING;

        const importer = startImport ? ImportRestService.importFromUrl : ImportRestService.updateFromUrl;
        importer($repositories.getActiveRepository(), $scope.settings).success(function () {
            $scope.updateList();
        }).error(function (data) {
            toastr.error($translate.instant('import.could.not.send.url', {data: getError(data)}));
        }).finally(nextCallback || function () {});
    };

    const uploadFile = (file, startImport, nextCallback) => {
        $scope.settings.name = file.name;
        const data = UploadRestService.createUploadPayload(file, $scope.settings);
        const uploader = startImport ? UploadRestService.uploadUserDataFile : UploadRestService.updateUserDataFile;
        uploader($repositories.getActiveRepository(), file, data).then(() => {
            $scope.updateList();
        }).catch((data) => {
            toastr.error($translate.instant('import.could.not.upload.file', {data: getError(data)}));
            file.status = FILE_STATUS.ERROR;
            file.message = getError(data);
        }).finally(nextCallback || function () {});
    };

    const removeBZip2Files = (files) => {
        files.forEach(function (f) {
            if (f.name.substr(f.name.lastIndexOf('.') + 1) === 'bz2') {
                const fileIdx = files.indexOf(f);
                if (fileIdx > -1) {
                    files.splice(fileIdx, 1);
                }
                toastr.error($translate.instant('import.could.not.upload', {name: f.name}));
            }
        });
    };

    const openDuplicatedFilesConfirmDialog = (duplicatedFiles, uniqueFiles) => {
        const existingFilenames = duplicatedFiles.map((file) => file.name).join('<br/>');
        return ModalService.openSimpleModal({
            title: $translate.instant('import.user_data.duplicates_confirmation.title'),
            message: decodeHTML($translate.instant('import.user_data.duplicates_confirmation.message', {duplicatedFiles: existingFilenames})),
            dialogClass: "confirm-duplicate-files-dialog",
            warning: true
        }).result.then(
            () => {
                // on first upload, currentFiles would be empty
                if (!$scope.currentFiles.length) {
                    $scope.currentFiles.push(...duplicatedFiles, ...uniqueFiles);
                } else {
                    // while staying on the import view, each upload after the first should override existing files with
                    // newer versions if file names are equal
                    $scope.currentFiles = [...duplicatedFiles, ...uniqueFiles];
                }
                isFileListInitialized = true;
            },
            () => {
                // override rejected
                const prefixedDuplicates = filesPrefixRegistry.prefixDuplicates(duplicatedFiles);
                $scope.currentFiles = [...$scope.currentFiles, ...prefixedDuplicates, ...uniqueFiles];
                isFileListInitialized = true;
            }
        );
    };

    const uploadedFilesValidator = () => {
        $scope.files = _.uniqBy(
            _.union(
                _.map($scope.currentFiles, function (file) {
                    return {name: file.name, type: 'file', file: file};
                }),
                $scope.files
            ),
            function (file) {
                return file.name;
            }
        );
        $scope.savedSettings = _.mapKeys(_.filter($scope.files, 'parserSettings'), 'name');
        if (isFileListInitialized) {
            // Mark the new files so that they can all be collected and imported.
            if ($scope.currentFiles.length > 0) {
                deselectAllFiles();
                $scope.currentFiles.forEach((file) => {
                    $scope.fileChecked[file.name] = true;
                });
                // Provide an import rejected callback and do the upload instead.
                $scope.setSettingsFor('', false, undefined, () => {
                    $scope.currentFiles.forEach((file) => {
                        $scope.updateImport(file.name, false, false);
                    });
                });
            }
        }
    };

    const deselectAllFiles = () => {
        Object.keys($scope.fileChecked).forEach((key) => {
            $scope.fileChecked[key] = false;
        });
    };

    const removeAllListeners = () => {
        subscriptions.forEach((subscription) => subscription());
    };

    // =========================
    // Watchers and event handlers
    // =========================

    subscriptions.push($scope.$watchCollection('currentFiles', uploadedFilesValidator));

    $scope.$on('$destroy', removeAllListeners);

    // =========================
    // Initialization
    // =========================

    const init = function () {
        $scope.pollList();
        $scope.onRepositoryChange();
        ImportContextService.onFilesUpdated((files) => {
            filesPrefixRegistry.buildPrefixesRegistry(files);
        });
    };
    init();
}]);

importViewModule.controller('UrlCtrl', ['$scope', '$uibModalInstance', 'toastr', function ($scope, $uibModalInstance) {

    // =========================
    // Public variables
    // =========================

    $scope.importFormat = {name: 'Auto', type: ''};
    $scope.startImport = true;

    // =========================
    // Public functions
    // =========================

    $scope.cancel = function () {
        $uibModalInstance.dismiss();
    };

    $scope.ok = function () {
        $uibModalInstance.close({
            url: $scope.dataUrl,
            format: $scope.importFormat.type,
            startImport: $scope.startImport
        });
    };
}]);

importViewModule.controller('TextCtrl', ['$scope', '$uibModalInstance', 'text', 'format', function ($scope, $uibModalInstance, text, format) {

    // =========================
    // Public variables
    // =========================

    $scope.importFormats = [
        {name: 'RDF/JSON', type: 'application/rdf+json'},
        {name: 'JSON-LD', type: 'application/ld+json'},
        {name: 'NDJSON-LD', type: 'application/x-ld+ndjson'},
        {name: 'RDF/XML', type: 'application/rdf+xml'},
        {name: 'N3', type: 'text/rdf+n3'},
        {name: 'N-Triples', type: 'text/plain'},
        {name: 'N-Quads', type: 'text/x-nquads'},
        {name: 'Turtle', type: 'text/turtle'},
        {name: 'Turtle*', type: 'application/x-turtlestar'},
        {name: 'TriX', type: 'application/trix'},
        {name: 'TriG', type: 'application/x-trig'},
        {name: 'TriG*', type: 'application/x-trigstar'}
    ];
    $scope.rdfText = text;
    $scope.importFormat = _.find($scope.importFormats, {type: format});
    $scope.startImport = true;

    // =========================
    // Public functions
    // =========================

    $scope.setFormat = function (format) {
        $scope.importFormat = format;
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss();
    };

    $scope.ok = function () {
        $uibModalInstance.close({
            text: $scope.rdfText,
            format: $scope.importFormat.type,
            startImport: $scope.startImport
        });
    };
}]);

importViewModule.controller('TabCtrl', ['$scope', '$location', 'ImportViewStorageService', 'ImportContextService', function ($scope, $location, ImportViewStorageService, ImportContextService) {

    // =========================
    // Private variables
    // =========================

    // flag to reset help visibility on empty state in initial load of the view
    let shouldResetHelpVisibility = true;

    // =========================
    // Public variables
    // =========================

    $scope.viewType = $location.hash();
    $scope.isHelpVisible = true;
    $scope.fileSizeLimitInfoTemplateUrl = 'js/angular/import/templates/fileSizeLimitInfo.html';

    // =========================
    // Public functions
    // =========================

    $scope.openTab = (tab) => {
        $scope.viewType = tab;
        $scope.$parent.viewUrl = tab === 'server' ? OPERATION.SERVER : OPERATION.UPLOAD;
        $location.hash($scope.viewType);
        $scope.updateListHttp(true);
    };

    $scope.changeHelpTemplate = function (templateFile) {
        $scope.templateUrl = 'js/angular/import/templates/' + templateFile;
    };

    $scope.toggleHelp = () => {
        const viewPersistance = ImportViewStorageService.getImportViewSettings();
        ImportViewStorageService.toggleHelpVisibility();
        $scope.isHelpVisible = !viewPersistance.isHelpVisible;
    };

    // =========================
    // Private functions
    // =========================

    const onFilesUpdated = (files) => {
        // reset help visibility on empty state in initial load
        if (shouldResetHelpVisibility && files.length === 0) {
            ImportViewStorageService.setHelpVisibility(true);
            shouldResetHelpVisibility = false;
        }
        const viewPersistance = ImportViewStorageService.getImportViewSettings();
        let isVisible = viewPersistance.isHelpVisible;
        if (files.length === 0 && viewPersistance.isHelpVisible) {
            isVisible = true;
        } else if (files.length === 0 && !viewPersistance.isHelpVisible) {
            isVisible = false;
        } else if (viewPersistance.isHelpVisible) {
            isVisible = true;
        } else if (!viewPersistance.isHelpVisible) {
            isVisible = false;
        }
        ImportViewStorageService.setHelpVisibility(isVisible);
        $scope.isHelpVisible = isVisible;
    };

    // =========================
    // Initialization
    // =========================

    const init = function () {
        ImportContextService.onFilesUpdated(onFilesUpdated);

        if ($scope.viewType !== 'user' && $scope.viewType !== 'server') {
            $scope.viewType = 'user';
        }

        if ($scope.viewType === 'user') {
            $scope.templateUrl = 'js/angular/import/templates/uploadInfo.html';
        } else {
            $scope.templateUrl = 'js/angular/import/templates/importInfo.html';
        }

        $scope.openTab($scope.viewType || 'user');
    };
    init();
}]);

importViewModule.controller('SettingsModalCtrl', ['$scope', '$uibModalInstance', 'toastr', 'UriUtils', 'settings', 'hasParserSettings', 'defaultSettings', 'isMultiple', '$translate',
    function ($scope, $uibModalInstance, toastr, UriUtils, settings, hasParserSettings, defaultSettings, isMultiple, $translate) {

        // =========================
        // Public variables
        // =========================

        $scope.settings = settings;
        $scope.hasParserSettings = hasParserSettings;
        $scope.isMultiple = isMultiple;
        $scope.enableReplace = !!($scope.settings.replaceGraphs && $scope.settings.replaceGraphs.length);
        $scope.showAdvancedSettings = false;

        // =========================
        // Public functions
        // =========================

        $scope.hasError = function (error, input) {
            return _.find(error, function (o) {
                return input === o['$name'];
            });
        };

        $scope.ok = function () {
            // resets the validity of a field only used for temporary things
            $scope.settingsForm.replaceGraph.$setValidity('replaceGraph', true);

            if ($scope.settingsForm.$valid) {
                fixSettings();
                $uibModalInstance.close($scope.settings);
            }
        };

        $scope.cancel = function () {
            fixSettings();
            $uibModalInstance.dismiss($scope.settings);
        };

        $scope.reset = function () {
            $scope.settings = _.cloneDeep(defaultSettings);
            $scope.target = 'data';
        };

        $scope.addReplaceGraph = function (graph) {
            let valid = true;
            if (graph !== 'default') {
                valid = UriUtils.isValidIri(graph, graph.toString());
            }
            $scope.settingsForm.replaceGraph.$setTouched();
            $scope.settingsForm.replaceGraph.$setValidity('replaceGraph', valid);

            if ($scope.settingsForm.replaceGraph.$valid) {
                $scope.settings.replaceGraphs = $scope.settings.replaceGraphs || [];
                if (_.indexOf($scope.settings.replaceGraphs, graph) === -1) {
                    $scope.replaceGraph = '';
                    $scope.settings.replaceGraphs.push(graph);
                } else {
                    toastr.warning($translate.instant('import.graph.already.in.list'));
                }
            }
        };

        $scope.checkEnterReplaceGraph = function (event, graph) {
            if (event.keyCode === 13) {
                event.preventDefault();
                $scope.addReplaceGraph(graph);
            }
        };

        $scope.switchParserSettings = function () {
            $scope.showAdvancedSettings = !$scope.showAdvancedSettings;
        };

        // =========================
        // Private functions
        // =========================

        const fixSettings = function () {
            if ($scope.target === 'default') {
                $scope.settings.context = 'default';
            } else if ($scope.target === 'data') {
                $scope.settings.context = '';
            }
            if ($scope.enableReplace) {
                if ($scope.target === 'default' || $scope.target === 'named') {
                    $scope.settings.replaceGraphs = [$scope.settings.context];
                }
            } else {
                $scope.settings.replaceGraphs = [];
            }
        };

        // =========================
        // Initialization
        // =========================

        const init = function () {
            if ($scope.settings.context) {
                if ($scope.settings.context === 'default') {
                    $scope.target = 'default';
                    $scope.settings.context = '';
                } else {
                    $scope.target = 'named';
                }
            } else {
                $scope.target = 'data';
            }
        };
        init();
    }]);
