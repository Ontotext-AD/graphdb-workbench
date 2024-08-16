import 'angular/core/filters/readableTimestamp';

const modules = [
    'graphdb.framework.core.filters.readable_titmestamp'
];

angular
    .module('graphdb.framework.ttyg.directives.chats-list', modules)
    .directive('chatList', ChatListComponent);

ChatListComponent.$inject = [];

function ChatListComponent() {
    return {
        restrict: 'E',
        templateUrl: 'js/angular/ttyg/templates/chat-list.html',
        scope: {
            chatList: '='
        },
        link: ($scope, element, attrs) => {

            // =========================
            // Public variables
            // =========================

            // =========================
            // Public functions
            // =========================

            // =========================
            // Private functions
            // =========================


            // =========================
            // Subscription handlers
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
        }
    };
}
