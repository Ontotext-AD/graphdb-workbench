import ImportSteps from "../../steps/import/import-steps";
import {ModalDialogSteps} from "../../steps/modal-dialog-steps";

const bnodes = `_:node0 <http://purl.org/dc/elements/1.1/title> "A new book" ;
                    \t<http://purl.org/dc/elements/1.1/creator> "A.N.Other" .`;
const jsonld = JSON.stringify({
    "@context": {
        "ab": "http://learningsparql.com/ns/addressbook#"
    },
    "@id": "ab:richard",
    "ab:homeTel": "(229)276-5135",
    "ab:email": "richard491@hotmail.com"
});

describe('Import user data: Import settings dialog', () => {

    let repositoryId;
    const testFiles = [
        'bnodes.ttl',
        'jsonld.json'
    ];

    beforeEach(() => {
        repositoryId = 'user-import-' + Date.now();
        cy.createRepository({id: repositoryId});
        cy.presetRepository(repositoryId);
        ImportSteps.visitImport('user', repositoryId);
    });

    afterEach(() => {
        cy.deleteUploadedFile(repositoryId, testFiles);
        cy.deleteRepository(repositoryId);
    });

    it.skip('Should prevent import when there are missing or invalid settings', () => {
        // Given I have uploaded a file

        // When the settings dialog appears

        // Then I should be able to start the import because the form is valid

        // When I switch target graph to  named graph

        // Then context field should become enabled and invalid because it is required

        // And the import button should become disabled

        // When I fill in valid IRI for context

        // Then The field should become valid

        // And the import button should become enabled

        // When I fill in invalid IRI for jsonld context link

        // Then the field should become invalid

        // When I fill in valid IRI for jsonld context link

        // Then the jsonld context link should become valid

        // When I fill in invalid IRI for base IRI

        // Then the base IRI should become invalid

        // When I fill in valid IRI for base IRI

        // Then the base IRI should become valid

    });
});
