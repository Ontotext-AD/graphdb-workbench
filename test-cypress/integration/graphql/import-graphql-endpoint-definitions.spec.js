import {GraphqlEndpointManagementSteps} from "../../steps/graphql/graphql-endpoint-management-steps";
import {ImportEndpointDefinitionModalSteps} from "../../steps/graphql/import-endpoint-definition-modal-steps";
import {GenerationReportModalSteps} from "../../steps/graphql/generation-report-modal-steps";

describe('Graphql: import endpoint definitions', () => {
    let repositoryId;
    const swapiDefinitionPath = 'graphql/soml/swapi-schema.yaml';
    const swapiPlanetsDefinitionPath = 'graphql/soml/swapi-schema-planets.yaml';
    const brokenSwapiDefinitionPath = 'graphql/soml/swapi-schema-broken.yaml';
    const swapiDefinitionZipPath = 'graphql/soml/swapi-schemas.zip';

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
        // And I should see the selected file in the modal
        ImportEndpointDefinitionModalSteps.getSelectedFiles().should('have.length', 1);
        ImportEndpointDefinitionModalSteps.getSelectedFileName(0).should('contain', 'swapi-schema.yaml');
        ImportEndpointDefinitionModalSteps.getSelectedFileSize(0).should('contain', '23.4 kB');
        ImportEndpointDefinitionModalSteps.getImportStatus(0).should('contain', 'Pending');
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
        // TODO: This check makes the test flaky, because the progress bar might disappear before the check
        // ImportEndpointDefinitionModalSteps.getProgressBar().should('be.visible');
        // And I should see the import status for the imported definition file
        ImportEndpointDefinitionModalSteps.getImportStatus(0).should('contain', 'Created');
        // And I should see the generated endpoint link
        ImportEndpointDefinitionModalSteps.getGeneratedEndpointLink(0).should('be.visible');

        // When I close the modal
        ImportEndpointDefinitionModalSteps.close();
        // Then the modal should be closed and the endpoint should be visible
        ImportEndpointDefinitionModalSteps.getDialog().should('not.exist');
        GraphqlEndpointManagementSteps.getEndpointsInfo().should('have.length', 1);

        GraphqlEndpointManagementSteps.verifyEndpointInfo([
            {
                status: 'deleted',
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
        ImportEndpointDefinitionModalSteps.getImportStatus(0).should('contain', 'Pending');
        // When I click the upload button
        ImportEndpointDefinitionModalSteps.upload();
        // Then I should see the import progress
        // TODO: This check makes the test flaky, because the progress bar might disappear before the check
        // ImportEndpointDefinitionModalSteps.getProgressBar().should('be.visible');
        // And I should see the import status for the imported definition file
        ImportEndpointDefinitionModalSteps.getImportStatus(0).should('contain', 'Failed');
        // And I should see the generated endpoint link
        ImportEndpointDefinitionModalSteps.getGeneratedEndpointLink(0).should('not.exist');
        // And I should see the generation report link
        ImportEndpointDefinitionModalSteps.getReportLink(0).should('be.visible');

        // When I click the report link
        ImportEndpointDefinitionModalSteps.openReport(0);
        // Then I should see the report modal
        GenerationReportModalSteps.getDialog().should('be.visible');
        // And I should see the report content
        GenerationReportModalSteps.getDialogBody().should('be.visible');
        GenerationReportModalSteps.getErrorsCount().should('contain', '1');
        GenerationReportModalSteps.getWarningsCount().should('contain', '0');
        GenerationReportModalSteps.getErrors().should('have.length', 1);
        GenerationReportModalSteps.closeChildModal();
        // Then the report modal should be closed
        GenerationReportModalSteps.getDialog().should('not.exist');

        // When I close the modal
        ImportEndpointDefinitionModalSteps.close();
        // Then the modal should be closed and no endpoints should be visible
        ImportEndpointDefinitionModalSteps.getDialog().should('not.exist');
        // And no endpoints should be visible
        GraphqlEndpointManagementSteps.getNoEndpointsInRepositoryBanner().should('be.visible');
    });

    it('should be able to import multiple definitions at once', () => {
        visitAndOpenImportModal();
        // When I select the file to upload
        ImportEndpointDefinitionModalSteps.selectFile([swapiDefinitionPath, swapiPlanetsDefinitionPath]);
        // And I should see the selected files in the modal
        ImportEndpointDefinitionModalSteps.getSelectedFiles().should('have.length', 2);
        ImportEndpointDefinitionModalSteps.getSelectedFileName(0).should('contain', 'swapi-schema.yaml');
        ImportEndpointDefinitionModalSteps.getImportStatus(0).should('contain', 'Pending');
        ImportEndpointDefinitionModalSteps.getSelectedFileName(1).should('contain', 'swapi-schema-planets.yaml');
        ImportEndpointDefinitionModalSteps.getImportStatus(1).should('contain', 'Pending');
        // When I click the upload button
        ImportEndpointDefinitionModalSteps.upload();
        // Then I should see the import progress
        // TODO: This check makes the test flaky, because the progress bar might disappear before the check
        // ImportEndpointDefinitionModalSteps.getProgressBar().should('be.visible');
        // And I should see the import status for the imported definition files
        ImportEndpointDefinitionModalSteps.getImportStatus(0).should('contain', 'Created');
        ImportEndpointDefinitionModalSteps.getImportStatus(1).should('contain', 'Created');
        // When I close the modal
        ImportEndpointDefinitionModalSteps.close();
        // Then the modal should be closed and the endpoints should be visible
        ImportEndpointDefinitionModalSteps.getDialog().should('not.exist');
        GraphqlEndpointManagementSteps.getEndpointsInfo().should('have.length', 2);

        GraphqlEndpointManagementSteps.verifyEndpointInfo([
            {
                status: 'deleted',
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
                status: 'deleted',
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
        ImportEndpointDefinitionModalSteps.getSelectedFileName(0).should('contain', 'swapi-schemas.zip');
        ImportEndpointDefinitionModalSteps.getImportStatus(0).should('contain', 'Pending');
        // When I click the upload button
        ImportEndpointDefinitionModalSteps.upload();
        // Then I should see the import progress
        // TODO: This check makes the test flaky, because the progress bar might disappear before the check
        // ImportEndpointDefinitionModalSteps.getProgressBar().should('be.visible');

        // And I should see the import status for the imported definition files
        // The status for the zip file should not be displayed, because we care only about the files inside it
        ImportEndpointDefinitionModalSteps.getImportStatus(0).should('not.exist');
        ImportEndpointDefinitionModalSteps.getImportStatus(1).should('contain', 'Failed');
        ImportEndpointDefinitionModalSteps.getReportLink(1).should('be.visible');
        ImportEndpointDefinitionModalSteps.getImportStatus(2).should('contain', 'Created');
        ImportEndpointDefinitionModalSteps.getGeneratedEndpointLink(2).should('be.visible');
        ImportEndpointDefinitionModalSteps.getImportStatus(3).should('contain', 'Created');
        ImportEndpointDefinitionModalSteps.getGeneratedEndpointLink(3).should('be.visible');

        // When I close the modal
        ImportEndpointDefinitionModalSteps.close();
        // Then the modal should be closed and the endpoint should be visible
        ImportEndpointDefinitionModalSteps.getDialog().should('not.exist');
        GraphqlEndpointManagementSteps.getEndpointsInfo().should('have.length', 2);
        GraphqlEndpointManagementSteps.verifyEndpointInfo([
            {
                status: 'deleted',
                id: 'swapi-planets',
                label: 'Star Wars planets API',
                description: '',
                default: true,
                active: true,
                modified: new Date().toISOString().split('T')[0],
                types: 1,
                properties: 10
            },
            {
                status: 'deleted',
                id: 'swapi-species',
                label: 'Star Wars species API',
                description: '',
                default: false,
                active: true,
                modified: new Date().toISOString().split('T')[0],
                types: 2,
                properties: 17
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
