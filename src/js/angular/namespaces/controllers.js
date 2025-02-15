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

namespaces.controller('NamespacesCtrl', ['$scope', '$http', '$repositories', 'toastr', '$uibModal', 'ModalService', 'RepositoriesRestService', 'RDF4JRepositoriesRestService', '$translate',
    function ($scope, $http, $repositories, toastr, $uibModal, ModalService, RepositoriesRestService, RDF4JRepositoriesRestService, $translate) {
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
            deselectAll();
            filterResults();
        };

        const filterResults = function() {
            angular.forEach($scope.namespaces, function (item) {
                if (item.namespace.indexOf($scope.searchNamespaces) !== -1 || item.prefix.indexOf($scope.searchNamespaces) !== -1) {
                    $scope.matchedElements.push(item);
                }
            });
        };

        $scope.saveNamespace = function (prefix, namespace) {
            $scope.loader = true;
            return RDF4JRepositoriesRestService.updateNamespacePrefix($repositories.getActiveRepository(), namespace, prefix)
                .then(function () {
                    $scope.getNamespaces();
                    toastr.success($translate.instant('namespace.saved'));
                    $scope.loader = false;
                }).catch(function (data) {
                    const msg = getError(data);
                    toastr.error(msg, $translate.instant('common.error'));
                    $scope.loader = false;
                    // Reject the promise so that the caller can handle the error as well. Some callers don't care about
                    // the error and just want to know if the operation was successful or not. But there are also callers
                    // that want to know the error details.
                    return Promise.reject(data);
                });
        };

        $scope.editPrefix = function (oldPrefix, newPrefix) {
            $scope.loader = true;
            RepositoriesRestService.getPrefix($repositories.getActiveRepository(), {
                from: oldPrefix, to: newPrefix, location: $repositories.getActiveRepositoryObject().location})
                .success(function () {
                    $scope.getNamespaces();
                    $scope.loader = false;
                }).error(function (data) {
                    const msg = getError(data);
                    toastr.error(msg, $translate.instant('common.error'));
                    $scope.loader = false;
                });
        };

        const confirmReplace = function (okCallback, cancelCallback) {
            return ModalService.openSimpleModal({
                title: $translate.instant('namespace.confirm.replace'),
                message: $translate.instant('namespace.already.exists.msg'),
                warning: true
            }).result;
        };

        /**
         * Validates the prefix and namespace and checks if the prefix already exists. If the prefix already exists,
         * a confirmation dialog is shown to the user. If the user confirms the dialog, the flow continues and the
         * namespace is updated. If the user rejects the dialog, the flow continues in the catch block.
         *
         * <strong>Using async/await in order to be able to control the flow of the function and to be able to return a value
         * which is expected by the xeditable component. Otherwise, it won't behave as expected.</strong>
         *
         * @param {string} prefixValue The new prefix value.
         * @param {string} namespaceValue The new namespace value.
         * @param {*} namespaceObject The namespace object holding the old values.
         * @return {Promise<boolean|string>}
         */
        $scope.editPrefixAndNamespace = async (prefixValue, namespaceValue, namespaceObject) => {
            try {
                const namespace = namespaceValue;
                let prefix = prefixValue;
                if (!prefixValue) {
                    prefix = '';
                }

                if (!validatePrefixAndNamespace(prefix, namespace)) {
                    // The string returned here is only meaningful for the xeditable component which handles it as an
                    // error which we don't show to the user. In this case the form remains open and the user can cancel
                    // or correct the input.
                    return 'Prefix or namespace is invalid';
                }

                const oldPrefix = namespaceObject.prefix;
                if (isPrefixExist(prefix, oldPrefix)) {
                    // If the user rejects the confirmation dialog, the flow continues in the catch block.
                    await ModalService.openSimpleModal({
                        title: $translate.instant('namespace.confirm.replace'),
                        message: $translate.instant('namespace.already.exists.msg'),
                        warning: true
                    }).result;
                }
                return updateNamespace(prefix, oldPrefix, namespace);
            } catch (err) {
                // The string returned here is only meaningful for the xeditable component which handles it as an
                // error which we don't show to the user. In this case the form remains open and the user can cancel
                // or correct the input.
                return 'Prefix overwrite cancelled';
            }
        };

        /**
         * Checks if the prefix already exists in the list of namespaces.
         * @param {string} prefix The prefix to check.
         * @param {string} oldPrefix The old prefix value.
         * @return {boolean} True if the prefix already exists, false otherwise.
         */
        const isPrefixExist = (prefix, oldPrefix) => {
            return !!$scope.namespaces.find((elem) => elem.prefix === prefix && oldPrefix !== prefix);
        };

        /**
         * Updates the namespace and if the operation is successful, updates the prefix as well.
         * @param {string} newPrefix The new prefix value.
         * @param {string} oldPrefix The old prefix value.
         * @param {*} namespace The namespace object holding the old values.
         * @return {Promise<void>}
         */
        const updateNamespace = (newPrefix, oldPrefix, namespace) => {
            return $scope.saveNamespace(oldPrefix, namespace)
                .then(function () {
                    if (oldPrefix !== newPrefix) {
                        $scope.editPrefix(oldPrefix, newPrefix);
                    }
                });
        };

        $scope.addNamespace = function () {
            if (!$scope.namespace.prefix) {
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
                confirmReplace().then(saveNamespaceAndUpdateTheUI);
            } else {
                saveNamespaceAndUpdateTheUI();
            }
        };

        /**
         * Saves the namespace and if operation is successful, resets the form state.
         */
        const saveNamespaceAndUpdateTheUI = () => {
            $scope.saveNamespace($scope.namespace.prefix, $scope.namespace.namespace)
                .then(() => {
                    $scope.namespace.namespace = '';
                    $scope.namespace.prefix = '';
                    // Not sure why the timeout is needed here. Probably resetting the values above needs to be
                    // reflected first in the form state and then the form validation model needs to be reset.
                    setTimeout(() => {
                        $scope.form.$setUntouched();
                        $scope.form.$setPristine();
                    });
                })
                .catch(() => {
                    // Do nothing, the error is already handled in the saveNamespace function
                });
        };

        $scope.removeNamespace = function (namespace) {
            ModalService.openSimpleModal({
                title: $translate.instant('common.confirm.delete'),
                message: $translate.instant('namespace.warning.delete.msg', {prefix: namespace.prefix}),
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
                    title: $translate.instant('common.confirm.delete'),
                    message: $translate.instant('namespace.warning.delete.selected'),
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

        const deleteNamespace = (namespace, namespaces)=> {
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
                            toastr.success($translate.instant('namespace.prefix.deleted.successfully', {prefix: prefix}), '');
                        } else {
                            toastr.success($translate.instant('namespace.selected.namespaces.deleted.successfully'), '');
                        }
                    }
                }).error(function (data) {
                const msg = getError(data);
                toastr.error(msg, $translate.instant('common.error'));
                $scope.loader = false;
            });
        };

        $scope.checkIfSelectedNamespace = function () {
            $scope.haveSelected = false;
            angular.forEach($scope.namespaces, function (item) {
                if (item.selected) {
                    $scope.haveSelected = true;
                }
            });
        };

        const deselectAll = function () {
            angular.forEach($scope.namespaces, function (item) {
                item.selected = false;
            });
        };

        const validatePrefixAndNamespace = (prefix, namespace) => {
            if (!validatePrefix(prefix)) {
                toastr.error($translate.instant('namespace.invalid.prefix', {prefix: prefix}, $translate.instant('common.error')));
                return false;
            }

            if (angular.isUndefined(namespace) || namespace === '') {
                toastr.error($translate.instant('namespace.warning.provide.namespace'), $translate.instant('common.error'));
                return false;
            }

            return true;
        };
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
