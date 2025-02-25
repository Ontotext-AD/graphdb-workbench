import {EndpointGenerationReport, EndpointGenerationReportList} from "../../models/graphql/endpoint-generation-report";
import {resolveGraphqlEndpoint} from "./endpoint-utils";

/**
 * Maps the response from the endpoint generation to a list of endpoint generation reports.
 * @param {*[]} data The response data.
 * @param {string} repositoryId The repository id.
 * @returns {EndpointGenerationReportList}
 */
export const endpointGenerationReportListMapper = (data, repositoryId) => {
    if (!data) {
        return new EndpointGenerationReportList();
    }

    const reports = data.map((reportReponse) => endpointGenerationReportMapper(reportReponse, repositoryId));
    return new EndpointGenerationReportList(reports);
}

/**
 * Maps the response data to an endpoint generation report.
 * @param {*} reportReponse The response data.
 * @param {string} repositoryId The repository id.
 * @returns {EndpointGenerationReport} The endpoint generation report.
 */
export const endpointGenerationReportMapper = (reportReponse, repositoryId) => {
    return new EndpointGenerationReport({
        endpointId: reportReponse.id,
        endpointURI: resolveGraphqlEndpoint(repositoryId, reportReponse.id),
        active: reportReponse.active,
        default: reportReponse.default,
        label: reportReponse.label,
        description: reportReponse.description,
        lastModified: reportReponse.lastModified,
        objectsCount: reportReponse.objectsCount,
        propertiesCount: reportReponse.propertiesCount,
        warnings: reportReponse.warnings,
        errors: reportReponse.errors,
        messages: reportReponse.messages
    });
}

/**
 * Maps the endpoint definition import response to an endpoint generation report.
 * @param {*} importResponse The import response.
 * @param {string} endpointId The endpoint id.
 * @param {string} repositoryId The repository id.
 * @returns {EndpointGenerationReport}
 */
export const importEndpointDefinitionReportMapper = (importResponse, endpointId, repositoryId) => {
    const errorsCount = importResponse.messages ? importResponse.messages.errors?.length : 0;
    const warningsCount = importResponse.messages ? importResponse.messages.warnings?.length : 0;
    return new EndpointGenerationReport({
        endpointId: importResponse.id,
        endpointURI: resolveGraphqlEndpoint(repositoryId, importResponse.id),
        warnings: warningsCount,
        errors: errorsCount,
        messages: importResponse.messages
    });
}
