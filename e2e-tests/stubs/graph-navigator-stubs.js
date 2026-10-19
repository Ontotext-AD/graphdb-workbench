import {Stubs} from './stubs';

export class GraphNavigatorStubs extends Stubs {
    /**
     * Makes the full-text search of the Graph Navigator settings use the GraphDB autocomplete index.
     */
    static stubSettingsWithAutocomplete() {
        cy.intercept('GET', '/rest/repositories/*/graph-navigator/settings', (req) => {
            req.continue((res) => {
                res.body.fullTextSearch.prefix = 'PREFIX auto: <http://www.ontotext.com/plugins/autocomplete#>';
            });
        }).as('graph-navigator-settings');
    }

    /**
     * Aliases the SPARQL requests that look up entities by the given text as `entity-lookup`.
     */
    static spyEntityLookup(text) {
        cy.intercept('POST', '/repositories/*', (req) => {
            // The body is form-encoded (`query=...`), so decode it to match the SPARQL text.
            const body = new URLSearchParams(String(req.body)).get('query') ?? '';
            if (body.includes('SELECT ?inst ?class ?label WHERE') && body.includes(text)) {
                req.alias = 'entity-lookup';
            }
        });
    }
}
