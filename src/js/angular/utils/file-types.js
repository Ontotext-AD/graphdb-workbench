angular.module('graphdb.workbench.utils.filetypes', [])
    .value('FileTypes', [
        {name: 'JSON', type: 'application/rdf+json', extension: '.json'},
        {name: 'JSON-LD', type: 'application/ld+json', extension: '.jsonld'},
        {name: 'NDJSON-LD', type: 'application/x-ld+ndjson', extension: '.ndjsonld'},
        {name: 'RDF-XML', type: 'application/rdf+xml', extension: '.rdf'},
        {name: 'N3', type: 'text/rdf+n3', extension: '.n3'},
        {name: 'N-Triples', type: 'text/plain', extension: '.nt'},
        {name: 'N-Quads', type: 'text/x-nquads', extension: '.nq'},
        {name: 'Turtle', type: 'text/turtle', extension: '.ttl'},
        {name: 'Turtle*', type: 'application/x-turtlestar', extension: '.ttls'},
        {name: 'TriX', type: 'application/trix', extension: '.trix'},
        {name: 'TriG', type: 'application/x-trig', extension: '.trig'},
        {name: 'TriG*', type: 'application/x-trigstar', extension: '.trigs'},
        {name: 'Binary RDF', type: 'application/x-binary-rdf', extension: '.brf'}
    ]);
