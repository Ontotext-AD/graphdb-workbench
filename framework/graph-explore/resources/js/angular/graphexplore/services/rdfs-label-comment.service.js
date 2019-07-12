define([],
    function () {

        angular
            .module('graphdb.framework.graphexplore.services.rdfsdetails', [])
            .factory('RdfsLabelCommentService', RdfsLabelCommentService);

        RdfsLabelCommentService.$inject = ['$http'];
        function RdfsLabelCommentService($http) {
            return {
                processAndFilterLabelAndComment: processAndFilterLabelAndComment
            };

            function processAndFilterLabelAndComment(response) {
                function processKeysWithColon(obj) {
                    var newObj = {};
                    for (var k in obj) {
                        if (obj.hasOwnProperty(k)) {
                            var origKey = k;
                            if (k.indexOf(':') > -1) {
                                origKey = k;
                                k = k.split(':')[1].toLowerCase();
                            }
                            newObj[k] = obj[origKey];
                        }
                    }
                    return newObj;
                }

                var results = response.results.bindings,
                    labels = [],
                    comments = [];
                _.each(results, function (value) {
                    var processedObj;
                    if (!angular.isUndefined(value.label)) {
                        processedObj = processKeysWithColon(value.label);
                        labels.push(processedObj);
                    }

                    if (!angular.isUndefined(value.comment)) {
                        processedObj = processKeysWithColon(value.comment);
                        comments.push(processedObj);
                    }
                });

                var langFilter = function (item) {
                    return item.lang === "en" || item.lang === "de";
                };

                var filteredRdfsLabel = $.grep(labels, langFilter)[0],
                    filteredRdfsComment = $.grep(comments, langFilter)[0];

                var rdfsLabel = !angular.isUndefined(filteredRdfsLabel)
                    ? filteredRdfsLabel.value
                    : labels.length > 0
                    ? labels[0].value
                    : undefined;

                var rdfsComment = !angular.isUndefined(filteredRdfsComment)
                    ? filteredRdfsComment.value
                    : comments.length > 0
                    ? comments[0].value
                    : undefined;

                return {
                    rdfsLabel: rdfsLabel,
                    rdfsComment: rdfsComment
                }
            }
        }
    });
