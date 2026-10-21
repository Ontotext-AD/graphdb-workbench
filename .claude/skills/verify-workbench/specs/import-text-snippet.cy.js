import {ImportUserDataSteps} from 'steps/import/import-user-data-steps';
import {ImportSettingsDialogSteps} from 'steps/import/import-settings-dialog-steps';
import {proof, recordSideEffect, sparqlSelect, verifyRepoId} from './verify-support';

describe('verify: import text snippet', () => {
    const repositoryId = verifyRepoId('import');
    const SNIPPET = '<urn:verify:s1> <urn:verify:p1> "imported by verify-workbench" .';

    before(() => cy.createRepository({id: repositoryId}));
    after(() => cy.deleteRepository(repositoryId));

    it('imports an RDF text snippet into the selected repository', () => {
        ImportUserDataSteps.visitUserImport(repositoryId);
        proof('01-import-user-data');

        ImportUserDataSteps.openImportTextSnippetDialog();
        ImportUserDataSteps.fillRDFTextSnippet(SNIPPET);
        proof('02-snippet-filled');
        ImportUserDataSteps.clickImportTextSnippetButton();
        proof('03-import-settings');
        ImportSettingsDialogSteps.import();
        ImportUserDataSteps.checkImportedResourceByIndex(0, 'Text snippet');
        proof('04-imported-successfully');

        // Side effect: the triple is in the repository
        sparqlSelect(repositoryId, 'SELECT ?o WHERE { <urn:verify:s1> <urn:verify:p1> ?o }').then((body) => {
            expect(body.results.bindings).to.have.length(1);
            expect(body.results.bindings[0].o.value).to.equal('imported by verify-workbench');
            recordSideEffect('triple-read-back', body);
        });
    });
});
