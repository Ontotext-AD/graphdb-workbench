/**
 * A translation bundle with only top-level keys: the key path of each message, joined with dots, maps to the message.
 * Example:
 * {
 *   "sparql_editor.yasgui.tabs.unnamed_tab_title": "Unnamed",
 *   "sparql_editor.connector.created": "Created connector {{name}}"
 * }
 */
export type FlatTranslationBundle = Record<string, string>;
