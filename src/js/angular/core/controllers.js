angular
    .module('graphdb.framework.core.controllers', [])
    .controller('CopyToClipboardModalCtrl', CopyToClipboardModalCtrl)
    .controller('SimpleModalCtrl', SimpleModalCtrl)
    .controller('ViewQueryCtrl', ViewQueryCtrl);

SimpleModalCtrl.$inject = ['$scope', '$uibModalInstance', '$sce', 'config'];

function SimpleModalCtrl($scope, $uibModalInstance, $sce, config) {
    $scope.confirmButtonKey = config.confirmButtonKey;
    $scope.title = config.title;
    $scope.message = $sce.trustAsHtml(config.message);
    $scope.onClick = ($event) => {
        if (config.stopPropagation) {
            $event.stopPropagation();
        }
    };

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
