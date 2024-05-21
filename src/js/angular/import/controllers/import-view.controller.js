import 'angular/core/services';
import 'angular/utils/uri-utils';
import 'angular/rest/import.rest.service';
import 'angular/rest/upload.rest.service';
import 'angular/import/services/import-context.service';
import 'angular/import/services/import-view-storage.service';
import 'angular/import/controllers/tab.controller';
import 'angular/import/controllers/settings-modal.controller';
import 'angular/import/controllers/import-url.controller';
import 'angular/import/controllers/import-text-snippet.controller';
import 'angular/import/controllers/file-override-confirmation.controller';
import {FileFormats} from "../../models/import/file-formats";
import * as stringUtils from "../../utils/string-utils";
import {FileUtils} from "../../utils/file-utils";
import {DateUtils} from "../../utils/date-utils";
import {toImportResource, toImportServerResource, toImportUserDataResource} from "../../rest/mappers/import-mapper";
import {ImportResourceTreeElement} from "../../models/import/import-resource-tree-element";
import {decodeHTML} from "../../../../app";
import {FilePrefixRegistry} from "../services/file-prefix-registry";
import {SortingType} from "../../models/import/sorting-type";
import {ImportResourceStatus} from "../../models/import/import-resource-status";
import {TABS} from "../services/import-context.service";

const modules = [
    'ui.bootstrap',
    'toastr',
    'graphdb.framework.core.services.repositories',
    'graphdb.framework.utils.localstorageadapter',
    'graphdb.framework.utils.uriutils',
    'graphdb.framework.guides.services',
    'graphdb.framework.rest.import.service',
    'graphdb.framework.rest.upload.service',
    'graphdb.framework.import.services.importcontext',
    'graphdb.framework.import.services.importviewstorageservice',
    'graphdb.framework.impex.import.controllers.tab',
    'graphdb.framework.impex.import.controllers.settings-modal',
    'graphdb.framework.impex.import.controllers.import-url',
    'graphdb.framework.impex.import.controllers.import-text-snippet',
    'graphdb.framework.impex.import.controllers.file-override-confirmation'
];

