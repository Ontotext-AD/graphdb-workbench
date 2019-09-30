import 'angular/core/services';

const modules = [
    'ui.bootstrap',
    'graphdb.framework.repositories.services',
    'toastr'
];

const importCtrl = angular.module('graphdb.framework.impex.import.controllers', modules);

importCtrl.controller('CommonCtrl', ['$scope', '$http', 'toastr', '$interval', '$timeout', '$repositories', '$modal', '$filter', '$rootScope', '$jwtAuth', '$location',
    function ($scope, $http, toastr, $interval, $timeout, $repositories, $modal, $filter, $rootScope, $jwtAuth, $location) {
        $scope.files = [];
        $scope.fileChecked = {};
        $scope.checkAll = false;
        $scope.popoverTemplateUrl = 'settingsPopoverTemplate.html';
        $scope.fileQuery = '';

        $scope.getAppData = function () {
            $http.get('rest/info/properties').success(function (data, status, headers, config) {
                $scope.appData = {};

                $scope.appData.properties = {};

                for (var i = 0; i < data.length; i++) {
                    $scope.appData.properties[data[i].key] = {
                        source: data[i].source,
                        value: data[i].value
                    };
                }
                $scope.maxUploadFileSizeMB = $scope.appData.properties['graphdb.workbench.maxUploadSize'].value / (1024 * 1024);
            }).error(function (data, status, headers, config) {
                let msg = getError(data);
                toastr.error(msg, 'Error');
            });
        };

        $scope.getAppData();

        $scope.fileFormats = ['ttl', 'rdf', 'rj', 'n3', 'nt', 'nq', 'trig', 'trix', 'brf', 'owl', 'jsonld'];

        {
            var gzs = _.map($scope.fileFormats, function (f) {
                return '.' + f + '.gz'
            });
            var basics = _.map($scope.fileFormats, function (f) {
                return '.' + f
            });
            $scope.fileFormatsExtended = _.reduce(_.union(gzs, basics, ['.zip']), function (el, all) {
                return el + ', ' + all;
            });
            $scope.fileFormatsHuman = _.reduce(basics, function (el, all) {
                return el + ' ' + all;
            }) + ', as well as their .gz versions and .zip archives';
            $scope.textFileFormatsHuman = _.reduce(_.filter(basics, function (el) {
                    return el !== '.brf'
                }),
                function (el, all) {
                    return el + ' ' + all;
                });
        }

        $scope.updateListHttp = function (force) {
            $http({
                method: 'GET',
                url: $scope.getBaseUrl(),
            }).success(function (data, status, headers, config) {
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
                        var remoteStatus = _.find(data, _.matches({'name': f.name}));
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
                        return f.status != undefined;
                    });
                }
                $scope.showClearStatuses = _.filter($scope.files, function (file) {
                    return file.status === 'DONE' || file.status === 'ERROR';
                }).length > 0;

                $scope.savedSettings = _.mapKeys(_.filter($scope.files, 'parserSettings'), 'name');

                $scope.loader = false;
            }).error(function (data, status, headers, config) {
                toastr.warning('Could not get files; ' + getError(data));
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
            $scope.updateList(true);
            $scope.getSettings();
        }

        $scope.$on('repositoryIsSet', $scope.init);

        $scope.pullList = function () {
            var timer = $interval(function () {
                // Skip iteration if we are updating something
                if (!$scope.updating) {
                    $scope.updateList(false)
                }
            }, 4000);
            $scope.$on("$destroy", function (event) {
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

            var modalInstance = $modal.open({
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
            });


            modalInstance.result.then(function (settings) {
                $scope.settings = settings;
                if ($scope.settingsFor == '') {
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
            }).success(function (data, status, headers, config) {
                $scope.updateList();
            }).error(function (data, status, headers, config) {
                toastr.warning('Could not stop import; ' + getError(data));
            });
        };

        $scope.importable = function (file) {
            return true;
        };

        $scope.hasImportable = function () {
            return _.filter($scope.files, function (f) {
                return $scope.importable(f)
            }).length > 0;
        };

        $scope.showTable = function () {
            var showTable = $scope.files.length > 0 && ('user' == $scope.viewType || 'server' == $scope.viewType);
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
                return $scope.fileChecked[f.name] && $scope.importable(f)
            }), 'name').length > 0;
        };

        $scope.rebatch = function () {
            var newFileChecked = {};
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
                return $scope.fileChecked[f.name] && $scope.importable(f)
            }), 'name');
        };

        $scope.importSelected = function (overrideSettings) {
            var selectedFileNames = $scope.getSelectedFiles();

            // Calls the REST API sequentially for the selected files
            var importNext = function () {
                var fileName = selectedFileNames.shift();
                if (fileName) {
                    if (overrideSettings) {
                        $scope.settings = $scope.getSettingsFor(fileName);
                    }
                    $scope.importFile(fileName, true, importNext);
                }
            }

            importNext();
        };

        var resetStatusOrRemoveEntry = function (names, remove) {
            $http({
                method: 'DELETE',
                url: $scope.getBaseUrl() + '/status',
                params: {remove: remove},
                data: names,
                headers: {'Content-type': 'application/json;charset=utf-8'}
            }).success(function (data) {
                $scope.updateList(true);
            }).error(function (data) {
                toastr.warning('Could not clear status; ' + getError(data));
            });
        };

        $scope.resetStatus = function (names) {
            resetStatusOrRemoveEntry(names, false);
        }

        $scope.resetStatusSelected = function () {
            $scope.resetStatus($scope.getSelectedFiles());
        };

        $scope.removeEntry = function (names) {
            resetStatusOrRemoveEntry(names, true);
        }

        $scope.removeEntrySelected = function () {
            $scope.removeEntry($scope.getSelectedFiles());
        };

        $scope.isLocalLocation = function () {
            var location = $repositories.getActiveLocation();
            return location && location.local;
        };
        // Settings

        $scope.filterSettings = function (fileName) {
            var filtered = _.omitBy($scope.savedSettings[fileName], _.isNull);
            filtered = _.omit(filtered, ['repoLocationHash', 'status', 'message', 'name', 'data', 'type', 'format', 'fileNames', '$$hashKey']);
            return _.map(_.keys(filtered), function (key) {
                return [key, filtered[key]]
            });
        };

        $scope.getSettings = function () {
            if (!$scope.canWriteActiveRepo()) {
                return;
            }

            $http({
                method: 'GET',
                url: 'rest/data/import/settings/default',
            }).success(function (data, status, headers, config) {
                $scope.defaultSettings = data;
            }).error(function (data, status, headers, config) {
                toastr.warning('Could not get default settings; ' + getError(data));
            });
        };

        $scope.getBaseUrl = function () {
            return 'rest/data/import/' + $scope.viewUrl + '/' + $repositories.getActiveRepository();
        };

        $scope.pritifySettings = function (settings) {
            return JSON.stringify(settings, null, " ");
        }

        $scope.toTitleCase = function (s) {
            if (!s) {
                return s;
            }
            return _.upperFirst(s.toLowerCase());
        };
    }]);

