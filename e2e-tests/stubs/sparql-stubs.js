import {Stubs} from './stubs.js';

export class SparqlStubs extends Stubs {
    static spyAddKnownPrefixes() {
        cy.intercept('/rest/sparql/add-known-prefixes', {
            method: 'POST',
            body: 'PREFIX voc: <https://swapi.co/vocabulary/> SELECT ?name ?height WHERE { ?character voc:height ?height; rdfs:label ?name. FILTER(?name = "Luke Skywalker" || ?name = "Leia Organa") }'
        }).as('addKnownPrefixes')
    }
}
