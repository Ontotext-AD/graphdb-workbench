angular
    .module('graphdb.framework.rest.graphexplore.data.service', [])
    .factory('GraphDataRestService', GraphDataRestService);

GraphDataRestService.$inject = ['$http'];

const CLASS_HIERARCHY_ENDPOINT = 'rest/class-hierarchy';
const DOMAIN_RANGE_ENDPOINT = 'rest/domain-range';
const DEPENDENCIES_ENDPOINT = 'rest/dependencies';
const EXPORE_GRAPH_ENDPOINT = 'rest/explore-graph';

function GraphDataRestService($http) {
    return {
        // class hierarchy
        getClassHierarchyData,
        reloadClassHierarchy,
        getClassInstances,

        // domain-range graph
        getDomainRangeData,
        checkDomainRangeData,

        // class relationships
        getRelationshipsData,
        getRelationshipsClasses,
        getRelationshipsStatus,
        calculateRelationships,
        getPredicates,

        // instances graph
        getInstanceNode,
        getInstanceNodeLinks,
        getProperties,

        updateGraph,

        // common
        getRdfsLabelAndComment
    };

    function getClassHierarchyData(graphURI) {
        return $http.get(CLASS_HIERARCHY_ENDPOINT, {
            params: {
                graphURI: graphURI
            }
        });
    }

    function reloadClassHierarchy(graphURI) {
        return $http.get(CLASS_HIERARCHY_ENDPOINT, {
            params: {
                doReload: true,
                graphURI: graphURI
            }
        });
    }

    function getClassInstances(targetUri) {
        return $http.get(`${CLASS_HIERARCHY_ENDPOINT}/class-instances`, {
            params: {
                targetUri
            }
        });
    }

    function checkDomainRangeData(targetUri) {
        return $http.head(DOMAIN_RANGE_ENDPOINT, {
            params: {
                targetUri
            }
        });
    }

    function getDomainRangeData(targetUri, collapsed) {
        return $http.get(DOMAIN_RANGE_ENDPOINT, {
            params: {
                targetUri,
                collapsed
            }
        });
    }

    function getRelationshipsData(selectedClasses, direction, graphURI) {
        return $http.get(`${DEPENDENCIES_ENDPOINT}/matrix`, {
            params: {
                'mode': direction,
                'classes': _.map(selectedClasses, function (c) {
                    return c.name;
                }),
                'graphURI': graphURI
            }
        });
    }

    function getRelationshipsClasses(direction, graphURI) {
        return $http.get(`${DEPENDENCIES_ENDPOINT}/classes`, {
            params: {
                'mode': direction,
                'graphURI': graphURI
            }
        });
    }

    function getRelationshipsStatus(graphURI) {
        return $http.get(`${DEPENDENCIES_ENDPOINT}/status`, {
            params: {
                graphURI: graphURI
            }
        });
    }

    function calculateRelationships(graphURI) {
        return $http.get(`${DEPENDENCIES_ENDPOINT}/update`, {
            params: {
                graphURI: graphURI
            }
        });
    }

    function getPredicates(sourceClass, destinationClass, graphURI) {
        return $http.get(`${DEPENDENCIES_ENDPOINT}/predicates`, {
            params: {
                'from': sourceClass,
                'to': destinationClass,
                'mode': 'all',
                'graphURI': graphURI
            }
        });
    }

    function getInstanceNode(params) {
        return $http.get(`${EXPORE_GRAPH_ENDPOINT}/node`, {
            params: params
        });
    }

    function getInstanceNodeLinks(params) {
        return $http.get(`${EXPORE_GRAPH_ENDPOINT}/links`, {
            params: params
        });
    }

    function getProperties(params) {
        return $http.get(`${EXPORE_GRAPH_ENDPOINT}/properties`, {
            params: params
        });
    }

    function updateGraph(payload) {
        let data = {
            headers: {
                'Content-Type': 'application/json'
            }
        };
        data = Object.assign(data, payload);
        return $http.post(`${EXPORE_GRAPH_ENDPOINT}/graph`, data);
    }

    function getRdfsLabelAndComment(targetUri, languages, extraParams) {
        const requestParams = extraParams || {};
        return $http({
            url: 'rest/explore/details',
            method: 'GET',
            params: _.extend(requestParams, {uri: targetUri, languages}),
            headers: {
                'Accept': 'application/json'
            }
        });
    }
}
