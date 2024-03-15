import {FILE_STATUS} from "../models/import/file-status";

angular
    .module('graphdb.framework.rest.upload.service', [])
    .factory('UploadRestService', UploadRestService);

UploadRestService.$inject = ['$http', 'Upload', '$translate'];

const BASE_ENDPOINT = 'rest/repositories';

function UploadRestService($http, Upload, $translate) {
    return {
        createUploadPayload,
        uploadUserDataFile,
        updateUserDataFile
    };

    /**
     * Creates the payload for the file upload.
     * @param {object} file The file to be uploaded
     * @param {object} settings The import settings
     * @return {{file, importSettings: *}}
     */
    function createUploadPayload(file, settings) {
        let data;
        if (file.file) {
            data = {file: file.file, importSettings: Upload.jsonBlob(settings)};
        } else {
            data = {importSettings: Upload.jsonBlob(settings)};
        }
        return data;
    }

    /**
     * Uploads the user data file.
     * @param {string} repositoryId The repository id
     * @param {object} file The file to be uploaded
     * @param {object} data The import settings
     * @return {*}
     */
    function uploadUserDataFile(repositoryId, file, data) {
        return Upload.upload({
            url: `${BASE_ENDPOINT}/${repositoryId}/import/upload/file`,
            data: data
        }).progress((evt) => reportProgress(evt, file));
    }

    /**
     * Updates the user data file.
     * @param {string} repositoryId The repository id
     * @param {object} file The file to be updated
     * @param {object} data The import settings
     * @return {*}
     */
    function updateUserDataFile(repositoryId, file, data) {
        return Upload.upload({
            url: `${BASE_ENDPOINT}/${repositoryId}/import/upload/update/file`,
            data: data
        }).progress((evt) => reportProgress(evt, file));
    }

    function reportProgress(evt, file) {
        if (file.file) {
            file.file = null;
            file.status = FILE_STATUS.UPLOADING;
        } else if (file.status !== FILE_STATUS.UPLOADING) {
            file.status = FILE_STATUS.PENDING;
        }

        if (file.status === FILE_STATUS.UPLOADING) {
            const progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
            file.message = $translate.instant('import.file.upload.progress', {progress: progressPercentage});
        }
    }
}
