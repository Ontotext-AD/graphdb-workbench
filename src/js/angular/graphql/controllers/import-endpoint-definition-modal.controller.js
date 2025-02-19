import '../../core/services/graphql.service';

const modules = [
    'ngFileUpload',
    'graphdb.framework.core.services.graphql-service'
];

angular
    .module('graphdb.framework.graphql.controllers.import-endpoint-definition-modal', modules)
    .controller('ImportEndpointDefinitionModalController', ImportEndpointDefinitionModalController);

ImportEndpointDefinitionModalController.$inject = ['$scope', '$q', '$uibModalInstance', 'data', 'GraphqlService'];

function ImportEndpointDefinitionModalController($scope, $q, $uibModalInstance, data, GraphqlService) {
    // =========================
    // Private variables
    // =========================

    /**
     * The canceler object used to cancel the upload request. We use this because the Upload.http uses the $http service
     * which doesn't have the abort method and the abort should be done manually.
     */
    let canceler;

    // =========================
    // Public variables
    // =========================

    /**
     * Current active repository ID.
     */
    $scope.repositoryId = data.repositoryId;

    /**
     * The list of files selected for import.
     * @type {*[]}
     */
    $scope.files = [];

    /**
     * The progress of the upload.
     * @type {number|undefined}
     */
    $scope.progress = undefined;

    /**
     * The list of errors that occurred during the import.
     * @type {*[]|undefined}
     */
    $scope.errors = undefined;

    /**
     * Flag indicating whether the upload has finished.
     * @type {boolean}
     */
    $scope.uploadFinished = false;

    /**
     * Flag indicating whether the upload has been aborted.
     * @type {boolean}
     */
    $scope.aborted = false;

    // =========================
    // Public functions
    // =========================

    /**
     * Triggered when files are selected in the file input.
     * @param {Array} files The selected files.
     */
    $scope.onSelectFiles = (files) => {
        $scope.files = files;
    };

    /**
     * Triggered when the user clicks the upload button.
     */
    $scope.onImport = () => {
        const payload = buildUploadPayloadObject();
        canceler = $q.defer();
        $scope.uploadFinished = false;
        GraphqlService.importEndpointDefinition($scope.repositoryId, payload, canceler)
            .progress((evt) => {
                $scope.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
            })
            .success(() => {
                $scope.progress = undefined;
                $scope.uploadFinished = true;
            })
            .error((errors) => {
                if (errors && errors.length > 0) {
                    $scope.errors = errors;
                    $scope.uploadFinished = true;
                }
            });
    }

    /**
     * Triggered when the user clicks the abort upload button.
     */
    $scope.onAbortUpload = () => {
        if (canceler) {
            canceler.resolve();
            $scope.aborted = true;
            $scope.progress = undefined;
            $scope.uploadFinished = true;
        }
    };

    /**
     * Triggered when the user clicks the remove file button.
     * @param file {File} The file to be removed.
     */
    $scope.onRemoveFile = (file) => {
        $scope.files.splice($scope.files.indexOf(file), 1);
        if ($scope.files.length === 0) {
            $scope.progress = undefined;
            $scope.errors = undefined;
        }
    };

    /**
     * Closes the modal.
     */
    $scope.close = () => {
        $uibModalInstance.dismiss('cancel')
    };

    // =========================
    // Private functions
    // =========================

    /**
     * Builds the payload object for the import request. If there is only one file selected, the file is returned.
     * If there are multiple files selected, a FormData object is created and the files are appended to it.
     * @returns {File|FormData} The payload object.
     */
    const buildUploadPayloadObject = () => {
        let payload;
        if ($scope.files.length === 1) {
            payload = $scope.files[0];
        } else {
            payload = new FormData();
            $scope.files.forEach((file) => {
                payload.append('importFiles', file, file.name);
            });
        }
        return payload;
    }

    const init = () => {
    }

    // =========================
    // Initialization
    // =========================

    init();
}
