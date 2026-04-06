import {GeoFeatureProperties} from './geo-feature-properties';

/**
 * Type for a callback invoked when a Geo feature is clicked.
 *
 * @param nonGeoProperties - The properties of the clicked feature excluding geospatial-specific variables (see {@link GeoFeatureProperties}).
 *
 */
export type GeoFeatureClickHandler = (nonGeoProperties: GeoFeatureProperties) => void;
