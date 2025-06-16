import 'angular/core/services';
import 'angular/core/services/jwt-auth.service';
import 'angular/core/services/repositories.service';
import 'angular/rest/rdf4j.repositories.rest.service';

const modules = [
    'ui.bootstrap',
    'graphdb.framework.core.services.repositories',
    'graphdb.framework.core.services.jwtauth',
    'graphdb.framework.rest.repositories.service',
    'graphdb.framework.rest.rdf4j.repositories.service',
    'toastr'
];

const namespaces = angular.module('graphdb.framework.namespaces.controllers', modules);

// A regular expression that validates a prefix according to the SPARQL 1.1 specification.
// XXX: Technically this should include Unicode chars > 0xFFFF but those aren't fully supported in JavaScript
const pnPrefixRe = function () {
    const pnCharsBase = '[A-Z]|[a-z]|[\u00C0-\u00D6]|[\u00D8-\u00F6]|[\u00F8-\u02FF]|[\u0370-\u037D]'
        + '|[\u037F-\u1FFF]|[\u200C-\u200D]|[\u2070-\u218F]|[\u2C00-\u2FEF]|[\u3001-\uD7FF]'
        + '|[\uF900-\uFDCF]|[\uFDF0-\uFFFD]';
    const pnCharsU = pnCharsBase + '|_';
    const pnChars = pnCharsU + '|-|[0-9]|\u00B7|[\u0300-\u036F]|[\u203F-\u2040]';

    return new RegExp('^(?:' + pnCharsBase + ')(?:(?:' + pnChars + '|\\.)*(?:' + pnChars + '))?$');
}();

function validatePrefix(prefix) {
    return prefix === '' || prefix.match(pnPrefixRe);
}

