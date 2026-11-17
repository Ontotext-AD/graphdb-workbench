import 'angular/core/services/markdown/markdown.service';
import {CODE_ACTION_ATTRIBUTE, CODE_BLOCK_CLASS} from 'angular/core/services/markdown/plugins/markdown-code-block';

const modules = [
    'graphdb.framework.core.services.markdown-service',
];

/**
 * @ngdoc directive
 * @name graphdb.framework.core.directives.markdown-content:markdownContent
 * @restrict E
 *
 * @description
 * The `markdownContent` directive renders Markdown content inside AngularJS applications.
 *
 * The rendered content is never compiled, because it may come from an untrusted source (e.g. an LLM answer), and
 * compiling it would evaluate any AngularJS expression (`{{...}}`) in it. When the content is trusted, only the code
 * block actions added by the Markdown plugins are compiled (see {@link CODE_ACTION_ATTRIBUTE}).
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

markdownContentDirective.$inject = ['$compile', '$sce', 'MarkdownService'];

function markdownContentDirective($compile, $sce, MarkdownService) {
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
            // Private variables
            // =========================

            /**
             * The scopes of the compiled code block actions of the current content.
             *
             * @type {Object[]}
             */
            let codeActionScopes = [];

            // =========================
            // Private functions
            // =========================

            /**
             * Compiles the code block actions of the rendered content, see {@link CODE_ACTION_ATTRIBUTE}.
             */
            const compileCodeActions = () => {
                element.find(`[${CODE_ACTION_ATTRIBUTE}]`).each((index, actionElement) => {
                    const codeBlock = actionElement.closest(`.${CODE_BLOCK_CLASS}`);
                    const actionScope = $scope.$new(true);
                    // Markdown-it ends every code block with a new line, which is not part of the code.
                    actionScope.code = codeBlock.querySelector('code').textContent.replace(/\n$/, '');
                    codeActionScopes.push(actionScope);
                    $compile(actionElement)(actionScope);
                });
            };

            const destroyCodeActionScopes = () => {
                codeActionScopes.forEach((actionScope) => actionScope.$destroy());
                codeActionScopes = [];
            };

            const init = () => {
                const trusted = $scope.trusted === 'true';
                const html = $scope.content
                    ? $sce.getTrustedHtml(MarkdownService.renderMarkdown($scope.content, $scope.options, trusted))
                    : '';
                destroyCodeActionScopes();
                element.find('.markdown-content').html(html);
                if (trusted) {
                    compileCodeActions();
                }
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
