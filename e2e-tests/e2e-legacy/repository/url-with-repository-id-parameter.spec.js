import {ModalDialogSteps} from "../../steps/modal-dialog-steps";
import HomeSteps from '../../steps/home-steps.js';
import {RepositoryErrorsWidgetSteps} from '../../steps/widgets/repository-errors-widget-steps.js';
import {RepositorySteps} from '../../steps/repository-steps.js';
import {RepositorySelectorSteps} from '../../steps/repository-selector-steps.js';
import {ErrorPageSteps} from '../../steps/error-page-steps.js';
import {MainMenuSteps} from '../../steps/main-menu-steps.js';

describe('URL with Repository ID parameter', () => {
    let repositoryId;
    let secondRepositoryId;

    describe('When repository is changed', () => {
        beforeEach(() => {
            repositoryId = 'repository-in-url-' + Date.now();
            cy.createRepository({id: repositoryId});
            secondRepositoryId = 'second-repository-in-url-' + Date.now();
            cy.createRepository({id: secondRepositoryId});
            cy.presetRepository(repositoryId);
        })

        afterEach(() => {
            cy.deleteRepository(repositoryId);
            cy.deleteRepository(secondRepositoryId);
        });

        it('should update URL', () => {
            RepositorySteps.visit();
            RepositorySteps.getActiveRepositoryRow().should('contain', repositoryId);
            RepositorySelectorSteps.getSelectedRepository().should('contain', repositoryId);
            cy.url().should('include', 'repositoryId=' + repositoryId);

            RepositorySelectorSteps.selectRepository(secondRepositoryId);

            RepositorySteps.getActiveRepositoryRow().should('contain', secondRepositoryId);
            RepositorySelectorSteps.getSelectedRepository().should('contain', secondRepositoryId);
            cy.url().should('include', 'repositoryId=' + secondRepositoryId);

            RepositorySteps.activateRepository(repositoryId);

            RepositorySteps.getActiveRepositoryRow().should('contain', repositoryId);
            RepositorySelectorSteps.getSelectedRepository().should('contain', repositoryId);
            cy.url().should('include', 'repositoryId=' + repositoryId);
        });
    });

    describe('When there is no active repository and no repository in URL', () => {
        // 1. active repo no, repo in url no -> no action - just show repo selector
        it('should show repository selector with no repository selected', () => {
            HomeSteps.visit();
            RepositoryErrorsWidgetSteps.getWidget().should('be.visible');
            cy.url().should('not.include', 'repositoryId=');
            HomeSteps.getSelectedRepository().should('contain', 'No accessible repositories');
            // no modal dialog should be shown
            ModalDialogSteps.getDialog().should('not.exist');
        })
    })

    describe('When there is no active repository and repository in URL is present', () => {
        beforeEach(() => {
            repositoryId = 'repository-in-url-' + Date.now();
            cy.createRepository({id: repositoryId});
        })

        afterEach(() => {
            cy.deleteRepository(repositoryId);
        });

        // 2. active repo no, repo in url yes, url repo exists -> set active repo same as the url
        it('should set active repository to the one in URL if it exists', () => {
            HomeSteps.visitWithRepositoryInUrl(repositoryId);
            RepositoryErrorsWidgetSteps.getWidget().should('not.exist');
            cy.url().should('include', 'repositoryId=' + repositoryId);
            HomeSteps.getSelectedRepository().should('contain', repositoryId);
        });

        // 3. active repo no, repo in url yes, url repo missing -> show warning, keep url
        it('should show warning if repository in URL does not exist', () => {
            HomeSteps.visitWithRepositoryInUrl('mising-repo');
            RepositoryErrorsWidgetSteps.getWidget().should('be.visible');
            HomeSteps.getSelectedRepository().should('contain', 'Choose repository');
            ModalDialogSteps.getModalAlert().should('be.visible');
            ModalDialogSteps.getDialogBody().should('contain', 'The repository "mising-repo" specified in the URL does not exist. Please select an existing repository.');
            ModalDialogSteps.close();
            cy.url().should('include', 'repositoryId=mising-repo');
        });
    });

    describe('When there is an active repository and no repository in URL', () => {
        beforeEach(() => {
            repositoryId = 'repository-in-url-' + Date.now();
            cy.createRepository({id: repositoryId});
            cy.presetRepository(repositoryId);
        })

        afterEach(() => {
            cy.deleteRepository(repositoryId);
            cy.deleteRepository(secondRepositoryId);
        });

        // 4. active repo yes, repo in url no -> update url
        it('should update URL to include active repository', () => {
            HomeSteps.visit();
            RepositoryErrorsWidgetSteps.getWidget().should('be.hidden');
            cy.url().should('include', 'repositoryId=' + repositoryId);
            HomeSteps.getSelectedRepository().should('contain', repositoryId);
        });

        // 5. active repo yes, repo in url yes, url repo exists -> show confirmation, update active repo on confirmation
        it('should show confirmation and update active repository if repository in URL exists', () => {
            secondRepositoryId = 'second-repository-in-url-' + Date.now();
            cy.createRepository({id: secondRepositoryId});
            HomeSteps.visitWithRepositoryInUrl(secondRepositoryId);
            cy.url().should('include', 'repositoryId=' + secondRepositoryId);
            HomeSteps.getSelectedRepository().should('contain', repositoryId);
            HomeSteps.getView().should('be.visible');
            HomeSteps.getActiveRepositoryWidget().should('be.visible');
            RepositoryErrorsWidgetSteps.getWidget().should('be.hidden');
            ModalDialogSteps.getDialog().should('be.visible');
            ModalDialogSteps.getDialogBody().should('contain', `Active repository will be changed to "${secondRepositoryId}". Do you want to proceed?`);
            ModalDialogSteps.confirm();
            ModalDialogSteps.getDialog().should('not.exist');
            HomeSteps.getSelectedRepository().should('contain', secondRepositoryId);
            cy.url().should('include', 'repositoryId=' + secondRepositoryId);
        });

        // 5. active repo yes, repo in url yes, url repo exists -> show confirmation, keep active repo on reject
        it('should show confirmation and keep active repository if repository in URL exists but user rejects', () => {
            // active repo yes, repo in url yes, url repo exists -> show confirmation, update active repo
            secondRepositoryId = 'second-repository-in-url-' + Date.now();
            cy.createRepository({id: secondRepositoryId});
            HomeSteps.visitWithRepositoryInUrl(secondRepositoryId);
            cy.url().should('include', 'repositoryId=' + secondRepositoryId);
            HomeSteps.getSelectedRepository().should('contain', repositoryId);
            HomeSteps.getView().should('be.visible');
            HomeSteps.getActiveRepositoryWidget().should('be.visible');
            RepositoryErrorsWidgetSteps.getWidget().should('be.hidden');
            ModalDialogSteps.getDialog().should('be.visible');
            ModalDialogSteps.getDialogBody().should('contain', `Active repository will be changed to "${secondRepositoryId}". Do you want to proceed?`);
            ModalDialogSteps.cancel();
            ModalDialogSteps.getDialog().should('not.exist');
            HomeSteps.getSelectedRepository().should('contain', repositoryId);
            cy.url().should('include', 'repositoryId=' + repositoryId);
        });

        // 6. active repo yes, repo in url yes, url repo missing-> show warning, keep the active repo
        it('should show warning if repository in URL does not exist and keep active repository', () => {
            HomeSteps.visitWithRepositoryInUrl('mising-repo');
            cy.url().should('include', 'repositoryId=mising-repo');
            ModalDialogSteps.getModalAlert().should('be.visible');
            ModalDialogSteps.clickOKButton();
            ModalDialogSteps.getModalAlert().should('not.exist');
            HomeSteps.getSelectedRepository().should('contain', repositoryId);
            cy.url().should('include', 'repositoryId=' + repositoryId);
        });
    });

    describe('When navigating between legacy and new workbench', () => {
        beforeEach(() => {
            repositoryId = 'repository-in-url-' + Date.now();
            cy.createRepository({id: repositoryId});
            cy.initializeRepository(repositoryId);
            cy.presetRepository(repositoryId);
        })

        afterEach(() => {
            cy.deleteRepository(repositoryId);
        });

        it('should preserve repositoryId parameter when navigating from 404 (new workbench) to legacy page', () => {
            // Given I am on the 404 page which is in the new workbench
            ErrorPageSteps.visit404();
            ErrorPageSteps.get404Page().should('be.visible');
            cy.url().should('not.include', 'repositoryId=');
            // When I navigate to some legacy page
            MainMenuSteps.clickOnSparqlMenu();
            // Then repositoryId parameter should be preserved in the URL
            cy.url().should('include', `repositoryId=${repositoryId}`);
        });
    });
});
