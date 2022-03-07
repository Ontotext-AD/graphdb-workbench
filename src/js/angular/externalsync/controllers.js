import 'angular/rest/rdf4j.repositories.rest.service';
import 'angular/rest/connectors.rest.service';

const modules = [
    'graphdb.framework.rest.rdf4j.repositories.service',
    'graphdb.framework.rest.connectors.service'
];

angular
    .module('graphdb.framework.externalsync.controllers', modules)
    .controller('ConnectorsCtrl', ConnectorsCtrl)
    .controller('ExtendNewConnectorCtrl', ExtendNewConnectorCtrl)
    .controller('CreateConnectorCtrl', CreateConnectorCtrl)
    .controller('CreateProgressCtrl', CreateProgressCtrl)
    .controller('DeleteConnectorCtrl', DeleteConnectorCtrl)
    .filter('ceil', ceil);

function jsonToFormData(data) {
    const str = [];
    Object.keys(data).forEach(function (key) {
        str.push(encodeURIComponent(key) + '=' + encodeURIComponent(data[key]));
    });
    return str.join('&');
}

function toArrayMap(map) {
    return _.map(map, function (value, key) {
        return {key: key, value: value};
    });
}

function fromArrayMap(arrayMap) {
    return _.reduce(arrayMap, function (acc, value) {
        if (value.key === '' && value.value === '') {
            // empty pair, skip it
        } else if (value.key === '') {
            throw new Error('Key may not be empty with value "' + value.value + '"');
        } else if (acc.hasOwnProperty(value.key)) {
            throw new Error('Duplicate key ' + value.key);
        } else {
            acc[value.key] = value.value;
        }
        return acc;
    }, {});
}

