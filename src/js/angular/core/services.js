import 'lib/angularjs/1.3.8/angular-animate.min';
import 'lib/angularjs/1.3.8/angular-cookies.min'; //ngCookies
import 'lib/angularjs/1.3.8/angular-route';
import 'lib/angular-local-storage/0.1.5/angular-local-storage.min';
import 'lib/angular-sanitize/1.3.11/angular-sanitize.min';
import toastr from 'angular-toastr';
import 'lodash';
import 'lib/angular-ui-bootstrap/0.13.0/ui-bootstrap-tpls.min';
import 'angular-bowser/src/angular-bowser';
import 'workbench-core';
import 'autofill-event/autofill-event';
import 'angular/core/directives';
import 'angular/core/controllers';

const modules = [
    'ui.bootstrap',
    'jlareau.bowser',
    'LocalStorageModule'
];

angular
    .module('graphdb.framework.core', modules)
    .provider('$menuItems', MenuItemsProvider)
    .factory('ModalService', ModalService)
    .factory('ClassInstanceDetailsService', ClassInstanceDetailsService)
    .factory('AutocompleteService', AutocompleteService)
    .factory('UtilService', UtilService);

function MenuItemsProvider() {
    var findParent = function (items, parent) {
        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            if (item.label == parent) {
                return item;
            }
            var found = findParent(item.children, parent);
            if (!angular.isUndefined(found)) {
                return found;
            }
        }
        return undefined;
    };

    var exists = function (items, label) {
        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            if (item.label == label) {
                return true;
            }
        }
        return false;
    };

    var menuItemCompare = function compare(a, b) {
        if (a.order < b.order)
            return -1;
        if (a.order > b.order)
            return 1;
        return 0;
    };

    var productInfo;

    var items = [];

    this.addItem = function (item) {
        if (angular.isUndefined(item.parent)) {
            if (!exists(items, item.label)) {
                items.push({
                    label: item.label,
                    href: item.href,
                    hrefFun: item.hrefFun,
                    order: item.order,
                    role: item.role,
                    icon: item.icon,
                    children: []
                });
            }
        }
        else {
            var parentItem = findParent(items, item.parent);
            if (!angular.isUndefined(parentItem)) {
                if (!exists(parentItem.children, item.label)) {
                    parentItem.children.push({
                        label: item.label,
                        href: item.href,
                        hrefFun: item.hrefFun,
                        order: item.order,
                        role: item.role,
                        icon: item.icon,
                        children: item.children ? item.children : []
                    });
                }
            }
        }
    };

    this.$get = function () {
        items.sort(menuItemCompare);
        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            item.children.sort(menuItemCompare);
        }
        return items;
    };

    this.setProductInfo = function (pinfo) {
        productInfo = pinfo;
    };

    this.getProductInfo = function () {
        return productInfo;
    }
}

ModalService.$inject = ['$modal', '$timeout', '$sce'];

