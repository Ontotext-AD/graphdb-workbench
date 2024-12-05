const DEFAULT_MARKDOWN_CONFIGURATION = {
    buttonStyle: "position: absolute; top: 0; right: 0;",
    buttonClass: ""
};

/**
 * This function enhances the rendering of fenced code blocks in markdown that contain SPARQL queries
 * by appending an "open in SPARQL editor" button to each SPARQL code block.
 *
 * @param {Function} origRule The original rule function responsible for rendering code blocks.
 * @param {Object} options The options to customize the rendering. These will be merged with the default configuration.
 * Options model description:
 * ```JSON
 *      {
 *          // Inline CSS styles applied to position the button inside the code block. Defaults to positioning the button at the top-right of the block.
 *          buttonStyle: "position: absolute; top: 0; right: 0;",
 *          // The CSS class for styling the button.
 *          buttonClass: "",
 *          // A flag that determines whether the SPARQL query should be automatically executed when opened in the SPARQL editor. Defaults to `false`.
 *          executeQuery: false,
 *          // The ID of the repository that the SPARQL query will be executed against.
 *          repositoryId: ''
 *      }
 * ```
 *
 * @return {Function} A function that renders a fenced code block with an "open in SPARQL editor" button when the block is recognized as containing SPARQL code.
 */
function renderCode(origRule, options) {
    options = _.merge({}, DEFAULT_MARKDOWN_CONFIGURATION, options);
    return (...args) => {
        const [tokens, idx] = args;
        const token = tokens[idx];

        const content = tokens[idx].content
            .replaceAll('"', '&quot;')
            .replaceAll("'", "&apos;");
        const origRendered = origRule(...args);

        if (token.type === 'fence' && token.info === 'sparql' && origRendered.trim()) {
            return `<div style="position: relative">
                        ${origRendered}
                        <open-in-sparql-editor
                            style="${options.buttonStyle}"
                            class="${options.buttonClass}"
                            execute-query="${options.executeQuery}"
                            repository-id="${options.repositoryId}"
                            query="${content}">
                        </open-in-sparql-editor>
                    </div>`;
        } else {
            return origRendered;
        }
    };
}

export const markdownOpenInSparqlEditorPlugin = (md, options) => {
    md.renderer.rules.code_block = renderCode(md.renderer.rules.code_block, options);
    md.renderer.rules.fence = renderCode(md.renderer.rules.fence, options);
};
