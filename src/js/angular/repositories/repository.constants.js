export const STATIC_RULESETS = [
    {id: 'empty', name: 'No inference'},
    {id: 'rdfs-optimized', name: 'RDFS (Optimized)'},
    {id: 'rdfs', name: 'RDFS'},
    {id: 'rdfsplus-optimized', name: 'RDFS-Plus (Optimized)'},
    {id: 'owl-horst-optimized', name: 'OWL-Horst (Optimized)'},
    {id: 'owl-horst', name: 'OWL-Horst'},
    {id: 'owl2-ql-optimized', name: 'OWL2-QL (Optimized)'},
    {id: 'owl2-ql', name: 'OWL2-QL'},
    {id: 'owl-max-optimized', name: 'OWL-Max (Optimized)'},
    {id: 'owl-max', name: 'OWL-Max'},
    {id: 'owl2-rl-optimized', name: 'OWL2-RL (Optimized)'},
    {id: 'owl2-rl', name: 'OWL2-RL'},

];

export const REPOSITORY_TYPES = {graphdbRepo: 'graphdb', free: 'free', eeWorker: 'worker', eeMaster: 'master', ontop: 'ontop', se: 'se', fedx: 'fedx'};
export const FILENAME_PATTERN = new RegExp('^[a-zA-Z0-9-_]+$');
export const NUMBER_PATTERN = new RegExp('^[0-9]+$');
