import markdownIt from 'markdown-it';
import {markdownCodeCopyPlugin} from "./plugins/markdown-code-copy-plugin";
import {markdownOpenInSparqlEditorPlugin} from "./plugins/markdown-open-in-sparql-editor-plugin";

const OPEN_IN_SPARQL_PLUGIN_OPTIONS = {
    buttonStyle: 'position: absolute; top: 0; right: 0; margin-right: 24px'
};

/**
 * AngularJS service that provides methods for rendering Markdown text.
 * @class MarkdownService
 * @param {$sce} $sce - AngularJS service for Strict Contextual Escaping.
 */
angular
    .module('graphdb.framework.core.services.markdown-service', [])
    .service('MarkdownService', MarkdownService);

MarkdownService.$inject = ['$sce'];

function MarkdownService($sce) {
    const markdownInstance = markdownIt()
        .use(markdownCodeCopyPlugin)
        .use(markdownOpenInSparqlEditorPlugin, OPEN_IN_SPARQL_PLUGIN_OPTIONS);

    /**
     * Retrieves a Markdown-it instance with optional custom configuration.
     * @function getMarkdown
     * @param {Object} [config] - Optional custom configuration for Markdown-it.
     * @return {Object} The Markdown instance.
     */
    const getMarkdown = (config) => {
        if (config) {
            return markdownIt()
                .use(markdownCodeCopyPlugin, config)
                .use(markdownOpenInSparqlEditorPlugin, _.merge({}, OPEN_IN_SPARQL_PLUGIN_OPTIONS, config));

        }
        return markdownInstance;
    };

    /**
     * Renders Markdown text into HTML.
     * @function renderMarkdown
     * @param {string} text - The Markdown text to render.
     * @return {string} The rendered HTML, or the original text in case of an error.
     */
    const renderMarkdown = (text, config) => {
        try {
            return $sce.trustAsHtml(getMarkdown(config).render(text));
        } catch (e) {
            console.error('Error rendering markdown:', e);
            // Return the original text in case of an error
            return $sce.trustAsHtml(text);
        }
    };

    return {
        renderMarkdown
    };
}
