import HomeSteps from "../../../steps/home-steps";
import {MainMenuSteps} from "../../../steps/main-menu-steps";
import {BackupAndRestoreSteps} from "../../../steps/monitoring/backup-and-restore-steps";

describe('Backup And Restore with selected repository', () => {
    let repositoryId;

    beforeEach(() => {
        repositoryId = 'backup-and-restore-init-' + Date.now();
        cy.createRepository({id: repositoryId});
        cy.presetRepository(repositoryId);
    });

    afterEach(() => {
        cy.deleteRepository(repositoryId);
    });

    it('Should display the correct initial state when navigating via URL', () => {
        // Given, I visit the Backup And Restore page via URL with a repository selected
        BackupAndRestoreSteps.visit();
        // Then,
        verifyInitialStateWithSelectedRepository();
    });

    it('Should display the correct initial state when navigating via the navigation bar', () => {
        // Given, I visit the Backup And Restore page via the navigation menu with a repository selected
        HomeSteps.visit();
        MainMenuSteps.clickOnBackupAndRestore();
        // Then,
        verifyInitialStateWithSelectedRepository();
    });

    const verifyInitialStateWithSelectedRepository = () => {
        BackupAndRestoreSteps.getInfoMessageElement().contains('No running backup or restore.');
    };
})
