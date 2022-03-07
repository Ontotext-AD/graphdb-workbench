angular
    .module('graphdb.framework.rest.rdf4j.repositories.service', [])
    .factory('RDF4JRepositoriesRestService', RDF4JRepositoriesRestService);

RDF4JRepositoriesRestService.$inject = ['$http', '$repositories'];

const ACTIVATE_PLUGIN_QUERY = 'INSERT DATA { <u:a> <http://www.ontotext.com/owlim/system#startplugin> \'{{pluginName}}\' .}';
const CHECK_PLUGIN_ACTIVE_QUERY = 'select ?o where {\n' +
    '?s <http://www.ontotext.com/owlim/system#listplugins> ?o .\n' +
    'filter(str(?s) = \'{{pluginName}}\')\n' +
    '} ';

const REPOSITORIES_ENDPOINT = 'repositories';

function RDF4JRepositoriesRestService($http, $repositories) {
    return {
        getNamespaces,
        getRepositoryNamespaces,
        updateNamespacePrefix,
        deleteNamespacePrefix,
        addStatements,
        activatePlugin,
        checkPluginIsActive,
        getRepositorySize,
        getGraphs,
        resolveGraphs
    };

    function getNamespaces(repositoryId) {
        return $http.get(`${REPOSITORIES_ENDPOINT}/${repositoryId}/namespaces`);
    }

    function getRepositoryNamespaces() {
        return $http.get(`${REPOSITORIES_ENDPOINT}/${$repositories.getActiveRepository()}/namespaces`);
    }

    function updateNamespacePrefix(repositoryId, namespace, prefix) {
        return $http({
            url: `${REPOSITORIES_ENDPOINT}/${repositoryId}/namespaces/${prefix}`,
            method: 'PUT',
            data: namespace
        });
    }

    function deleteNamespacePrefix(repositoryId, prefix) {
        return $http({
            url: `${REPOSITORIES_ENDPOINT}/${repositoryId}/namespaces/${prefix}`,
            method: 'DELETE'
        });
    }

    function addStatements(repositoryId, data) {
        return $http({
            url: `${REPOSITORIES_ENDPOINT}/${repositoryId}/statements`,
            method: 'POST',
            data,
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        });
    }

    function activatePlugin(pluginName) {
        return $.ajax({
            method: 'POST',
            url: `${REPOSITORIES_ENDPOINT}/${$repositories.getActiveRepository()}/statements`,
            data: {
                update: ACTIVATE_PLUGIN_QUERY.replace('{{pluginName}}', pluginName)
            }
        });
    }

    function checkPluginIsActive(pluginName) {
        return $.ajax({
            method: 'GET',
            url: `${REPOSITORIES_ENDPOINT}/${$repositories.getActiveRepository()}`,
            data: {
                query: CHECK_PLUGIN_ACTIVE_QUERY.replace('{{pluginName}}', pluginName)
            }
        });
    }

    function getRepositorySize() {
        return $http.get(`${REPOSITORIES_ENDPOINT}/${$repositories.getActiveRepository()}/size`);
    }

    function getGraphs(repositoryId) {
        return $http.get(`${REPOSITORIES_ENDPOINT}/${repositoryId}/contexts`);
    }


    function resolveGraphs() {
        const activeRepository = $repositories.getActiveRepository();
        let graphsInRepo = [];
        if (activeRepository) {
            return getGraphs(activeRepository).success(function (graphs) {
                    graphs.results.bindings.unshift({
                        contextID: {
                            type: "default",
                            value: "The default graph"
                        }
                    });

                    Object.keys(graphs.results.bindings).forEach(function (key) {
                        const binding = graphs.results.bindings[key];
                        if (binding.contextID.type === "bnode") {
                            binding.contextID.value = `_:${binding.contextID.value}`;
                        } else if (binding.contextID.type === "default") {
                            binding.contextID.uri = "http://www.openrdf.org/schema/sesame#nil";
                        } else {
                            binding.contextID.uri = binding.contextID.value;
                        }
                    });
                    graphs.results.bindings.unshift(allGraphs);
                    graphsInRepo = graphs.results.bindings;
            });
        }
        return graphsInRepo;
    }
}