function ModalService($modal, $timeout, $sce) {
    return {
        openSimpleModal: openSimpleModal,
        openCopyToClipboardModal: openCopyToClipboardModal
    };

    function openSimpleModal(config) {
        var simpleTemplate = 'js/angular/core/templates/modal/modal-simple.html',
            warningTemplate = 'js/angular/core/templates/modal/modal-warning.html';

        return $modal.open({
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
        var modalInstance = $modal.open({
            templateUrl: 'js/angular/core/templates/modal/copy-to-clipboard-modal.html',
            controller: 'CopyToClipboardModalCtrl',
            resolve: {
                uri: function () {
                    return uri;
                }
            }
        });

        modalInstance.opened.then(function () {
            $timeout(function () {
                $('#clipboardURI')[0].select();
            }, 100)
        });

        return modalInstance;
    }
}

ClassInstanceDetailsService.$inject = ['$http'];

function ClassInstanceDetailsService($http) {
    return {
        getNamespaces: getNamespaces,
        getDetails: getDetails,
        getGraph: getGraph,
        getNamespaceUriForPrefix: getNamespaceUriForPrefix,
        getNamespacePrefixForUri: getNamespacePrefixForUri,
        getLocalName: getLocalName
    };


    function getNamespaces(activeRepository) {
        return $http.get('repositories/' + activeRepository + '/namespaces');
    }

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
        var encodedUri = encodeURIComponent(uriParam);
        return $http.get('rest/explore/graph?uri=' + encodedUri + '&role=subject', {
            // why doesn't it work this way? :(
            //params: {
            //   role: 'subject',
            //   uri: encodedUri
            //},
            headers: {
                Accept: 'application/rdf+json'
            }
        })
    }

    function getNamespaceUriForPrefix(namespaces, prefix) {
        var foundUri = '';
        for (var i = 0; i < namespaces.length; i++) {
            if (namespaces[i].prefix == prefix) {
                foundUri = namespaces[i].uri;
                break;
            }
        }

        return foundUri;
    }

    function getNamespacePrefixForUri(namespaces, uri) {
        var foundUri = '';
        for (var i = 0; i < namespaces.length; i++) {
            if (namespaces[i].uri == uri) {
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
            var trimmedUri;
            var size = uri.length - 1;
            var idxSlash = uri.lastIndexOf('/');
            if (idxSlash === size) {
                trimmedUri = uri.substr(0, size);
                idxSlash = trimmedUri.lastIndexOf('/');
            }
            var idxDiaz = uri.lastIndexOf('#');
            if (idxDiaz === size) {
                trimmedUri = uri.substr(0, size);
                idxDiaz = trimmedUri.lastIndexOf('/');
            }
            return uri.substring(Math.max(idxDiaz, idxSlash) + 1);
        }
    }
}

AutocompleteService.$inject = ['$http'];

function AutocompleteService($http) {
    return {
        checkAutocompleteStatus: checkAutocompleteStatus,
        getAutocompleteSuggestions: getAutocompleteSuggestions
    };

    function checkAutocompleteStatus() {
        return $http.get('rest/autocomplete/enabled');
    }

    function getAutocompleteSuggestions(str, cancelerPromise) {
        return $http.get('rest/autocomplete/query', {
            params: {
                q: str
            },
            timeout: cancelerPromise
        });
        return promise;
    }
}

var iriRegExp;
try {
    // Real validation but it requires a relatively new browser
    var iriRegExp = new RegExp("^[a-z](?:[-a-z0-9\\+\\.])*:(?:\\/\\/(?:(?:%[0-9a-f][0-9a-f]|[-a-z0-9\\._~\\u{A0}-\\u{D7FF}\\u{F900}-\\u{FDCF}\\u{FDF0}-\\u{FFEF}\\u{10000}-\\u{1FFFD}\\u{20000}-\\u{2FFFD}\\u{30000}-\\u{3FFFD}\\u{40000}-\\u{4FFFD}\\u{50000}-\\u{5FFFD}\\u{60000}-\\u{6FFFD}\\u{70000}-\\u{7FFFD}\\u{80000}-\\u{8FFFD}\\u{90000}-\\u{9FFFD}\\u{A0000}-\\u{AFFFD}\\u{B0000}-\\u{BFFFD}\\u{C0000}-\\u{CFFFD}\\u{D0000}-\\u{DFFFD}\\u{E1000}-\\u{EFFFD}!\\$&'\\(\\)\\*\\+,;=:])*@)?(?:\\[(?:(?:(?:[0-9a-f]{1,4}:){6}(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])(?:\\.(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])){3})|::(?:[0-9a-f]{1,4}:){5}(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])(?:\\.(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])){3})|(?:[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){4}(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])(?:\\.(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])){3})|(?:[0-9a-f]{1,4}:[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){3}(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])(?:\\.(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])){3})|(?:(?:[0-9a-f]{1,4}:){0,2}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){2}(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])(?:\\.(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])){3})|(?:(?:[0-9a-f]{1,4}:){0,3}[0-9a-f]{1,4})?::[0-9a-f]{1,4}:(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])(?:\\.(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])){3})|(?:(?:[0-9a-f]{1,4}:){0,4}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])(?:\\.(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])){3})|(?:(?:[0-9a-f]{1,4}:){0,5}[0-9a-f]{1,4})?::[0-9a-f]{1,4}|(?:(?:[0-9a-f]{1,4}:){0,6}[0-9a-f]{1,4})?::)|v[0-9a-f]+[-a-z0-9\\._~!\\$&'\\(\\)\\*\\+,;=:]+)\\]|(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])(?:\\.(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])){3}|(?:%[0-9a-f][0-9a-f]|[-a-z0-9\\._~\\u{A0}-\\u{D7FF}\\u{F900}-\\u{FDCF}\\u{FDF0}-\\u{FFEF}\\u{10000}-\\u{1FFFD}\\u{20000}-\\u{2FFFD}\\u{30000}-\\u{3FFFD}\\u{40000}-\\u{4FFFD}\\u{50000}-\\u{5FFFD}\\u{60000}-\\u{6FFFD}\\u{70000}-\\u{7FFFD}\\u{80000}-\\u{8FFFD}\\u{90000}-\\u{9FFFD}\\u{A0000}-\\u{AFFFD}\\u{B0000}-\\u{BFFFD}\\u{C0000}-\\u{CFFFD}\\u{D0000}-\\u{DFFFD}\\u{E1000}-\\u{EFFFD}!\\$&'\\(\\)\\*\\+,;=@])*)(?::[0-9]*)?(?:\\/(?:(?:%[0-9a-f][0-9a-f]|[-a-z0-9\\._~\\u{A0}-\\u{D7FF}\\u{F900}-\\u{FDCF}\\u{FDF0}-\\u{FFEF}\\u{10000}-\\u{1FFFD}\\u{20000}-\\u{2FFFD}\\u{30000}-\\u{3FFFD}\\u{40000}-\\u{4FFFD}\\u{50000}-\\u{5FFFD}\\u{60000}-\\u{6FFFD}\\u{70000}-\\u{7FFFD}\\u{80000}-\\u{8FFFD}\\u{90000}-\\u{9FFFD}\\u{A0000}-\\u{AFFFD}\\u{B0000}-\\u{BFFFD}\\u{C0000}-\\u{CFFFD}\\u{D0000}-\\u{DFFFD}\\u{E1000}-\\u{EFFFD}!\\$&'\\(\\)\\*\\+,;=:@]))*)*|\\/(?:(?:(?:(?:%[0-9a-f][0-9a-f]|[-a-z0-9\\._~\\u{A0}-\\u{D7FF}\\u{F900}-\\u{FDCF}\\u{FDF0}-\\u{FFEF}\\u{10000}-\\u{1FFFD}\\u{20000}-\\u{2FFFD}\\u{30000}-\\u{3FFFD}\\u{40000}-\\u{4FFFD}\\u{50000}-\\u{5FFFD}\\u{60000}-\\u{6FFFD}\\u{70000}-\\u{7FFFD}\\u{80000}-\\u{8FFFD}\\u{90000}-\\u{9FFFD}\\u{A0000}-\\u{AFFFD}\\u{B0000}-\\u{BFFFD}\\u{C0000}-\\u{CFFFD}\\u{D0000}-\\u{DFFFD}\\u{E1000}-\\u{EFFFD}!\\$&'\\(\\)\\*\\+,;=:@]))+)(?:\\/(?:(?:%[0-9a-f][0-9a-f]|[-a-z0-9\\._~\\u{A0}-\\u{D7FF}\\u{F900}-\\u{FDCF}\\u{FDF0}-\\u{FFEF}\\u{10000}-\\u{1FFFD}\\u{20000}-\\u{2FFFD}\\u{30000}-\\u{3FFFD}\\u{40000}-\\u{4FFFD}\\u{50000}-\\u{5FFFD}\\u{60000}-\\u{6FFFD}\\u{70000}-\\u{7FFFD}\\u{80000}-\\u{8FFFD}\\u{90000}-\\u{9FFFD}\\u{A0000}-\\u{AFFFD}\\u{B0000}-\\u{BFFFD}\\u{C0000}-\\u{CFFFD}\\u{D0000}-\\u{DFFFD}\\u{E1000}-\\u{EFFFD}!\\$&'\\(\\)\\*\\+,;=:@]))*)*)?|(?:(?:(?:%[0-9a-f][0-9a-f]|[-a-z0-9\\._~\\u{A0}-\\u{D7FF}\\u{F900}-\\u{FDCF}\\u{FDF0}-\\u{FFEF}\\u{10000}-\\u{1FFFD}\\u{20000}-\\u{2FFFD}\\u{30000}-\\u{3FFFD}\\u{40000}-\\u{4FFFD}\\u{50000}-\\u{5FFFD}\\u{60000}-\\u{6FFFD}\\u{70000}-\\u{7FFFD}\\u{80000}-\\u{8FFFD}\\u{90000}-\\u{9FFFD}\\u{A0000}-\\u{AFFFD}\\u{B0000}-\\u{BFFFD}\\u{C0000}-\\u{CFFFD}\\u{D0000}-\\u{DFFFD}\\u{E1000}-\\u{EFFFD}!\\$&'\\(\\)\\*\\+,;=:@]))+)(?:\\/(?:(?:%[0-9a-f][0-9a-f]|[-a-z0-9\\._~\\u{A0}-\\u{D7FF}\\u{F900}-\\u{FDCF}\\u{FDF0}-\\u{FFEF}\\u{10000}-\\u{1FFFD}\\u{20000}-\\u{2FFFD}\\u{30000}-\\u{3FFFD}\\u{40000}-\\u{4FFFD}\\u{50000}-\\u{5FFFD}\\u{60000}-\\u{6FFFD}\\u{70000}-\\u{7FFFD}\\u{80000}-\\u{8FFFD}\\u{90000}-\\u{9FFFD}\\u{A0000}-\\u{AFFFD}\\u{B0000}-\\u{BFFFD}\\u{C0000}-\\u{CFFFD}\\u{D0000}-\\u{DFFFD}\\u{E1000}-\\u{EFFFD}!\\$&'\\(\\)\\*\\+,;=:@]))*)*|(?!(?:%[0-9a-f][0-9a-f]|[-a-z0-9\\._~\\u{A0}-\\u{D7FF}\\u{F900}-\\u{FDCF}\\u{FDF0}-\\u{FFEF}\\u{10000}-\\u{1FFFD}\\u{20000}-\\u{2FFFD}\\u{30000}-\\u{3FFFD}\\u{40000}-\\u{4FFFD}\\u{50000}-\\u{5FFFD}\\u{60000}-\\u{6FFFD}\\u{70000}-\\u{7FFFD}\\u{80000}-\\u{8FFFD}\\u{90000}-\\u{9FFFD}\\u{A0000}-\\u{AFFFD}\\u{B0000}-\\u{BFFFD}\\u{C0000}-\\u{CFFFD}\\u{D0000}-\\u{DFFFD}\\u{E1000}-\\u{EFFFD}!\\$&'\\(\\)\\*\\+,;=:@])))(?:\\?(?:(?:%[0-9a-f][0-9a-f]|[-a-z0-9\\._~\\u{A0}-\\u{D7FF}\\u{F900}-\\u{FDCF}\\u{FDF0}-\\u{FFEF}\\u{10000}-\\u{1FFFD}\\u{20000}-\\u{2FFFD}\\u{30000}-\\u{3FFFD}\\u{40000}-\\u{4FFFD}\\u{50000}-\\u{5FFFD}\\u{60000}-\\u{6FFFD}\\u{70000}-\\u{7FFFD}\\u{80000}-\\u{8FFFD}\\u{90000}-\\u{9FFFD}\\u{A0000}-\\u{AFFFD}\\u{B0000}-\\u{BFFFD}\\u{C0000}-\\u{CFFFD}\\u{D0000}-\\u{DFFFD}\\u{E1000}-\\u{EFFFD}!\\$&'\\(\\)\\*\\+,;=:@])|[\\u{E000}-\\u{F8FF}\\u{F0000}-\\u{FFFFD}\\u{100000}-\\u{10FFFD}\\/\\?])*)?(?:#(?:(?:%[0-9a-f][0-9a-f]|[-a-z0-9\\._~\\u{A0}-\\u{D7FF}\\u{F900}-\\u{FDCF}\\u{FDF0}-\\u{FFEF}\\u{10000}-\\u{1FFFD}\\u{20000}-\\u{2FFFD}\\u{30000}-\\u{3FFFD}\\u{40000}-\\u{4FFFD}\\u{50000}-\\u{5FFFD}\\u{60000}-\\u{6FFFD}\\u{70000}-\\u{7FFFD}\\u{80000}-\\u{8FFFD}\\u{90000}-\\u{9FFFD}\\u{A0000}-\\u{AFFFD}\\u{B0000}-\\u{BFFFD}\\u{C0000}-\\u{CFFFD}\\u{D0000}-\\u{DFFFD}\\u{E1000}-\\u{EFFFD}!\\$&'\\(\\)\\*\\+,;=:@])|[\\/\\?])*)?$", "ui");
} catch (e) {
    // Fallback to simple validation, works in all browsers
    iriRegExp = new RegExp("^[a-z](?:[-a-z0-9\\+\\.])*:", "i");
}

UtilService.$inject = [];

function UtilService() {
    return {
        isValidIri: isValidIri
    };

    function isValidIri(iri) {
        return iri !== undefined && !!iri.match(iriRegExp);
    }
}
