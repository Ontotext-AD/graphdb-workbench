define(['angular/core/lib/stringify'],
    function (stringify) {

        function jsonToFormData(data) {
            var str = [];
            for (var p in data)
                str.push(encodeURIComponent(p) + "=" + encodeURIComponent(data[p]));
            return str.join("&");
        }

        function toArrayMap(map) {
            return _.map(map, function(value, key) {
                return {key: key, value: value}
            });
        }

        function fromArrayMap(arrayMap) {
            return _.reduce(arrayMap, function(acc, value) {
                if (value.key === '' && value.value === '') {
                    // empty pair, skip it
                } else if (value.key === '') {
                    throw new Error('Key may not be empty with value "' + value.value + '"');
                } else if (acc.hasOwnProperty(value.key)) {
                    throw new Error('Duplicate key ' + value.key);
                } else {
                    acc[value.key] = value.value;
                }
                return acc
            }, {});
        }

        function mapCreateValuesToUiValues(values, options) {
            for (var i = 0; i < options.length; i++) {
                var option = options[i];
                if (option.__type == 'StringArray') {
                    if (!values[option.__name]) {
                        values[option.__name] = [''];
                    }
                }
                else if (option.__type == 'OptionArray') {
                    if (!values[option.__name]) {
                        values[option.__name] = [];
                        var optionEl = {};
                        var boolOptions = [];
                        for (var j = 0; j < option.__childOptions.length; j++) {
                            var child = option.__childOptions[j];
                            if (child.__type == 'StringArray') {
                                optionEl[child.__name] = [''];
                            }
                            else {
                                optionEl[child.__name] = (!angular.isUndefined(child.__defaultValue) ? child.__defaultValue : '');
                            }
                        }
                        values[option.__name].push(optionEl);
                    }
                }
                else if (option.__type == 'Map') {
                    if (!values[option.__name]) {
                        values[option.__name] = [];
                    } else {
                        values[option.__name] = toArrayMap(values[option.__name]);
                    }
                }
                else if (option.__type == 'JsonString') {
                    if (!values[option.__name]) {
                        values[option.__name] = '{}';
                    } else {
                        values[option.__name] = angular.toJson(values[option.__name], 2);
                    }
                }
                else {
                    if (!values[option.__name]) {
                        values[option.__name] = (!angular.isUndefined(option.__defaultValue) ? option.__defaultValue : '');
                    }
                }
            }

            return values;
                    }

        function _evaluateSparqlQuery(http, repository, query) {
            return http.post('repositories/' + repository, jsonToFormData({query: query}),
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Accept': 'application/sparql-results+json',
                        'X-GraphDB-Local-Consistency': 'updating'
                    }
                });
        }

        function createConnectorQuery(name, prefix, fields, options, reportError) {
            // Returns a copy of the parameter obj sorted according to the order in options
            function sortObject(obj, options) {
                var newObject = {};
                _.each(options, function (option) {
                    if (angular.isDefined(obj[option.__name])) {
                        if (option.__type === 'OptionArray') {
                            newObject[option.__name] = [];
                            _.each(obj[option.__name], function (childOption) {
                                newObject[option.__name].push(sortObject(childOption, option.__childOptions));
                            });
                        } else {
                            newObject[option.__name] = angular.copy(obj[option.__name]);
                        }
                    }
                });
                return newObject;
            }

            var fcopy = sortObject(fields, options);

            for (var i = 0; i < options.length; i++) {
                try {
                    if (options[i].__type == 'Map') {
                        fcopy[options[i].__name] = fromArrayMap(fcopy[options[i].__name]);
                    } else if (options[i].__type == 'JsonString') {
                        fcopy[options[i].__name] = angular.fromJson(fcopy[options[i].__name])
                    }
                } catch (e) {
                    reportError(options[i].__label, e.message);
                    return null;
                }
            }

            removeEmptyValues(fcopy);
            //escapeValues(fields);
            var finalString = '';
            finalString += 'PREFIX :<' + prefix + '>\n';
            var namePrefix = prefix.substring(0, prefix.length - 1) + "/instance#";
            finalString += 'PREFIX inst:<' + namePrefix + '>\n';
            finalString += 'INSERT DATA {\n';
            finalString += "\tinst:" + name + " :createConnector '''\n";
            finalString += angular.toJson(fcopy, 2);
            finalString += "\n''' .\n}\n";
            finalString = finalString.replace(/\\/g, '\\\\\\');
            return finalString;
        }

        function createStatusQueryForIri(iri) {
            var statusIri = iri.replace(/\/instance#.+$/, "#connectorStatus");
            var finalString = '';
            finalString += 'SELECT ?status {\n';
            finalString += "\t<" + iri + "> <" + statusIri + "> ?status";
            finalString += "\n}";
            return finalString;
        }

        function createStatusQueryForAny(connectors) {
            var connectorIris = _.map(connectors,
                function (k) {
                    return '<' + k.value + 'connectorStatus' + '>';
                }).join('|');

            if (connectorIris) {
                return "SELECT ?connector ?status { ?connector " + connectorIris + " ?status }";
            }

            return null;
        }

        function repairConnectorQuery(name, prefix) {
            var namePrefix = prefix.substring(0, prefix.length - 1) + "/instance#";
            var query = 'PREFIX prefix:<' + prefix + '>\n' +
                'INSERT DATA {\n' +
                '\t<' + namePrefix + name + '> prefix:repairConnector ""\n' +
                '}';
            return query;
        }

        function deleteConnectorQuery(name, prefix) {
            var namePrefix = prefix.substring(0, prefix.length - 1) + "/instance#";
            var query = 'PREFIX prefix:<' + prefix + '>\n' +
                'INSERT DATA {\n' +
                '\t<' + namePrefix + name + '> prefix:dropConnector ""\n' +
                '}';
            return query;
        }

        function removeEmptyValues(o) {
            // remove empty values from array
            if (Array.isArray(o)) {
                o = _.filter(o, function(item) {return item !== null && (!item.trim || item.trim() != "")})
            }
            // remove empty values from object values
            Object.keys(o).forEach(function (k) {
                if ((o[k] == "" || o[k] == null) && o[k] !== false) {
                    delete o[k];
                }
                else if (typeof o[k] == 'object') {
                    o[k] = removeEmptyValues(o[k]);
                }
            });
            return o;
        }

        function parseFirstBuildingResult(results) {
            if (results.bindings) {
                for (var i = 0; i < results.bindings.length; i++) {
                    try {
                        var statusObject = JSON.parse(results.bindings[i].status.value);
                        if (statusObject.status === 'BUILDING') {
                            return {
                                connector: results.bindings[i].connector.value,
                                status: statusObject
                            };
                        }
                    } catch (e) {
                    }
                }
            }

            return {};
        }

        angular
            .module('graphdb.framework.externalsync.controllers', [])
            .controller('ConnectorsCtrl', ConnectorsCtrl)
            .controller('ExtendNewConnectorCtrl', ExtendNewConnectorCtrl)
            .controller('CreateConnectorCtrl', CreateConnectorCtrl)
            .controller('CreateProgressCtrl', CreateProgressCtrl)
            .filter('ceil', ceil);

        ConnectorsCtrl.$inject = ['$scope', '$http', '$repositories', '$modal', 'toastr', 'ModalService', '$q'];
        function ConnectorsCtrl($scope, $http, $repositories, $modal, toastr, ModalService, $q) {
            $scope.loader = false;

            $scope.controllers = [];

            $scope.existing = {};

            $scope.definitions = {};

            $scope.getLoaderMessage = function() {
                var timeSeconds = (Date.now() - $scope.loaderStartTime) / 1000;
                var timeHuman = $scope.getHumanReadableSeconds(timeSeconds);
                var message = "";
                if ($scope.progressMessage) {
                    message = $scope.progressMessage + "... " + timeHuman;
                } else {
                    message = "Running operation..." + timeHuman;
                }
                if ($scope.extraMessage && timeSeconds > 10) {
                    message += "\n" + $scope.extraMessage;
                }

                return message;
            };

            $scope.setLoader = function(isRunning, progressMessage, extraMessage) {
                if (isRunning) {
                    $scope.loader = true;
                    $scope.loaderStartTime = Date.now();
                    $scope.progressMessage = progressMessage;
                    $scope.extraMessage = extraMessage;
                } else {
                    $scope.loader = false;
                    $scope.progressMessage = "";
                    $scope.extraMessage = "";
                }
            };

            $scope.initConnector = function(connector) {
                return $http.get('rest/connectors/options?prefix=' + encodeURIComponent(connector.value))
                    .then(function (res) {
                        $scope.definitions[connector.key] = res.data;

                        return $http.get('rest/connectors/existing?prefix=' + encodeURIComponent(connector.value))
                            .then(function (res) {
                                $scope.existing[connector.key] = res.data;

                            });
                    });
            };

            $scope.getConnectors = function () {
                if (!$scope.canWriteActiveRepo()) {
                    return;
                }

                $scope.setLoader(true, 'Fetching connectors', 'Normally this is a fast operation but it may take longer if a bigger repository needs to be initialised first.');

                $http.get('rest/connectors').then(function (res) {
                    $scope.connectors = Object.keys(res.data).map(function (key) {
                        return {key: key, value: res.data[key]}
                    });

                    $q.all(_.map($scope.connectors, function(connector) {
                        return $scope.initConnector(connector);
                    })).finally(function() {
                        resetProgress();

                        var query = createStatusQueryForAny($scope.connectors);

                        if (query) {
                            evaluateSparqlQuery(query)
                                .then(function (res) {
                                    var status = parseFirstBuildingResult(res.data.results);
                                    if (status.connector) {
                                        // has a building connector, open progress indicator
                                        var d = status.connector.split(/#/);
                                        d[0] = d[0].replace(/\/instance$/, "#");
                                        showProgress(d[0], d[1]);
                                    }
                                })
                                .finally(function() {
                                    $scope.setLoader(false);
                                });
                        } else {
                            $scope.setLoader(false);
                        }
                    });
                }).catch(function (e) {
                    $scope.setLoader(false);
                    toastr.error(getError(e), 'Could not get connectors');
                });

                $scope.existing = {};
            };

            $scope.getOptions = function (connector) {
                return $scope.definitions[connector.key];
            };

            $scope.isEmpty = function (value) {
                return angular.isObject(value) && Object.keys(value).length === 0;
            };

            $scope.toPrettyJson = function (value) {
                return angular.toJson(value, 2);
            };

            $scope.$watch(function () {
                return $repositories.getActiveRepository();
            }, $scope.getConnectors);

            $scope.$watch(function () {
                return $repositories.getActiveLocation();
            }, $scope.getConnectors);

            function evaluateSparqlQuery(query) {
                return _evaluateSparqlQuery($http, $repositories.getActiveRepository(), query);
            }

            function resetProgress(repair) {
                $scope.beingBuiltConnector = {
                    percentDone: 0,
                    status: {
                        processedEntities: 0,
                        estimatedEntities: 0,
                        indexedEntities: 0,
                        entitiesPerSecond: 0
                    },
                    actionName: repair ? 'Repairing' : 'Creating',
					waitOnRepairStartOnce: repair ? true : false,
                    eta: "-",
                    inline: false,
                    iri: null
                }
            }

            function openProgressModal(prefix, name, repair) {
                resetProgress(repair);

                $.extend($scope.beingBuiltConnector, {
                    iri: prefix.substring(0, prefix.length - 1) + "/instance#" + name,
                    name: name,
                    inline: false,
                    doneCallback: function() {
                        $scope.beingBuiltConnector.modalInstance.dismiss('cancel');
                    }
                });

                $scope.beingBuiltConnector.modalInstance = $modal.open({
                    templateUrl: 'pages/connectorProgress.html',
                    controller: 'CreateProgressCtrl',
                    size: 'lg',
                    backdrop: 'static',
                    scope: $scope
                });

                return $scope.beingBuiltConnector.modalInstance;
            }

            function showProgress(prefix, name) {
                resetProgress();

                $.extend($scope.beingBuiltConnector, {
                    iri: prefix.substring(0, prefix.length - 1) + "/instance#" + name,
                    name: name,
                    inline: true,
                    doneCallback: function() {
                        $scope.beingBuiltConnector.inline = false;
                    }
                });
            }

            function executeCreate(connector, obj, errorCallback) {
                var modal = openProgressModal(connector.value, obj.name, false);

                $http.post('repositories/' + $repositories.getActiveRepository() + '/statements', jsonToFormData({update: obj.query}), {headers: {'Content-Type': 'application/x-www-form-urlencoded'}}).then(function (res) {
                    $http.get('rest/connectors').then(function (res) {
                        $http.get('rest/connectors/existing?prefix=' + encodeURIComponent(connector.value)).then(function (res) {
                            $scope.existing[connector.key] = res.data;
                        });
                    });
                    toastr.success("Created connector " + obj.name);
                }, function (err) {
                    toastr.error(getError(err));
                    errorCallback();
                }).finally(function () {
                    modal.dismiss('cancel');
                })
            }

            $scope.copyConnector = function (connector, values) {
                var newValues;
                if (!angular.isUndefined(values)) {
                    newValues = angular.copy(values);
                    newValues.name = newValues.name + '-copy'
                }
                var modal = $modal.open({
                    templateUrl: 'pages/createConnector.html',
                    controller: 'CreateConnectorCtrl',
                    size: 'lg',
                    backdrop: 'static',
                    resolve: {
                        connector: function () {
                            return connector;
                        },
                        values: function () {
                            return angular.isUndefined(newValues) ? {name: "", values: {}} : newValues;
                        },
                        options: function () {
                            return $scope.getOptions(connector);
                        }
                    }
                });

                modal.result.then(function (obj) {
                    executeCreate(connector, obj, function () {
                        obj.skipConversion = true;
                        $scope.newConnector(connector, obj)
                    });
                });
            };

            $scope.newConnector = function (connector, values) {
                var modal = $modal.open({
                    templateUrl: 'pages/createConnector.html',
                    controller: 'CreateConnectorCtrl',
                    size: 'lg',
                    backdrop: 'static',
                    resolve: {
                        connector: function () {
                            return connector;
                        },
                        values: function () {
                            return angular.isUndefined(values) ? {name: "", values: {}} : values;
                        },
                        options: function () {
                            return $scope.getOptions(connector);
                        }
                    }
                });

                modal.result.then(function (obj) {
                    executeCreate(connector, obj, function () {
                        obj.skipConversion = true;
                        $scope.newConnector(connector, obj)
                    });
                });

            };

            $scope.repair = function (inst, type) {
                ModalService.openSimpleModal({
                    title: 'Confirm repair',
                    message: 'Are you sure you want to repair this connector?<br>Note that repair means delete + recreate with the same settings.',
                    warning: true
                }).result
                    .then(function () {
                        var modal = openProgressModal(type.value, inst.name, true);

                        var query = repairConnectorQuery(inst.name, type.value);

                        $http.post('repositories/' + $repositories.getActiveRepository() + '/statements', jsonToFormData({update: query}), {headers: {'Content-Type': 'application/x-www-form-urlencoded'}}).then(function (res) {
                            $http.get('rest/connectors').then(function (res) {
                                $http.get('rest/connectors/existing?prefix=' + encodeURIComponent(type.value)).then(function (res) {
                                    $scope.existing[type.key] = res.data;
                                });
                            });
                            toastr.success("Repaired connector " + inst.name);
                        }, function (err) {
                            toastr.error(getError(err));
                        }).finally(function() {
                            modal.dismiss('cancel');
                        });
                });
            };

            $scope.delete = function (inst, type) {
                ModalService.openSimpleModal({
                    title: 'Confirm delete',
                    message: 'Are you sure you want to delete this connector?',
                    warning: true
                }).result
                    .then(function () {
                        $scope.setLoader(true, 'Deleting connector ' + inst.name, 'This is usually a fast operation but it might take a while.');

                        var query = deleteConnectorQuery(inst.name, type.value);
                        $http.post('repositories/' + $repositories.getActiveRepository() + '/statements', jsonToFormData({update: query}), {headers: {'Content-Type': 'application/x-www-form-urlencoded'}}).then(function (res) {
                            $http.get('rest/connectors').then(function (res) {
                                $http.get('rest/connectors/existing?prefix=' + encodeURIComponent(type.value)).then(function (res) {
                                    $scope.existing[type.key] = res.data;
                                });
                            });
                            toastr.success("Deleted connector " + inst.name);
                        }, function (err) {
                            toastr.error(getError(err));
                        }).finally(function() {
                            $scope.setLoader(false);
                        });
                    });

            };

            $scope.viewQuery = function (connector, inst) {
                var modal = $modal.open({
                    templateUrl: 'pages/viewQuery.html',
                    controller: 'ViewQueryCtrl',
                    resolve: {
                        query: function () {
                            var options = $scope.getOptions(connector);
                            return createConnectorQuery(inst.name, connector.value,
                                mapCreateValuesToUiValues(inst.values, options), options);
                        }
                    }
                });
            };

        }

        ExtendNewConnectorCtrl.$inject = ['$scope', '$modalInstance', 'connector', '$modal', 'toastr'];
        function ExtendNewConnectorCtrl($scope, $modalInstance, connector, $modal, toastr) {

            $scope.connector = connector;

            $scope.addField = function (index, optionName) {
                var newField = angular.copy($scope.defaultValues[optionName][0]);
                $scope.values[optionName].splice(index + 1, 0, newField);
            };

            $scope.addOption = function (index, array) {
                array.splice(index + 1, 0, '');
            };

            $scope.deleteOption = function (index, array) {
                array.splice(index, 1);
            };

            $scope.addMapOption = function (index, array) {
                array.splice(index + 1, 0, {key: '', value: ''});
            };

            $scope.deleteMapOption = function (index, array) {
                array.splice(index, 1);
            };

            function toQuery() {
                return createConnectorQuery($scope.name, connector.value, $scope.values, $scope.options,
                    function (label, error) {
                        toastr.error(error, label);
                    });
            }

            $scope.ok = function () {
                if ($scope.form.$valid) {
                    var query = toQuery();

                    if (query) {
                        $modalInstance.close({name: $scope.name, values: $scope.values, options: $scope.options, query: query});
                    }
                }
            };

            $scope.viewQuery = function () {
                var query = toQuery();

                if (query) {
                    var modal = $modal.open({
                        templateUrl: 'pages/viewQuery.html',
                        controller: 'ViewQueryCtrl',
                        resolve: {
                            query: function () {
                                return query;
                            }
                        }
                    });
                }
            };

            $scope.cancel = function () {
                $modalInstance.dismiss('cancel');
            };
        }

        CreateConnectorCtrl.$inject = ['$scope', '$controller', '$http', '$modalInstance', 'connector', '$modal', 'values', 'options'];
        function CreateConnectorCtrl($scope, $controller, $http, $modalInstance, connector, $modal, values, options) {
            angular.extend(this, $controller('ExtendNewConnectorCtrl', {
                $scope: $scope,
                $modalInstance: $modalInstance,
                connector: connector,
                $modal: $modal
            }));
            $scope.values = values.values;
            $scope.options = options;
            $scope.name = values.name;
            if (!values.skipConversion) {
                $scope.values = mapCreateValuesToUiValues($scope.values, $scope.options);
            }
            $scope.defaultValues = angular.copy($scope.values);
        }

        // Note that this is a fancy controller: it's used both for a modal and for a directive.
        // This means you can't rely on custom injection through resolve in the modal and the scope
        // must be shared with the main connectors controller.
        CreateProgressCtrl.$inject = ['$scope', '$interval', '$http', '$repositories'];
        function CreateProgressCtrl($scope, $interval, $http, $repositories) {
            function evaluateSparqlQuery(query) {
                return _evaluateSparqlQuery($http, $repositories.getActiveRepository(), query);
            }

            function initProgress() {
                var query = createStatusQueryForIri($scope.beingBuiltConnector.iri);

                // reset iri value so that watch will fire again when we do something with the same connector
                $scope.beingBuiltConnector.iri = null;

                $scope.progressInterval = $interval(function () {
                    function getFirstStatusFromResult(results) {
                        if (results.bindings) {
                            if (results.bindings.length > 0) {
                                try {
                                    return JSON.parse(results.bindings[0].status.value);
                                } catch (e) {
                                }
                            }
                        }

                        return {};
                    }

                    evaluateSparqlQuery(query)
                        .then(function (res) {
                            var status = getFirstStatusFromResult(res.data.results);
                            if (status.status === "BUILDING") {
                                $scope.beingBuiltConnector.status = status;
                                $scope.beingBuiltConnector.percentDone = (100 * status.processedEntities / status.estimatedEntities).toFixed(0);
                                $scope.beingBuiltConnector.eta = $scope.getHumanReadableSeconds(status.etaSeconds);
                                $scope.beingBuiltConnector.actionName = status.repair ? 'Repairing' : 'Creating';
								$scope.beingBuiltConnector.waitOnRepairStartOnce = false;
                            } else if (status.status === "BUILT" && !$scope.beingBuiltConnector.waitOnRepairStartOnce) {
                                // done
                                $interval.cancel($scope.progressInterval);
                                if ($scope.beingBuiltConnector.doneCallback) {
                                    $scope.beingBuiltConnector.doneCallback();
                                }
                            }
                        });
                }, 1000);

                $scope.$on('$destroy', function () {
                    $interval.cancel($scope.progressInterval);
                });
            }

            $scope.beingBuiltConnector = $scope.beingBuiltConnector || {};

            // for modal instance we get the iri before hand and can start progress now
            if (!$scope.beingBuiltConnector.inline && $scope.beingBuiltConnector.iri) {
                initProgress();
            }

            // for inline progress we need to watch for the iri value
            $scope.$watch('beingBuiltConnector.iri', function (value) {
                if ($scope.beingBuiltConnector.inline && value) {
                    initProgress();
                }
            });
        }

        function ceil() {
            return function (input) {
                return Math.ceil(input);
            };
        }
    }
);
