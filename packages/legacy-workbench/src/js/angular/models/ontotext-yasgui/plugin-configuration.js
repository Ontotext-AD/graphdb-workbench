/**
 * Represents a single plugin's configuration.
 */
export class PluginConfiguration {}// NOSONAR

/**
 * Geo plugin configuration.
 */
export class GeoPluginConfiguration extends PluginConfiguration {
    constructor() {
        super();
        this.defaultGeoStyleOptions = {
            // Width of the geo feature line.
            weight: 3,
            // Color of the geo feature line.
            color: 'var(--graphwise-blue-color)',
            // Opacity of the geo feature line,
            opacity: 0.7,
            // Fill color of polygon features.
            fillColor: 'var(--graphwise-blue-color)',
            // Fill opacity of polygon features,
            fillOpacity: 0.2,
        };

        /**
         * Callback invoked when a feature is clicked. Receives the feature properties excluding geo-related fields.
         * @type {((nonGeoProperties: Record<string, unknown>) => void) | undefined}
         */
        this.onFeatureClick = undefined;
    }
}
