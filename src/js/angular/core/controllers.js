angular
    .module('graphdb.framework.core.controllers', [])
    .controller('CopyToClipboardModalCtrl', CopyToClipboardModalCtrl)
    .controller('SimpleModalCtrl', SimpleModalCtrl)
    .controller('ViewQueryCtrl', ViewQueryCtrl);

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

CopyToClipboardModalCtrl.$inject = ['$scope', '$uibModalInstance', 'uri', 'toastr'];

function CopyToClipboardModalCtrl($scope, $uibModalInstance, uri, toastr) {
    $scope.clipboardURI = uri;

    $scope.ok = function () {
        try {
            const copyText = document.getElementById('clipboardURI');
            copyText.select();
            document.execCommand('copy');
            toastr.success('URL copied successfully to clipboard.');
        } catch (e) {
            toastr.error('Your browser doesn\'t support "copy" operation.\nPress Ctrl-C / Cmd-C to copy URL manually.');
        }
        $uibModalInstance.close();
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
}

ViewQueryCtrl.$inject = ['$scope', '$uibModalInstance', 'query', 'toastr'];

function ViewQueryCtrl($scope, $uibModalInstance, query, toastr) {
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
            toastr.success('Query copied successfully to clipboard.');
        } catch (e) {
            toastr.error('Your browser doesn\'t support "copy" operation.\nPress Ctrl-C / Cmd-C to copy query to clipboard manually.');
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
