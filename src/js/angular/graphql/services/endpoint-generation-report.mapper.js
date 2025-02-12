import {EndpointGenerationReport, EndpointGenerationReportList} from "../../models/graphql/endpoint-generation-report";

/**
 * Maps the response data to a list of endpoint generation reports.
 * @param {*[]} data The response data.
 * @returns {EndpointGenerationReportList}
 */
export const endpointGenerationReportListMapper = (data) => {
    if (!data) {
        return new EndpointGenerationReportList();
    }

    const reports = data.map((reportReponse) => endpointGenerationReportMapper(reportReponse));
    return new EndpointGenerationReportList(reports);
}

/**
 * Maps the response data to an endpoint generation report.
 * @param {*} reportReponse The response data.
 * @returns {EndpointGenerationReport} The endpoint generation report.
 */
export const endpointGenerationReportMapper = (reportReponse) => {
    return new EndpointGenerationReport({
        id: reportReponse.id,
        endpointId: reportReponse.endpointId,
        endpointURI: reportReponse.endpointURI,
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
