import 'angular/rest/graphql.rest.service';
import {endpointListMapper, endpointsToSelectMenuOptionsMapper} from "../../graphql/services/endpoints.mapper";
import {endpointsInfoListMapper} from "../../graphql/services/endpoint-info-list.mapper";
import {graphqlSchemaShapesMapper} from "../../graphql/services/graphql-schema-shapes.mapper";
import {prefixModelToSelectMenuOptionsMapper} from "../../graphql/services/prefix-list.mapper";
import {
    shaclShapeGraphListOptionsMapper
} from "../../graphql/services/shacl-shape-list.mapper";

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
            .then((response) => endpointsToSelectMenuOptionsMapper(response.data));
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

    return {
        getEndpoints,
        getEndpointsAsSelectMenuOptions,
        getEndpointsInfo,
        getGraphqlSchemaShapes,
        getPrefixListAsSelectOptions,
        getShaclShapeGraphs
    };
}
