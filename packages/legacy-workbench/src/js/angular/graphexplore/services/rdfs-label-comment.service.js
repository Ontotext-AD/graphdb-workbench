angular
    .module('graphdb.framework.graphexplore.services.rdfsdetails', [])
    .factory('RdfsLabelCommentService', RdfsLabelCommentService);

function RdfsLabelCommentService() {
    return {
        processAndFilterLabelAndComment: processAndFilterLabelAndComment
    };

    function processAndFilterLabelAndComment(response) {
        function processKeysWithColon(obj) {
            const newObj = {};
            for (let k in obj) {
                if (obj.hasOwnProperty(k)) {
                    let origKey = k;
                    if (k.indexOf(':') > -1) {
                        origKey = k;
                        k = k.split(':')[1].toLowerCase();
                    }
                    newObj[k] = obj[origKey];
                }
            }
            return newObj;
        }

        const results = response.results.bindings;
        const labels = [];
        const comments = [];
        _.each(results, function (value) {
            let processedObj;
            if (!angular.isUndefined(value.label)) {
                processedObj = processKeysWithColon(value.label);
                labels.push(processedObj);
            }

            if (!angular.isUndefined(value.comment)) {
                processedObj = processKeysWithColon(value.comment);
                comments.push(processedObj);
            }
        });

        const langFilter = function (item) {
            return item.lang === 'en' || item.lang === 'de';
        };

        const filteredRdfsLabel = $.grep(labels, langFilter)[0];
        const filteredRdfsComment = $.grep(comments, langFilter)[0];

        const rdfsLabel = !angular.isUndefined(filteredRdfsLabel)
            ? filteredRdfsLabel.value
            : labels.length > 0
                ? labels[0].value
                : undefined;

        const rdfsComment = !angular.isUndefined(filteredRdfsComment)
            ? filteredRdfsComment.value
            : comments.length > 0
                ? comments[0].value
                : undefined;

        return {
            rdfsLabel: rdfsLabel,
            rdfsComment: rdfsComment
        };
    }
}
