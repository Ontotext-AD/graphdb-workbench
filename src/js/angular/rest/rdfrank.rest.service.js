angular
    .module('graphdb.framework.rest.rdfrank.service', [])
    .factory('RdfRankRestService', RdfRankRestService);

const RDFRANK_ENDPOINT = 'rest/rdfrank';
const RDFRANK_FILTERING_ENDPOINT = `${RDFRANK_ENDPOINT}/filtering`;

RdfRankRestService.$inject = ['$http'];

function RdfRankRestService($http) {
    return {
        getStatus,
        checkRdfRankPluginEnabled,
        checkFilteringEnabled,
        toggleFiltering,
        filter,
        updateFilter,
        deleteFilter,
        includeExplicit,
        toggleIncludeExplicit,
        includeImplicit,
        toggleIncludeImplicit,
        compute,
        computeIncremental,
        interrupt
    };

    function getStatus() {
        return $http.get(`${RDFRANK_ENDPOINT}/status`);
    }

    function checkRdfRankPluginEnabled() {
        return $http.get(`${RDFRANK_ENDPOINT}/plugin-found`);
    }

    function checkFilteringEnabled() {
        return $http.get(RDFRANK_FILTERING_ENDPOINT);
    }

    function toggleFiltering(enable) {
        return $http.post(`${RDFRANK_FILTERING_ENDPOINT}?enabled=${enable}`);
    }

    function filter(predicate) {
        return $http.get(`${RDFRANK_FILTERING_ENDPOINT}/${predicate}`);
    }

    function updateFilter(predicate, data) {
        return $http.put(`${RDFRANK_FILTERING_ENDPOINT}/${predicate}`, data);
    }

    function deleteFilter(predicate, data) {
        return $http.delete(`${RDFRANK_FILTERING_ENDPOINT}/${predicate}`, {
            data,
            headers: {'Content-Type': 'application/json;charset=utf-8'}
        });
    }

    function includeExplicit() {
        return $http.get(`${RDFRANK_ENDPOINT}/include-explicit`);
    }

    function toggleIncludeExplicit(enable) {
        return $http.post(`${RDFRANK_ENDPOINT}/include-explicit?enabled=` + enable);
    }

    function includeImplicit() {
        return $http.get(`${RDFRANK_ENDPOINT}/include-implicit`);
    }

    function toggleIncludeImplicit(enable) {
        return $http.post(`${RDFRANK_ENDPOINT}/include-implicit?enabled=` + enable);
    }

    function compute() {
        return $http.post(`${RDFRANK_ENDPOINT}/compute`);
    }

    function computeIncremental() {
        return $http.post(`${RDFRANK_ENDPOINT}/compute-incremental`);
    }

    function interrupt() {
        return $http.post(`${RDFRANK_ENDPOINT}/interrupt`);
    }
}
