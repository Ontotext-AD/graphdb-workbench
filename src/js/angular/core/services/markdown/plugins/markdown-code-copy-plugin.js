const DEFAULT_MARKDOWN_CONFIGURATION = {
    iconStyle: "",
    iconClass: "icon-copy",
    buttonStyle: "position: absolute; top: 0; right: 0;",
    buttonClass: "btn btn-link btn-sm secondary"
};

/**
 * This function enhances the rendering of code blocks in markdown by appending a "copy to clipboard" button to each code block.
 *
 * @param {Function} origRule The original rule function responsible for rendering code blocks.
 * @param {Object} options The options to customize the rendering. These will be merged with the default configuration.
 * @return {Function} A function that renders a code block with a "copy to clipboard" button, when a fenced code block is detected.
 */
function renderCode(origRule, options) {
    options = _.merge(DEFAULT_MARKDOWN_CONFIGURATION, options);
    return (...args) => {
        const [tokens, idx] = args;
        const token = tokens[idx];

        const content = tokens[idx].content
            .replaceAll('"', '&quot;')
            .replaceAll("'", "&apos;");
        const origRendered = origRule(...args);

        if (token.type === 'fence' && origRendered.trim()) {
            return `<div style="position: relative">
                        ${origRendered}
                        <copy-to-clipboard
                            style="${options.buttonStyle}"
                            class="${options.buttonStyle}"
                            tooltip-text="ttyg.chat_panel.btn.copy_sparql.tooltip"
                            text-to-copy="${content}">
                        </copy-to-clipboard>
                    </div>`;
        } else {
            return origRendered;
        }
    };
}

export const markdownCodeCopyPlugin = (md, options) => {
    md.renderer.rules.code_block = renderCode(md.renderer.rules.code_block, options);
    md.renderer.rules.fence = renderCode(md.renderer.rules.fence, options);
};
