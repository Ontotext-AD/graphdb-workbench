/**
 * Defines YASGUI operation types that can be triggered via URL parameters.
 *
 * @type {{YASGUI_OPERATION: string}}
 */
export const YASGUI_OPERATION = {
    EXTERNAL_CLICK_HANDLER: 'externalClickHandler',
};

/**
 * The types of operations that can be performed on the YASGUI. These are used to identify the type of operation that is
 * being performed when the YASGUI_OPERATION_TYPE event is emitted.
 * @type {{FEATURE_CLICK: string}}
 */
export const YASGUI_OPERATION_TYPE = {
    FEATURE_CLICK: 'yasgui.click.feature',
};

