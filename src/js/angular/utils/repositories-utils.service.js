const modules = [];

angular
    .module('graphdb.framework.repositories', modules)
    .factory('RepositoriesUtilService', RepositoriesUtilsService);

RepositoriesUtilsService.$inject = ['RDF4JRepositoriesRestService'];

function RepositoriesUtilsService(RDF4JRepositoriesRestService) {

    const getPrefixes = () => {
        return RDF4JRepositoriesRestService.getRepositoryNamespaces()
            .then((response) => {
                const usedPrefixes = {};
                response.data.results.bindings.forEach(function (e) {
                    usedPrefixes[e.prefix.value] = e.namespace.value;
                });
                return usedPrefixes;
            });
    };

    return {
        getPrefixes
    };
}
