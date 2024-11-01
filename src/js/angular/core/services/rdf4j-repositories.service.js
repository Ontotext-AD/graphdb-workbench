import 'angular/rest/rdf4j.repositories.rest.service';
import {namespaceListModelMapper} from "../../rest/mappers/namespaces-mapper";

angular
    .module('graphdb.framework.rdf4j.repositories.service', ['graphdb.framework.rest.rdf4j.repositories.service'])
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

    return {
        getNamespaces
    };
}
