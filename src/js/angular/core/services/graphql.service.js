import 'angular/rest/graphql.rest.service';
import {endpointListMapper, endpointsToSelectMenuOptionsMapper} from "../../graphql/services/endpoints.mapper";
import {endpointInfoModelMapper, endpointsInfoListMapper} from "../../graphql/services/endpoint-info-list.mapper";
import {graphqlSchemaShapesMapper} from "../../graphql/services/graphql-schema-shapes.mapper";
import {prefixModelToSelectMenuOptionsMapper} from "../../graphql/services/prefix-list.mapper";
import {
    shaclShapeGraphListOptionsMapper
} from "../../graphql/services/shacl-shape-list.mapper";
import {GraphqlEndpointConfiguration} from "../../models/graphql/graphql-endpoint-configuration";
import {dynamicFormModelMapper} from "../../rest/mappers/dynamic-form-fied-mapper";
import {GraphqlEndpointConfigurationSettings} from "../../models/graphql/graphql-endpoint-configuration-setting";
import {GraphqlEndpointOverviewList} from "../../models/graphql/graphql-endpoint-overview-list";
import {
    endpointGenerationReportListMapper
} from "../../graphql/services/endpoint-generation-report.mapper";

const modules = ['graphdb.framework.rest.graphql.service'];

angular
    .module('graphdb.framework.core.services.graphql-service', modules)
    .factory('GraphqlService', GraphqlService);

GraphqlService.$inject = ['GraphqlRestService'];

