import type {TranslationBundle} from '@ontotext/workbench-api';

/**
 * A collection of translation bundles, where each key is a language code (e.g., 'en', 'fr') and the value is a
 * TranslationBundle for that language.
 * Example:
 * {
 *   en: {
 *     "yasgui.toolbar.orientation.btn.tooltip.switch_orientation_horizontal": "Switch to horizontal view",
 *     "yasgui.toolbar.orientation.btn.tooltip.switch_orientation_vertical": "Switch to vertical view",
 *     "yasgui.toolbar.mode_yasqe.btn.label": "Editor only",
 *     "yasgui.toolbar.mode_yasgui.btn.label": "Editor and results",
 *     "yasgui.toolbar.mode_yasr.btn.label": "Results only",
 *   }
 *   fr: {
 *     "yasgui.toolbar.orientation.btn.tooltip.switch_orientation_vertical": "Basculer vers verticale voir",
 *     "yasgui.toolbar.mode_yasqe.btn.label": "Éditeur seulement",
 *   }
 * }
 */
export type TranslationBundles = Record<string, TranslationBundle>;