importCtrl.controller('ImportCtrl', ['$scope', '$http', 'toastr', '$interval', '$controller', function ($scope, $http, toastr, $interval, $controller) {
    $scope.loader = true;
    angular.extend(this, $controller('CommonCtrl', {$scope: $scope}));
    $scope.viewUrl = 'server';
    $scope.defaultType = 'server';
    $scope.tabId = '#import-server';
    $scope.showItems = 'all';

    $scope.pullList();

    var importServerFiles = function (selectedFileNames, overrideSettings) {
        if (!$scope.canWriteActiveRepo()) {
            return;
        }

        $http({
            method: 'POST',
            url: $scope.getBaseUrl(),
            data: {importSettings: overrideSettings ? null : $scope.settings, fileNames: selectedFileNames}
        }).success(function (data) {
            $scope.updateList();
            $scope.batch = false;
            $scope.fileChecked = {};
        }).error(function (data, status, headers, config) {
            toastr.error('Could not send file for import; ' + getError(data));
        });
    };

    $scope.importSelected = function (overrideSettings) {
        var selectedFileNames = $scope.getSelectedFiles();
        importServerFiles(selectedFileNames, overrideSettings);
    };

    $scope.importFile = function (fileName) {
        importServerFiles([fileName]);
    };

    $scope.init();
}]);

