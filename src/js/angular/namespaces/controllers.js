import 'angular/core/services';
import 'angular/security/services';
import 'angular/repositories/services';

const modules = [
    'ui.bootstrap',
    'graphdb.framework.repositories.services',
    'graphdb.framework.security.services',
    'toastr'
];

const sparqlCtrl = angular.module('graphdb.framework.namespaces.controllers', modules);

// A regular expression that validates a prefix according to the SPARQL 1.1 specification.
// XXX: Technically this should include Unicode chars > 0xFFFF but those aren't fully supported in JavaScript
var pn_prefix_re = function () {
    var pn_chars_base = "[A-Z]|[a-z]|[\u00C0-\u00D6]|[\u00D8-\u00F6]|[\u00F8-\u02FF]|[\u0370-\u037D]"
        + "|[\u037F-\u1FFF]|[\u200C-\u200D]|[\u2070-\u218F]|[\u2C00-\u2FEF]|[\u3001-\uD7FF]"
        + "|[\uF900-\uFDCF]|[\uFDF0-\uFFFD]";
    var pn_chars_u = pn_chars_base + "|_";
    var pn_chars = pn_chars_u + "|-|[0-9]|\u00B7|[\u0300-\u036F]|[\u203F-\u2040]";

    return new RegExp("^(?:" + pn_chars_base + ")(?:(?:" + pn_chars + "|\\.)*(?:" + pn_chars + "))?$");
}();

function validatePrefix(prefix) {
    return prefix === "" || prefix.match(pn_prefix_re);
}

sparqlCtrl.controller('NamespacesCtrl', ['$scope', '$http', '$timeout', '$repositories', 'toastr', '$modal', '$jwtAuth', 'ModalService',
    function ($scope, $http, $timeout, $repositories, toastr, $modal, $jwtAuth, ModalService) {
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
            $http({
                url: 'repositories/' + $repositories.getActiveRepository() + '/namespaces',
                method: 'GET'
            }).success(function (data, status, headers, config) {
                $scope.namespaces = data.results.bindings.map(function (e) {
                    return {
                        prefix: e.prefix.value,
                        namespace: e.namespace.value
                    };
                });
                if ($scope.namespaces.length > 0) {
                    $scope.namespaces.sort(function (a, b) {
                        var prefix_A = a.prefix.toUpperCase(), // ignore upper and lowercase
                            prefix_B = b.prefix.toUpperCase(); // ignore upper and lowercase
                        if (prefix_A < prefix_B) {
                            return -1;
                        }
                        if (prefix_A > prefix_B) {
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
            }).error(function (data, status, headers, config) {
                msg = getError(data);
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

        $scope.saveNamespace = function (prefix, namespace) {
            $scope.loader = true;
            return $http({
                url: 'repositories/' + $repositories.getActiveRepository() + '/namespaces/' + prefix,
                method: 'PUT',
                data: namespace
            }).success(function (data, status, headers, config) {
                $scope.getNamespaces();
                $scope.loader = false;
            }).error(function (data, status, headers, config) {
                msg = getError(data);
                toastr.error(msg, 'Error');
                $scope.loader = false;
            });
        };

        $scope.editPrefix = function (oldPrefix, newPrefix) {
            $scope.loader = true;
            $http({
                url: "rest/repositories/" + $repositories.getActiveRepository() + "/prefix",
                method: "POST",
                params: {from: oldPrefix, to: newPrefix}
            }).success(function (data, status, headers, config) {
                $scope.getNamespaces();
                $scope.loader = false;
            }).error(function (data, status, headers, config) {
                msg = getError(data);
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
                prefix = "";
            }

            if (!validatePrefixAndNamespace(prefix, namespace)) {
                return "";
            }

            var prefixExist = false;
            var oldPrefix = namespaceObject.prefix;
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
                $scope.namespace.prefix = "";
            }

            if (!validatePrefixAndNamespace($scope.namespace.prefix, $scope.namespace.namespace)) {
                return;
            }

            $scope.selectedAll = false;
            var prefixExist = false;
            for (var i = 0; i < $scope.namespaces.length; i++) {
                if ($scope.namespaces[i].prefix == $scope.namespace.prefix) {
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
                message: "Are you sure you want to delete the namespace '" + namespace.prefix + "'?",
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
            var modalInstanceOpened = false;
            angular.forEach($scope.displayedNamespaces, function (namespace) {
                if (!modalInstanceOpened) {
                    if (namespace.selected) {
                        modalInstanceOpened = true;
                        openModalInstance();
                    }
                }
            });
            if (!$scope.selectedAll) {
                return;
            }

            function openModalInstance() {
                ModalService.openSimpleModal({
                    title: 'Confirm delete',
                    message: "Are you sure you want to delete the selected namespace(s)?",
                    warning: true
                }).result.then(function () {
                    $scope.loader = true;
                    var namespaces = [];
                    angular.forEach($scope.displayedNamespaces, function (namespace, index) {
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
            }
        };

        function deleteNamespace(namespace, namespaces) {
            var prefix;
            if (typeof namespace === "object") {
                prefix = namespace.prefix;
            }
            else {
                prefix = namespace;
            }
            $http({
                url: "repositories/" + $repositories.getActiveRepository() + "/namespaces/" + prefix,
                method: "DELETE"
            }).success(function (data, status, headers, config) {
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
                        toastr.success("Namespace with prefix \"" + prefix + "\" was deleted successfully.", "");
                    } else {
                        toastr.success("Selected namespaces were deleted successfully.", "");
                    }
                }
            }).error(function (data, status, headers, config) {
                msg = getError(data);
                toastr.error(msg, "Error");
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
            angular.forEach($scope.namespaces, function (item, index) {
                item.selected = false;
            });
        };

        function validatePrefixAndNamespace(prefix, namespace) {
            if (!validatePrefix(prefix)) {
                toastr.error("Invalid prefix: " + prefix, "Error");
                return false;
            }

            if (angular.isUndefined(namespace) || namespace === "") {
                toastr.error("Please provide namespace.", "Error");
                return false;
            }

            return true;
        }
    }]);

sparqlCtrl.controller('StandartModalCtrl', ["$scope", "$modalInstance", function ($scope, $modalInstance) {

    $scope.ok = function () {
        var result = true;
        $modalInstance.close(result);
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
}]);
