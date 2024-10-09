import 'angular-animate/angular-animate.min';
import 'angular-cookies/angular-cookies.min';
import 'angular-route/angular-route.min';
import 'angular-local-storage/dist/angular-local-storage.min';
import 'angular-sanitize/angular-sanitize.min';
import toastr from 'angular-toastr';
import 'lodash';
import 'angular-ui-bootstrap/ui-bootstrap-tpls.min';
import 'angular-bowser/src/angular-bowser';
import 'angular/utils/error-utils';
import 'autofill-event/autofill-event';
import 'angular/core/directives';
import 'angular/core/controllers';
import 'angular-translate/dist/angular-translate';

const modules = [
    'ui.bootstrap',
    'jlareau.bowser',
    'LocalStorageModule',
    'graphdb.framework.core.controllers',
    'pascalprecht.translate'
];

angular
    .module('graphdb.framework.core', modules)
    .provider('$menuItems', MenuItemsProvider)
    .factory('ModalService', ModalService)
    .factory('ClassInstanceDetailsService', ClassInstanceDetailsService)
    .factory('AuthTokenService', AuthTokenService);

function MenuItemsProvider() {
    const findParent = function (items, parent) {
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            if (item.label === parent) {
                return item;
            }
            const found = findParent(item.children, parent);
            if (!angular.isUndefined(found)) {
                return found;
            }
        }
        return undefined;
    };

    const exists = function (items, label) {
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            if (item.label === label) {
                return true;
            }
        }
        return false;
    };

    const menuItemCompare = function compare(a, b) {
        if (a.order < b.order) {
            return -1;
        }
        if (a.order > b.order) {
            return 1;
        }
        return 0;
    };

    const cloneItem = function (item, children) {
        return {
            label: item.label,
            labelKey: item.labelKey,
            href: item.href,
            hrefFun: item.hrefFun,
            order: item.order,
            role: item.role,
            editions: item.editions,
            icon: item.icon,
            guideSelector: item.guideSelector,
            children: children
        };
    };

    let productInfo;

    const items = [];
    let itemsWithMissedParent = [];

    this.addItem = function (item) {
        if (angular.isUndefined(item.parent)) {
            if (!exists(items, item.label)) {
                items.push(cloneItem(item, []));
                // A new parent is registered so we try to process items which parents were missed.
                this.updateItemsWithMissedParent();
            }
        } else {
            if (!this.addItemToParent(item)) {
                // Save item because parent may not processed yet. We will try later to process it again.
                itemsWithMissedParent.push(item);
            }
        }
    };

    this.addItemToParent = function (item) {
        const parentItem = findParent(items, item.parent);
        if (!angular.isUndefined(parentItem)) {
            if (!exists(parentItem.children, item.label)) {
                parentItem.children.push(cloneItem(item, item.children ? item.children : []));
                return true;
            }
        }
        return false;
    };

    this.updateItemsWithMissedParent = function () {
        if (itemsWithMissedParent.length > 0) {
            const notProcessed = [];
            let self = this;
            itemsWithMissedParent.forEach(function (itemWithMissedParent) {
                if (!self.addItemToParent(itemWithMissedParent)) {
                    notProcessed.push(itemWithMissedParent);
                }
            });
            itemsWithMissedParent = notProcessed;
        }
    };

    this.$get = function () {
        items.sort(menuItemCompare);
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            item.children.sort(menuItemCompare);
        }
        return items;
    };

    // TODO Remove
    this.setProductInfo = function (pinfo) {
        productInfo = pinfo;
    };

    this.getProductInfo = function () {
        return productInfo;
    };
}

ModalService.$inject = ['$uibModal', '$timeout', '$sce'];

