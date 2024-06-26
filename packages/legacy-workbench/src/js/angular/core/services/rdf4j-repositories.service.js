import 'angular/rest/rdf4j.repositories.rest.service';
import {namespaceListModelMapper} from "../../rest/mappers/namespaces-mapper";
import {graphListOptionsMapper} from "../../rest/mappers/graph-list-mapper";

angular
    .module('graphdb.framework.core.services.rdf4j.repositories', ['graphdb.framework.rest.rdf4j.repositories.service'])
    .factory('RDF4JRepositoriesService', RDF4JRepositoriesService);

RDF4JRepositoriesService.$inject = ['RDF4JRepositoriesRestService'];

function RDF4JRepositoriesService(RDF4JRepositoriesRestService) {

    /**
     * Fetches the namespaces of a repository.
     *
     * @param {string} repositoryId - The ID of the repository whose namespaces are to be fetched.
     * @return {NamespacesListModel} The list of namespaces associated with the specified repository.
     */
    const getNamespaces = (repositoryId) => {
        return RDF4JRepositoriesRestService.getRepositoryNamespaces(repositoryId)
            .then((response) => namespaceListModelMapper(response.data.results.bindings));
    };

    /**
     * Fetches the graphs of a repository.
     * @param {string} repositoryId - The ID of the repository whose graphs are to be fetched.
     * @returns {GraphListOptions} The list of graphs associated with the specified repository.
     */
    const getGraphs = (repositoryId) => {
        return RDF4JRepositoriesRestService.getGraphs(repositoryId)
            .then((response) => graphListOptionsMapper(response.data));
    }

    /**
     * Fetches the graphs of a repository as a file.
     *
     * @param {string} repositoryId - The ID of the repository from which graphs should be downloaded.
     * @param {number} [limit] - The maximum number of graphs to include in the response. If not provided, all graphs will be included.
     * @return {Promise<{data: Blob, filename: string}>} A promise resolving to an object containing the file data (Blob) and its filename.
     */
    const downloadGraphsAsFile = (repositoryId, limit) => {
        return RDF4JRepositoriesRestService.downloadGraphsAsFile(repositoryId, limit);
    }

    return {
        getNamespaces,
        getGraphs,
        downloadGraphsAsFile
    };
}
