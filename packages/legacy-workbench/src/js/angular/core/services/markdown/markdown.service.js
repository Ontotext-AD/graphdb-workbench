import markdownIt from 'markdown-it';
import {markdownCodeCopyPlugin} from "./plugins/markdown-code-copy-plugin";
import {markdownOpenInSparqlEditorPlugin} from "./plugins/markdown-open-in-sparql-editor-plugin";
import {LoggerProvider} from "../logger-provider";

const OPEN_IN_SPARQL_PLUGIN_OPTIONS = {
    buttonStyle: 'position: absolute; top: 0; right: 0; margin-right: 24px',
};

const logger = LoggerProvider.logger;

/**
 * AngularJS service that provides methods for rendering Markdown text.
 * @class MarkdownService
 * @param {$sce} $sce - AngularJS service for Strict Contextual Escaping.
 */
angular
    .module('graphdb.framework.core.services.markdown-service', ['ngSanitize'])
    .service('MarkdownService', MarkdownService);

MarkdownService.$inject = ['$sce', '$sanitize'];

function MarkdownService($sce, $sanitize) {
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
     * @param {Object} [config] - Optional custom configuration for Markdown rendering.
     * @param {boolean} [trusted=true] - Indicates whether the rendered HTML should be treated as trusted. If false, the
     * HTML will be sanitized to prevent potential security risks.
     * @return {string} The rendered HTML, or the original text in case of an error.
     */
    const renderMarkdown = (text, config, trusted = true) => {
        try {
            const html = getMarkdown(config).render(text);
            return trusted
                // trusted: skip sanitize (plugins may add custom HTML)
                ? $sce.trustAsHtml(html)
                // untrusted: sanitize before content that may have angular bindings
                : $sce.trustAsHtml($sanitize(html));
        } catch (e) {
            logger.error('Error rendering markdown:', e);
            return $sce.trustAsHtml(trusted ? text : $sanitize(text));
        }
    };

    return {
        renderMarkdown,
    };
}
