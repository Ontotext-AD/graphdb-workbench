define([],
    function () {

        angular
            .module('graphdb.framework.graphexplore.services.data', [])
            .factory('GraphDataService', GraphDataService);

        GraphDataService.$inject = ['$http', '$repositories'];
        function GraphDataService($http, $repositories) {
            return {
                // class hierarchy
                getClassHierarchyData: getClassHierarchyData,
                reloadClassHierarchy: reloadClassHierarchy,
                getClassInstances: getClassInstances,

                // domain-range graph
                getDomainRangeData: getDomainRangeData,
                checkDomainRangeData: checkDomainRangeData,

                // class relationships
                getRelationshipsData: getRelationshipsData,
                getRelationshipsClasses: getRelationshipsClasses,
                getRelationshipsStatus: getRelationshipsStatus,
                calculateRelationships: calculateRelationships,

                // instances graph
                getInstanceNode: getInstanceNode,
                getInstanceNodeLinks: getInstanceNodeLinks,

                // common
                getRdfsLabelAndComment: getRdfsLabelAndComment
            };

            function getClassHierarchyData() {
                return $http.get('rest/class-hierarchy');
            }

            function reloadClassHierarchy() {
                return $http.get('rest/class-hierarchy', {
                    params: {
                        doReload: true
                    }
                });
            }

            function getClassInstances(targetUri) {
                return $http.get('rest/class-hierarchy/class-instances', {
                    params: {
                        targetUri: targetUri
                    }
                });
            }

            function checkDomainRangeData(targetUri) {
                return $http.head('rest/domain-range', {
                    params: {
                        targetUri: targetUri
                    }
                });
            }

            function getDomainRangeData(targetUri, collapsed) {
                return $http.get('rest/domain-range', {
                    params: {
                        targetUri: targetUri,
                        collapsed: collapsed
                    }
                });
            }

            function getRelationshipsData(selectedClasses, direction) {
                return   $http.get('rest/dependencies/matrix', {
                    params: {
                        "mode": direction,
                        "classes": _.map(selectedClasses, function (c) {
                            return c.name
                        })
                    }
                })
            }

            function getRelationshipsClasses(direction) {
                return $http.get("rest/dependencies/classes", {
                    params: {
                        "mode": direction
                    }
                })
            }

            function getRelationshipsStatus() {
                return $http.get('rest/dependencies/status');
            }

            function calculateRelationships() {
                return $http.get('rest/dependencies/update');
            }

            function getInstanceNode(iri) {
                return $http.get('rest/explore-graph/node', {
                    params: {
                        iri: iri
                    }
                });
            }

            function getInstanceNodeLinks(iri) {
                return $http.get('rest/explore-graph/links', {
                    params: {
                        iri: iri,
                    }
                });
            }

            function getRdfsLabelAndComment(targetUri, languages, extraParams) {
                extraParams = extraParams || {};
                return $http({
                    url: 'rest/explore/details',
                    method: 'GET',
                    params: _.extend(extraParams, {uri: targetUri, languages: languages}),
                    headers: {
                        'Accept': 'application/json'
                    }
                });
            }
        }
    });