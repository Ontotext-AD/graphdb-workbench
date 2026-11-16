import {SparqlEditorSteps} from 'steps/sparql-editor-steps';
import {YasqeSteps} from 'steps/yasgui/yasqe-steps';
import {YasrSteps} from 'steps/yasgui/yasr-steps';
import {collectAppErrors, proof, recordSideEffect, verifyRepoId} from './verify-support';

describe('verify: SPARQL query', () => {
    const repositoryId = verifyRepoId('sparql');
    const QUERY = 'SELECT ?name WHERE { ?s <urn:verify:name> ?name } ORDER BY ?name';

    before(() => {
        cy.createRepository({id: repositoryId});
        cy.importRDFTextSnippet(repositoryId,
            '<urn:verify:a> <urn:verify:name> "Alice" . <urn:verify:b> <urn:verify:name> "Bob" .');
    });
    after(() => cy.deleteRepository(repositoryId));

    function runQueryAndReadResults(proofName, sideEffectName) {
        YasqeSteps.pasteQuery(QUERY);
        YasqeSteps.executeQuery();
        YasrSteps.getResults().should('have.length', 2);
        YasrSteps.getResultCell(0, 1).should('contain', 'Alice');
        YasrSteps.getResultCell(1, 1).should('contain', 'Bob');
        YasrSteps.getResponseInfo().invoke('text').then((text) => {
            recordSideEffect(sideEffectName, {text: text.trim()});
        });
        // The result table is below the fold of the 1280x720 viewport.
        YasrSteps.getResultCell(0, 1).scrollIntoView().should('be.visible');
        proof(proofName);
    }

    it('runs a SELECT query and renders the result table', () => {
        cy.presetRepository(repositoryId);
        SparqlEditorSteps.visitSparqlEditorPageAndWaitForEditor();
        proof('01-editor-default-query');
        runQueryAndReadResults('02-results', 'response-info');
    });

    it('runs the same SELECT when the editor is opened by URL with ?repositoryId=', () => {
        // Known product issue (in Jira): the SPARQL view can throw "getHumanReadableSeconds is not a function"
        // while a query runs. Record it instead of failing; any other uncaught error still fails below.
        const appErrors = [];
        collectAppErrors(appErrors);
        // ?repositoryId= selects the repository.
        cy.visit(`/sparql?repositoryId=${repositoryId}`);
        cy.get('ontotext-yasgui .CodeMirror').should('be.visible');
        cy.get('.active-repository').should('contain', repositoryId);
        proof('03-sparql-url-editor');
        runQueryAndReadResults('04-sparql-url-results', 'sparql-url-response-info');
        cy.then(() => {
            recordSideEffect('sparql-url-uncaught-app-errors', appErrors);
            appErrors.forEach((msg) => expect(msg).to.match(/getHumanReadableSeconds is not a function/));
        });
    });
});
