import {QueryStubs} from '../../stubs/yasgui/query-stubs.js';
import {SparqlEditorSteps} from '../../steps/sparql-editor-steps.js';
import {YasqeSteps} from '../../steps/yasgui/yasqe-steps.js';
import ImportSteps from '../../steps/import/import-steps.js';
import {MainMenuSteps} from '../../steps/main-menu-steps.js';
import {ModalDialogSteps} from '../../steps/modal-dialog-steps.js';
import {RepositorySelectorSteps} from '../../steps/repository-selector-steps.js';
import {LanguageSelectorSteps} from '../../steps/language-selector-steps.js';
import {UserAndAccessSteps} from '../../steps/setup/user-and-access-steps.js';
import {LoginSteps} from '../../steps/login-steps.js';

const LONG_RUNNING_QUERY_DELAY = 10000;

describe('SPARQL Editor Navigation', () => {
    let repositoryId;
    let secondRepositoryId;
    beforeEach(() => {
        repositoryId = 'sparql-editor-' + Date.now();
        QueryStubs.stubQueryCountResponse();
        cy.createRepository({id: repositoryId});
        cy.presetRepository(repositoryId);
        QueryStubs.spyAbortQuery();
    });

    afterEach(() => {
        cy.deleteRepository(repositoryId);
        if (secondRepositoryId) {
            cy.deleteRepository(secondRepositoryId);
        }
    });

    it('should navigate to other view if user confirmed navigation', () => {
        // GIVEN: I visit a page with the ontotext-yasgui-web-component on it.
        SparqlEditorSteps.visitSparqlEditorPage();
        MainMenuSteps.getMainMenu().should('be.visible');

        // WHEN: I try to go to another view
        MainMenuSteps.clickOnMenuImport();
        // THEN: I expect to navigate because there is no running query
        ImportSteps.getView().should('exist');

        // WHEN: I return to the view with the ontotext-yasgui-web-component.
        SparqlEditorSteps.visitSparqlEditorPage();
        // AND: I run a long-running query
        QueryStubs.stubLongRunningQuery(repositoryId, LONG_RUNNING_QUERY_DELAY);
        YasqeSteps.executeQueryWithoutWaiteResult();
        // AND: I try to leave the page
        MainMenuSteps.clickOnMenuImport();
        // THEN: I expect to see a confirmation dialog
        ModalDialogSteps.getDialog().should('exist');
        ModalDialogSteps.getDialogBody().should('contain.text', 'You have running 1 query, that will be aborted.');

        // WHEN: I cancel the dialog
        ModalDialogSteps.cancel();
        // THEN: I expect to stay on the same view
        SparqlEditorSteps.verifyUrl();
        ImportSteps.getView().should('not.exist');
        // AND: I expect the query not to be aborted
        cy.get('@abortQuery.all').should('have.length', 0);

        // WHEN: I confirm leaving the page
        MainMenuSteps.clickOnMenuImport();
        ModalDialogSteps.getDialog().should('exist');
        ModalDialogSteps.getDialogBody().should('contain.text', 'You have running 1 query, that will be aborted.');
        ModalDialogSteps.confirm();
        // THEN: I expect to navigate to the other view
        ImportSteps.verifyUrl();
        ImportSteps.getView().should('exist');
        // AND: I expect the query to be aborted
        cy.get('@abortQuery.all').should('have.length', 1);
    });

    it('should change active repository if user confirmed', () => {
        // GIVEN: There are at least two repositories and one is selected
        secondRepositoryId = 'sparql-editor-' + Date.now();
        cy.createRepository({id: secondRepositoryId});

        // WHEN: I visit a page with the ontotext-yasgui-web-component on it.
        SparqlEditorSteps.visitSparqlEditorPage();
        // AND: I change the repository
        RepositorySelectorSteps.selectRepository(secondRepositoryId);
        // THEN: I expect the repository to be changed without confirmation, because there are no running queries.
        RepositorySelectorSteps.getSelectedRepository().should('contain', secondRepositoryId);

        // WHEN: I run a long-running query
        QueryStubs.stubLongRunningQuery(secondRepositoryId, LONG_RUNNING_QUERY_DELAY);
        YasqeSteps.executeQueryWithoutWaiteResult();
        // AND: I try to change the repository
        RepositorySelectorSteps.selectRepository(repositoryId);
        // THEN: I expect to see a confirmation dialog
        ModalDialogSteps.getDialog().should('exist');
        ModalDialogSteps.getDialogBody().should('contain.text', 'You have running 1 query, that will be aborted.');

        // WHEN: I cancel the dialog
        ModalDialogSteps.cancel();
        // THEN: I expect the repository not to be changed.
        RepositorySelectorSteps.getSelectedRepository().should('contain', secondRepositoryId);
        // AND: I expect the query not to be aborted
        cy.get('@abortQuery.all').should('have.length', 0);

        // WHEN: I confirm changing of repository
        RepositorySelectorSteps.selectRepository(repositoryId);
        ModalDialogSteps.getDialog().should('exist');
        ModalDialogSteps.getDialogBody().should('contain.text', 'You have running 1 query, that will be aborted.');
        ModalDialogSteps.confirm();
        // THEN: I expect the active repository to be changed
        RepositorySelectorSteps.getSelectedRepository().should('contain', repositoryId);
        // AND: I expect the query to be aborted
        cy.get('@abortQuery.all').should('have.length', 1);
    });

    it('should change application language if user confirmed', () => {
        // GIVEN: I visit a page with the ontotext-yasgui-web-component on it.
        SparqlEditorSteps.visitSparqlEditorPage();
        // Execute and wait for result give chance to application to be ready for the test, otherwise listeners are not
        // attached and the test will fail
        YasqeSteps.executeQuery();
        LanguageSelectorSteps.getLanguageSelectorDropdownButton().should('contain', 'en');

        // WHEN: I run a long-running query
        QueryStubs.stubLongRunningQuery(repositoryId, LONG_RUNNING_QUERY_DELAY);
        YasqeSteps.executeQueryWithoutWaiteResult();
        // AND: I try to change the application language
        LanguageSelectorSteps.switchToFr();
        // THEN: I expect to see a confirmation dialog
        ModalDialogSteps.getDialog().should('exist');
        ModalDialogSteps.getDialogBody().should('contain.text', 'You have running 1 query, that will be aborted.');

        // WHEN: I cancel the dialog
        ModalDialogSteps.cancel();
        // THEN: I expect the application language not to be changed.
        LanguageSelectorSteps.getLanguageSelectorDropdownButton().should('contain', 'en');
        // AND: I expect the query not to be aborted
        cy.get('@abortQuery.all').should('have.length', 0);

        // WHEN: I confirm changing the language
        LanguageSelectorSteps.switchToFr();
        ModalDialogSteps.getDialog().should('exist');
        ModalDialogSteps.getDialogBody().should('contain.text', 'You have running 1 query, that will be aborted.');
        ModalDialogSteps.confirm();
        // THEN: I expect the query to be aborted
        cy.get('@abortQuery.all').should('have.length', 1);
        // AND: I expect the application language to be changed
        LanguageSelectorSteps.getLanguageSelectorDropdownButton().should('contain', 'fr');
    });

    it('should abort query when page is reloaded', () => {
        // GIVEN: I visit a page with the ontotext-yasgui-web-component on it.
        SparqlEditorSteps.visitSparqlEditorPage();
        // AND: I run a long-running query
        QueryStubs.stubLongRunningQuery(repositoryId, LONG_RUNNING_QUERY_DELAY);
        YasqeSteps.executeQueryWithoutWaiteResult();

        // WHEN: I reload the page
        SparqlEditorSteps.visitSparqlEditorPage();
        // THEN: I expect the query to be aborted
        cy.get('@abortQuery.all').should('have.length', 1);
    });

    context('Security', () => {

        beforeEach(() => {
            UserAndAccessSteps.visit();
            UserAndAccessSteps.toggleSecurity();
            LoginSteps.loginWithUser('admin', 'root');
        });

        afterEach(() => {
            cy.loginAsAdmin().then(() => {
                cy.switchOffSecurity(true);
            });
        });

        it('should logged out if user confirmed navigation', () => {
            // GIVEN: The security is on
            // AND: I visit a page with the ontotext-yasgui-web-component on it.
            SparqlEditorSteps.visitSparqlEditorPage();

            // WHEN: I log out
            LoginSteps.logout();
            // THEN: I expect to navigate to the login page, because there are no long-running queries.
            LoginSteps.verifyUrl();

            // WHEN: I am logged in
            LoginSteps.loginWithUser('admin', 'root');
            // AND: I run a long-running query
            QueryStubs.stubLongRunningQuery(repositoryId, LONG_RUNNING_QUERY_DELAY);
            YasqeSteps.executeQueryWithoutWaiteResult();
            // AND: I try to log out
            LoginSteps.logout();
            // THEN: I expect to see a confirmation dialog
            ModalDialogSteps.getDialog().should('exist');
            ModalDialogSteps.getDialogBody().should('contain.text', 'You have running 1 query, that will be aborted.');

            // WHEN: I cancel the dialog
            ModalDialogSteps.cancel();
            // THEN: I expect to stay logged in
            // AND: I expect the query not to be aborted
            cy.get('@abortQuery.all').should('have.length', 0);

            // WHEN: I confirm leaving the page
            LoginSteps.logout();
            ModalDialogSteps.getDialog().should('exist');
            ModalDialogSteps.getDialogBody().should('contain.text', 'You have running 1 query, that will be aborted.');
            ModalDialogSteps.confirm();
            // THEN: I expect to navigate to the login page.
            LoginSteps.verifyUrl();
            // AND: I expect the query to be aborted
            cy.get('@abortQuery.all').should('have.length', 1);
        });
    });
});
