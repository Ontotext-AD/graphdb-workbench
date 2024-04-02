/**
 * Represents all possible import formats for {@link ImportResourceType.URL} or {@link ImportResourceType.TEXT}.
 *
 * @type {{Turtle: string, "Turtle*": string, BinaryRDF: string, RDF_XML: string, N3: string, "N-Triples": string, TriX: string, RDF_JSON: string, NDJSON_LD: string, RDF_LD: string, "N-Quads": string, TriG: string, "TriG*": string}}
 */
export const ImportResourceFormat = {
    'RDF_JSON': 'application/rdf+json',
    'RDF_LD': 'application/ld+json',
    'NDJSON_LD': 'application/x-ld+NDjson',
    'RDF_XML': 'application/rdf+xml',
    'N3': 'text/rdf+n3',
    'N-Triples': 'text/plain',
    'N-Quads': 'text/x-nquads',
    'Turtle': 'text/turtle',
    'Turtle*': 'application/x-turtlestar',
    'TriX': 'application/trix',
    'TriG': 'application/x-trig',
    'TriG*': 'application/x-trigstar',
    'BinaryRDF': 'application/x-binary-rdf'
};
