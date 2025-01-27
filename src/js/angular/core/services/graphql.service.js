import 'angular/rest/graphql.rest.service';
import {endpointListMapper, endpointsToSelectMenuOptionsMapper} from "../../graphql/services/endpoints.mapper";
import {endpointsInfoListMapper} from "../../graphql/services/endpoint-info-list.mapper";

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

    return {
        getEndpoints,
        getEndpointsAsSelectMenuOptions,
        getEndpointsInfo
    };
}
