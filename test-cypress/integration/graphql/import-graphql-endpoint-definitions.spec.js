import {GraphqlEndpointManagementSteps} from "../../steps/graphql/graphql-endpoint-management-steps";
import {ImportEndpointDefinitionModalSteps} from "../../steps/graphql/import-endpoint-definition-modal-steps";

describe('Graphql: import endpoint definitions', () => {
    let repositoryId;
    const swapiDefinitionPath = 'graphql/soml/swapi-schema.yaml';
    const swapiPlanetsDefinitionPath = 'graphql/soml/swapi-schema-planets.yaml';
    const brokenSwapiDefinitionPath = 'graphql/soml/swapi-schema-broken.yaml';
    const swapiDefinitionZipPath = 'graphql/soml/swapi-schema.zip';

    beforeEach(() => {
        repositoryId = 'graphql-endpoint-management-' + Date.now();
        cy.createRepository({id: repositoryId});
        cy.presetRepository(repositoryId);
    });

    afterEach(() => {
        cy.deleteRepository(repositoryId);
    });

    it('should be able to open the import definition modal', () => {
        visitAndOpenImportModal();
        ImportEndpointDefinitionModalSteps.getUploadButton().should('be.visible').and('be.disabled');
        ImportEndpointDefinitionModalSteps.getAbortButton().should('be.visible').and('be.disabled');
        // When I close the modal
        ImportEndpointDefinitionModalSteps.close();
        // Then the modal should be closed and no endpoints should be visible
        ImportEndpointDefinitionModalSteps.getDialog().should('not.exist');
        GraphqlEndpointManagementSteps.getNoEndpointsInRepositoryBanner().should('be.visible');
    });

    it('should be able to import an endpoint definition', () => {
        visitAndOpenImportModal();
        // When I select the file to upload
        ImportEndpointDefinitionModalSteps.selectFile(swapiDefinitionPath);
        // Then the upload button should be enabled
        ImportEndpointDefinitionModalSteps.getUploadButton().should('be.enabled');
        // And the abort button should be disabled until the upload starts
        ImportEndpointDefinitionModalSteps.getAbortButton().should('be.disabled');
        // And I should see the selected file in the modal
        ImportEndpointDefinitionModalSteps.getSelectedFiles().should('have.length', 1);
        ImportEndpointDefinitionModalSteps.getSelectedFileName(0).should('contain', 'swapi-schema.yaml');
        // And I should see the remove selected file button
        ImportEndpointDefinitionModalSteps.getRemoveSelectedFileButton(0).should('be.visible').and('be.enabled');
        // When I remove the selected file
        ImportEndpointDefinitionModalSteps.removeSelectedFile(0);
        // Then the selected file should be removed
        ImportEndpointDefinitionModalSteps.getSelectedFiles().should('have.length', 0);
        // And the upload button should be disabled
        ImportEndpointDefinitionModalSteps.getUploadButton().should('be.disabled');
        // When I select the file to upload again
        ImportEndpointDefinitionModalSteps.selectFile(swapiDefinitionPath);
        ImportEndpointDefinitionModalSteps.getUploadButton().should('be.enabled');
        ImportEndpointDefinitionModalSteps.getSelectedFileName(0).should('contain', 'swapi-schema.yaml');

        // When I click the upload button
        ImportEndpointDefinitionModalSteps.upload();
        // Then I should see the import progress
        ImportEndpointDefinitionModalSteps.getProgressBar().should('be.visible');

        // Wait a bit before checking the progress again
        cy.wait(1000);
        // When the upload is finished
        ImportEndpointDefinitionModalSteps.getProgressBar().should('be.hidden');

        // When I close the modal
        ImportEndpointDefinitionModalSteps.close();
        // Then the modal should be closed and the endpoint should be visible
        ImportEndpointDefinitionModalSteps.getDialog().should('not.exist');
        GraphqlEndpointManagementSteps.getEndpointsInfo().should('have.length', 1);

        GraphqlEndpointManagementSteps.verifyEndpointInfo([
            {
                id: 'swapi',
                label: 'Ontotext Star Wars Ontology',
                description: '',
                default: true,
                active: true,
                modified: new Date().toISOString().split('T')[0],
                types: 56,
                properties: 68
            }
        ]);
    });

    it('should be able to import broken endpoint definition', () => {
        visitAndOpenImportModal();
        // When I select the file to upload
        ImportEndpointDefinitionModalSteps.selectFile(brokenSwapiDefinitionPath);
        // And I should see the selected file in the modal
        ImportEndpointDefinitionModalSteps.getSelectedFiles().should('have.length', 1);
        ImportEndpointDefinitionModalSteps.getSelectedFileName(0).should('contain', 'swapi-schema-broken.yaml');
        // When I click the upload button
        ImportEndpointDefinitionModalSteps.upload();
        // Then I should see the import progress
        ImportEndpointDefinitionModalSteps.getProgressBar().should('be.visible');
        // Wait a bit before checking the progress again
        cy.wait(1000);
        // When the upload is finished I should see error message
        ImportEndpointDefinitionModalSteps.getProgressBar().should('be.visible');
        ImportEndpointDefinitionModalSteps.getValidationErrors().should('be.visible');
        ImportEndpointDefinitionModalSteps.getValidationError(0).should('contain', 'ERROR: mapping values are not allowed here line 24, column 10');
        ImportEndpointDefinitionModalSteps.getImportStatus(0).should('have.class', 'failed');
        // When I close the modal
        ImportEndpointDefinitionModalSteps.close();
        // Then the modal should be closed and no endpoints should be visible
        ImportEndpointDefinitionModalSteps.getDialog().should('not.exist');
    });

    it('should be able to import multiple definitions at once', () => {
        visitAndOpenImportModal();
        // When I select the file to upload
        ImportEndpointDefinitionModalSteps.selectFile([swapiDefinitionPath, swapiPlanetsDefinitionPath]);
        // And I should see the selected files in the modal
        ImportEndpointDefinitionModalSteps.getSelectedFiles().should('have.length', 2);
        ImportEndpointDefinitionModalSteps.getSelectedFileName(0).should('contain', 'swapi-schema.yaml');
        ImportEndpointDefinitionModalSteps.getSelectedFileName(1).should('contain', 'swapi-schema-planets.yaml');
        // When I click the upload button
        ImportEndpointDefinitionModalSteps.upload();
        // Then I should see the import progress
        ImportEndpointDefinitionModalSteps.getProgressBar().should('be.visible');
        // Wait a bit before checking the progress again
        cy.wait(1000);
        // When the upload is finished
        ImportEndpointDefinitionModalSteps.getProgressBar().should('be.hidden');
        ImportEndpointDefinitionModalSteps.getImportStatus(0).should('have.class', 'success');
        ImportEndpointDefinitionModalSteps.getImportStatus(1).should('have.class', 'success');
        // When I close the modal
        ImportEndpointDefinitionModalSteps.close();
        // Then the modal should be closed and the endpoints should be visible
        ImportEndpointDefinitionModalSteps.getDialog().should('not.exist');
        GraphqlEndpointManagementSteps.getEndpointsInfo().should('have.length', 2);

        GraphqlEndpointManagementSteps.verifyEndpointInfo([
            {
                id: 'swapi',
                label: 'Ontotext Star Wars Ontology',
                description: '',
                default: true,
                active: true,
                modified: new Date().toISOString().split('T')[0],
                types: 56,
                properties: 68
            },
            {
                id: 'swapi-planets',
                label: 'Star Wars planets API',
                description: '',
                default: false,
                active: true,
                modified: new Date().toISOString().split('T')[0],
                types: 1,
                properties: 10
            }
        ]);
    });

    it('should be able to upload definitions in zip archive', () => {
        visitAndOpenImportModal();
        // When I select the zip file to upload
        ImportEndpointDefinitionModalSteps.selectFile(swapiDefinitionZipPath);
        // And I should see the selected file in the modal
        ImportEndpointDefinitionModalSteps.getSelectedFiles().should('have.length', 1);
        ImportEndpointDefinitionModalSteps.getSelectedFileName(0).should('contain', 'swapi-schema.zip');
        // When I click the upload button
        ImportEndpointDefinitionModalSteps.upload();
        // Then I should see the import progress
        ImportEndpointDefinitionModalSteps.getProgressBar().should('be.visible');
        // Wait a bit before checking the progress again
        cy.wait(1000);
        // When the upload is finished
        // TODO: find out why sometimes for zip import the progress remains open!!!
        // ImportEndpointDefinitionModalSteps.getProgressBar().should('be.hidden');
        ImportEndpointDefinitionModalSteps.getImportStatus(0).should('have.class', 'success');
        // When I close the modal
        ImportEndpointDefinitionModalSteps.close();
        // Then the modal should be closed and the endpoint should be visible
        ImportEndpointDefinitionModalSteps.getDialog().should('not.exist');
        GraphqlEndpointManagementSteps.getEndpointsInfo().should('have.length', 1);
        GraphqlEndpointManagementSteps.verifyEndpointInfo([
            {
                id: 'swapi',
                label: 'Ontotext Star Wars Ontology',
                description: '',
                default: true,
                active: true,
                modified: new Date().toISOString().split('T')[0],
                types: 56,
                properties: 68
            }
        ]);
    });
});

function visitAndOpenImportModal() {
    // Given I have a repository without GraphQL endpoints
    // And I have visited the endpoint management view
    GraphqlEndpointManagementSteps.visit();
    GraphqlEndpointManagementSteps.getNoEndpointsInRepositoryBanner().should('be.visible');
    // When I open the import modal
    GraphqlEndpointManagementSteps.openImportModal();
    ImportEndpointDefinitionModalSteps.getDialog().should('be.visible');
    ImportEndpointDefinitionModalSteps.getFileselectorButton().should('be.visible').and('be.enabled');
}