function GraphqlService(GraphqlRestService) {

    /**
     * Creates a list of GraphQL endpoint overview models from the given data.
     * @param {GraphqlEndpointConfiguration} endpointConfiguration
     * @returns {GraphqlEndpointOverviewList}
     */
    const getGenerateEndpointsOverview = (endpointConfiguration) => {
        if (!endpointConfiguration) {
            return new GraphqlEndpointOverviewList();
        }
        const shapesOverview = endpointConfiguration.getSelectedGraphqlSchemaShapesOverview();
        return new GraphqlEndpointOverviewList(shapesOverview);
    };

    /**
     *
     * @param {GraphqlEndpointConfiguration} endpointConfiguration
     */
    const getEndpointsCountToGenerate = (endpointConfiguration) => {
        let count = 0;
        if (!endpointConfiguration) {
            count = 0;
        }
        if (endpointConfiguration.generateFromGraphqlSchemaShapes()) {
            count = endpointConfiguration.getSelectedGraphqlSchemaShapesCount();
        }
        // A single endpoint is generated always when generating from ontologies or
        // shacl shapes.
        if (endpointConfiguration.generateFromShaclShapes()) {
            count = 1;
        }
        return count;
    };

    /**
     * Get the GraphQL endpoints model for the given repository.
     * @param {string} repositoryId - The repository id.
     * @return {Promise<GraphqlEndpointList>}
     */
    const getEndpoints = (repositoryId) => {
        return GraphqlRestService.getEndpoints(repositoryId)
            .then((response) => endpointListMapper(response.data));
    };

    /**
     * Get the GraphQL endpoints as select menu options for the given repository.
     * @param {string} repositoryId - The repository id.
     * @return {Promise<SelectMenuOptionsModel[]>}
     */
    const getEndpointsAsSelectMenuOptions = (repositoryId) => {
        return GraphqlRestService.getEndpoints(repositoryId)
            .then((response) => {
                return endpointsToSelectMenuOptionsMapper(response.data, repositoryId)
            });
    };

    /**
     * Get the GraphQL endpoints info for the given repository.
     * @param {string} repositoryId - The repository id.
     * @return {Promise<GraphqlEndpointsInfoList>}
     */
    const getEndpointsInfo = (repositoryId) => {
        return GraphqlRestService.getEndpointsInfo(repositoryId)
            .then((response) => endpointsInfoListMapper(response.data, repositoryId));
    };

    /**
     * Get the GraphQL schema shapes for the given repository.
     * @param {string} repositoryId - The repository id.
     * @returns {Promise<GraphqlSchemaShapes>}
     */
    const getGraphqlSchemaShapes = (repositoryId) => {
        return GraphqlRestService.getGraphqlSchemaShapes(repositoryId)
            .then((response) => graphqlSchemaShapesMapper(response.data));
    }

    /**
     * Get the prefix list as select options for the given repository.
     * @param {string} repositoryId - The repository id.
     * @returns {Promise<SelectMenuOptionsModel[]>}
     */
    const getPrefixListAsSelectOptions = (repositoryId) => {
        return GraphqlRestService.getPrefixes(repositoryId)
            .then((response) => prefixModelToSelectMenuOptionsMapper(response.data));
    }

    /**
     * Get the SHACL shape graphs for the given repository as list model.
     * @param {string} repositoryId The repository id.
     * @returns {Promise<GraphListOptions>} The SHACL shape graphs list model.
     */
    const getShaclShapeGraphs = (repositoryId) => {
        return GraphqlRestService.getShaclShapeGraphs(repositoryId)
            .then((response) => shaclShapeGraphListOptionsMapper(response.data));
    }

    /**
     * Get the GraphQL generation settings. These settings are used to configure the GraphQL endpoint generation.
     * @returns {Promise<GraphqlEndpointConfigurationSettings>}
     */
    const getGraphqlGenerationSettings = () => {
        return GraphqlRestService.getGraphqlGenerationSettings()
            .then((response) => {
                const fieldsModel = dynamicFormModelMapper(response.data);
                return new GraphqlEndpointConfigurationSettings(fieldsModel);
            });
    };

    /**
     * Get the GraphQL endpoint configuration settings.
     * @param {string} repositoryId - The repository id.
     * @param {string} endpointId - The endpoint id.
     * @returns {Promise<DynamicFormField[]>}
     */
    const getGraphqlEndpointConfigurationSettings = (repositoryId, endpointId) => {
        return GraphqlRestService.getGraphqlEndpointConfigurationSettings(repositoryId, endpointId)
            .then((response) => {
                const fieldsModel = dynamicFormModelMapper(response.data);
                return new GraphqlEndpointConfigurationSettings(fieldsModel);
            });
    };

    /**
     * Gets the GraphQL endpoint configuration.
     * @param {string} repositoryId The repository ID.
     * @param {string} endpointId The endpoint ID.
     * @returns {Promise<unknown>}
     */
    const getEndpointConfiguration = (repositoryId, endpointId) => {
        return GraphqlRestService.getEndpointConfiguration(repositoryId, endpointId);
    };

    /**
     * Gets the GraphQL endpoint configuration report.
     * @param {string} repositoryId The repository ID.
     * @param {string} endpointId The endpoint ID.
     * @returns {Promise<EndpointGenerationReportList>}
     */
    const getEndpointConfigurationReport = (repositoryId, endpointId) => {
        return GraphqlRestService.getEndpointConfiguration(repositoryId, endpointId)
            .then((response) => endpointGenerationReportListMapper([response.data], repositoryId));
    };

    /**
     * Save the GraphQL endpoint configuration. All of UpdateEndpointRequest properties are optional, so this method
     * can be used to update any of them. The request object should contain only the properties that need to be updated.
     * @param {string} repositoryId - The repository id.
     * @param {string} endpointId - The endpoint id.
     * @param {PartialUpdateEndpointRequest} updateEndpointRequest - The endpoint update request.
     * @returns {Promise<GraphqlEndpointInfo> | *}
     */
    const editEndpointConfiguration = (repositoryId, endpointId, updateEndpointRequest) => {
        return GraphqlRestService.editEndpointConfiguration(repositoryId, endpointId, updateEndpointRequest)
            .then((response) => endpointInfoModelMapper(response.data, repositoryId));
    };

    /**
     * Delete the GraphQL endpoint.
     * @param {string} repositoryId The repository ID.
     * @param {string} endpointId The endpoint ID.
     * @returns {Promise<unknown>}
     */
    const deleteEndpoint = (repositoryId, endpointId) => {
        return GraphqlRestService.deleteEndpoint(repositoryId, endpointId);
    };

    /**
     * Generate the GraphQL endpoint from the GraphQL shapes.
     * @param {string} repositoryId The current active repository ID.
     * @param {CreateEndpointFromShapesRequest} request The endpoint create request.
     * @returns {Promise<EndpointGenerationReport>}
     */
    const generateEndpointFromGraphqlShapes = (repositoryId, request) => {
        return GraphqlRestService.generateEndpointFromGraphqlShapes(repositoryId, request.toJSON())
            .then((response) => endpointGenerationReportListMapper(response.data, repositoryId));
    }

    /**
     * Generate the GraphQL endpoint from the OWL ontology.
     * @param {string} repositoryId The current active repository ID.
     * @param {CreateEndpointFromOwlRequest} request The endpoint create request.
     * @returns {Promise<EndpointGenerationReport>}
     */
    const generateEndpointFromOwl = (repositoryId, request) => {
        return GraphqlRestService.generateEndpointFromOwl(repositoryId, request.toJSON())
            .then((response) => endpointGenerationReportListMapper([response.data], repositoryId));
    }

    /**
     * Export the endpoint definition.
     * @param {string} repositoryId The repository ID.
     * @param {string} endpointId The endpoint ID.
     * @returns {Promise<{data: any, filename: string}>}
     */
    const exportEndpointDefinition = (repositoryId, endpointId) => {
        return GraphqlRestService.exportEndpointDefinition(repositoryId, endpointId)
            .then((res) => {
                const data = res.data;
                const headers = res.headers();
                const contentDispositionHeader = headers['content-disposition'];
                let filename = `endpoint-${endpointId}-definition`;
                if (contentDispositionHeader) {
                    filename = contentDispositionHeader.split('filename=')[1];
                    filename = filename.replace(/"/g, '');
                }
                return {data, filename};
            });
    }

    /**
     * Import endpoint definitions given as payload.
     * @param {string} repositoryId The repository ID.
     * @param {File|FormData} payload The request payload.
     * @returns {Promise<*>|*}
     */
    const importEndpointDefinition = (repositoryId, payload) => {
        return GraphqlRestService.importEndpointDefinition(repositoryId, payload);
    };

    return {
        getEndpointsCountToGenerate,
        getGenerateEndpointsOverview,
        getEndpoints,
        getEndpointsAsSelectMenuOptions,
        getEndpointsInfo,
        getGraphqlSchemaShapes,
        getPrefixListAsSelectOptions,
        getShaclShapeGraphs,
        getGraphqlGenerationSettings,
        getGraphqlEndpointConfigurationSettings,
        getEndpointConfiguration,
        getEndpointConfigurationReport,
        editEndpointConfiguration,
        deleteEndpoint,
        generateEndpointFromGraphqlShapes,
        generateEndpointFromOwl,
        exportEndpointDefinition,
        importEndpointDefinition
    };
}
