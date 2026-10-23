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
}
