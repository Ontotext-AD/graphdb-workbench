import {
    EndpointDefinitionFile, EndpointDefinitionFileList,
    ImportStatusLabelKeys
} from "../../models/graphql/endpoint-definition-file";
import {importEndpointDefinitionReportMapper} from "./endpoint-generation-report.mapper";

/**
 * Maps a list of files to a list of import definitions.
 * @param {File[]} files - The list of files to map.
 * @param {string} importStatus - The status of the import.
 * @returns {EndpointDefinitionFileList}
 */
export const fileToImportDefinitionsMapper = (files, importStatus) => {
    const definitionFiles = files.map(file => fileToImportDefinitionMapper(file, importStatus));
    return new EndpointDefinitionFileList(definitionFiles);
};

/**
 * Maps a file to an import definition.
 * @param {File} file - The file to map.
 * @param {string} importStatus - The status of the import.
 * @returns {EndpointDefinitionFile}
 */
export const fileToImportDefinitionMapper = (file, importStatus) => {
    return new EndpointDefinitionFile(file, importStatus, ImportStatusLabelKeys[importStatus]);
};

/**
 * Maps the server response to EndpointDefinitionFileList.
 * @param {*} data The server response data.
 * @param {string} repositoryId The repository ID.
 * @param {EndpointDefinitionFileList} definitionFiles The list of definition files.
 * @returns {EndpointDefinitionFileList}
 */
export const importEndpointDefinitionListMapper = (data, repositoryId, definitionFiles) => {
    if (!data || !data.length) {
        return new EndpointDefinitionFileList();
    }

    const processEntry = (response) => {
        const endpointId = response.id;
        const filename = response.filename;
        const status = response.status.toUpperCase();
        let definitionFile = definitionFiles.findDefinitionFileByName(filename) || new EndpointDefinitionFile();
        definitionFile.endpointId = endpointId;
        definitionFile.filename = filename;
        definitionFile.status = status;
        definitionFile.statusMessage = ImportStatusLabelKeys[status];
        definitionFile.report = importEndpointDefinitionReportMapper(response, endpointId, repositoryId);
        if (response.subFiles) {
            const subFileDefinitions = response.subFiles.map(processEntry);
            definitionFile.list = new EndpointDefinitionFileList(subFileDefinitions);
        }
        return definitionFile;
    }

    data.forEach(processEntry);

    return new EndpointDefinitionFileList([...definitionFiles.list]);
}
