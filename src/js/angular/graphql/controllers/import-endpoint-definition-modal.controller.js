import '../../core/services/graphql.service';
import {
    EndpointDefinitionFile,
    EndpointDefinitionFileList,
    ImportStatus
} from "../../models/graphql/endpoint-definition-file";
import {
    fileToImportDefinitionsMapper, importEndpointDefinitionListMapper
} from "../services/file-to-import-definition.mapper";
import {resolvePlaygroundUrlWithEndpoint} from "../services/endpoint-utils";
import {GraphqlEndpointInfo} from "../../models/graphql/graphql-endpoints-info";

const modules = [
    'ngFileUpload',
    'graphdb.framework.core.services.graphql-service'
];

angular
    .module('graphdb.framework.graphql.controllers.import-endpoint-definition-modal', modules)
    .controller('ImportEndpointDefinitionModalController', ImportEndpointDefinitionModalController);

ImportEndpointDefinitionModalController.$inject = ['$scope', '$q', 'toastr', '$uibModal', '$uibModalInstance', 'data', 'GraphqlService', 'GraphqlContextService'];

function ImportEndpointDefinitionModalController($scope, $q, toastr, $uibModal, $uibModalInstance, data, GraphqlService, GraphqlContextService) {
    // =========================
    // Private variables
    // =========================

    const allowedFileTypes = ['.zip', '.yaml', '.yml'];

    // =========================
    // Public variables
    // =========================

    $scope.allowedFileTypesString = allowedFileTypes.join(',');

    /**
     * The import status enum.
     * @type {{PENDING: string, SUCCESS: string, FAIL: string, SKIP: string}}
     */
    $scope.ImportStatus = ImportStatus;

    /**
     * Current active repository ID.
     */
    $scope.repositoryId = data.repositoryId;

    /**
     * The list of files selected for import.
     * @type {EndpointDefinitionFileList}
     */
    $scope.definitionFiles = new EndpointDefinitionFileList();

    /**
     * The progress of the upload.
     * @type {number|undefined}
     */
    $scope.progress = undefined;

    /**
     * Flag indicating whether the upload has finished.
     * @type {boolean}
     */
    $scope.uploadFinished = false;

    // =========================
    // Public functions
    // =========================

    /**
     * Event handler triggered when files are selected in the file input.
     * @param {Array} $files The selected files.
     * @param {File} $file The selected file.
     * @param {Array} $newFiles The new files selected.
     * @param {Array} $duplicateFiles The duplicate files selected.
     * @param {Array} $invalidFiles The invalid files selected.
     */
    $scope.onFilesChange = ($files, $file, $newFiles, $duplicateFiles, $invalidFiles) => {
        let selectedFiles = $newFiles;

        // find out files with invalid extensions in the list
        const invalidFiles = selectedFiles.filter(file => {
            const extension = '.' + file.name.split('.').pop().toLowerCase();
            return !allowedFileTypes.includes(extension);
        });
        if (invalidFiles.length) {
            console.error(`The following files have invalid extensions: ${invalidFiles.map(file => file.name).join(', ')}`);
        }
        // filter out invalid files
        selectedFiles = selectedFiles.filter(file => {
            const extension = '.' + file.name.split('.').pop().toLowerCase();
            return allowedFileTypes.includes(extension);
        });
        // if no valid files are left, return
        if (!selectedFiles || !selectedFiles.length) {
            return;
        }
        // Reset the list of files if the upload has finished and the user is adding new files
        if ($scope.uploadFinished) {
            $scope.definitionFiles = new EndpointDefinitionFileList();
            $scope.uploadFinished = false;
        }
        // Reset error state when adding new files
        $scope.progress = undefined;
        // Filter out duplicates by comparing file names
        const existingFileNames = new Set($scope.definitionFiles.getFileNames());
        const filesToAdd = selectedFiles.filter(file => !existingFileNames.has(file.name));
        $scope.definitionFiles.appendFiles(fileToImportDefinitionsMapper(filesToAdd, ImportStatus.PENDING).list)
    };

    /**
     * Event handler triggered when the user clicks the upload button. The selected files are uploaded to the server
     * which then processes them and if definitions are valid, graphql endpoints are created for each definition.
     * The server response contains reports for each definition file.
     */
    $scope.onImport = () => {
        const payload = buildUploadPayloadObject();
        $scope.uploadFinished = false;
        GraphqlService.importEndpointDefinition($scope.repositoryId, payload)
            .progress((evt) => {
                $scope.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
            })
            .success((response) => {
                $scope.progress = undefined;
                $scope.uploadFinished = true;
                $scope.definitionFiles = importEndpointDefinitionListMapper(response, $scope.repositoryId, $scope.definitionFiles);
            })
            .error((errors) => {
                $scope.progress = undefined;
                $scope.uploadFinished = true;
                toastr.error(getError(errors));
            });
    };

    /**
     * Triggered when the user clicks the remove file button. The file is removed from the list of selected files.
     * @param {EndpointDefinitionFile} definitionFile The file to be removed.
     */
    $scope.onRemoveFile = (definitionFile) => {
        $scope.definitionFiles.removeFile(definitionFile);
        if ($scope.definitionFiles.size === 0) {
            $scope.progress = undefined;
        }
    };

    /**
     * Event handler triggered when the user clicks on the generated endpoint link. Opens the GraphQL Playground with
     * the selected endpoint.
     * @param {string} endpointId The ID of the endpoint to explore.
     */
    $scope.onExploreEndpoint = (endpointId) => {
        const url = resolvePlaygroundUrlWithEndpoint(endpointId);
        GraphqlContextService.setSelectedEndpoint(new GraphqlEndpointInfo({
            endpointId
        }));
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    /**
     * Event handler triggered when the user clicks the view report link. Opens the report modal with the given
     * definition file.
     * @param {EndpointGenerationReport} endpointGenerationReport The report to display.
     * @returns {Promise} The promise that resolves when the modal is closed.
     */
    $scope.onOpenReport = (endpointGenerationReport) => {
        return $uibModal.open({
            templateUrl: 'js/angular/graphql/templates/modal/endpoint-generation-failure-result-modal.html',
            controller: 'EndpointGenerationResultFailureModalController',
            windowClass: 'endpoint-generation-failure-result-modal',
            size: 'lg',
            backdrop: 'static',
            keyboard: false,
            resolve: {
                data: () => {
                    return {
                        endpointReport: endpointGenerationReport
                    };
                }
            }
        }).result;
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
     * Builds the payload object for the import request. FormData object is created and the files are appended to it.
     * @returns {FormData} The payload object.
     */
    const buildUploadPayloadObject = () => {
        let payload = new FormData();
        $scope.definitionFiles.processWith((definition) => {
            payload.append('importFiles', definition.file, definition.file.name);
        });
        return payload;
    }

    const init = () => {
    }

    // =========================
    // Initialization
    // =========================

    init();
}
