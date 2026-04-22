import 'angular/core/services/markdown/markdown.service';

const modules = [
    'graphdb.framework.core.services.markdown-service',
];

/**
 * @ngdoc directive
 * @name graphdb.framework.core.directives.markdown-content:markdownContent
 * @restrict E
 *
 * @description
 * The `markdownContent` directive is used to render and compile Markdown content inside AngularJS applications.
 * It dynamically compiles any AngularJS directives within the rendered Markdown content, ensuring that the
 * directives are properly recognized and executed.
 *
 * @param {string=} content The markdown content to be rendered. This can be passed dynamically from the scope.
 * @param {object=} options Optional configuration object to pass to the Markdown rendering engine, providing
 * customization for how the Markdown is rendered.
 *
 * @example
 * Usage:
 * <markdown-content content="markdownText" options="markdownOptions"></markdown-content>
 */
angular
    .module('graphdb.framework.core.directives.markdown-content', modules)
    .directive('markdownContent', markdownContentDirective);

markdownContentDirective.$inject = ['$compile', 'MarkdownService'];

function markdownContentDirective($compile, MarkdownService) {
    return {
        templateUrl: 'js/angular/core/templates/markdown-content/markdown-content.html',
        restrict: 'E',
        scope: {
            content: '@',
            options: '=',
            trusted: '@',
        },
        link: function($scope, element) {
            // =========================
            // Public variables
            // =========================

            /**
             * The rendered HTML content generated from the provided Markdown.
             *
             * @type {string|undefined} markdownContent
             */
            $scope.markdownContent = undefined;

            // =========================
            // Private functions
            // =========================

            const init = () => {
                if (!$scope.content) {
                    $scope.markdownContent = undefined;
                    return;
                }
                if ($scope.trusted === 'true') {
                    $scope.markdownContent = MarkdownService.renderMarkdown($scope.content, $scope.options);
                    compileMarkdownAnswerContents();
                } else {
                    $scope.markdownContent = MarkdownService.renderMarkdown($scope.content, $scope.options, false);
                }
            };

            /**
             * Manually compiles AngularJS directives within the dynamically generated markdown HTML content.
             * AngularJS does not automatically detect and compile directives inside HTML that is dynamically
             * inserted, so this function ensures that the content is compiled after it is rendered.
             */
            const compileMarkdownAnswerContents = () => {
                $scope.$evalAsync(() => {
                    // Find the dynamically rendered element that needs to be compiled
                    const markdownElement = element.find('.markdown-content');
                    $compile(angular.element(markdownElement).contents())($scope);
                });
            };

            $scope.$watch('content', (newVal, oldVal) => {
                if (newVal !== oldVal) {
                    init();
                }
            });

            init();
        },
    };
}
