import markdownIt from 'markdown-it';
import markdownItCodeCopy from 'markdown-it-code-copy';

const DEFAULT_MARKDOWN_CONFIGURATION = {
    iconStyle: "",
    iconClass: "icon-copy",
    buttonStyle: "position: absolute; top: 0; right: 0;",
    buttonClass: "btn btn-link btn-sm secondary"
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
    const markdownInstance = markdownIt().use(markdownItCodeCopy, DEFAULT_MARKDOWN_CONFIGURATION);

    /**
     * Retrieves a Markdown-it instance with optional custom configuration.
     * @function getMarkdown
     * @param {Object} [config] - Optional custom configuration for Markdown-it.
     * @return {Object} The Markdown instance.
     */
    const getMarkdown = (config) => {
        if (config) {
            return markdownIt().use(markdownItCodeCopy, config);
        }
        return markdownInstance;
    };

    /**
     * Renders Markdown text into HTML.
     * @function renderMarkdown
     * @param {string} text - The Markdown text to render.
     * @return {string} The rendered HTML, or the original text in case of an error.
     */
    const renderMarkdown = (text) => {
        try {
            return $sce.trustAsHtml(getMarkdown().render(text));
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
