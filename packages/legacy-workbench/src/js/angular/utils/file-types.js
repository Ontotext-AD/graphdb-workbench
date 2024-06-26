angular.module('graphdb.workbench.utils.filetypes', [])
    .value('FileTypes', [
        {name: 'JSON', translateKey: 'download.as.json', type: 'application/rdf+json', extension: '.json'},
        {name: 'JSON-LD', translateKey: 'download.as.jsonld', type: 'application/ld+json', extension: '.jsonld'},
        {name: 'NDJSON-LD', translateKey: 'download.as.ndjsonld', type: 'application/x-ld+ndjson', extension: '.ndjsonld'},
        {name: 'RDF-XML', translateKey: 'download.as.rdfxml', type: 'application/rdf+xml', extension: '.rdf'},
        {name: 'N3', translateKey: 'download.as.n3', type: 'text/rdf+n3', extension: '.n3'},
        {name: 'N-Triples', translateKey: 'download.as.ntriples', type: 'text/plain', extension: '.nt'},
        {name: 'N-Quads', translateKey: 'download.as.nquads', type: 'text/x-nquads', extension: '.nq'},
        {name: 'Turtle', translateKey: 'download.as.turtle', type: 'text/turtle', extension: '.ttl'},
        {name: 'Turtle*', translateKey: 'download.as.turtlestar', type: 'application/x-turtlestar', extension: '.ttls'},
        {name: 'TriX', translateKey: 'download.as.trix', type: 'application/trix', extension: '.trix'},
        {name: 'TriG', translateKey: 'download.as.trig', type: 'application/x-trig', extension: '.trig'},
        {name: 'TriG*', translateKey: 'download.as.trigstar', type: 'application/x-trigstar', extension: '.trigs'},
        {name: 'Binary RDF', translateKey: 'download.as.binaryrdf', type: 'application/x-binary-rdf', extension: '.brf'}
    ]);
