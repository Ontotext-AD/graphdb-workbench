angular
    .module('graphdb.framework.utils.localstorageadapter', [])
    .factory('LocalStorageAdapter', LocalStorageAdapter)
    .value('LSKeys', {
        'TABS_STATE': 'tabs-state',
        'TABS_STATE_CURRENT_ID': 'tabs-state-currentid',
        'TABS_STATE_MAXID': 'tabs-state-maxid',
        'VIEW_MODE': 'viewMode',
        'CLASS_HIERARCHY_HIDE_PREFIXES': 'classHierarchy-hidePrefixes',
        'CLASS_HIERARCHY_CURRENT_SLIDER_VALUE': 'classHierarchy-currentSliderValue',
        'CLASS_HIERARCHY_SWITCH_PREFIXES': 'classHierarchy-switchPrefixes',
        'CLASS_HIERARCHY_LAST_SELECTED_CLASS': 'classHierarchy-lastSelectedClass',
        'DOMAIN_RANGE_WENT_BACK': 'domainRange-wentBack',
        'DOMAIN_RANGE_COLLAPSE_EDGES': 'domainRange-collapseEdges',
        'HIDE_SIMILARITY_HELP': 'hide-similarity-help',
        'TUTORIAL_STATE': 'tutorial-state',
        'MENU_STATE': 'menu-state',
        'HIDE_GRAPH_CONFIG_HELP': 'hide-graph-config-help',
        'GRAPHS_VIZ': 'graphs-viz',
        'AUTOCOMPLETE_ENABLED': 'autocomplete.enabled',
        'RDF_SEARCH_TYPE': 'rdf-search.search-type',
        'RDF_SEARCH_INPUT': 'rdf-search.search-input',
        'RDF_SEARCH_EXPANDED_URI': 'rdf-search.search-expanded-uri',
        'RDF_RESOURCE_DESCRIPTION': 'rdf-search.resource-description',
        'PREFERRED_LANG': 'preferred-language',
        'WORKBENCH_SETTINGS': 'workbench-settings',
        'REPOSITORY_ID': 'repository-id',
        'REPOSITORY_LOCATION': 'repository-location',
        'JSONLD_EXPORT_SETTINGS': 'jsonld-export-settings'
    });

LocalStorageAdapter.$inject = ['localStorageService', 'LSKeys'];

function LocalStorageAdapter(localStorageService, LSKeys) {
    return {
        get,
        set,
        keys,
        remove,
        clearAll,

        // class hierarchy related
        clearClassHieararchyState
    };

    function get(key) {
        return localStorageService.get(key);
    }

    function set(key, value) {
        localStorageService.set(key, value);
    }

    function keys() {
        return localStorageService.keys();
    }

    function remove(key) {
        localStorageService.remove(key);
    }

    function clearAll() {
        localStorageService.clearAll();
    }

    function clearClassHieararchyState() {
        keys().forEach(function(key) {
            // remove everything but the hide prefixes setting, it should always persist
            if (key.indexOf("classHierarchy-") === 0 && key !== LSKeys.CLASS_HIERARCHY_HIDE_PREFIXES && !key.startsWith("classHierarchy-selectedGraph-")) {
                remove(key);
            }
        });
    }
}
