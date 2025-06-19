import {ErrorSteps} from "../../../steps/error-steps";
import HomeSteps from "../../../steps/home-steps";
import {MainMenuSteps} from "../../../steps/main-menu-steps";
import {BackupAndRestoreSteps} from "../../../steps/monitoring/backup-and-restore-steps";

describe('Backup and Restore without selected repository', () => {
    it('Should display the correct initial state when navigating via URL', () => {
        // Given, I visit the Backup and Restore page via URL without a repository selected
        BackupAndRestoreSteps.visit();
        // Then,
        verifyInitialStateWithSelectedRepository();
    });

    it('Should display the correct initial state when navigating via the navigation menu', () => {
        // Given, I visit the Backup and Restore page via the navigation menu without a repository selected
        HomeSteps.visit();
        MainMenuSteps.clickOnBackupAndRestore();
        // Then,
        verifyInitialStateWithSelectedRepository();
    });

    const verifyInitialStateWithSelectedRepository = () => {
        BackupAndRestoreSteps.getInfoMessageElement().contains('No running backup or restore.');
    };
})
