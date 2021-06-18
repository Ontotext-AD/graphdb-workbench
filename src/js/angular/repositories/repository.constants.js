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

export const REPOSITORY_TYPES = {free: 'free', eeWorker: 'worker', eeMaster: 'master', ontop: 'ontop', se: 'se', fedx: 'fedx'};
export const FILENAME_PATTERN = new RegExp('^[a-zA-Z0-9-_]+$');
export const NUMBER_PATTERN = new RegExp('[0-9]');

export const REPO_TOOLTIPS = {
    id: "Unique identifier for the repository. The ID must contain only letters (a-z, A-Z), numbers (0-9), '-' and '_'.",
    title: "Human readable description of the repository.",
    readOnly: "Protects the repository against any changes.",
    ruleset: "Sets of axiomatic triples, consistency checks and entailment rules, " +
        "which determine the applied semantics with a PIE file.",
    rulesetWarnings: {
        needsSameAs: "Disabling owl:sameAs for this ruleset may cause incomplete inference with owl:sameAs statements.",
        doesntNeedSameAs: "This ruleset does not need owl:sameAs, consider disabling it.",
        customRuleset: "If the custom ruleset does not use owl:sameAs, consider disabling it. <br>" +
            "If the ruleset uses owl:sameAs, disabling it may cause incomplete inference with owl:sameAs statements."
    },
    disableSameAs: "GraphDB uses a non-rule implementation of owl:sameAs, " +
        "which can be enabled or disabled independently of the ruleset.",
    checkForInconsistencies: "Enables the consistency checks from the ruleset.",
    isShacl: "Enables support for SHACL validation.",
    shaclOptions: {
        cacheSelectNodes: "The SHACL implementation retrieves a lot of its relevant data through running " +
            "SPARQL Select queries against the repository and against the changes in the transaction. " +
            "This is usually good for performance, but while validating large amounts of data disabling this cache will use less memory.",
        undefinedTargetValidatesAllSubjects: "If no target is defined for a NodeShape, that NodeShape will be ignored. " +
            "Enabling this will make such NodeShapes wildcard shapes and validate all subjects. " +
            "Equivalent to setting sh:targetClass to owl:Thing or rdfs:Resource in an environment with a reasoner.",
        logValidationPlans: "Log (INFO) the executed validation plans as GraphViz DOT. " +
            "It is recommended to disable parallel validation when this is enabled.",
        logValidationViolations: "Log (INFO) a list of violations and the triples that caused the violations. " +
            "It is recommended to disable parallel validation when this is enabled.",
        parallelValidation: "Run SHACL validation in parallel.",
        globalLogValidationExecution: "Log (INFO) every execution step of the SHACL validation. " +
            "This is fairly costly and should not be used in production. " +
            "It is recommended to disable parallel validation when this is enabled.",
        performanceLogging: "Log (INFO) the execution time per shape. " +
            "It is recommended to disable parallel validation and caching of select nodes when this is enabled.",
        eclipseRdf4jShaclExtensions: "Activates RDF4J's SHACL extensions that provide additional functionality (experimental).",
        dashDataShapes: "Activates DASH Data Shapes extensions that provide additional functionality (experimental)."
    },
    entityIdSize: "Defines the bit size of internal IDs used to index entities (URIs, blank nodes, literals, and RDF* embedded triples)." +
        "<br>Use 40 bit ID only if you expect more than 2 billion unique RDF values.",
    enableContextIndex: "Builds an additional Context-Predicate-Subject-Object index to boost the " +
        "SPARQL query performance of queries with GRAPH/FROM/FROM NAMED clauses.",
    enablePredicateList: "Enables the mappings from an entity (subject or object) to its predicates; " +
        "enabling it can significantly speed up queries that use wildcard predicate patterns.",
    queryTimeout: "Sets the number of seconds after which the evaluation of a query will be terminated; " +
        "values less than or equal to zero mean no limit.",
    throwQueryEvaluationExceptionOnTimeout: "Repository throws QueryEvaluationException when the duration of a query execution " +
        "exceeds the timeout parameter.",
    queryLimitResults: "Sets the maximum number of results returned from a query after which the evaluation of " +
        "a query will be terminated; values less than or equal to zero mean no limit.",
    nonInterpretablePredicates: "Semicolon-delimited list of predicates (full URIs) that GraphDB will not try to process " +
        "with the registered GraphDB plugins.",
    ontop: {
        driverType: "Determines the type of SQL database to connect to.",
        propertiesFile: "Describes the JDBC configuration such as hostname and database name to connect to.",
        hostName: 'The JDBC hostname to connect to.',
        port: "The JDBC port to connect to if different from the default for the chosen JDBC driver.",
        portIfRequired: "The JDBC port to connect to.",
        databaseName: 'The database name to connect to.',
        userName: 'The username to use for the JDBC connection.',
        password: 'The password to use for the JDBC connection.',
        driverClass: 'Classname of the chosen JDBC driver. It must be on the classpath (in the lib directory).',
        driverClassWarning: "JDBC driver not found in the classpath, please save it in the lib directory and restart GraphDB",
        url: 'The JDBC URL that will be used. It is constructed using the supplied hostname, port and database name.',
        obdaFile: "Describes the mapping from SQL to RDF in either the OBDA or the R2RML format.",
        owlFile: "Specifies relations between the classes and properties in the cosntructed RDF graph. " +
            "It can be in any supported RDF format.",
        constraintFile: "Specifies override of SQL primary and foreign keys.",
        testConn: "Attempts to establish a connection to the SQL database to test if the supplied configuration is correct."
    }
};