const importViewModule = angular.module('graphdb.framework.impex.import.controllers', modules);

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
        $scope.activeTabId = ImportContextService.getActiveTabId();
        /**
         * Contains a mapping of file names to flags indicating whether the file is selected or not.
         * The selected files from this mapping are synchronized in the resources model each time it is refreshed from
         * the server.
         * @type {{[string]:boolean}}
         */
        $scope.selectedForImportFiles = {};
        $scope.popoverTemplateUrl = 'settingsPopoverTemplate.html';
        $scope.fileFormatsExtended = FileFormats.getFileFormatsExtended();
        $scope.fileFormatsHuman = FileFormats.getFileFormatsHuman() + $translate.instant('import.gz.zip');
        $scope.textFileFormatsHuman = FileFormats.getTextFileFormatsHuman();
        $scope.maxUploadFileSizeMB = 0;
        $scope.SORTING_TYPES = SortingType;

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
                controller: 'SettingsModalController',
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

        /**
         * Get selection from the resource tree.
         * @return {string[]}
         */
        $scope.getSelectedFiles = () => {
            return ImportContextService.getResources().getAllSelectedFilesNames();
        };

        $scope.importSelected = (overrideSettings) => {
            const selected = new Set([...Object.keys($scope.selectedForImportFiles), ...$scope.getSelectedFiles()]);
            const selectedFileNames = Array.from(selected);

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

        $scope.isLocalLocation = () => {
            const location = $repositories.getActiveLocation();
            return location && location.local;
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

        /**
         * Handles the change of the active repository.
         *
         * !!!This should be public because it's used by the upload and import controllers
         */
        $scope.onRepositoryChange = () => {
            // Update restricted on repositoryIsSet
            $scope.setRestricted();
            if ($scope.isRestricted) {
                return;
            }
            $scope.updateList(true);
            getSettings();
        };

        /**
         * Handles the import operation triggered by the user.
         * @param {ImportResourceTreeElement} resource - The resource for which the import should be triggered.
         */
        $scope.onImport = (resource) => {
            $scope.setSettingsFor(resource.importResource.name, false, resource.importResource.format);
        };

        /**
         * Triggers a stop operation in the backend for selected resources.
         * @param {ImportResourceTreeElement} resource - The resource for which the import should be stopped.
         */
        $scope.onStopImport = (resource) => {
            const file = resource.importResource;
            ImportRestService.stopImport($repositories.getActiveRepository(), {name: file.name, type: file.type})
                .success(function () {
                    $scope.updateList();
                }).error(function (data) {
                toastr.warning($translate.instant('import.error.could.not.stop', {data: getError(data)}));
            });
        };

        /**
         * Triggers a remove operation in the backend for selected resources.
         * @param {ImportResourceTreeElement[]} resources - The resources to be removed.
         */
        $scope.onRemove = (resources) => {
            const resourceNames = resources.map((resource) => resource.name);
            removeEntry(resourceNames);
        };

        /**
         * Resets the status of the selected resources.
         * @param {string[]} selectedResourcesNames - The names of the resources to be reset.
         */
        $scope.onReset = (selectedResourcesNames) => {
            resetStatusOrRemoveEntry(selectedResourcesNames, false);
        };

        /**
         * Imports all selected resources.
         * @param {ImportResourceTreeElement[]} selectedResources - The resources to be imported.
         * @param {boolean} withoutChangingSettings - Whether to use default settings or not.
         */
        $scope.importAll = (selectedResources, withoutChangingSettings) => {
            // mark all files as selected locally in order to have them after the import is confirmed via the modal
            selectedResources
                .forEach((resource) => {
                    $scope.selectedForImportFiles[resource.path] = true;
                });
            if (withoutChangingSettings) {
                $scope.importSelected(selectedResources, withoutChangingSettings);
            } else {
                // For single file import we need to pass the name.
                let fileName = '';
                if (selectedResources.length === 1) {
                    fileName = selectedResources[0].importResource.name;
                }
                $scope.setSettingsFor(fileName, withoutChangingSettings, undefined);
            }
        };

        /**
         * Edits the <code>resource</code>.
         *
         * @param {ImportResourceTreeElement} resource - the resource to be edited.
         */
        $scope.onEditResource = (resource) => {
            if (resource.importResource.isText()) {
                $scope.openTextSnippetDialog(resource.importResource);
            }
        };

        // =========================
        // Private functions
        // =========================

        const getSettings = () => {
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
            const filesLoader = $scope.activeTabId === TABS.USER ? ImportRestService.getUploadedFiles : ImportRestService.getServerFiles;
            filesLoader($repositories.getActiveRepository()).success(function (data) {

                if (TABS.SERVER === $scope.activeTabId) {
                    ImportContextService.updateResources(toImportServerResource(toImportResource(data)));
                } else if (TABS.USER === $scope.activeTabId) {
                    ImportContextService.updateResources(toImportUserDataResource(toImportResource(data)));
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
                if (force && TABS.USER === $scope.activeTabId) {
                    $scope.files = _.filter($scope.files, function (f) {
                        return f.status !== undefined;
                    });
                    ImportContextService.updateFiles($scope.files);
                }

                $scope.savedSettings = _.mapKeys(_.filter($scope.files, 'parserSettings'), 'name');
            }).error(function (data) {
                toastr.warning($translate.instant('import.error.could.not.get.files', {data: getError(data)}));
            });
        };

        const resetStatusOrRemoveEntry = (names, remove) => {
            if (!names || names.length < 1) {
                return;
            }
            const resetService = $scope.activeTabId === TABS.USER ? ImportRestService.resetUserDataStatus : ImportRestService.resetServerFileStatus;
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

        const initSubscriptions = () => {
            subscriptions.push($scope.$on('repositoryIsSet', $scope.onRepositoryChange));
            subscriptions.push($scope.$on('$destroy', () => $interval.cancel(listPollingHandler)));
            subscriptions.push(ImportContextService.onActiveTabIdUpdated((newActiveTabId) => {
                $scope.activeTabId = newActiveTabId;
                ImportContextService.updateResources(new ImportResourceTreeElement());
                $scope.updateListHttp(true);
            }));
            $scope.$on('$destroy', removeAllListeners);
        };

        // =========================
        // Initialization
        // =========================

        // TODO: Beware that this init is called tree times due to the child controllers which extends this one. We should refactor this.
        const init = () => {
            initSubscriptions();
            getAppData();
            initPersistence();
        };
        init();
    }]);

importViewModule.controller('ImportCtrl', ['$scope', 'toastr', '$controller', '$translate', '$repositories', 'ImportRestService', 'ImportContextService', function ($scope, toastr, $controller, $translate, $repositories, ImportRestService, ImportContextService) {

    // =========================
    // Private variables
    // =========================

    // =========================
    // Public variables
    // =========================

    $scope.columnKeys = {
        'name': 'import.import_resource_tree.header.name',
        'size': 'import.import_resource_tree.header.size',
        'modified': 'import.import_resource_tree.header.modified',
        'imported': 'import.import_resource_tree.header.imported',
        'context': 'import.import_resource_tree.header.context'
    };
    $scope.loader = true;
    angular.extend(this, $controller('ImportViewCtrl', {$scope: $scope}));
    $scope.defaultType = 'server';
    $scope.tabId = '#import-server';

    // =========================
    // Public functions
    // =========================

    /**
     * Triggers import operation for selected files.
     * @param {boolean} overrideSettings If default settings should be used or not.
     */
    $scope.importSelected = (overrideSettings) => {
        const selectedFileNames = Object.keys($scope.selectedForImportFiles);
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
        const onFirstResourceUpdatesHandler = ImportContextService.onResourcesUpdated(() => {
            $scope.loader = false;
            onFirstResourceUpdatesHandler();
        });
    };
    init();
}]);

importViewModule.controller('UploadCtrl', ['$scope', 'toastr', '$controller', '$uibModal', '$translate', '$repositories', 'ImportRestService', 'UploadRestService', 'ModalService', 'ImportContextService', 'EventEmitterService', function ($scope, toastr, $controller, $uibModal, $translate, $repositories, ImportRestService, UploadRestService, ModalService, ImportContextService, EventEmitterService) {

    // =========================
    // Private variables
    // =========================

    // A registry to keep track of the current index for each file name. The registry is created on page load and
    // updated when a new file is selected by the user with the option to preserve the original file.
    const filesPrefixRegistry = new FilePrefixRegistry();
    // Keeps track of any subscription that needs to be removed when the controller is destroyed.
    const subscriptions = [];

    // =========================
    // Public variables
    // =========================

    $scope.columnKeys = {
        'name': 'import.import_resource_tree.header.name',
        'size': 'import.import_resource_tree.header.size',
        'modified': 'import.import_resource_tree.header.uploaded',
        'imported': 'import.import_resource_tree.header.imported',
        'context': 'import.import_resource_tree.header.context'
    };
    $scope.loader = true;
    angular.extend(this, $controller('ImportViewCtrl', {$scope: $scope}));
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

    // =========================
    // Public functions
    // =========================

    $scope.fileSelected = function ($files, $file, $newFiles, $duplicateFiles, $invalidFiles) {
        const eventData = {files: $newFiles, cancel: false};
        // Notify that new files have been selected and will be added for uploading.
        // Subscribers of the "filesForUploadSelected" event may cancel the event by setting the 'cancel' property to true in the passed 'eventData' object.
        EventEmitterService.emit("filesForUploadSelected", eventData, (eventData) => {
            // Skip uploading of files if some subscriber canceled the uploading.
            if (!eventData.cancel) {
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
            }
        });
    };

    /**
     * Triggers import operation for selected resource. The resource can be a file, url or a rdf text snippet.
     * @param {string} fileName The name of the file that was selected.
     * @param {boolean} startImport If the import should be started immediately.
     * @param {function} nextCallback A callback that is called when the import is finished.
     */
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
     * @param {{ImportResource}|undefined} importResource
     */
    $scope.openTextSnippetDialog = (importResource) => {
        const scope = {};
        if (importResource) {
            scope.rdfText = importResource.data;
        }
        const modalInstance = $uibModal.open({
            templateUrl: 'js/angular/import/templates/textSnippet.html',
            controller: 'ImportTextSnippetController',
            resolve: {
                text: function () {
                    return importResource ? importResource.data : '';
                },
                format: function () {
                    return importResource ? importResource.format : 'text/turtle';
                }
            }
        });

        modalInstance.result.then((data) => {
            if (importResource) {
                if ((importResource.data !== data.text || importResource.format !== data.format) && importResource.status !== ImportResourceStatus.NONE) {
                    importResource.status = ImportResourceStatus.NONE;
                    importResource.message = $translate.instant('import.text.snippet.not.imported');
                }
                importResource.data = data.text;
                importResource.format = data.format;
                updateTextImport(importResource);
            } else {
                importResource = {type: 'text', name: 'Text snippet ' + DateUtils.formatCurrentDateTime(), format: data.format, data: data.text};
                $scope.files.unshift(importResource);
                $scope.updateImport(importResource.name, false, false);
            }
            if (data.startImport) {
                $scope.setSettingsFor(importResource.name, false, importResource.format);
            }
        });
    };

    /**
     * Opens a modal dialog where the user can paste a url and import the data from it.
     */
    $scope.rdfDataFromURL = () => {
        const modalInstance = $uibModal.open({
            templateUrl: 'js/angular/import/templates/urlImport.html',
            controller: 'ImportUrlController',
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
        file.status = ImportResourceStatus.PENDING;

        const importer = startImport ? ImportRestService.importTextSnippet : ImportRestService.updateTextSnippet;
        importer($repositories.getActiveRepository(), $scope.settings)
            .success(function () {
                $scope.updateList();
            }).error(function (data) {
            toastr.error($translate.instant('import.could.not.send.data', {data: getError(data)}));
            file.status = ImportResourceStatus.ERROR;
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
        file.status = ImportResourceStatus.PENDING;

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
            file.status = ImportResourceStatus.ERROR;
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
        const modalInstance = $uibModal.open({
            templateUrl: 'js/angular/import/templates/file-override-confirmation.html',
            controller: 'FileOverrideConfirmationController',
            windowClass: 'confirm-duplicate-files-dialog',
            resolve: {
                duplicatedFiles: () => existingFilenames
            }
        });

        modalInstance.result.then((data) => {
            if (data.overwrite) {
                // on first upload, currentFiles would be empty
                if (!$scope.currentFiles.length) {
                    $scope.currentFiles.push(...duplicatedFiles, ...uniqueFiles);
                } else {
                    // while staying on the import view, each upload after the first should override existing files with
                    // newer versions if file names are equal
                    $scope.currentFiles = [...duplicatedFiles, ...uniqueFiles];
                }
                isFileListInitialized = true;
            } else {
                // override rejected
                const prefixedDuplicates = filesPrefixRegistry.prefixDuplicates(duplicatedFiles);
                $scope.currentFiles = [...$scope.currentFiles, ...prefixedDuplicates, ...uniqueFiles];
                isFileListInitialized = true;
            }
        });
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
                // TODO: Get the selection from the tree where the user might have selected a file before and add it to
                // the list of currentFiles files to be imported.
                $scope.currentFiles.forEach((file) => {
                    $scope.fileChecked[file.name] = true;
                    $scope.selectedForImportFiles[file.name] = true;
                });
                // Provide an import rejected callback and do the upload instead.
                let fileName = '';
                if ($scope.currentFiles.length === 1) {
                    fileName = $scope.currentFiles[0].name;
                }
                $scope.setSettingsFor(fileName, false, undefined, () => {
                    $scope.currentFiles.forEach((file) => {
                        $scope.updateImport(file.name, false, false);
                        // reset these as we are just uploading here
                        $scope.selectedForImportFiles = {};
                    });
                });
            }
        }
    };

    const deselectAllFiles = () => {
        Object.keys($scope.fileChecked).forEach((key) => {
            $scope.fileChecked[key] = false;
        });
        // TODO: The above should be removed
        $scope.selectedForImportFiles = {};
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
        subscriptions.push(ImportContextService.onFilesUpdated((files) => {
            filesPrefixRegistry.buildPrefixesRegistry(files);
        }));
        const onFirstResourceUpdatesHandler = ImportContextService.onResourcesUpdated(() => {
            $scope.loader = false;
            onFirstResourceUpdatesHandler();
        });
    };
    init();
}]);
