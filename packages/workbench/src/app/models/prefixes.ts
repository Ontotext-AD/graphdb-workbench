/**
 * A mapping of prefixes to their corresponding URIs.
 * For instance:
 * <pre>
 *   {
 *     "gn": "http://www.geonames.org/ontology#",
 *     "path": "http://www.ontotext.com/path#",
 *     "rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
 *     "rdfs": "http://www.w3.org/2000/01/rdf-schema#",
 *     "xsd": "http://www.w3.org/2001/XMLSchema#",
 *   }
 * </pre>
 */
// TODO: use NamespaceMap instead of Prefixes and remove this type
export type Prefixes = Record<string, string>;
