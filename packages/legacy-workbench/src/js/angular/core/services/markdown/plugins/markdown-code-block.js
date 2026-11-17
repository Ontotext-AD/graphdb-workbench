/**
 * The class of the element that wraps a rendered code block together with its actions.
 *
 * @type {string}
 */
export const CODE_BLOCK_CLASS = 'markdown-code-block';

/**
 * The attribute that marks an action of a code block, such as copy or open in SPARQL editor. The `markdownContent`
 * directive compiles only these elements, never the rest of the rendered Markdown, and gives each one a scope whose
 * `code` property holds the text of its code block. So an action reads the code from `{{code}}` and must not contain
 * the code itself, and an AngularJS expression in the code is never evaluated.
 *
 * @type {string}
 */
export const CODE_ACTION_ATTRIBUTE = 'markdown-code-action';

/**
 * Wraps a rendered code block together with an action for it.
 *
 * @param {string} renderedCode The rendered code block, or a code block already wrapped with another action.
 * @param {string} action The HTML of the action, marked with {@link CODE_ACTION_ATTRIBUTE}.
 * @returns {string} The wrapped code block.
 */
export const wrapCodeBlock = (renderedCode, action) => {
    return `<div class="${CODE_BLOCK_CLASS}" style="position: relative">
                ${renderedCode}
                ${action}
            </div>`;
};
