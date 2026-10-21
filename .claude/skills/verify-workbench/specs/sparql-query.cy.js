import {SparqlEditorSteps} from 'steps/sparql-editor-steps';
import {YasqeSteps} from 'steps/yasgui/yasqe-steps';
import {YasrSteps} from 'steps/yasgui/yasr-steps';
import {proof, recordSideEffect, verifyRepoId} from './verify-support';

describe('verify: SPARQL query', () => {
    const repositoryId = verifyRepoId('sparql');

    before(() => {
        cy.createRepository({id: repositoryId});
        cy.importRDFTextSnippet(repositoryId,
            '<urn:verify:a> <urn:verify:name> "Alice" . <urn:verify:b> <urn:verify:name> "Bob" .');
    });
    after(() => cy.deleteRepository(repositoryId));

    it('runs a SELECT query and renders the result table', () => {
        cy.presetRepository(repositoryId);
        SparqlEditorSteps.visitSparqlEditorPageAndWaitForEditor();
        proof('01-editor-default-query');

        YasqeSteps.pasteQuery('SELECT ?name WHERE { ?s <urn:verify:name> ?name } ORDER BY ?name');
        YasqeSteps.executeQuery();
        YasrSteps.getResults().should('have.length', 2);
        YasrSteps.getResultCell(0, 1).should('contain', 'Alice');
        YasrSteps.getResultCell(1, 1).should('contain', 'Bob');
        YasrSteps.getResponseInfo().invoke('text').then((text) => {
            recordSideEffect('response-info', {text: text.trim()});
        });
        // The result table is below the fold of the 1280x720 viewport.
        YasrSteps.getResultCell(0, 1).scrollIntoView().should('be.visible');
        proof('02-results');
    });
});
