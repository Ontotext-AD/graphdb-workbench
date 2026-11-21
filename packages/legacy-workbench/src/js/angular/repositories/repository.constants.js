export const STATIC_RULESETS = [
    {id: 'empty', name: 'No inference'},
    {id: 'rdfs-optimized', name: 'RDFS (Optimized)'},
    {id: 'rdfs-optimized-rdf12', name: 'RDFS (Optimized, RDF 1.2)'},
    {id: 'rdfs', name: 'RDFS'},
    {id: 'rdfs-rdf12', name: 'RDFS (RDF 1.2)'},
    {id: 'rdfsplus-optimized', name: 'RDFS-Plus (Optimized)'},
    {id: 'rdfsplus-optimized-rdf12', name: 'RDFS-Plus (Optimized, RDF 1.2)'},
    {id: 'owl-horst-optimized', name: 'OWL-Horst (Optimized)'},
    {id: 'owl-horst-optimized-rdf12', name: 'OWL-Horst (Optimized, RDF 1.2)'},
    {id: 'owl-horst', name: 'OWL-Horst'},
    {id: 'owl-horst-rdf12', name: 'OWL-Horst (RDF 1.2)'},
    {id: 'owl2-ql-optimized', name: 'OWL2-QL (Optimized)'},
    {id: 'owl2-ql-optimized-rdf12', name: 'OWL2-QL (Optimized, RDF 1.2)'},
    {id: 'owl2-ql', name: 'OWL2-QL'},
    {id: 'owl2-ql-rdf12', name: 'OWL2-QL (RDF 1.2)'},
    {id: 'owl-max-optimized', name: 'OWL-Max (Optimized)'},
    {id: 'owl-max-optimized-rdf12', name: 'OWL-Max (Optimized, RDF 1.2)'},
    {id: 'owl-max', name: 'OWL-Max'},
    {id: 'owl-max-rdf12', name: 'OWL-Max (RDF 1.2)'},
    {id: 'owl2-rl-optimized', name: 'OWL2-RL (Optimized)'},
    {id: 'owl2-rl-optimized-rdf12', name: 'OWL2-RL (Optimized, RDF 1.2)'},
    {id: 'owl2-rl', name: 'OWL2-RL'},
    {id: 'owl2-rl-rdf12', name: 'OWL2-RL (RDF 1.2)'},
];

export const REPOSITORY_TYPES = {graphdbRepo: 'graphdb', free: 'free', eeWorker: 'worker', eeMaster: 'master', ontop: 'ontop', se: 'se', fedx: 'fedx'};
export const FILENAME_PATTERN = /^[\w-]+$/;
export const NUMBER_PATTERN = /^\d+$/;
export const SIGNED_NUMBER_PATTERN = /^[+-]?\d+$/;