namespaces.controller('NamespacesCtrl', ['$scope', '$http', '$repositories', 'toastr', '$uibModal', 'ModalService', 'RepositoriesRestService', 'RDF4JRepositoriesRestService',
    function ($scope, $http, $repositories, toastr, $uibModal, ModalService, RepositoriesRestService, RDF4JRepositoriesRestService) {
        $scope.namespaces = {};
        $scope.namespace = {};
        $scope.loader = false;
        $scope.haveSelected = false;
        $scope.pageSizeOptions = [10, 20, 50, 100];
        $scope.page = 1;
        $scope.pageSize = $scope.pageSizeOptions[0];
        $scope.displayedNamespaces = [];

        $scope.getNamespaces = function () {
            if (!$repositories.getActiveRepository()) {
                return;
            }

            $scope.loader = true;
            $scope.namespaces = {};
            RDF4JRepositoriesRestService.getNamespaces($repositories.getActiveRepository())
                .success(function (data) {
                    $scope.namespaces = data.results.bindings.map(function (e) {
                        return {
                            prefix: e.prefix.value,
                            namespace: e.namespace.value
                        };
                    });
                    if ($scope.namespaces.length > 0) {
                        $scope.namespaces.sort(function (a, b) {
                            const prefixA = a.prefix.toUpperCase(); // ignore upper and lowercase
                            const prefixB = b.prefix.toUpperCase(); // ignore upper and lowercase
                            if (prefixA < prefixB) {
                                return -1;
                            }
                            if (prefixA > prefixB) {
                                return 1;
                            }
                            return 0;
                        });
                        $scope.matchedElements = $scope.namespaces;
                        $scope.changePagination();
                    }
                    if ($scope.namespaces.length === 0) {
                        // Remove the loader ourselves
                        $scope.loader = false;
                    } // else let the loaderPostRepeatDirective do it
                }).error(function (data) {
                    const msg = getError(data);
                    toastr.error(msg);
                    $scope.loader = false;
                });
        };

        $scope.changePagination = function () {
            if (angular.isDefined($scope.namespaces)) {
                $scope.displayedNamespaces = $scope.namespaces.slice($scope.pageSize * ($scope.page - 1), $scope.pageSize * $scope.page);
            }
        };

        $scope.changePageSize = function (size) {
            $('.ot-graph-page-size').removeClass('active');
            $scope.page = 1;
            $scope.searchNamespaces = '';
            if (size) {
                $scope.getNamespaces();
                $scope.pageSize = size;
            }
        };

        $scope.$watch('matchedElements', function () {
            if (angular.isDefined($scope.matchedElements)) {
                $scope.displayedNamespaces = $scope.matchedElements.slice($scope.pageSize * ($scope.page - 1), $scope.pageSize * $scope.page);
            }
        });

        $scope.$watch(function () {
            return $repositories.getActiveRepository();
        }, function () {
            $scope.searchNamespaces = '';
            $scope.getNamespaces();
            $scope.selectedAll = false;
        });

        $scope.onNamespaceSearch = function() {
            $scope.haveSelected = false;
            $scope.selectedAll = false;
            $scope.matchedElements = [];
            $scope.deselectAll();
            $scope.filterResults();
        };

        $scope.filterResults = function() {
            angular.forEach($scope.namespaces, function (item) {
                if (item.namespace.indexOf($scope.searchNamespaces) !== -1 || item.prefix.indexOf($scope.searchNamespaces) !== -1) {
                    $scope.matchedElements.push(item);
                }
            });
        };

        $scope.saveNamespace = function (prefix, namespace) {
            $scope.loader = true;
            return RDF4JRepositoriesRestService.updateNamespacePrefix($repositories.getActiveRepository(), namespace, prefix)
                .success(function () {
                    $scope.getNamespaces();
                    $scope.loader = false;
                }).error(function (data) {
                    const msg = getError(data);
                    toastr.error(msg, 'Error');
                    $scope.loader = false;
                });
        };

        $scope.editPrefix = function (oldPrefix, newPrefix) {
            $scope.loader = true;
            RepositoriesRestService.getPrefix($repositories.getActiveRepository(), {from: oldPrefix, to: newPrefix})
                .success(function () {
                    $scope.getNamespaces();
                    $scope.loader = false;
                }).error(function (data) {
                    const msg = getError(data);
                    toastr.error(msg, 'Error');
                    $scope.loader = false;
                });
        };

        $scope.confirmReplace = function (okCallback, cancelCallback) {
            ModalService.openSimpleModal({
                title: 'Confirm replace',
                message: 'This namespace prefix already exists. Do you want to replace it?',
                warning: true
            }).result.then(okCallback, cancelCallback);
        };

        $scope.editPrefixAndNamespace = function (prefix, namespace, namespaceObject) {
            if (angular.isUndefined(prefix)) {
                prefix = '';
            }

            if (!validatePrefixAndNamespace(prefix, namespace)) {
                return '';
            }

            let prefixExist = false;
            const oldPrefix = namespaceObject.prefix;
            angular.forEach($scope.namespaces, function (elem) {
                if (elem.prefix === prefix && oldPrefix !== prefix) {
                    prefixExist = true;
                }
            });
            if (prefixExist) {
                $scope.confirmReplace(function () {
                    $scope.saveNamespace(oldPrefix, namespace).then(function () {
                        if (oldPrefix !== prefix) {
                            $scope.editPrefix(oldPrefix, prefix);
                        }
                    });
                }, function () {
                    $scope.getNamespaces();
                });
            } else if (angular.isDefined(prefixExist)) {
                $scope.saveNamespace(oldPrefix, namespace).then(function () {
                    if (oldPrefix !== prefix) {
                        $scope.editPrefix(oldPrefix, prefix);
                    }
                });
            }
        };

        $scope.addNamespace = function () {
            if (angular.isUndefined($scope.namespace.prefix)) {
                $scope.namespace.prefix = '';
            }

            if (!validatePrefixAndNamespace($scope.namespace.prefix, $scope.namespace.namespace)) {
                return;
            }

            $scope.selectedAll = false;
            let prefixExist = false;
            for (let i = 0; i < $scope.namespaces.length; i++) {
                if ($scope.namespaces[i].prefix === $scope.namespace.prefix) {
                    prefixExist = true;
                }
            }
            if (prefixExist) {
                $scope.confirmReplace(function () {
                    $scope.saveNamespace($scope.namespace.prefix, $scope.namespace.namespace);
                    $scope.namespace = {};
                });
            } else {
                $scope.saveNamespace($scope.namespace.prefix, $scope.namespace.namespace);
                $scope.namespace = {};
            }
        };

        $scope.removeNamespace = function (namespace) {
            ModalService.openSimpleModal({
                title: 'Confirm delete',
                message: 'Are you sure you want to delete the namespace \'' + namespace.prefix + '\'?',
                warning: true
            }).result.then(function () {
                deleteNamespace(namespace);
            });
        };

        $scope.checkAll = function () {
            angular.forEach($scope.displayedNamespaces, function (item) {
                item.selected = $scope.selectedAll;
            });
        };

        $scope.deleteSelected = function () {
            const openModalInstance = function () {
                ModalService.openSimpleModal({
                    title: 'Confirm delete',
                    message: 'Are you sure you want to delete the selected namespace(s)?',
                    warning: true
                }).result.then(function () {
                    $scope.loader = true;
                    const namespaces = [];
                    angular.forEach($scope.displayedNamespaces, function (namespace) {
                        if (namespace.selected) {
                            namespaces.push(namespace);
                        }
                    });
                    deleteNamespace(namespaces.shift(), namespaces);
                    $scope.selectedAll = false;
                }, function () {
                    $scope.getNamespaces();
                    $scope.selectedAll = false;
                    $scope.searchNamespaces = '';
                });
            };

            let modalInstanceOpened = false;
            angular.forEach($scope.displayedNamespaces, function (namespace) {
                if (!modalInstanceOpened) {
                    if (namespace.selected) {
                        modalInstanceOpened = true;
                        openModalInstance();
                    }
                }
            });
        };

        function deleteNamespace(namespace, namespaces) {
            let prefix;
            if (typeof namespace === 'object') {
                prefix = namespace.prefix;
            } else {
                prefix = namespace;
            }
            RDF4JRepositoriesRestService.deleteNamespacePrefix($repositories.getActiveRepository(), prefix)
                .success(function () {
                    if (namespaces && namespaces.length > 0) {
                        namespace = namespaces.shift();
                        deleteNamespace(namespace, namespaces);
                    } else {
                        $scope.selectedAll = false;
                        $scope.namespace = {};
                        $scope.getNamespaces();
                        $scope.searchNamespaces = '';
                        $scope.haveSelected = false;
                        $scope.loader = false;
                        $scope.displayedNamespaces = [];
                        if (namespaces === undefined) {
                            toastr.success('Namespace with prefix \'' + prefix + '\' was deleted successfully.', '');
                        } else {
                            toastr.success('Selected namespaces were deleted successfully.', '');
                        }
                    }
                }).error(function (data) {
                    const msg = getError(data);
                    toastr.error(msg, 'Error');
                    $scope.loader = false;
                });
        }

        $scope.checkIfSelectedNamespace = function () {
            $scope.haveSelected = false;
            angular.forEach($scope.namespaces, function (item) {
                if (item.selected) {
                    $scope.haveSelected = true;
                }
            });
        };

        $scope.deselectAll = function () {
            angular.forEach($scope.namespaces, function (item) {
                item.selected = false;
            });
        };

        function validatePrefixAndNamespace(prefix, namespace) {
            if (!validatePrefix(prefix)) {
                toastr.error('Invalid prefix: ' + prefix, 'Error');
                return false;
            }

            if (angular.isUndefined(namespace) || namespace === '') {
                toastr.error('Please provide namespace.', 'Error');
                return false;
            }

            return true;
        }
    }]);

namespaces.controller('StandartModalCtrl', ['$scope', '$uibModalInstance', function ($scope, $uibModalInstance) {

    $scope.ok = function () {
        const result = true;
        $uibModalInstance.close(result);
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
}]);
