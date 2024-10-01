import 'angular/core/services/markdown.service';

const modules = [
    'graphdb.framework.core.services.markdown-service'
];

angular
    .module('graphdb.framework.ttyg.directives.chat-item-detail', modules)
    .directive('chatItemDetail', ChatItemDetailComponent);

ChatItemDetailComponent.$inject = ['toastr', '$translate', 'TTYGContextService', 'MarkdownService'];

/**
 * @ngdoc directive
 * @name graphdb.framework.ttyg.directives.chat-detail:chatDetail
 * @restrict E
 * @description
 *
 * This directive represents a component that displays a chat data.
 *
 * @example
 * <chat-item-detail chat-item="chatItem"></chat-item-detail>
 */
function ChatItemDetailComponent(toastr, $translate, TTYGContextService, MarkdownService) {
    return {
        restrict: 'E',
        templateUrl: 'js/angular/ttyg/templates/chat-item-detail.html',
        scope: {
            chatItemDetail: '=',
            showActions: '=',
            asking: '=',
            onRegenerateQuestion: '&',
            onCopyAnswerToClipboard: '&'
        },
        link: ($scope, element, attrs) => {

            // =========================
            // Public variables
            // =========================
            $scope.MarkdownService = MarkdownService;

            // =========================
            // Private variables
            // =========================

            // =========================
            // Public functions
            // =========================
            $scope.regenerateQuestion = () => {
                $scope.onRegenerateQuestion({chatItem: $scope.chatItemDetail});
            };

            $scope.copyAnswerToClipboard = () => {
                $scope.onCopyAnswerToClipboard({chatItem: $scope.chatItemDetail});
            };

            // =========================
            // Private functions
            // =========================

            // =========================
            // Subscriptions
            // =========================
            const subscriptions = [];

            const removeAllSubscribers = () => {
                subscriptions.forEach((subscription) => subscription());
            };


            // Deregister the watcher when the scope/directive is destroyed
            $scope.$on('$destroy', removeAllSubscribers);

            // =========================
            // Initialization
            // =========================
        }
    };
}
