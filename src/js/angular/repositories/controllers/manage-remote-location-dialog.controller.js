import {RemoteLocationAuthType, RemoteLocationModel, RemoteLocationType} from "../../models/repository/remote-location.model";
import 'angular/core/directives/validate-url.directive';

const modules = [
    'graphdb.framework.core.directives.validate-url'
];

angular.module('graphdb.framework.repositories.controllers.manage-remote-location-dialog', modules)
    .controller('ManageRemoteLocationDialogController', ManageRemoteLocationDialogController);

ManageRemoteLocationDialogController.$inject = ['$scope', '$uibModalInstance', 'productInfo', 'data'];

/**
 * Controller for managing the remote location dialog, which handles both creation and editing of remote locations.
 *
 * @param {Object} $scope
 * @param {Object} $uibModalInstance
 * @param {Object} productInfo
 * @param {Object} data - Data passed to the dialog:
 *                        - If `data.remoteLocation` is provided, the dialog is in edit mode
 *                          and the remote location object is initialized with the provided data.
 *                        - If `data.remoteLocation` is not provided, the dialog is in create mode
 *                          and a new `RemoteLocationModel` instance is initialized.
 *
 * @constructor
 */
function ManageRemoteLocationDialogController($scope, $uibModalInstance, productInfo, data) {

    $scope.RemoteLocationType = RemoteLocationType;
    $scope.RemoteLocationAuthType = RemoteLocationAuthType;
    $scope.isEdit = !!data.remoteLocation;

    /**
     * @type {RemoteLocationModel}
     */
    $scope.remoteLocation = data.remoteLocation ? new RemoteLocationModel({...data.remoteLocation}) : new RemoteLocationModel();
    $scope.docBase = `https://graphdb.ontotext.com/documentation/${productInfo.productShortVersion}`;

    $scope.ok = () => {
        if ($scope.remoteLocationForm.$pristine || $scope.remoteLocationForm.$invalid) {
            return;
        }
        $uibModalInstance.close($scope.remoteLocation);
    };

    $scope.cancel = () => {
        $uibModalInstance.dismiss('cancel');
    };

    $scope.onLocationTypeChanged = () => {
        if ([RemoteLocationType.ONTOPIC, RemoteLocationType.SPARQL].includes($scope.remoteLocation.locationType)) {
            $scope.remoteLocation.authType = RemoteLocationAuthType.BASIC;
        } else {
            $scope.remoteLocation.authType = RemoteLocationAuthType.NONE;
        }
    }
}