function mapCreateValuesToUiValues(values, options) {
    for (let i = 0; i < options.length; i++) {
        const option = options[i];
        if (option.__type === 'StringArray') {
            if (!values[option.__name]) {
                values[option.__name] = [''];
            }
        } else if (option.__type === 'OptionArray') {
            if (!values[option.__name]) { // values has no entry for this option
                values[option.__name] = [];
                const optionEl = {};
                for (let j = 0; j < option.__childOptions.length; j++) {
                    const child = option.__childOptions[j];
                    if (child.__type === 'StringArray') {
                        optionEl[child.__name] = [''];
                    } else {
                        optionEl[child.__name] = (!angular.isUndefined(child.__defaultValue) ? child.__defaultValue : '');
                    }
                }
                values[option.__name].push(optionEl);
            } else { // values already has en entry for this option
                // Copies the default value for Boolean child options if no explicit value is set
                for (let j = 0; j < option.__childOptions.length; j++) {
                    const child = option.__childOptions[j];
                    if (child.__type === 'Boolean') {
                        for (let k = 0; k < values[option.__name].length; k++) {
                            const valueK = values[option.__name][k];
                            if (!valueK.hasOwnProperty([child.__name]) && angular.isDefined(child.__defaultValue)) {
                                valueK[child.__name] = child.__defaultValue;
                            }
                        }
                    }
                }
            }
        } else if (option.__type === 'Map') {
            if (!values[option.__name]) {
                values[option.__name] = [];
            } else {
                values[option.__name] = toArrayMap(values[option.__name]);
            }
        } else if (option.__type === 'JsonString') {
            if (values[option.__name] && !(values[option.__name] instanceof String) && typeof values[option.__name] !== 'string') {
                values[option.__name] = angular.toJson(values[option.__name], 2);
            }
        } else {
            if (angular.isUndefined(values[option.__name])) {
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

function buildNamePrefix(prefix) {
    return prefix.substring(0, prefix.length - 1) + '/instance#';
}

function createConnectorQuery(name, prefix, fields, options, reportError) {
    // Returns a copy of the parameter obj sorted according to the order in options
    function sortObject(obj, options) {
        const newObject = {};
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

    const fcopy = sortObject(fields, options);

    for (let i = 0; i < options.length; i++) {
        try {
            if (options[i].__type === 'Map') {
                fcopy[options[i].__name] = fromArrayMap(fcopy[options[i].__name]);
            } else if (options[i].__type === 'JsonString') {
                fcopy[options[i].__name] = angular.fromJson(fcopy[options[i].__name]);
            }
        } catch (e) {
            reportError(options[i].__label, e.message);
            return null;
        }
    }

    removeEmptyValues(fcopy);
    //escapeValues(fields);
    let finalString = '';
    finalString += 'PREFIX :<' + prefix + '>\n';
    const namePrefix = buildNamePrefix(prefix);
    finalString += 'PREFIX inst:<' + namePrefix + '>\n';
    finalString += 'INSERT DATA {\n';
    finalString += "\tinst:" + name + " :createConnector '''\n"; // eslint-disable-line quotes
    finalString += angular.toJson(fcopy, 2);
    finalString += "\n''' .\n}\n"; // eslint-disable-line quotes
    finalString = finalString.replace(/\\/g, '\\\\\\');
    return finalString;
}

function createStatusQueryForIri(iri) {
    const statusIri = iri.replace(/\/instance#.+$/, '#connectorStatus');
    let finalString = '';
    finalString += 'SELECT ?status {\n';
    finalString += '\t<' + iri + '> <' + statusIri + '> ?status';
    finalString += '\n}';
    return finalString;
}

function createStatusQueryForAny(connectors) {
    const connectorIris = _.map(connectors,
        function (k) {
            return '<' + k.value + 'connectorStatus' + '>';
        }).join('|');

    if (connectorIris) {
        return 'SELECT ?connector ?status { ?connector ' + connectorIris + ' ?status }';
    }

    return null;
}

function repairConnectorQuery(name, prefix) {
    const namePrefix = buildNamePrefix(prefix);
    return 'PREFIX prefix:<' + prefix + '>\n' +
        'INSERT DATA {\n' +
        '\t<' + namePrefix + name + '> prefix:repairConnector ""\n' +
        '}';
}

function deleteConnectorQuery(name, prefix, force) {
    const namePrefix = prefix.substring(0, prefix.length - 1) + "/instance#";
    return 'PREFIX prefix:<' + prefix + '>\n' +
        'INSERT DATA {\n' +
        '\t<' + namePrefix + name + '> prefix:dropConnector "' + (force ? "force" : "") + '"\n' +
        '}';
}

function removeEmptyValues(data) {
    // remove empty values from array
    if (Array.isArray(data)) {
        data = _.filter(data, function (item) {
            return item !== null && (!item.trim || item.trim() !== '');
        });
    }
    // remove empty values from object values
    Object.keys(data).forEach(function (key) {
        if ((data[key] === '' || data[key] == null) && data[key] !== false) {
            delete data[key];
        } else if (typeof data[key] === 'object') {
            data[key] = removeEmptyValues(data[key]);
        }
    });
    return data;
}

function parseFirstBuildingResult(results) {
    if (results.bindings) {
        for (let i = 0; i < results.bindings.length; i++) {
            try {
                const statusObject = JSON.parse(results.bindings[i].status.value);
                if (statusObject.status === 'BUILDING') {
                    return {
                        connector: results.bindings[i].connector.value,
                        status: statusObject
                    };
                }
            } catch (e) {
                console.error(e); // eslint-disable-line no-console
            }
        }
    }

    return {};
}

ConnectorsCtrl.$inject = ['$scope', '$http', '$repositories', '$modal', 'toastr', 'ModalService', '$q', 'RDF4JRepositoriesRestService', 'ConnectorsRestService'];

function ConnectorsCtrl($scope, $http, $repositories, $modal, toastr, ModalService, $q, RDF4JRepositoriesRestService, ConnectorsRestService) {
    $scope.loader = false;

    $scope.controllers = [];

    $scope.existing = {};

    $scope.definitions = {};

    $scope.getLoaderMessage = function () {
        const timeSeconds = (Date.now() - $scope.loaderStartTime) / 1000;
        const timeHuman = $scope.getHumanReadableSeconds(timeSeconds);
        let message = '';
        if ($scope.progressMessage) {
            message = $scope.progressMessage + '... ' + timeHuman;
        } else {
            message = 'Running operation...' + timeHuman;
        }
        if ($scope.extraMessage && timeSeconds > 10) {
            message += '\n' + $scope.extraMessage;
        }

        return message;
    };

    $scope.setLoader = function (isRunning, progressMessage, extraMessage) {
        if (isRunning) {
            $scope.loader = true;
            $scope.loaderStartTime = Date.now();
            $scope.progressMessage = progressMessage;
            $scope.extraMessage = extraMessage;
        } else {
            $scope.loader = false;
            $scope.progressMessage = '';
            $scope.extraMessage = '';
        }
    };

    $scope.initConnector = function (connector) {
        return ConnectorsRestService.initConnector(encodeURIComponent(connector.value))
            .then(function (res) {
                $scope.definitions[connector.key] = res.data;

                return ConnectorsRestService.hasConnector(encodeURIComponent(connector.value))
                    .then(function (res) {
                        $scope.existing[connector.key] = res.data;

                    });
            });
    };

    $scope.getConnectors = function () {
        if (!$scope.isLicenseValid()) {
            return;
        }
        if (!$scope.canWriteActiveRepo()) {
            return;
        }

        $scope.setLoader(true, 'Fetching connectors', 'Normally this is a fast operation but it may take longer if a bigger repository needs to be initialised first.');

        ConnectorsRestService.getConnectors()
            .then(function (res) {
                $scope.connectors = Object.keys(res.data).map(function (key) {
                    return {key: key, value: res.data[key]};
                });

                $q.all(_.map($scope.connectors, function (connector) {
                    return $scope.initConnector(connector);
                })).finally(function () {
                    resetProgress();

                    const query = createStatusQueryForAny($scope.connectors);

                    if (query) {
                        evaluateSparqlQuery(query)
                            .then(function (res) {
                                const status = parseFirstBuildingResult(res.data.results);
                                if (status.connector) {
                                    // has a building connector, open progress indicator
                                    const d = status.connector.split(/#/);
                                    d[0] = d[0].replace(/\/instance$/, '#');
                                    showProgress(d[0], d[1]);
                                }
                            })
                            .finally(function () {
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
            waitOnRepairStartOnce: !!repair,
            eta: '-',
            inline: false,
            iri: null
        };
    }

    function openProgressModal(prefix, name, repair) {
        resetProgress(repair);

        $.extend($scope.beingBuiltConnector, {
            iri: buildNamePrefix(prefix) + name,
            name: name,
            inline: false,
            doneCallback: function () {
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
            iri: buildNamePrefix(prefix) + name,
            name: name,
            inline: true,
            doneCallback: function () {
                $scope.beingBuiltConnector.inline = false;
            }
        });
    }

    function executeCreate(connector, obj, errorCallback) {
        const modal = openProgressModal(connector.value, obj.name, false);
        RDF4JRepositoriesRestService.addStatements($repositories.getActiveRepository(), jsonToFormData({update: obj.query}))
            .then(function () {
                ConnectorsRestService.getConnectors().then(function () {
                    ConnectorsRestService.hasConnector(encodeURIComponent(connector.value)).then(function (res) {
                        $scope.existing[connector.key] = res.data;
                    });
                });
                toastr.success('Created connector ' + obj.name);
            }, function (err) {
                toastr.error(getError(err));
                errorCallback();
            }).finally(function () {
                modal.dismiss('cancel');
            });
    }

    $scope.copyConnector = function (connector, values) {
        let newValues;
        if (!angular.isUndefined(values)) {
            newValues = angular.copy(values);
            newValues.name = newValues.name + '-copy';
        }
        const modal = $modal.open({
            templateUrl: 'pages/createConnector.html',
            controller: 'CreateConnectorCtrl',
            size: 'lg',
            backdrop: 'static',
            resolve: {
                connector: function () {
                    return connector;
                },
                values: function () {
                    return angular.isUndefined(newValues) ? {name: '', values: {}} : newValues;
                },
                options: function () {
                    return $scope.getOptions(connector);
                }
            }
        });

        modal.result.then(function (obj) {
            executeCreate(connector, obj, function () {
                obj.skipConversion = true;
                $scope.newConnector(connector, obj);
            });
        });
    };

    $scope.newConnector = function (connector, values) {
        const modal = $modal.open({
            templateUrl: 'pages/createConnector.html',
            controller: 'CreateConnectorCtrl',
            size: 'lg',
            backdrop: 'static',
            resolve: {
                connector: function () {
                    return connector;
                },
                values: function () {
                    return angular.isUndefined(values) ? {name: '', values: {}} : values;
                },
                options: function () {
                    return $scope.getOptions(connector);
                }
            }
        });

        modal.result.then(function (obj) {
            executeCreate(connector, obj, function () {
                obj.skipConversion = true;
                $scope.newConnector(connector, obj);
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
                const modal = openProgressModal(type.value, inst.name, true);

                const query = repairConnectorQuery(inst.name, type.value);

                RDF4JRepositoriesRestService.addStatements($repositories.getActiveRepository(), jsonToFormData({update: query}))
                    .then(function () {
                        ConnectorsRestService.getConnectors().then(function () {
                            ConnectorsRestService.hasConnector(encodeURIComponent(type.value)).then(function (res) {
                                $scope.existing[type.key] = res.data;
                            });
                        });
                        toastr.success('Repaired connector ' + inst.name);
                    }, function (err) {
                        toastr.error(getError(err));
                    }).finally(function () {
                        modal.dismiss('cancel');
                    });
            });
    };

    $scope.delete = function (inst, type) {
        const isExternal = type.key.indexOf("Elastic") >= 0 || type.key.indexOf("Solr") >= 0;

        $modal.open({
            templateUrl: 'js/angular/externalsync/templates/deleteConnector.html',
            controller: 'DeleteConnectorCtrl',
            resolve: {
                type: function () {
                    return type.key;
                },
                isExternal: function () {
                    return isExternal;
                }
            }
        }).result
            .then(function(force) {
                $scope.setLoader(true, 'Deleting connector ' + inst.name, 'This is usually a fast operation but it might take a while.');

                const query = deleteConnectorQuery(inst.name, type.value, force);
                RDF4JRepositoriesRestService.addStatements($repositories.getActiveRepository(), jsonToFormData({update: query}))
                    .then(function () {
                        ConnectorsRestService.getConnectors().then(function () {
                            ConnectorsRestService.hasConnector(encodeURIComponent(type.value)).then(function (res) {
                                $scope.existing[type.key] = res.data;
                            });
                        });
                        if (force) {
                            toastr.success("Deleted (with force) connector " + inst.name);
                            if (isExternal) {
                                toastr.warning("You may have to remove the index manually from " + type.key);
                            }
                        } else {
                            toastr.success("Deleted connector " + inst.name);
                        }
                    }, function (err) {
                        toastr.error(getError(err));
                    }).finally(function() {
                        $scope.setLoader(false);
                    });
            });
    };

    $scope.viewQuery = function (connector, inst) {
        $modal.open({
            templateUrl: 'pages/viewQuery.html',
            controller: 'ViewQueryCtrl',
            resolve: {
                query: function () {
                    const options = $scope.getOptions(connector);
                    return createConnectorQuery(inst.name, connector.value,
                        mapCreateValuesToUiValues(inst.values, options), options);
                }
            }
        });
    };
}

DeleteConnectorCtrl.$inject = ['$scope', '$modalInstance', 'type', 'isExternal'];
function DeleteConnectorCtrl($scope, $modalInstance, type, isExternal) {
    $scope.force = false;
    $scope.type = type;
    $scope.isExternal = isExternal;

    $scope.ok = function () {
        $modalInstance.close($scope.force);
    };

    $scope.cancel = function () {
        $modalInstance.dismiss();
    };
}

ExtendNewConnectorCtrl.$inject = ['$scope', '$modalInstance', 'connector', '$modal', 'toastr'];
function ExtendNewConnectorCtrl($scope, $modalInstance, connector, $modal, toastr) {

    $scope.connector = connector;

    $scope.addField = function (index, optionName) {
        const newField = angular.copy($scope.defaultValues[optionName][0]);
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
            const query = toQuery();

            if (query) {
                $modalInstance.close({name: $scope.name, values: $scope.values, options: $scope.options, query: query});
            }
        }
    };

    $scope.viewQuery = function () {
        const query = toQuery();

        if (query) {
            $modal.open({
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
        const query = createStatusQueryForIri($scope.beingBuiltConnector.iri);

        // reset iri value so that watch will fire again when we do something with the same connector
        $scope.beingBuiltConnector.iri = null;

        $scope.progressInterval = $interval(function () {
            function getFirstStatusFromResult(results) {
                if (results.bindings) {
                    if (results.bindings.length > 0) {
                        try {
                            return JSON.parse(results.bindings[0].status.value);
                        } catch (e) {
                            console.error(e); // eslint-disable-line no-console
                        }
                    }
                }

                return {};
            }

            evaluateSparqlQuery(query)
                .then(function (res) {
                    const status = getFirstStatusFromResult(res.data.results);
                    if (status.status === 'BUILDING') {
                        $scope.beingBuiltConnector.status = status;
                        $scope.beingBuiltConnector.percentDone = (100 * status.processedEntities / status.estimatedEntities).toFixed(0);
                        $scope.beingBuiltConnector.eta = $scope.getHumanReadableSeconds(status.etaSeconds);
                        $scope.beingBuiltConnector.actionName = status.repair ? 'Repairing' : 'Creating';
                        $scope.beingBuiltConnector.waitOnRepairStartOnce = false;
                    } else if (status.status === 'BUILT' && !$scope.beingBuiltConnector.waitOnRepairStartOnce) {
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