importCtrl.controller('UploadCtrl', ['$scope', 'Upload', '$http', 'toastr', '$controller', '$rootScope', '$modal', function ($scope, Upload, $http, toastr, $controller, $rootScope, $modal) {
    $scope.loader = true;
    angular.extend(this, $controller('CommonCtrl', {$scope: $scope}));
    $scope.viewUrl = 'upload';
    $scope.defaultType = 'file';
    $scope.tabId = '#import-user';

    $scope.pullList();

    $scope.currentFiles = [];

    $scope.importable = function (file) {
        return true;
    };

    $scope.fileSelected = function ($files, $file, $newFiles, $duplicateFiles, $invalidFiles, $event) {
        if ($invalidFiles.length > 0) {
            $invalidFiles.forEach(function (f) {
                toastr.warning('File ' + f.name + ' too big ' + Math.floor(f.size / (1024 * 1024)) + ' MB. Use Server Files import.');
            });
        }
    };

    $scope.$watchCollection('currentFiles', function () {
        function disallowBZip2Files() {
            $scope.currentFiles.forEach(function (f) {
                if (f.name.substr(f.name.lastIndexOf('.') + 1) === "bz2") {
                    var fileIdx = $scope.currentFiles.indexOf(f);
                    if (fileIdx > -1) {
                        $scope.currentFiles.splice(fileIdx, 1);
                    }
                    toastr.error('Could not upload file ' + f.name + '. BZip2 archives are not supported.');
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
                    return {name: file.name, type: "file", file: file}
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
        var fileIndex = _.findIndex($scope.files, {name: fileName});
        if (fileIndex < 0) {
            toastr.warning('No such file; ' + fileName);
        }
        else {
            var file = $scope.files[fileIndex];
            if (file.type === 'text') {
                // Import text snippet
                $scope.settings.name = file.name;
                $scope.settings.type = file.type;
                $scope.settings.data = file.data;
                $scope.settings.format = file.format;
                file.status = 'PENDING';
                $http({
                    method: 'POST',
                    url: $scope.getBaseUrl() + (startImport ? '' : '/update') + '/text',
                    data: $scope.settings
                }).success(function (data) {
                    $scope.updateList();
                    //$scope.batch = false;
                }).error(function (data, status, headers, config) {
                    toastr.error('Could not send data for import; ' + getError(data));
                    file.status = 'ERROR';
                    file.message = getError(data);
                }).finally(nextCallback || function () {
                });
            } else if (file.type === 'url') {
                // Submit URL
                $scope.settings.name = file.name;
                $scope.settings.type = file.type;
                $scope.settings.data = file.data;
                $scope.settings.format = file.format;
                file.status = 'PENDING';
                $http({
                    method: 'POST',
                    url: $scope.getBaseUrl() + (startImport ? '' : '/update') + '/url',
                    data: $scope.settings
                }).success(function (data) {
                    $scope.updateList();
                    //$scope.batch = false;
                }).error(function (data, status, headers, config) {
                    toastr.error('Could not send url for import; ' + getError(data));
                }).finally(nextCallback || function () {
                });
            } else {
                // Upload real file
                $scope.settings.name = file.name;
                var data;
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
                        file.status = 'UPLOADING';
                    } else if (file.status !== 'UPLOADING') {
                        file.status = 'PENDING';
                    }

                    if (file.status === 'UPLOADING') {
                        var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                        file.message = progressPercentage + '% uploaded';
                    }
                }).success(function (data, status, headers, config) {
                    $scope.updateList();
                    //$scope.batch = false;
                }).error(function (data, status, headers, config) {
                    toastr.error('Could not upload file; ' + getError(data));
                    file.status = 'ERROR';
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
        }).error(function (data, status, headers, config) {
            toastr.error('Could not update text import; ' + getError(data));
        }).finally(function () {
            $scope.updating = false;
        });
    };

    $scope.pastedDataIdx = 1;

    var formattedDate = function () {
        var date = new Date();
        return date.getFullYear() + '-' + _.padStart(date.getMonth() + 1, 2, '0') + '-' + _.padStart(date.getDate(), 2, '0')
            + ' ' + _.padStart(date.getHours(), 2, '0') + ':' + _.padStart(date.getMinutes(), 2, '0') + ':' + _.padStart(date.getSeconds(), 2, '0')
            + '.' + _.padStart(date.getMilliseconds(), 3, '0');
    };

    $scope.pasteData = function (file) {
        var scope = {};
        if (file) {
            scope.rdfText = file.data;
        }
        var modalInstance = $modal.open({
            templateUrl: 'js/angular/import/templates/textSnippet.html',
            controller: 'TextCtrl',
            resolve: {
                text: function () {
                    return file ? file.data : ''
                },
                format: function () {
                    return file ? file.format : 'text/turtle'
                }
            }
        });

        modalInstance.result.then(function (data) {
            if (file) {
                if ((file.data !== data.text || file.format !== data.format) && file.status !== 'NONE') {
                    file.status = 'NONE';
                    file.message = 'Text snippet was edited but has not been imported again.';
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
        var modalInstance = $modal.open({
            templateUrl: 'js/angular/import/templates/urlImport.html',
            controller: 'UrlCtrl',
            scope: $scope
        });

        modalInstance.result.then(function (data) {
            // URL may already exist
            var existing = _.find($scope.files, {type: 'url', name: data.url});
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

importCtrl.controller('UrlCtrl', ['$scope', '$controller', '$modalInstance', 'toastr', function ($scope, $controller, $modalInstance, toastr) {
    $scope.importFormat = {name: 'Auto', type: ''};
    $scope.startImport = true;

    $scope.cancel = function () {
        $modalInstance.dismiss();
    };

    $scope.ok = function () {
        $modalInstance.close({
            url: $scope.dataUrl,
            format: $scope.importFormat.type,
            startImport: $scope.startImport
        });
    };
}]);

importCtrl.controller('TextCtrl', ['$scope', '$controller', '$modalInstance', 'toastr', 'text', 'format', function ($scope, $controller, $modalInstance, toastr, text, format) {
    var defaultFormat = {name: 'Turtle', type: 'text/turtle'};
    $scope.importFormats = [
        {name: 'RDF/JSON', type: 'application/rdf+json'},
        {name: 'JSON-LD', type: 'application/ld+json'},
        {name: 'RDF/XML', type: 'application/rdf+xml'},
        {name: 'N3', type: 'text/rdf+n3'},
        {name: 'N-Triples', type: 'text/plain'},
        {name: 'N-Quads', type: 'text/x-nquads'},
        {name: 'Turtle', type: 'text/turtle'},
        {name: 'TriX', type: 'application/trix'},
        {name: 'TriG', type: 'application/x-trig'}
    ];

    $scope.rdfText = text;
    $scope.importFormat = _.find($scope.importFormats, {type: format});
    $scope.startImport = true;

    $scope.setFormat = function (format) {
        $scope.importFormat = format;
    };

    $scope.cancel = function () {
        $modalInstance.dismiss();
    };

    $scope.ok = function () {
        $modalInstance.close({
            text: $scope.rdfText,
            format: $scope.importFormat.type,
            startImport: $scope.startImport
        });
    };
}]);


importCtrl.controller('TabCtrl', ['$scope', '$rootScope', '$location', function ($scope, $rootScope, $location) {
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
    $scope.changeHelpTemplate = function (templateFile, files) {
        $scope.templateUrl = 'js/angular/import/templates/' + templateFile;
    };
    $scope.commonUrl = 'js/angular/import/templates/commonInfo.html';
}]);

importCtrl.controller('SettingsModalCtrl', ["$scope", "$modalInstance", "toastr", "UtilService", "settings", "hasParserSettings", "defaultSettings", "isMultiple", function ($scope, $modalInstance, toastr, UtilService, settings, hasParserSettings, defaultSettings, isMultiple) {
    $scope.hasError = function (error, input) {
        return _.find(error, function (o) {
            return input == o['$name'];
        });
    }

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

    var fixSettings = function () {
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
            $modalInstance.close($scope.settings);
        }
    };

    $scope.cancel = function () {
        fixSettings();
        $modalInstance.dismiss($scope.settings);
    };

    $scope.reset = function () {
        $scope.settings = angular.copy(defaultSettings);
        $scope.target = 'data';
    };

    $scope.addReplaceGraph = function (graph) {
        var valid = true;
        if (graph !== 'default') {
            valid = UtilService.isValidIri(graph);
        }
        $scope.settingsForm.replaceGraph.$setTouched();
        $scope.settingsForm.replaceGraph.$setValidity('replaceGraph', valid);

        if ($scope.settingsForm.replaceGraph.$valid) {
            $scope.settings.replaceGraphs = $scope.settings.replaceGraphs || [];
            if (_.indexOf($scope.settings.replaceGraphs, graph) === -1) {
                $scope.replaceGraph = '';
                $scope.settings.replaceGraphs.push(graph);
            } else {
                toastr.warning('This graph is already in the list.');
            }
        }
    };

    $scope.checkEnterReplaceGraph = function (event, graph) {
        if (event.keyCode === 13) {
            event.preventDefault();

            $scope.addReplaceGraph(graph)
        }
    };

    $scope.showAdvancedSettings = false;
    $scope.switchParserSettings = function () {
        $scope.showAdvancedSettings = !$scope.showAdvancedSettings;
    }
}]);
