angular
    .module('graphdb.framework.graphexplore.directives.rdfsdetails', [])
    .directive('rdfsCommentLabel', rdfsCommentLabelDirective)
    .constant('SHORT_COMMENT_LENGTH', 100);

rdfsCommentLabelDirective.$inject = ['SHORT_COMMENT_LENGTH'];

function rdfsCommentLabelDirective(SHORT_COMMENT_LENGTH) {
    return {
        restrict: 'AE',
        scope: {
            rdfsLabel: '=',
            rdfsComment: '=',
            expanded: '=',
            alwaysExpanded: '='
        },
        templateUrl: 'js/angular/graphexplore/templates/rdfsCommentLabelTemplate.html',
        link: function (scope, element) {
            scope.stringLimit = SHORT_COMMENT_LENGTH;
            scope.scrollToTop = function () {
                element[0].getElementsByClassName('rdfs-comment')[0].scrollTop = 0;
            };

            scope.checkCommentLength = function () {
                const commentLength = element[0].getElementsByClassName('rdfs-comment-text')[0].innerText.length;
                return commentLength < SHORT_COMMENT_LENGTH;
            };

            scope.equalHeights = function () {
                const commentHeight = element[0].getElementsByClassName('rdfs-comment-text')[0].innerHeight;
                if (commentHeight < 250 && scope.expanded) {
                    element[0].getElementsByClassName('rdfs-comment')[0].innerHeight = commentHeight;
                }
            };

            scope.toggleFullComment = function () {
                scope.expanded = !scope.expanded;
            };

            scope.$watch('expanded || alwaysExpanded', function (value) {
                if (value) {
                    scope.stringLimit = scope.rdfsComment.length;
                } else {
                    scope.stringLimit = SHORT_COMMENT_LENGTH;
                }
            });
        }
    };
}
