import {SparqlDataProviderSettings} from '../../../models/graph-navigator';

// TODO: GDB-15242 remove this file together with the REST stubs.

/**
 * A copy of Reactodia's `OwlRdfsSettings`, returned by the stubbed settings endpoint.
 */
export const DEFAULT_SETTINGS_STUB: SparqlDataProviderSettings = {
  linkConfigurations: [],
  openWorldLinks: false,
  propertyConfigurations: [],
  openWorldProperties: false,
  linksInfoQuery: `SELECT ?source ?type ?target
            WHERE {
                \${linkConfigurations}
                VALUES (?source) {\${sourceIris}}
                VALUES (?target) {\${targetIris}}
            }`,
  defaultPrefix: `PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
 PREFIX rdf:  <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
 PREFIX owl:  <http://www.w3.org/2002/07/owl#>
`,
  schemaLabelProperty: 'rdfs:label',
  dataLabelProperty: 'rdfs:label',
  fullTextSearch: {
    prefix: '',
    queryPattern: `?inst \${dataLabelProperty} ?search1
        FILTER regex(COALESCE(str(?search1)), "\${text}", "i")
        BIND(0 as ?score)
`,
    extractLabel: true
  },
  classTreeQuery: `
        SELECT ?class ?label ?parent
        WHERE {
            {
                ?class a rdfs:Class
            } UNION {
                ?class a owl:Class
            }
            FILTER ISIRI(?class)
            OPTIONAL {
                ?class rdfs:label ?label
                \${labelLanguageFilter}
            }
            OPTIONAL {?class rdfs:subClassOf ?parent. FILTER ISIRI(?parent)}
        }
    `,
  classInfoQuery: `SELECT ?class ?label ?instcount WHERE {
    VALUES(?class) {\${ids}}
    OPTIONAL {
        ?class \${schemaLabelProperty} ?label
        \${labelLanguageFilter}
    }
    BIND("" as ?instcount)
}`,
  linkTypesQuery: `SELECT DISTINCT ?link ?instcount ?label WHERE {
    \${linkTypesPattern}
    OPTIONAL {
        ?link \${schemaLabelProperty} ?label
        \${labelLanguageFilter}
    }
}`,
  linkTypesPattern: `
        { ?link a rdf:Property }
        UNION
        { ?link a owl:ObjectProperty }
        BIND('' as ?instcount)
    `,
  linkTypesInfoQuery: `SELECT ?link ?label WHERE {
    VALUES(?link) {\${ids}}
    OPTIONAL {
        ?link \${schemaLabelProperty} ?label
        \${labelLanguageFilter}
    }
}`,
  propertyInfoQuery: `SELECT ?property ?label WHERE {
    VALUES(?property) {\${ids}}
    OPTIONAL {
        ?property \${schemaLabelProperty} ?label
        \${labelLanguageFilter}
    }
}`,
  elementInfoQuery: `
        CONSTRUCT {
            ?inst <urn:reactodia:sparql:type> ?class .
            ?inst <urn:reactodia:sparql:label> ?label .
            ?inst ?propType ?propValue.
        } WHERE {
            VALUES (?inst) {\${ids}}
            OPTIONAL { ?inst a ?class }
            OPTIONAL {
                ?inst \${dataLabelProperty} ?label
                \${labelLanguageFilter}
            }
            OPTIONAL {
                \${propertyConfigurations}
                FILTER (isLiteral(?propValue))
                \${valueLanguageFilter}
            }
        }
    `,
  imageQueryPattern: '{ ?inst ?linkType ?image } UNION { [] ?linkType ?inst. BIND(?inst as ?image) }',
  linkTypesOfQuery: `
        SELECT DISTINCT ?link ?direction
        WHERE {
            \${linkConfigurations}
        }
    `,
  linkTypesStatisticsQuery: `
        SELECT ?link ?outCount ?inCount
        WHERE {
            {
                SELECT (\${linkId} as ?link) (count(?outObject) as ?outCount) WHERE {
                    \${linkConfigurationOut}
                    \${navigateElementFilterOut}
                } LIMIT 101
            } {
                SELECT (\${linkId} as ?link) (count(?inObject) as ?inCount) WHERE {
                    \${linkConfigurationIn}
                    \${navigateElementFilterIn}
                } LIMIT 101
            }
        }
    `,
  lookupQuery: `SELECT \${outerProjection} WHERE {
    \${filterInnerPrelude}
    {
        SELECT DISTINCT \${innerProjection} WHERE {
            \${filterByType}
            \${filterByRefElementLink}
            \${filterByText}
            \${filterAdditionalRestriction}
        } \${orderBy} \${limit}
    }
    \${queryTypes}
    \${queryElementInfo}
} \${orderBy}`,
  filterRefElementLinkPattern: '',
  filterTypePattern: '?inst a ?instType. ?instType rdfs:subClassOf* ?class',
  filterAdditionalRestriction: '',
  filterElementInfoPattern: `
        OPTIONAL {?inst rdf:type ?foundClass}
        BIND (coalesce(?foundClass, owl:Thing) as ?class)
        OPTIONAL {
            ?inst \${dataLabelProperty} ?label
            \${labelLanguageFilter}
        }
    `
};

/**
 * A minimal placeholder Turtle file returned by the stubbed settings export.
 */
export const SETTINGS_TURTLE_STUB = `@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
@prefix gn: <http://www.ontotext.com/graph-navigator#> .

gn:settings gn:dataLabelProperty "rdfs:label" ;
    gn:schemaLabelProperty "rdfs:label" .
`;
