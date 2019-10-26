angular.module('graphdb.workbench.utils.filetypes', [])
    .value('FileTypes', [
        {name: 'JSON', type: 'application/rdf+json', extension: '.json'},
        {name: 'JSON-LD', type: 'application/ld+json', extension: '.jsonld'},
        {name: 'RDF-XML', type: 'application/rdf+xml', extension: '.rdf'},
        {name: 'N3', type: 'text/rdf+n3', extension: '.n3'},
        {name: 'N-Triples', type: 'text/plain', extension: '.nt'},
        {name: 'N-Quads', type: 'text/x-nquads', extension: '.nq'},
        {name: 'Turtle', type: 'text/turtle', extension: '.ttl'},
        {name: 'TriX', type: 'application/trix', extension: '.trix'},
        {name: 'TriG', type: 'application/x-trig', extension: '.trig'},
        {name: 'Binary RDF', type: 'application/x-binary-rdf', extension: '.brf'}
    ]);