function ModalService($uibModal, $timeout, $sce) {
    return {
        openSimpleModal: openSimpleModal,
        openModalAlert: openModalAlert,
        openCopyToClipboardModal: openCopyToClipboardModal,
        openConfirmation: openConfirmation
    };

    /**
     * Opens a confirmation dialog with provided translated title and message. If provided onConfirm and onCancel
     * handler functions then they will be executed.
     * @param {string} title
     * @param {string} message
     * @param {Function} onConfirm
     * @param {Function} onCancel
     */
    function openConfirmation(title, message, onConfirm = () => {}, onCancel = () => {}) {
        const dialogConfig = {
            title,
            message,
            warning: true
        };
        openSimpleModal(dialogConfig).result.then(onConfirm, onCancel);
    }

    function openSimpleModal(config) {
        const simpleTemplate = 'js/angular/core/templates/modal/modal-simple.html';
        const warningTemplate = 'js/angular/core/templates/modal/modal-warning.html';

        return $uibModal.open({
            templateUrl: config.warning ? warningTemplate : simpleTemplate,
            controller: 'SimpleModalCtrl',
            size: config.size,
            windowClass: config.dialogClass,
            resolve: {
                title: function () {
                    return config.title;
                },
                message: function () {
                    return $sce.trustAsHtml(config.message);
                }
            }
        });
    }

    function openModalAlert(config) {
        const windowClass = 'modal-alert ' + config.dialogClass;
        return $uibModal.open({
            templateUrl: 'js/angular/core/templates/modal/modal-simple.html',
            controller: 'SimpleModalCtrl',
            size: config.size,
            windowClass,
            resolve: {
                title: function () {
                    return config.title;
                },
                message: function () {
                    return $sce.trustAsHtml(config.message);
                }
            }
        });
    }

    function openCopyToClipboardModal(uri) {
        return $uibModal.open({
            templateUrl: 'js/angular/core/templates/modal/copy-to-clipboard-modal.html',
            controller: 'CopyToClipboardModalCtrl',
            resolve: {
                uri: function () {
                    return uri;
                }
            }
        });
    }
}

ClassInstanceDetailsService.$inject = ['$http'];

function ClassInstanceDetailsService($http) {
    return {
        getDetails: getDetails,
        getGraph: getGraph,
        getNamespaceUriForPrefix: getNamespaceUriForPrefix,
        getNamespacePrefixForUri: getNamespacePrefixForUri,
        getLocalName: getLocalName
    };

    function getDetails(uriParam) {
        return $http.get('rest/explore/details', {
            params: {
                uri: uriParam
            },
            headers: {
                'Accept': 'application/json'
            }
        });
    }

    function getGraph(uriParam) {
        // encode uri before attaching as query parameter
        const encodedUri = encodeURIComponent(uriParam);
        return $http.get('rest/explore/graph?uri=' + encodedUri + '&role=subject', {
            // why doesn't it work this way? :(
            //params: {
            //   role: 'subject',
            //   uri: encodedUri
            //},
            headers: {
                Accept: 'application/rdf+json'
            }
        });
    }

    function getNamespaceUriForPrefix(namespaces, prefix) {
        let foundUri = '';
        for (let i = 0; i < namespaces.length; i++) {
            if (namespaces[i].prefix === prefix) {
                foundUri = namespaces[i].uri;
                break;
            }
        }

        return foundUri;
    }

    function getNamespacePrefixForUri(namespaces, uri) {
        let foundUri = '';
        for (let i = 0; i < namespaces.length; i++) {
            if (namespaces[i].uri === uri) {
                foundUri = namespaces[i].prefix;
                break;
            }
        }

        return foundUri;
    }

    function getLocalName(uri) {
        if (angular.isUndefined(uri)) {
            return uri;
        } else {
            let trimmedUri;
            const size = uri.length - 1;
            let idxSlash = uri.toString().lastIndexOf('/');
            if (idxSlash === size) {
                trimmedUri = uri.substr(0, size);
                idxSlash = trimmedUri.lastIndexOf('/');
            }
            let idxDiaz = uri.toString().lastIndexOf('#');
            if (idxDiaz === size) {
                trimmedUri = uri.substr(0, size);
                idxDiaz = trimmedUri.lastIndexOf('/');
            }
            return uri.toString().substring(Math.max(idxDiaz, idxSlash) + 1);
        }
    }
}

function AuthTokenService() {
    const authStorageName = 'com.ontotext.graphdb.auth';
    const OPENID_CONFIG = {};

    return {
        AUTH_STORAGE_NAME: authStorageName,
        getAuthToken: getAuthToken,
        setAuthToken: setAuthToken,
        clearAuthToken: clearAuthToken,
        OPENID_CONFIG: OPENID_CONFIG
    };

    function setAuthToken(token) {
        localStorage.setItem(authStorageName, token);
    }

    function getAuthToken() {
        return localStorage.getItem(authStorageName);
    }

    function clearAuthToken() {
        localStorage.removeItem(authStorageName);
    }
}
