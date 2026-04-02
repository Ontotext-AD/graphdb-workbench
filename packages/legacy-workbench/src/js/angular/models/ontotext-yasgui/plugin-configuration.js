/**
 * Represents a single plugin's configuration.
 * The structure depends on the concrete plugin.
 */
export class PluginConfiguration {}

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
            color: '#3388ff',
            // Opacity of the geo feature line,
            opacity: 0.2,
            // Fill color of polygon features.
            fillColor: '#3388ff',
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
