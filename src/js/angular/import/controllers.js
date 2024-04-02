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
import {toImportResource, toImportServerResource} from "../rest/mappers/import-mapper";
import {ImportResourceTreeElement} from "../models/import/import-resource-tree-element";

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

        $scope.getSettingsFor = (fileName, withDefaultSettings) => {
            if (!withDefaultSettings && !_.isEmpty(fileName) && !_.isEmpty($scope.savedSettings[fileName])) {
                return $scope.savedSettings[fileName];
            } else {
                return _.cloneDeep($scope.defaultSettings);
            }
        };

        $scope.setSettingsFor = (fileName, withDefaultSettings, format) => {
            $scope.settingsFor = fileName;
            $scope.settings = $scope.getSettingsFor(fileName, withDefaultSettings);
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
                // Prevents closing dialog when user click outside the if.
                options.backdrop = 'static';
                options.keyboard = false;
            }

            const modalInstance = $uibModal.open(options);
            modalInstance.result.then(function (settings) {
                $scope.settings = settings;
                if ($scope.settingsFor === '') {
                    $scope.importSelected();
                } else {
                    $scope.importFile($scope.settingsFor, true);
                }

            }, function (settings) {
                $scope.settings = settings;
            });
        };

        $scope.updateImport = (fileName, withDefaultSettings) => {
            $scope.settingsFor = fileName;
            $scope.settings = $scope.getSettingsFor(fileName, withDefaultSettings);

            $scope.importFile(fileName, false);
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
            const importNext = function () {
                const fileName = selectedFileNames.shift();
                if (fileName) {
                    if (overrideSettings) {
                        $scope.settings = $scope.getSettingsFor(fileName);
                    }
                    $scope.importFile(fileName, true, importNext);
                }
            };

            importNext();
        };

        const resetStatusOrRemoveEntry = (names, remove) => {
            const resetService = $scope.viewUrl === OPERATION.UPLOAD ? ImportRestService.resetUserDataStatus : ImportRestService.resetServerFileStatus;
            resetService($repositories.getActiveRepository(), names, remove).success(function () {
                $scope.updateList(true);
            }).error(function (data) {
                toastr.warning($translate.instant('import.error.could.not.clear', {data: getError(data)}));
            });
        };

        $scope.resetStatus = (names) => {
            resetStatusOrRemoveEntry(names, false);
        };

        $scope.resetStatusSelected = () => {
            $scope.resetStatus($scope.getSelectedFiles());
        };

        $scope.removeEntry = (names = []) => {
            ModalService.openConfirmation(
                $translate.instant('common.confirm'),
                $translate.instant('import.remove.confirm.msg', {name: names.join(', ')}),
                () => {
                    resetStatusOrRemoveEntry(names, true);
                });
        };

        $scope.removeEntrySelected = () => {
            $scope.removeEntry($scope.getSelectedFiles());
        };

        $scope.isLocalLocation = () => {
            const location = $repositories.getActiveLocation();
            return location && location.local;
        };

        // Settings

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

        // =========================
        // Private functions
        // =========================
        $scope.serverImportTree = new ImportResourceTreeElement();

        $scope.onImport = (importResource) => {
          console.log('The resource ', importResource, 'have to be imported');
        };

        $scope.onDelete = (importResource) => {
            console.log('The resource ', importResource, 'have to be deleted');
        };

        // TODO: temporary exposed in the scope because it is called via scope.parent from the child TabsCtrl which should be changed
        $scope.updateListHttp = (force) => {
            const filesLoader = $scope.viewUrl === OPERATION.UPLOAD ? ImportRestService.getUploadedFiles : ImportRestService.getServerFiles;
            filesLoader($repositories.getActiveRepository()).success(function (data) {

                // Commented during development. When evrething is ready this functionality have to change current one.
                // if (OPERATION.SERVER === $scope.viewType) {
                //     $scope.serverImportTree = toImportServerResource(toImportResource(data));
                // }

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

importViewModule.controller('UploadCtrl', ['$scope', 'toastr', '$controller', '$uibModal', '$translate', '$repositories', 'ImportRestService', 'UploadRestService', function ($scope, toastr, $controller, $uibModal, $translate, $repositories, ImportRestService, UploadRestService) {

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
    $scope.currentFiles = [];
    $scope.pastedDataIdx = 1;

    // =========================
    // Public functions
    // =========================

    $scope.importable = function () {
        return true;
    };

    $scope.fileSelected = function ($files, $file, $newFiles, $duplicateFiles, $invalidFiles) {
        if ($invalidFiles.length > 0) {
            $invalidFiles.forEach(function (file) {
                toastr.warning($translate.instant('import.large.file', {
                    name: file.name,
                    size: FileUtils.convertBytesToMegabytes(file.size)
                }));
            });
        }
    };

    $scope.importFile = function (fileName, startImport, nextCallback) {
        const fileIndex = _.findIndex($scope.files, {name: fileName});
        if (fileIndex < 0) {
            toastr.warning($translate.instant('import.no.such.file', {name: fileName}));
        } else {
            const file = $scope.files[fileIndex];
            if (file.type === USER_DATA_TYPE.TEXT) {
                importTextSnippet(file, startImport, nextCallback);
            } else if (file.type === USER_DATA_TYPE.URL) {
                importFromUrl(file, startImport, nextCallback);
            } else {
                uploadFile(file, startImport, nextCallback);
            }
        }
    };

    $scope.pasteData = function (file) {
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

        modalInstance.result.then(function (data) {
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
                $scope.updateImport(file.name);
            }
            if (data.startImport) {
                $scope.setSettingsFor(file.name, undefined, file.format);
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
            $scope.updateImport(data.url, true);
            if (data.startImport) {
                $scope.setSettingsFor(data.url, true, data.format);
            }
        });
    };

    // =========================
    // Private functions
    // =========================

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
        uploader($repositories.getActiveRepository(), file, data).success(function () {
            $scope.updateList();
        }).error(function (data) {
            toastr.error($translate.instant('import.could.not.upload.file', {data: getError(data)}));
            file.status = FILE_STATUS.ERROR;
            file.message = getError(data);
        }).finally(nextCallback || function () {});
    };

    const disallowBZip2Files = () => {
        $scope.currentFiles.forEach(function (f) {
            if (f.name.substr(f.name.lastIndexOf('.') + 1) === 'bz2') {
                const fileIdx = $scope.currentFiles.indexOf(f);
                if (fileIdx > -1) {
                    $scope.currentFiles.splice(fileIdx, 1);
                }
                toastr.error($translate.instant('import.could.not.upload', {name: f.name}));
            }
        });
    };

    const uploadedFilesValidator = () => {
        if ($scope.currentFiles) {
            // RDF4J does not support decompressing .bz2 files so we want to reject importing them
            disallowBZip2Files();
        }
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
        _.each($scope.currentFiles, function (file) {
            $scope.updateImport(file.name);
        });
    };

    const removeAllListeners = () => {
        subscriptions.forEach((subscription) => subscription());
    };

    // =========================
    // Watchers and event handlers
    // =========================

    const subscriptions = [];
    subscriptions.push($scope.$watchCollection('currentFiles', uploadedFilesValidator));

    $scope.$on('$destroy', removeAllListeners);

    // =========================
    // Initialization
    // =========================

    const init = function () {
        $scope.pollList();
        $scope.onRepositoryChange();
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
