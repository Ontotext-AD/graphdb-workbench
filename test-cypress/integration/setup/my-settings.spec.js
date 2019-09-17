const FILE_TO_IMPORT = 'wine.rdf';

describe('My Settings', () => {

    let repositoryId;

    before(() => {
        repositoryId = 'repo' + Date.now();
        cy.createRepository({id: repositoryId});
    });

    beforeEach(() => {
        cy.presetRepositoryCookie(repositoryId);

        visitSettingsView();
    });

    after(() => {
        cy.deleteRepository(repositoryId);
    });

    it('Initial state', () => {
        // Everything should be related to admin user.
        // Password change field is for admin.
        cy.get('.login-credentials').should('be.visible');
        cy.get('#wb-user-username').should('be.visible')
            .and('have.value', 'admin')
            .and('have.attr', 'readonly', 'readonly');
        // explicitly state that the fields must be of type password
        cy.get('#wb-user-password:password').should('be.visible')
            .and('have.value', '')
            .and('have.attr', 'placeholder', 'New password');
        cy.get('#wb-user-confirmpassword:password').should('be.visible')
            .and('have.value', '')
            .and('have.attr', 'placeholder', 'Confirm password');

        // SPARQL settings are as follows:
        // -Expand over sameAs is on
        // -Inference is on
        // -Count total results is checked
        // -Ignore saved queries is not checked
        cy.get('.sparql-editor-settings').should('be.visible');
        cy.get('#sameas-on').find('.switch:checkbox').should('be.checked');
        cy.get('.sameas-label').should('be.visible')
            .and('contain', 'Expand results over owl:SameAs is')
            .find('.tag').should('be.visible')
            .and('contain', 'ON');
        cy.get('#inference-on').find('.switch:checkbox').should('be.checked');
        cy.get('.inference-label').should('be.visible')
            .and('contain', 'Inference is')
            .find('.tag').should('be.visible')
            .and('contain', 'ON');
        getTotalResultsCountCheckbox().should('be.checked');
        cy.get('#ignore-shared:checkbox').should('not.be.checked');

        // User role
        // - User role is administrator (both cannot be changed)
        getUserRoleButtonGroup().should('be.visible')
            .find('#roleAdmin:radio')
            .should('be.checked')
            .and('be.disabled')
            .and('have.value', 'admin');
        getUserRoleButtonGroup().find('#roleRepoAdmin:radio')
            .should('not.be.checked')
            .and('be.disabled');
        getUserRoleButtonGroup().find('#roleUser:radio')
            .should('not.be.checked')
            .and('be.disabled');

        // Repository rights
        // - Admin has read and write access to all repositories."
        getUserRepositoryTable().should('be.visible');
        getUserRepository(repositoryId).find('.read-rights .read:checkbox').should('be.visible')
            .and('be.checked')
            .and('be.disabled');
        getUserRepository(repositoryId).find('.write-rights .write:checkbox').should('be.visible')
            .and('be.checked')
            .and('be.disabled');
    });

    it.only('Test SPARQL settings change', function () {
        const DEFAULT_QUERY = 'select * where { \n' +
            '\t?s ?p ?o .\n' +
            '} limit 100';

        cy.importServerFile(repositoryId, FILE_TO_IMPORT);

        // Verify SPARQL settings for current user:
        //     Go to SPARQL screen
        // Verify that:
        //     -Expand over sameAs is on (icon is SPARQL editor)
        // -Inference is on (icon is SPARQL editor)
        // -Total results count is working (run a query that generates more than 1000 results and verify that more than 1000 results are returned"
        cy.visit('/sparql');
        waitUntilSparqlPageIsLoaded();
        verifySameAsIsActive(true);
        verifyInferenceIsActive(true);

        cy.pasteQuery('select * where { ?s ?p ?o . } limit 1002');
        cy.executeQuery();

        cy.verifyResultsPageLength(1000);
        cy.verifyResultsMessage('1,000 of 1,002');

        // Change SPARQL settings:
        //     Turn off sameAs and Inference settings from My Settings menu.
        //     Uncheck Count total results checkbox
        visitSettingsView();
        toggleSameAs();
        toggleInference();
        toggleTotalResultsCount();
        saveSettings();

        // Verify SPARQL settings for current user:
        //     Go to SPARQL screen
        // Verify that:
        // -Expand over sameAs is off (icon is SPARQL editor)
        // -Inference is off (icon is SPARQL editor)
        // -Total results count is working (run a query that generates more than 1000 results and verify that exactly 1000 results are returned"
        waitUntilSparqlPageIsLoaded();

        // - In the active tab the same as and inference settings are active for that tab only. For a new one they should be disabled.
        verifySameAsIsActive(true);
        verifyInferenceIsActive(true);

        cy.addNewQueryEditorTab();
        cy.verifyQueryAreaContains(DEFAULT_QUERY);

        cy.pasteQuery('select * where { ?s ?p ?o . } limit 1002');

        verifySameAsIsActive(false);
        verifyInferenceIsActive(false);

        cy.executeQuery();

        cy.verifyResultsPageLength(1000);
        cy.verifyResultsMessage('1,000 of 1,000');

        // Restore default settings
        visitSettingsView();
        toggleSameAs();
        toggleInference();
        toggleTotalResultsCount();
        saveSettings();
    });

    function visitSettingsView() {
        cy.visit('/settings');
        cy.get('.ot-loader').should('not.be.visible');
    }

    function getUserRepositoryTable() {
        return cy.get('.user-repositories .table');
    }

    function getUserRepository(name) {
        return getUserRepositoryTable().find(`.repository-name:contains('${name}')`).closest('tr');
    }

    function getUserRoleButtonGroup() {
        return cy.get('.user-role');
    }

    function getSameAsCheckbox() {
        return cy.get('#sameas-on [for=sameas-on]');
    }

    function toggleSameAs() {
        getSameAsCheckbox().click();
    }

    function getInferenceCheckbox() {
        return cy.get('#inference-on [for=inference-on]');
    }

    function getTotalResultsCountCheckbox() {
        return cy.get('#defaultCount:checkbox');
    }

    function toggleTotalResultsCount() {
        getTotalResultsCountCheckbox().click();
    }

    function toggleInference() {
        getInferenceCheckbox().click();
    }

    function saveSettings() {
        cy.get('#wb-user-submit').click();
    }

    // SPARQL view

    function waitUntilSparqlPageIsLoaded() {
        // Workbench loading screen should not be visible
        cy.get('.ot-splash').should('not.be.visible');

        cy.get('#queryEditor .CodeMirror').should(codeMirrorEl => {
            const cm = codeMirrorEl[0].CodeMirror;
            expect(cm.getValue().trim().length > 0).to.be.true;
        });

        // No active loader
        cy.get('.ot-loader-new-content').should('not.be.visible');
    }

    function verifySameAsIsActive(isActive) {
        let activePropertyClass = 'icon-sameas-on';
        let inactivePropertyClass = 'icon-sameas-off';
        cy.get('#sameAs > span').then((icon) => {
            console.log('icon: ', icon, icon.attr('class'));
            cy.get(icon).should('not.have.class', 'ng-animate')
                .and('have.class', isActive ? activePropertyClass : inactivePropertyClass);
        })
    }

    function verifyInferenceIsActive(isActive) {
        let activePropertyClass = 'icon-inferred-on';
        let inactivePropertyClass = 'icon-inferred-off';
        cy.get('#inference > span')
            .should('not.have.class', 'ng-animate')
            .and('have.class', isActive ? activePropertyClass : inactivePropertyClass);
    }
});
