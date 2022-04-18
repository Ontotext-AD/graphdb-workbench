angular
    .module('graphdb.framework.core.controllers', [])
    .controller('CopyToClipboardModalCtrl', CopyToClipboardModalCtrl)
    .controller('SimpleModalCtrl', SimpleModalCtrl)
    .controller('ViewQueryCtrl', ViewQueryCtrl);

SimpleModalCtrl.$inject = ['$scope', '$modalInstance', 'title', 'message'];

function SimpleModalCtrl($scope, $modalInstance, title, message) {
    $scope.title = title;
    $scope.message = message;

    $scope.ok = function () {
        $modalInstance.close();
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
}

CopyToClipboardModalCtrl.$inject = ['$scope', '$modalInstance', 'uri', 'toastr', '$translate'];

function CopyToClipboardModalCtrl($scope, $modalInstance, uri, toastr, $translate) {
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
        $modalInstance.close();
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
}

ViewQueryCtrl.$inject = ['$scope', '$modalInstance', 'query', 'toastr', '$translate'];

function ViewQueryCtrl($scope, $modalInstance, query, toastr, $translate) {
    $scope.query = query;
    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };

    $scope.selectQuery = function () {
        $scope.selectElement($('#create-query'));
    };

    $scope.copyQueryToClipboard = function () {
        try {
            $scope.selectQuery();
            document.execCommand('copy');
            $modalInstance.close();
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
