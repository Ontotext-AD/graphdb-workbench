angular
    .module('graphdb.framework.clustermanagement.controllers.add-location', [])
    .controller('AddLocationFromClusterCtrl', AddLocationFromClusterCtrl);

AddLocationFromClusterCtrl.$inject = ['$scope', '$uibModalInstance', 'toastr', 'productInfo', '$translate'];

const getDocBase = function (productInfo) {
    return `https://graphdb.ontotext.com/documentation/${productInfo.productShortVersion}`;
};

function AddLocationFromClusterCtrl($scope, $uibModalInstance, toastr, productInfo, $translate) {
    //TODO: This, along with the view are duplicated from repositories page. Must be extracted for re-usability.
    $scope.newLocation = {
        'uri': '',
        'authType': 'signature',
        'username': '',
        'password': '',
        'active': false
    };
    $scope.docBase = getDocBase(productInfo);

    $scope.isValidLocation = function () {
        return ($scope.newLocation.uri.length < 6 ||
            $scope.newLocation.uri.indexOf('http:') === 0 || $scope.newLocation.uri.indexOf('https:') === 0)
            && $scope.newLocation.uri.indexOf('/repositories') <= -1;
    };

    $scope.ok = function () {
        if (!$scope.newLocation) {
            toastr.error($translate.instant('location.cannot.be.empty.error'));
            return;
        }
        $uibModalInstance.close($scope.newLocation);
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
}
