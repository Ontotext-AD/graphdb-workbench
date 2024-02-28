angular
    .module('graphdb.framework.rest.rdf4j.repositories.service', [])
    .factory('RDF4JRepositoriesRestService', RDF4JRepositoriesRestService);

RDF4JRepositoriesRestService.$inject = ['$http', '$translate'];

const ACTIVATE_PLUGIN_QUERY = 'INSERT DATA { <u:a> <http://www.ontotext.com/owlim/system#startplugin> \'{{pluginName}}\' .}';
const CHECK_PLUGIN_ACTIVE_QUERY = 'select ?o where {\n' +
    '?s <http://www.ontotext.com/owlim/system#listplugins> ?o .\n' +
    'filter(str(?s) = \'{{pluginName}}\')\n' +
    '} ';

const REPOSITORIES_ENDPOINT = 'repositories';

function RDF4JRepositoriesRestService($http, $translate) {
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
        resolveGraphs,
        downloadResultsAsFile
    };

    function getNamespaces(repositoryId) {
        return $http.get(`${REPOSITORIES_ENDPOINT}/${repositoryId}/namespaces`);
    }

    function getRepositoryNamespaces(repositoryId) {
        return $http.get(`${REPOSITORIES_ENDPOINT}/${repositoryId}/namespaces`);
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

    function activatePlugin(pluginName, repositoryId) {
        return $http({
            method: 'POST',
            url: `${REPOSITORIES_ENDPOINT}/${repositoryId}/statements`,
            params: {
                update: ACTIVATE_PLUGIN_QUERY.replace('{{pluginName}}', pluginName)
            }
        });
    }

    function checkPluginIsActive(pluginName, repositoryId) {
        return $http({
            method: 'GET',
            url: `${REPOSITORIES_ENDPOINT}/${repositoryId}`,
            params: {
                query: CHECK_PLUGIN_ACTIVE_QUERY.replace('{{pluginName}}', pluginName)
            },
            headers: {
                'Accept': '*/*'
            }
        });
    }

    function getRepositorySize(repostoryId) {
        return $http.get(`${REPOSITORIES_ENDPOINT}/${repostoryId}/size`);
    }

    function getGraphs(repositoryId) {
        return $http.get(`${REPOSITORIES_ENDPOINT}/${repositoryId}/contexts`);
    }


    function resolveGraphs(repositoryId) {
        let graphsInRepo = [];
        if (repositoryId) {
            return getGraphs(repositoryId).success(function (graphs) {
                    graphs.results.bindings.unshift({
                        contextID: {
                            type: "default",
                            value: 'import.default.graph'
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

    /**
     * Downloads sparql results as a file in given format provided by the accept header parameter.
     * @param {string} repositoryId
     * @param {*} data
     * @param {string} acceptHeader
     * @param {string} linkHeader
     * @return {Promise<any>}
     */
    function downloadResultsAsFile(repositoryId, data, acceptHeader, linkHeader) {
        const properties = Object.entries(data)
            .filter(([property, value]) => value !== undefined)
            .map(([property, value]) => `${property}=${value}`);
        const payloadString = properties.join('&');
        return $http({
            method: 'POST',
            url: `${REPOSITORIES_ENDPOINT}/${repositoryId}`,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
                'Accept': acceptHeader,
                'Link': linkHeader
            },
            data: payloadString,
            responseType: "blob"
        }).then(function (res) {
            const data = res.data;
            const headers = res.headers();
            const contentDisposition = headers['content-disposition'];
            let filename = contentDisposition.split('filename=')[1];
            filename = filename.substring(0, filename.length);
            return {data, filename};
        });
    }
}
