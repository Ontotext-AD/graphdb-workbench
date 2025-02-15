import 'angular/rest/graphql.rest.service';
import {endpointListMapper, endpointsToSelectMenuOptionsMapper} from "../../graphql/services/endpoints.mapper";
import {endpointsInfoListMapper} from "../../graphql/services/endpoint-info-list.mapper";
import {graphqlSchemaShapesMapper} from "../../graphql/services/graphql-schema-shapes.mapper";
import {prefixModelToSelectMenuOptionsMapper} from "../../graphql/services/prefix-list.mapper";
import {
    shaclShapeGraphListOptionsMapper
} from "../../graphql/services/shacl-shape-list.mapper";
import {GraphqlEndpointConfiguration} from "../../models/graphql/graphql-endpoint-configuration";
import {dynamicFormModelMapper} from "../../rest/mappers/dynamic-form-fied-mapper";
import {GraphqlEndpointConfigurationSettings} from "../../models/graphql/graphql-endpoint-configuration-setting";

const modules = ['graphdb.framework.rest.graphql.service'];

angular
    .module('graphdb.framework.core.services.graphql-service', modules)
    .factory('GraphqlService', GraphqlService);

GraphqlService.$inject = ['GraphqlRestService'];

function GraphqlService(GraphqlRestService) {

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
                return endpointsToSelectMenuOptionsMapper(response.data)
            });
    };

    /**
     * Get the GraphQL endpoints info for the given repository.
     * @param {string} repositoryId - The repository id.
     * @return {Promise<GraphqlEndpointsInfoList>}
     */
    const getEndpointsInfo = (repositoryId) => {
        return GraphqlRestService.getEndpointsInfo(repositoryId)
            .then((response) => endpointsInfoListMapper(response.data));
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
     * Save the GraphQL endpoint configuration settings.
     * @param {string} repositoryId - The repository id.
     * @param {string} endpointId - The endpoint id.
     * @param endpointSettings - The endpoint settings.
     * @returns {Promise<unknown> | *}
     */
    const saveEndpointConfigurationSettings = (repositoryId, endpointId, endpointSettings) => {
        return GraphqlRestService.saveEndpointConfigurationSettings(repositoryId, endpointId, endpointSettings);
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

    return {
        getEndpoints,
        getEndpointsAsSelectMenuOptions,
        getEndpointsInfo,
        getGraphqlSchemaShapes,
        getPrefixListAsSelectOptions,
        getShaclShapeGraphs,
        getGraphqlGenerationSettings,
        getGraphqlEndpointConfigurationSettings,
        saveEndpointConfigurationSettings,
        deleteEndpoint
    };
}
