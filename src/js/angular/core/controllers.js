import {find} from "lodash";

angular
    .module('graphdb.framework.core.controllers', [])
    .controller('CopyToClipboardModalCtrl', CopyToClipboardModalCtrl)
    .controller('SimpleModalCtrl', SimpleModalCtrl)
    .controller('ViewQueryCtrl', ViewQueryCtrl)
    .controller('ExportSettingsCtrl', ExportSettingsCtrl);

SimpleModalCtrl.$inject = ['$scope', '$uibModalInstance', 'title', 'message'];

function SimpleModalCtrl($scope, $uibModalInstance, title, message) {
    $scope.title = title;
    $scope.message = message;

    $scope.ok = function () {
        $uibModalInstance.close();
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
}

CopyToClipboardModalCtrl.$inject = ['$scope', '$uibModalInstance', 'uri', 'toastr', '$translate', '$timeout'];

function CopyToClipboardModalCtrl($scope, $uibModalInstance, uri, toastr, $translate, $timeout) {
    $uibModalInstance.opened.then(function () {
        $timeout(() => {
            $('#clipboardURI')[0].select();
        }, 0);
    });

    $scope.clipboardURI = uri;

    $scope.ok = function () {
        try {
            const copyText = document.getElementById('clipboardURI');
            copyText.select();
            document.execCommand('copy');
            toastr.success($translate.instant('modal.ctr.copy.url.success'));
        } catch (e) {
            toastr.error($translate.instant('modal.ctr.copy.not.supported.warning'));
        }
        $uibModalInstance.close();
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
}

ViewQueryCtrl.$inject = ['$scope', '$uibModalInstance', 'query', 'toastr', '$translate'];

function ViewQueryCtrl($scope, $uibModalInstance, query, toastr, $translate) {
    $scope.query = query;
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };

    $scope.selectQuery = function () {
        $scope.selectElement($('#create-query'));
    };

    $scope.copyQueryToClipboard = function () {
        try {
            $scope.selectQuery();
            document.execCommand('copy');
            $uibModalInstance.close();
            toastr.success($translate.instant('modal.ctr.copy.query.success'));
        } catch (e) {
            toastr.error($translate.instant('modal.ctr.copy.not.supported.warning'));
        }
    };

    // TODO: Rerewrite this in angular/whatever if desired
    $scope.selectElement = function (elements) {
        if (elements.length > 0) {
            if (window.getSelection) {
                const sel = window.getSelection();
                sel.removeAllRanges();
                const range = document.createRange();
                range.selectNodeContents(elements[0].firstChild);
                sel.addRange(range);
            } else if (document.selection) {
                const textRange = document.body.createTextRange();
                textRange.moveToElementText(elements[0]);
                textRange.select();
            }
        }
    };
}

ExportSettingsCtrl.$inject = ['$scope', '$uibModalInstance'];

export function ExportSettingsCtrl($scope, $uibModalInstance) {
    $scope.JSONLDModes = [
        {name: "framed", link: "http://www.w3.org/ns/json-ld#framed"},
        {name: "expanded", link: "http://www.w3.org/ns/json-ld#expanded"},
        {name: "flattened", link: "http://www.w3.org/ns/json-ld#flattened"},
        {name: "compacted", link: "http://www.w3.org/ns/json-ld#compacted"}
    ];

    $scope.JSONLDModesNames = $scope.JSONLDModes.reduce(function (acc, cur) {
        acc[cur.name] = cur.name;
        return acc;
    }, {});

    $scope.JSONLDFramedModes = [$scope.JSONLDModesNames.framed];
    $scope.JSONLDContextModes = [$scope.JSONLDModesNames.compacted, $scope.JSONLDModesNames.flattened];
    $scope.defaultMode = find($scope.JSONLDModes, {name: "expanded"});
    $scope.currentMode = $scope.defaultMode;

    if (localStorage.getItem("ls.jsonld-form")) {
        $scope.currentMode = find($scope.JSONLDModes, {name: JSON.parse(localStorage.getItem("ls.jsonld-form")).jsonldFormName});
        $scope.link = JSON.parse(localStorage.getItem("ls.jsonld-form")).jsonldLink;
    }

    $scope.setJSONLDSettingsToLocalStorage = function (formName, formLink, link) {
        localStorage.setItem("ls.jsonld-form", JSON.stringify({
            jsonldFormName: formName,
            jsonldFormLink: formLink,
            jsonldLink: link
        }));
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss();
    };

    $scope.reset = function () {
        $scope.currentMode = $scope.defaultMode;
        $scope.link = "";
        $scope.setJSONLDSettingsToLocalStorage($scope.currentMode.name, $scope.currentMode.link, $scope.link);
    };

    $scope.clearLinkInput = function () {
        $scope.link = "";
        $scope.setJSONLDSettingsToLocalStorage($scope.currentMode.name, $scope.currentMode.link, $scope.link);
    };

    $scope.exportJsonLD = function () {
        $scope.setJSONLDSettingsToLocalStorage($scope.currentMode.name, $scope.currentMode.link, $scope.link);
        $uibModalInstance.close({
            currentMode: $scope.currentMode,
            link: $scope.link
        });
    };
}
