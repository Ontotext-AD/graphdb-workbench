import 'angular/core/services';
import 'angular/utils/uri-utils';

const FILE_STATUS = {
    'UPLOADING': 'UPLOADING',
    'PENDING': 'PENDING',
    'ERROR': 'ERROR',
    'DONE': 'DONE',
    'NONE': 'NONE'
};

const modules = [
    'ui.bootstrap',
    'toastr',
    'graphdb.framework.core.services.repositories',
    'graphdb.framework.utils.uriutils',
    'graphdb.framework.guides.services'
];

const importCtrl = angular.module('graphdb.framework.impex.import.controllers', modules);

importCtrl.controller('CommonCtrl', ['$scope', '$http', 'toastr', '$interval', '$repositories', '$uibModal', '$filter', '$jwtAuth', '$location', '$translate', 'LicenseRestService', 'GuidesService', 'ModalService',
    function ($scope, $http, toastr, $interval, $repositories, $uibModal, $filter, $jwtAuth, $location, $translate, LicenseRestService, GuidesService, ModalService) {
        $scope.files = [];
        $scope.fileChecked = {};
        $scope.checkAll = false;
        $scope.popoverTemplateUrl = 'settingsPopoverTemplate.html';
        $scope.fileQuery = '';

        $scope.getAppData = function () {
            LicenseRestService.getInfo().success(function (data) {
                $scope.appData = {};

                $scope.appData.properties = {};

                for (let i = 0; i < data.length; i++) {
                    $scope.appData.properties[data[i].key] = {
                        source: data[i].source,
                        value: data[i].value
                    };
                }
                $scope.maxUploadFileSizeMB = $scope.appData.properties['graphdb.workbench.maxUploadSize'].value / (1024 * 1024);
            }).error(function (data) {
                const msg = getError(data);
                toastr.error(msg, $translate.instant('common.error'));
            });
        };

        $scope.getAppData();

        $scope.fileFormats = ['ttl', 'ttls', 'rdf', 'rj', 'n3', 'nt', 'nq', 'trig', 'trigs', 'trix', 'brf', 'owl', 'jsonld', 'xml', 'rdfs',
            'ndjsonld', 'ndjson', 'jsonl'];

        {
            const gzs = _.map($scope.fileFormats, function (f) {
                return '.' + f + '.gz';
            });
            const basics = _.map($scope.fileFormats, function (f) {
                return '.' + f;
            });
            $scope.fileFormatsExtended = _.reduce(_.union(gzs, basics, ['.zip']), function (el, all) {
                return el + ', ' + all;
            });
            $scope.fileFormatsHuman = _.reduce(basics, function (el, all) {
                return el + ' ' + all;
            }) + $translate.instant('import.gz.zip');
            $scope.textFileFormatsHuman = _.reduce(_.filter(basics, function (el) {
                    return el !== '.brf';
                }),
                function (el, all) {
                    return el + ' ' + all;
                });
        }

        $scope.updateListHttp = function (force) {
            $http({
                method: 'GET',
                url: $scope.getBaseUrl()
            }).success(function (data) {
                if ($scope.files.length === 0 || force) {
                    $scope.files = data;
                    _.forEach($scope.files, function (f) {
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
                }
                $scope.showClearStatuses = _.filter($scope.files, function (file) {
                    return file.status === FILE_STATUS.DONE || file.status === FILE_STATUS.ERROR;
                }).length > 0;

                $scope.savedSettings = _.mapKeys(_.filter($scope.files, 'parserSettings'), 'name');

                $scope.loader = false;
            }).error(function (data) {
                toastr.warning($translate.instant('import.error.could.not.get.files', {data: getError(data)}));
                $scope.loader = false;
            });
        };

        // update the list instantly when the tab is changed
        $scope.$watch(function () {
            return $($scope.tabId).is(':visible');
        }, function () {
            if ($($scope.tabId).is(':visible')) {
                $scope.updateListHttp(false);
                $location.hash($scope.viewType);
            }
        });

        $scope.updateList = function (force) {
            if (!$scope.canWriteActiveRepo()) {
                return;
            }

            if (!$($scope.tabId).is(':visible')) {
                return;
            }
            $scope.updateListHttp(force);
        };

        $scope.init = function () {
            // Update restricted on repositoryIsSet
            $scope.setRestricted();
            if ($scope.isRestricted) {
                return;
            }
            $scope.updateList(true);
            $scope.getSettings();
        };

        $scope.$on('repositoryIsSet', $scope.init);

        $scope.pullList = function () {
            const timer = $interval(function () {
                // Skip iteration if we are updating something
                if (!$scope.updating) {
                    $scope.updateList(false);
                }
            }, 4000);
            $scope.$on('$destroy', function () {
                $interval.cancel(timer);
            });
        };

        $scope.getVisibleFiles = function () {
            return $filter('filter')($scope.files, {name: $scope.fileQuery, type: $scope.getTypeFilter()});
        };

        $scope.getTypeFilter = function () {
            if ($scope.viewType === 'server' && ($scope.showItems === 'file' || $scope.showItems === 'directory')) {
                return $scope.showItems;
            } else {
                return '';
            }
        };

        $scope.selectAllFiles = function () {
            $scope.getVisibleFiles().forEach(function (file) {
                $scope.fileChecked[file.name] = $scope.checkAll && $scope.importable(file);
            });
        };

        $scope.getSettingsFor = function (fileName, withDefaultSettings) {
            if (!withDefaultSettings && !_.isEmpty(fileName) && !_.isEmpty($scope.savedSettings[fileName])) {
                return $scope.savedSettings[fileName];
            } else {
                return angular.copy($scope.defaultSettings);
            }
        };

        $scope.setSettingsFor = function (fileName, withDefaultSettings) {
            $scope.settingsFor = fileName;
            $scope.settings = $scope.getSettingsFor(fileName, withDefaultSettings);

            const options = {
                templateUrl: 'js/angular/import/templates/settingsModal.html',
                controller: 'SettingsModalCtrl',
                resolve: {
                    settings: function () {
                        return angular.copy($scope.settings);
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

        $scope.updateImport = function (fileName, withDefaultSettings) {
            $scope.settingsFor = fileName;
            $scope.settings = $scope.getSettingsFor(fileName, withDefaultSettings);

            $scope.importFile(fileName, false);
        };

        $scope.stopImport = function (file) {
            $http({
                method: 'DELETE',
                url: $scope.getBaseUrl(),
                params: {name: file.name, type: file.type}
            }).success(function () {
                $scope.updateList();
            }).error(function (data) {
                toastr.warning($translate.instant('import.error.could.not.stop', {data: getError(data)}));
            });
        };

        $scope.importable = function () {
            return true;
        };

        $scope.hasImportable = function () {
            return _.filter($scope.files, function (f) {
                return $scope.importable(f);
            }).length > 0;
        };

        $scope.showTable = function () {
            const showTable = $scope.files.length > 0 && ('user' === $scope.viewType || 'server' === $scope.viewType);
            if ($scope.checkAll) {
                $scope.switchBatch(true);
            }
            return showTable;
        };

        $scope.switchBatch = function (all) {
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

        $scope.rebatch = function () {
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

        $scope.getSelectedFiles = function () {
            return _.map(_.filter($scope.getVisibleFiles(), function (f) {
                return $scope.fileChecked[f.name] && $scope.importable(f);
            }), 'name');
        };

        $scope.importSelected = function (overrideSettings) {
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

        const resetStatusOrRemoveEntry = function (names, remove) {
            $http({
                method: 'DELETE',
                url: $scope.getBaseUrl() + '/status',
                params: {remove: remove},
                data: names,
                headers: {'Content-type': 'application/json;charset=utf-8'}
            }).success(function () {
                $scope.updateList(true);
            }).error(function (data) {
                toastr.warning($translate.instant('import.error.could.not.clear', {data: getError(data)}));
            });
        };

        $scope.resetStatus = function (names) {
            resetStatusOrRemoveEntry(names, false);
        };

        $scope.resetStatusSelected = function () {
            $scope.resetStatus($scope.getSelectedFiles());
        };

        $scope.removeEntry = function (names = []) {
            ModalService.openConfirmation(
                $translate.instant('common.confirm'),
                $translate.instant('import.remove.confirm.msg', {name: names.join(', ')}),
                () => {
                    resetStatusOrRemoveEntry(names, true);
                });
        };

        $scope.removeEntrySelected = function () {
            $scope.removeEntry($scope.getSelectedFiles());
        };

        $scope.isLocalLocation = function () {
            const location = $repositories.getActiveLocation();
            return location && location.local;
        };
        // Settings

        $scope.filterSettings = function (fileName) {
            let filtered = _.omitBy($scope.savedSettings[fileName], _.isNull);
            filtered = _.omit(filtered, ['repoLocationHash', 'status', 'message', 'name', 'data', 'type', 'format', 'fileNames', '$$hashKey']);
            return _.map(_.keys(filtered), function (key) {
                return [key, filtered[key]];
            });
        };

        $scope.getSettings = function () {
            if (!$scope.canWriteActiveRepo()) {
                return;
            }

            $http({
                method: 'GET',
                url: 'rest/repositories/' + $repositories.getActiveRepository() + '/import/settings/default'
            }).success(function (data) {
                $scope.defaultSettings = data;
            }).error(function (data) {
                toastr.warning($translate.instant('import.error.default.settings', {data: getError(data)}));
            });
        };

        $scope.getBaseUrl = function () {
            return 'rest/repositories/' + $repositories.getActiveRepository() + '/import/' + $scope.viewUrl;
        };

        $scope.pritifySettings = function (settings) {
            return JSON.stringify(settings, null, ' ');
        };

        $scope.toTitleCase = function (s) {
            if (!s) {
                return s;
            }
            return _.upperFirst(s.toLowerCase());
        };
    }]);

importCtrl.controller('ImportCtrl', ['$scope', '$http', 'toastr', '$controller', '$translate', function ($scope, $http, toastr, $controller, $translate) {
    $scope.loader = true;
    angular.extend(this, $controller('CommonCtrl', {$scope: $scope}));
    $scope.viewUrl = 'server';
    $scope.defaultType = 'server';
    $scope.tabId = '#import-server';
    $scope.showItems = 'all';

    $scope.pullList();

    const importServerFiles = function (selectedFileNames, overrideSettings) {
        if (!$scope.canWriteActiveRepo()) {
            return;
        }

        $http({
            method: 'POST',
            url: $scope.getBaseUrl(),
            data: {importSettings: overrideSettings ? null : $scope.settings, fileNames: selectedFileNames}
        }).success(function () {
            $scope.updateList();
            $scope.batch = false;
            $scope.fileChecked = {};
        }).error(function (data) {
            toastr.error($translate.instant('import.could.not.send.file', {data: getError(data)}));
        });
    };

    $scope.importSelected = function (overrideSettings) {
        const selectedFileNames = $scope.getSelectedFiles();
        importServerFiles(selectedFileNames, overrideSettings);
    };

    $scope.importFile = function (fileName) {
        importServerFiles([fileName]);
    };

    $scope.init();
}]);

importCtrl.controller('UploadCtrl', ['$scope', 'Upload', '$http', 'toastr', '$controller', '$uibModal', '$translate', function ($scope, Upload, $http, toastr, $controller, $uibModal, $translate) {
    $scope.loader = true;
    angular.extend(this, $controller('CommonCtrl', {$scope: $scope}));
    $scope.viewUrl = 'upload';
    $scope.defaultType = 'file';
    $scope.tabId = '#import-user';

    $scope.pullList();

    $scope.currentFiles = [];

    $scope.importable = function () {
        return true;
    };

    $scope.fileSelected = function ($files, $file, $newFiles, $duplicateFiles, $invalidFiles) {
        if ($invalidFiles.length > 0) {
            $invalidFiles.forEach(function (f) {
                toastr.warning($translate.instant('import.large.file', {name: f.name, size: Math.floor(f.size / (1024 * 1024))}));
            });
        }
    };

    $scope.$watchCollection('currentFiles', function () {
        function disallowBZip2Files() {
            $scope.currentFiles.forEach(function (f) {
                if (f.name.substr(f.name.lastIndexOf('.') + 1) === 'bz2') {
                    const fileIdx = $scope.currentFiles.indexOf(f);
                    if (fileIdx > -1) {
                        $scope.currentFiles.splice(fileIdx, 1);
                    }
                    toastr.error($translate.instant('import.could.not.upload', {name: f.name}));
                }
            });
        }

        if ($scope.currentFiles) {
            // RDF4J does not support decompressing .bz2 files so we want to reject importing them
            disallowBZip2Files();
        }
        $scope.files = _.uniqBy(
            _.union(
                _.map($scope.currentFiles, function (file) {
                    return {name: file.name, type: 'file', file: file}
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
    });

    $scope.importFile = function (fileName, startImport, nextCallback) {
        const fileIndex = _.findIndex($scope.files, {name: fileName});
        if (fileIndex < 0) {
            toastr.warning($translate.instant('import.no.such.file', {name: fileName}));
        } else {
            const file = $scope.files[fileIndex];
            if (file.type === 'text') {
                // Import text snippet
                $scope.settings.name = file.name;
                $scope.settings.type = file.type;
                $scope.settings.data = file.data;
                $scope.settings.format = file.format;
                file.status = FILE_STATUS.PENDING;
                $http({
                    method: 'POST',
                    url: $scope.getBaseUrl() + (startImport ? '' : '/update') + '/text',
                    data: $scope.settings
                }).success(function () {
                    $scope.updateList();
                }).error(function (data) {
                    toastr.error($translate.instant('import.could.not.send.data', {data: getError(data)}));
                    file.status = FILE_STATUS.ERROR;
                    file.message = getError(data);
                }).finally(nextCallback || function () {
                });
            } else if (file.type === 'url') {
                // Submit URL
                $scope.settings.name = file.name;
                $scope.settings.type = file.type;
                $scope.settings.data = file.data;
                $scope.settings.format = file.format;
                file.status = FILE_STATUS.PENDING;
                $http({
                    method: 'POST',
                    url: $scope.getBaseUrl() + (startImport ? '' : '/update') + '/url',
                    data: $scope.settings
                }).success(function () {
                    $scope.updateList();
                }).error(function (data) {
                    toastr.error($translate.instant('import.could.not.send.url', {data: getError(data)}));
                }).finally(nextCallback || function () {
                });
            } else {
                // Upload real file
                $scope.settings.name = file.name;
                let data;
                if (file.file) {
                    data = {file: file.file, importSettings: Upload.jsonBlob($scope.settings)};
                } else {
                    data = {importSettings: Upload.jsonBlob($scope.settings)};
                }
                Upload.upload({
                    url: $scope.getBaseUrl() + (startImport ? '' : '/update') + '/file',
                    data: data
                }).progress(function (evt) {
                    if (file.file) {
                        file.file = null;
                        file.status = FILE_STATUS.UPLOADING;
                    } else if (file.status !== FILE_STATUS.UPLOADING) {
                        file.status = FILE_STATUS.PENDING;
                    }

                    if (file.status === FILE_STATUS.UPLOADING) {
                        const progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                        file.message = progressPercentage + '% uploaded';
                    }
                }).success(function () {
                    $scope.updateList();
                }).error(function (data) {
                    toastr.error($translate.instant('import.could.not.upload.file', {data: getError(data)}));
                    file.status = FILE_STATUS.ERROR;
                    file.message = getError(data);
                }).finally(nextCallback || function () {
                });
            }
        }
    };

    $scope.updateTextImport = function (settings) {
        $scope.updating = true;
        $http({
            method: 'POST',
            url: $scope.getBaseUrl() + '/update/text',
            data: settings
        }).success(function (data) {
        }).error(function (data) {
            toastr.error($translate.instant('import.could.not.update.text', {data: getError(data)}));
        }).finally(function () {
            $scope.updating = false;
        });
    };

    $scope.pastedDataIdx = 1;

    const formattedDate = function () {
        const date = new Date();
        return date.getFullYear() + '-' + _.padStart(date.getMonth() + 1, 2, '0') + '-' + _.padStart(date.getDate(), 2, '0')
            + ' ' + _.padStart(date.getHours(), 2, '0') + ':' + _.padStart(date.getMinutes(), 2, '0') + ':' + _.padStart(date.getSeconds(), 2, '0')
            + '.' + _.padStart(date.getMilliseconds(), 3, '0');
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
                $scope.updateTextImport(file);
            } else {
                file = {type: 'text', name: 'Text snippet ' + formattedDate(), format: data.format, data: data.text};
                $scope.files.unshift(file);
                $scope.updateImport(file.name);
            }
            if (data.startImport) {
                $scope.setSettingsFor(file.name);
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
                $scope.setSettingsFor(data.url, true);
            }
        });
    };

    $scope.init();
}]);

importCtrl.controller('UrlCtrl', ['$scope', '$uibModalInstance', 'toastr', function ($scope, $uibModalInstance) {
    $scope.importFormat = {name: 'Auto', type: ''};
    $scope.startImport = true;

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

importCtrl.controller('TextCtrl', ['$scope', '$uibModalInstance', 'text', 'format', function ($scope, $uibModalInstance, text, format) {
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
        {name: 'TriG*', type: 'application/x-trigstar'},
    ];

    $scope.rdfText = text;
    $scope.importFormat = _.find($scope.importFormats, {type: format});
    $scope.startImport = true;

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

importCtrl.controller('TabCtrl', ['$scope', '$location', function ($scope, $location) {
    $scope.viewType = $location.hash();
    if ($scope.viewType !== 'user' && $scope.viewType !== 'server') {
        $scope.viewType = 'user';
    }
    $scope.isCollapsed = false;
    if ($scope.viewType === 'user') {
        $scope.templateUrl = 'js/angular/import/templates/uploadInfo.html';
    } else {
        $scope.templateUrl = 'js/angular/import/templates/importInfo.html';
    }
    $scope.changeHelpTemplate = function (templateFile) {
        $scope.templateUrl = 'js/angular/import/templates/' + templateFile;
    };
    $scope.commonUrl = 'js/angular/import/templates/commonInfo.html';
}]);

importCtrl.controller('SettingsModalCtrl', ['$scope', '$uibModalInstance', 'toastr', 'UriUtils', 'settings', 'hasParserSettings', 'defaultSettings', 'isMultiple', '$translate',
    function ($scope, $uibModalInstance, toastr, UriUtils, settings, hasParserSettings, defaultSettings, isMultiple, $translate) {
    $scope.hasError = function (error, input) {
        return _.find(error, function (o) {
            return input === o['$name'];
        });
    };

    $scope.settings = settings;
    $scope.hasParserSettings = hasParserSettings;
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
    $scope.isMultiple = isMultiple;
    $scope.enableReplace = !!($scope.settings.replaceGraphs && $scope.settings.replaceGraphs.length);

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
        $scope.settings = angular.copy(defaultSettings);
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

    $scope.showAdvancedSettings = false;
    $scope.switchParserSettings = function () {
        $scope.showAdvancedSettings = !$scope.showAdvancedSettings;
    };
}]);
