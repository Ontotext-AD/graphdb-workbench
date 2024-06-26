angular
    .module('graphdb.framework.rest.plugins.service', [])
    .factory('PluginsRestService', PluginsRestService);

const PLUGINS_ENDPOINT = 'repositories/';
const PLUGIN_OFF = 'INSERT DATA { <u:a> <http://www.ontotext.com/owlim/system#stopplugin>';
const PLUGIN_ENABLED = 'ask { ?p <http://www.ontotext.com/owlim/system#listplugins> ?s . \n' +
    ' filter(str(?p) = "history" && ?s) }';
const PLUGIN_ON = 'INSERT DATA { <u:a> <http://www.ontotext.com/owlim/system#startplugin>';
const GET_ALL_PLUGINS = 'select ?s ?o where { ?s <http://www.ontotext.com/owlim/system#listplugins> ?o .}';

PluginsRestService.$inject = ['$http'];

function PluginsRestService($http) {
    return {
        togglePlugin,
        getPlugins
    };
    function getPlugins(repoId) {
        return $http.get(`${PLUGINS_ENDPOINT}${repoId}`, {
            params: {
                query: GET_ALL_PLUGINS
            }
        });
    }

    function togglePlugin(repoId, enabled, plugin) {
        if (!enabled) {
            return $http.post(`${PLUGINS_ENDPOINT}${repoId}/statements`, undefined, {
                params: {
                    update: `${PLUGIN_ON} "${plugin}".}`
                }
            });
        } else {
            return $http.post(`${PLUGINS_ENDPOINT}${repoId}/statements`, undefined, {
                params: {
                    update: `${PLUGIN_OFF} "${plugin}".}`
                }
            });
        }
    }
}
