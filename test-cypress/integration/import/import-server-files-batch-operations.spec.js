import {ImportServerFilesSteps} from "../../steps/import/import-server-files-steps";
import {ImportSettingsDialogSteps} from "../../steps/import/import-settings-dialog-steps";

describe('Import server files - Batch operations', () => {

    let repositoryId;

    const FILE_FOR_IMPORT = 'italian_public_schools_links.nt.gz';

    beforeEach(() => {
        repositoryId = 'server-import-' + Date.now();
        cy.createRepository({id: repositoryId});
        ImportServerFilesSteps.visitServerImport(repositoryId);
        ImportServerFilesSteps.getResources().should('have.length', 19);
    });

    afterEach(() => {
        cy.deleteRepository(repositoryId);
    });

    it('should batch operation buttons be visible when files/directories are selected', () => {
        // When I select a directory.
        ImportServerFilesSteps.selectFileByName('more-files');

        // Then I expect the import button be visible
        ImportServerFilesSteps.getBatchImportButton().should('exist');

        // When I deselect all files and directories
        ImportServerFilesSteps.selectFileByName('more-files');

        // Then I expect batch import button to not be visible.
        ImportServerFilesSteps.getBatchImportButton().should('not.exist');

        // When I select a file of some folder
        ImportServerFilesSteps.selectFileByName('rdfxml.rdf');

        // Then I expect batch import button to not be visible.
        ImportServerFilesSteps.getBatchImportButton().should('exist');

        // When I deselect a file of some folder
        ImportServerFilesSteps.selectFileByName('rdfxml.rdf');

        // Then I expect batch import button to not be visible.
        ImportServerFilesSteps.getBatchImportButton().should('not.exist');
    });

    it('Should be able to filter server files by status', () => {
        // When I select All files from the menu
        ImportServerFilesSteps.selectAllResources();
        // Then I should see all files selected
        ImportServerFilesSteps.getSelectedResources().should('have.length', 19);
        // When I select None from the menu
        ImportServerFilesSteps.deselectAllResources();
        // Then I should see no files selected
        ImportServerFilesSteps.getSelectedResources().should('have.length', 0);
        // precondition for the next step
        ImportServerFilesSteps.importResourceByName(FILE_FOR_IMPORT);
        ImportSettingsDialogSteps.import();
        ImportServerFilesSteps.checkImportedResource(0, FILE_FOR_IMPORT);
        // When I select Imported from the menu
        ImportServerFilesSteps.selectImportedResources();
        // Then I should see only imported files selected
        ImportServerFilesSteps.getSelectedResources().should('have.length', 1);
        ImportServerFilesSteps.getSelectedResourceName(0).should('contain', FILE_FOR_IMPORT);
        // When I select Not Imported from the menu
        ImportServerFilesSteps.selectNotImportedResources();
        // Then I should see only not imported files selected
        ImportServerFilesSteps.getSelectedResources().should('have.length', 18);
        // Deselect all for the next step
        ImportServerFilesSteps.deselectAllResources();
        ImportServerFilesSteps.getSelectedResources().should('have.length', 0);
        // When I select a directory via the checkbox on the row
        ImportServerFilesSteps.selectFileByName('more-files');
        ImportServerFilesSteps.getSelectedResources().should('have.length', 3);
        // When I deselect a single file from the directory via the checkbox on the row
        ImportServerFilesSteps.deselectFileByName('rdfxml.rdf');
        // Then I should see the file deselected and the folder is partially selected
        ImportServerFilesSteps.getSelectedResources().should('have.length', 1);
        // When I click again on the folder
        ImportServerFilesSteps.selectFileByName('more-files');
        // Then All files in the folder should be selected again
        ImportServerFilesSteps.getSelectedResources().should('have.length', 3);
        // When I deselect the folder
        ImportServerFilesSteps.deselectFileByName('more-files');
        // Then I should see no files selected
        ImportServerFilesSteps.getSelectedResources().should('have.length', 0);
    });

    it('Should perform batch import and reset of selected server files with changing settings', () => {
        // Given I have opened the server files tab
        // When I select couple of files for import
        ImportServerFilesSteps.selectFileByName('more-files');
        // And I click on the batch import button
        ImportServerFilesSteps.batchImport();
        ImportSettingsDialogSteps.import();
        // Then the files should be imported
        // We send only the files in the folder for import
        // ImportServerFilesSteps.checkImportedResource(0, 'more-files');
        ImportServerFilesSteps.checkImportedResource(0, 'jsonld-file.jsonld');
        ImportServerFilesSteps.checkImportedResource(0, 'rdfxml.rdf');
        ImportServerFilesSteps.deselectFileByName('more-files');
        // When I select the folder and click on the batch reset button
        ImportServerFilesSteps.selectFileByName('more-files');
        ImportServerFilesSteps.batchReset();
        // Then the files should be reset
        ImportServerFilesSteps.getImportedResourcesStates().should('have.length', 0);
    });

    it('should perform batch import without changing default settings', () => {
        // Given I have opened the server files tab
        // When I select couple of files for import
        ImportServerFilesSteps.selectFileByName('more-files');
        // And I click on the batch import button without changing default settings
        ImportServerFilesSteps.batchImportWithoutChangingDefaultSettings();
        // Then the files should be imported
        // We send only the files in the folder for import
        // ImportServerFilesSteps.checkImportedResource(0, 'more-files');
        ImportServerFilesSteps.checkImportedResource(0, 'jsonld-file.jsonld');
        ImportServerFilesSteps.checkImportedResource(0, 'rdfxml.rdf');
    });
});
