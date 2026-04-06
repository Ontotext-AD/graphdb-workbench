import {GeoSparqlVariable} from './geo-sparql-variable';

/**
 * Represents properties of a geospatial feature excluding geospatial-specific SPARQL variables.
 *
 * Allows arbitrary string keys with unknown values, while explicitly disallowing keys defined in {@link GeoSparqlVariable}.
 *
 * This type is typically used for feature metadata passed to consumers (e.g., in click handlers), ensuring that styling
 * and rendering-related fields are omitted.
 */
export type GeoFeatureProperties = Record<string, unknown> & Partial<Record<GeoSparqlVariable, never>>;
