import {SparqlEditorSteps} from "../../../steps/sparql-editor-steps";
import {YasguiSteps} from "../../../steps/yasgui/yasgui-steps";
import {QueryStubs} from "../../../stubs/yasgui/query-stubs";
import {YasqeSteps} from "../../../steps/yasgui/yasqe-steps";

describe('Execute query', () => {

    let repositoryId;

    beforeEach(() => {
        repositoryId = 'sparql-editor-' + Date.now();
        QueryStubs.stubQueryCountResponse();
        cy.createRepository({id: repositoryId});
        cy.presetRepository(repositoryId);
        QueryStubs.stubDefaultQueryResponse(repositoryId);

        SparqlEditorSteps.visitSparqlEditorPage();
        YasguiSteps.getYasgui().should('be.visible');
    });

    afterEach(() => {
        cy.deleteRepository(repositoryId);
    });

    it('Should be able to execute query from each editor tab', () => {
        cy.intercept('POST', `/repositories/${repositoryId}`).as('query');
        YasqeSteps.executeQuery();
        cy.wait('@query').then((interception) => {
            const headers = interception.request.headers;
            expect(headers).to.have.property('x-graphdb-local-consistency');
            expect(headers).to.have.property('x-graphdb-repository-location');
            expect(headers).to.have.property('x-graphdb-track-alias');
        });
        YasguiSteps.openANewTab();
        YasguiSteps.getTabs().should('have.length', 2);
        YasqeSteps.executeQuery();
        cy.wait('@query').then((interception) => {
            const headers = interception.request.headers;
            expect(headers).to.have.property('x-graphdb-local-consistency');
            expect(headers).to.have.property('x-graphdb-repository-location');
            expect(headers).to.have.property('x-graphdb-track-alias');
        });
    });
});
