/**
 * Represents the event triggered when a feature is clicked in the GeoPlugin.
 */
export interface GeoPluginFeatureClickEvent {
  // The unique ID of the clicked feature. Depending on the structure of the payload, this property may be optional.
  id?: string;
  // Geometry properties of the clicked feature. Depending on the structure of the payload, this property may be optional.
  geometry?: unknown;
}
