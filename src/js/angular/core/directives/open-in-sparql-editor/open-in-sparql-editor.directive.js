import {decodeHTML} from "../../../../../app";

/**
 * @ngdoc directive
 * @name graphdb.framework.core.directives.open-in-sparql-editor.directive:openInSparqlEditor
 * @restrict E
 *
 * @description
 * This directive provides a button that allows users to open the SPARQL editor with a pre-defined query.
 * Optionally, it can handle repository switching before opening the editor and executing the query.
 * The directive can also trigger the query execution automatically if specified.
 *
 * @scope
 *
 * @param {string} query The SPARQL query to be opened and optionally executed in the SPARQL editor.
 * @param {string} repositoryId The ID of the repository to be selected before opening the SPARQL editor.
 * @param {string} executeQuery Flag that determines whether the query should be executed upon opening the editor.
 *                              It accepts 'true' or 'false'. If 'true', the query will be automatically executed.
 *
 * @example
 * <open-in-sparql-editor
 *     query="SELECT * WHERE {?s ?p ?o}"
 *     repository-id="myRepository"
 *     execute-query="true">
 * </open-in-sparql-editor>
 *
 * @requires $repositories
 * @requires $translate
 * @requires ModalService
 * @requires $window
 *
 * @param {string} query The SPARQL query to be executed in the new tab.
 */

angular
    .module('graphdb.framework.core.directives.open-in-sparql-editor', [])
    .directive('openInSparqlEditor', openInSparqlEditorDirective);

openInSparqlEditorDirective.$inject = ['$repositories', '$translate', 'ModalService', '$window'];

function openInSparqlEditorDirective($repositories, $translate, ModalService, $window) {
    return {
        // Note: the line-height of the element must match the line-height of the icon.
        // This defines a composite FontAwesome icon to match the style of the surrounding icons.
        template: `
            <style>
                .open-in-sparql-editor-btn {
                    line-height: 0.75;
                }
                .open-in-sparql-editor-btn .fa:nth-child(2) {
                    margin-left: -0.2em;
                    margin-right: -0.2em;
                    font-size: 0.9em;
                }
            </style>
            <button class="btn btn-link btn-sm open-in-sparql-editor-btn" gdb-tooltip="{{'ttyg.chat_panel.btn.open_in_sparql_editor.tooltip' | translate}}" ng-click="onGoToSparqlEditorView()">
                <i class="fa fa-bracket-curly"></i><i class="fa fa-ellipsis"></i><i class="fa fa-bracket-curly-right"></i>
            </button>
        `,
        restrict: 'E',
        scope: {
            query: '@',
            repositoryId: '@',
            executeQuery: '@'
        },
        link: function ($scope, element) {

            // =========================
            // Public variables
            // =========================

            $scope.tooltipText = 'ttyg.chat_panel.btn.open_in_sparql_editor.tooltip';
            // =========================
            // Private functions
            // =========================
            const execute = $scope.executeQuery === 'true';

            // =========================
            // Public functions
            // =========================

            /**
             * Opens the SPARQL editor in a new browser tab with the specified query and optional execution.
             */
            $scope.onGoToSparqlEditorView = () => {
                const activeRepositoryId = $repositories.getActiveRepository();
                if (!activeRepositoryId || activeRepositoryId !== $scope.repositoryId) {
                    // Open a confirmation modal before switching the repository
                    ModalService.openConfirmationModal(
                        {
                            title: $translate.instant('common.confirm'),
                            message: decodeHTML($translate.instant('ttyg.chat_panel.dialog.confirm_repository_change.body', {repositoryId: $scope.repositoryId})),
                            confirmButtonKey: 'ttyg.chat_panel.btn.proceed.label'
                        },
                        () => {
                            $repositories.setRepository($repositories.getRepository($scope.repositoryId));
                            openInSparqlEditorInNewTab($scope.query);
                        }
                    );
                } else {
                    // No repository switch needed, just open the SPARQL editor
                    openInSparqlEditorInNewTab($scope.query);
                }
            };
            // =========================
            // Private functions
            // =========================

            /**
             * Opens SPARQL editor view with passed query and handles repository switch if necessary.
             * @param {string} query
             */
            const openInSparqlEditorInNewTab = (query) => {
                // Open the SPARQL editor in a new tab and execute the query
                $window.open(`/sparql?query=${encodeURIComponent(query)}&execute=${execute}`, '_blank');
            };
        }
    };
}
