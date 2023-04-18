export class LuceneConnectorSteps {
    static getCreateConnectorQuery() {
        return `PREFIX luc: <http://www.ontotext.com/connectors/lucene#> ` +
                `PREFIX luc-index: <http://www.ontotext.com/connectors/lucene/instance#> ` +
                    `INSERT DATA { ` +
                        `luc-index:my_index luc:createConnector ''' { ` +
                            `"types": [` +
                                `"http://www.ontotext.com/example/wine#Wine"` +
                            `],` +
                            `"fields": [` +
                                `{` +
                                    `"fieldName": "grape", ` +
                                    `"propertyChain": [` +
                                        `"http://www.ontotext.com/example/wine#madeFromGrape", ` +
                                        `"http://www.w3.org/2000/01/rdf-schema#label"` +
                                     `]` +
                                `}, {` +
                                    `"fieldName": "sugar", ` +
                                    `"analyzed": false,` +
                                    `"multivalued": false,` +
                                    `"propertyChain": [` +
                                        `"http://www.ontotext.com/example/wine#hasSugar"` +
                                        `]` +
                                `}, { ` +
                                    `"fieldName": "year", ` +
                                    `"analyzed": false, ` +
                                    `"propertyChain": [` +
                                        `"http://www.ontotext.com/example/wine#hasYear"` +
                                    `]` +
                                `}` +
                            `]` +
                        `}''' ` +
                `.}`;
    }

    static getDeleteConnectorSteps() {
        return `PREFIX luc: <http://www.ontotext.com/connectors/lucene#>` +
                `PREFIX luc-index: <http://www.ontotext.com/connectors/lucene/instance#>` +
                `INSERT DATA {` +
                `  luc-index:my_index luc:dropConnector [] .` +
                `}`;
    }
}
