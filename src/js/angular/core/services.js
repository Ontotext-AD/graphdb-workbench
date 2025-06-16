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

const modules = [
    'ui.bootstrap',
    'jlareau.bowser',
    'LocalStorageModule',
    'graphdb.framework.core.controllers'
];

angular
    .module('graphdb.framework.core', modules)
    .provider('$menuItems', MenuItemsProvider)
    .factory('ModalService', ModalService)
    .factory('ClassInstanceDetailsService', ClassInstanceDetailsService);

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
            href: item.href,
            hrefFun: item.hrefFun,
            order: item.order,
            role: item.role,
            icon: item.icon,
            children: children
        };
    };

    let productInfo;

    const items = [];

    this.addItem = function (item) {
        if (angular.isUndefined(item.parent)) {
            if (!exists(items, item.label)) {
                items.push(cloneItem(item, []));
            }
        } else {
            const parentItem = findParent(items, item.parent);
            if (!angular.isUndefined(parentItem)) {
                if (!exists(parentItem.children, item.label)) {
                    parentItem.children.push(cloneItem(item, item.children ? item.children : []));
                }
            }
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
        openCopyToClipboardModal: openCopyToClipboardModal
    };

    function openSimpleModal(config) {
        const simpleTemplate = 'js/angular/core/templates/modal/modal-simple.html';
        const warningTemplate = 'js/angular/core/templates/modal/modal-warning.html';

        return $uibModal.open({
            templateUrl: config.warning ? warningTemplate : simpleTemplate,
            controller: 'SimpleModalCtrl',
            size: config.size,
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
        const modalInstance = $uibModal.open({
            templateUrl: 'js/angular/core/templates/modal/copy-to-clipboard-modal.html',
            controller: 'CopyToClipboardModalCtrl',
            resolve: {
                uri: function () {
                    return uri;
                }
            }
        });

        modalInstance.opened.then(function () {
            // TODO: If the need for this timeout was to wait for the clipboardURI to be rendered,
            // then better and more reliable approach would be to replace it with an interval instead.
            // And the best way is to move this logic in the CopyToClipboardModalCtrl where it should
            // be because working with the DOM is not the place in services but in controllers or
            // directives.
            $timeout(function () {
                $('#clipboardURI')[0].select();
            }, 100);
        });

        return modalInstance;
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
