import {ImportUserDataSteps} from "../../steps/import/import-user-data-steps";
import {ImportSettingsDialogSteps} from "../../steps/import/import-settings-dialog-steps";

const RDF_TEXT_SNIPPET = '<urn:s1> <urn:p1> <urn:o1>.';
const RDF_XML_WITH_DOCTYPE_SNIPPET = '<?xml version="1.0"?>\n' +
    '<!DOCTYPE rdf:RDF [<!ENTITY ex "http://example.com/">]>\n' +
    '<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:ex="http://example.com/">\n' +
    '    <rdf:Description rdf:about="&ex;subject"><ex:predicate>object</ex:predicate></rdf:Description>\n' +
    '</rdf:RDF>';
const RDF_XML_FORMAT = 'RDF/XML';
const TEXT_SNIPPET = 'Text snippet';

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
        ImportUserDataSteps.visitImport('user', repositoryId);
    });

    afterEach(() => {
        cy.deleteUploadedFile(repositoryId, testFiles);
        cy.deleteRepository(repositoryId);
    });

    it('Should disallow DOCTYPE declarations by default', () => {
        // Given I have opened the import settings dialog for a text snippet
        ImportUserDataSteps.interceptTextSnippetImport(repositoryId);
        ImportUserDataSteps.openTextSnippetImportSettings(RDF_TEXT_SNIPPET);
        // When I expand the advanced settings
        ImportSettingsDialogSteps.expandAdvancedSettings();
        // Then the DOCTYPE declarations option should be checked
        ImportSettingsDialogSteps.getDisallowDoctypeDeclCheckbox().should('be.checked');
        // When I start the import
        ImportSettingsDialogSteps.import();
        // Then DOCTYPE declarations should be disallowed in the request
        ImportUserDataSteps.waitForTextSnippetImportSettings()
            .its('parserSettings.disallowDoctypeDecl').should('equal', true);
    });

    it('Should allow DOCTYPE declarations when the option is unchecked', () => {
        // Given I have opened the import settings dialog for a text snippet
        ImportUserDataSteps.interceptTextSnippetImport(repositoryId);
        ImportUserDataSteps.openTextSnippetImportSettings(RDF_TEXT_SNIPPET);
        ImportSettingsDialogSteps.expandAdvancedSettings();
        // When I uncheck the DOCTYPE declarations option and start the import
        ImportSettingsDialogSteps.allowDoctypeDeclarations();
        ImportSettingsDialogSteps.import();
        // Then DOCTYPE declarations should be allowed in the request
        ImportUserDataSteps.waitForTextSnippetImportSettings()
            .its('parserSettings.disallowDoctypeDecl').should('equal', false);
    });

    it('Should restore the DOCTYPE declarations option to its default', () => {
        // Given I have opened the import settings dialog for a text snippet
        ImportUserDataSteps.openTextSnippetImportSettings(RDF_TEXT_SNIPPET);
        ImportSettingsDialogSteps.expandAdvancedSettings();
        // And I have unchecked the DOCTYPE declarations option
        ImportSettingsDialogSteps.allowDoctypeDeclarations();
        ImportSettingsDialogSteps.getDisallowDoctypeDeclCheckbox().should('not.be.checked');
        // When I restore the default settings
        ImportSettingsDialogSteps.restoreDefaults();
        // Then the DOCTYPE declarations option should be checked again
        ImportSettingsDialogSteps.getDisallowDoctypeDeclCheckbox().should('be.checked');
    });

    it('Should reject RDF/XML with a DOCTYPE declaration by default', () => {
        // Given I have opened the import settings dialog for an RDF/XML snippet with a DOCTYPE declaration
        ImportUserDataSteps.openTextSnippetImportSettings(RDF_XML_WITH_DOCTYPE_SNIPPET, RDF_XML_FORMAT);
        // When I start the import with the default settings
        ImportSettingsDialogSteps.import();
        // Then the import should fail, because DOCTYPE declarations are disallowed
        ImportUserDataSteps.checkImportedResourceByIndex(0, TEXT_SNIPPET, 'DOCTYPE is disallowed');
    });

    it('Should import RDF/XML with a DOCTYPE declaration when DOCTYPE declarations are allowed', () => {
        // Given I have opened the import settings dialog for an RDF/XML snippet with a DOCTYPE declaration
        ImportUserDataSteps.openTextSnippetImportSettings(RDF_XML_WITH_DOCTYPE_SNIPPET, RDF_XML_FORMAT);
        ImportSettingsDialogSteps.expandAdvancedSettings();
        // When I allow DOCTYPE declarations and start the import
        ImportSettingsDialogSteps.allowDoctypeDeclarations();
        ImportSettingsDialogSteps.import();
        // Then the import should succeed
        ImportUserDataSteps.checkImportedResourceByIndex(0, TEXT_SNIPPET);

        // When I open the import settings dialog for the same snippet again
        ImportUserDataSteps.importFile(0);
        ImportSettingsDialogSteps.expandAdvancedSettings();
        // Then the saved DOCTYPE declarations option should be restored
        ImportSettingsDialogSteps.getDisallowDoctypeDeclCheckbox().should('not.be.checked');

        // When I restore the default settings
        ImportSettingsDialogSteps.restoreDefaults();
        // Then the DOCTYPE declarations option should be reset to the backend default, not to the saved value
        ImportSettingsDialogSteps.getDisallowDoctypeDeclCheckbox().should('be.checked');
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
