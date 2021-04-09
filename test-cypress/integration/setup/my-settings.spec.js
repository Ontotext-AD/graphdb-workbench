describe('My Settings', () => {

    let repositoryId;
    let testResultCountQuery = "select * where { \n" +
        "\t?s ?p ?o .\n" +
        "} limit 1001";
    const FILE_TO_IMPORT = 'wine.rdf';

    before(() => {
        repositoryId = 'repo' + Date.now();
        cy.createRepository({id: repositoryId});
        cy.importServerFile(repositoryId, FILE_TO_IMPORT);
        // Verify that the default user settings are returned
        cy.clearLocalStorage();
        cy.setDefaultUserData();
    });

    beforeEach(() => {
        cy.presetRepository(repositoryId);

        cy.visit('/settings');
        cy.window();
        cy.url().should('eq', `${Cypress.config('baseUrl')}/settings`);
    });

    after(() => {
        // Verify that the default user settings are returned
        cy.clearLocalStorage();
        cy.setDefaultUserData();
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
        cy.get('#defaultCount:checkbox').should('be.checked');
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

    it('should change settings for admin and verify changes are reflected in SPARQL editor', () => {
        cy.get('.sparql-editor-settings').should('be.visible');

        //turn off inference, sameAs and count total results
        cy.get('#sameas-on')
            .find('.switch.mr-0').should('be.visible').click()
            .then(() => {
                cy.get('#sameas-on')
                    .find('.switch:checkbox')
                    .should('not.be.visible');
            });
        cy.get('#inference-on')
            .find('.switch.mr-0').should('be.visible').click()
            .then(() => {
                cy.get('#inference-on')
                    .find('.switch:checkbox')
                    .should('not.be.visible');
            });
        cy.get('#defaultCount:checkbox').uncheck()
            .then(() => {
                cy.get('#defaultCount:checkbox')
                    .should('not.be.checked');
            });

        // Note that saving settings takes time.
        // Make sure that visiting SPARQL view
        // will happen after successful save
        getSaveButton().click()
            .then(() => {
                verifyUserSettingsUpdated();
                //Go to SPARQL editor and verify changes are persisted for the admin user
                cy.visit('/sparql');
                cy.window();
                cy.url().should('eq', `${Cypress.config('baseUrl')}/sparql`);

                waitUntilYASQUEBtnsAreVisible();

                //verify disabled default inference, sameAs and total results count
                cy.get('#inference')
                    .should('be.visible')
                    .find('.icon-2-5x.icon-inferred-off')
                    .should('be.visible');

                cy.get('#sameAs')
                    .should('be.visible')
                    .find('.icon-2-5x.icon-sameas-off')
                    .should('be.visible');

                //clear default query and paste a new one that will generate more than 1000 results
                cy.get('#queryEditor .CodeMirror').find('textarea').type(Cypress.env('modifierKey') + 'a{backspace}', {force: true});
                cy.get('#queryEditor .CodeMirror').find('textarea').
                invoke('val', testResultCountQuery).trigger('change', {force: true});

                waitUntilQueryValueEquals(testResultCountQuery);

                cy.get('#wb-sparql-runQuery')
                    .should('be.visible')
                    .and('not.be.disabled').click()
                    .then(() => {
                        // Retry until success message is shown
                        cy.waitUntil(() =>
                            cy.get('#yasr-inner')
                                .should('be.visible')
                                .find('.results-info .text-xs-right')
                                .find('.results-description')
                                .then(result => result && result.text().indexOf('Showing results from 1 to 1,000 of at least 1,001') > -1));
                    });

                //return to My Settings to revert the changes
                cy.visit('/settings');
                cy.window();
                cy.url().should('eq', `${Cypress.config('baseUrl')}/settings`);
                // Wait for loader to disappear
                cy.get('.ot-loader').should('not.be.visible');
                // Note that '.switch:checkbox' doesn't present when unchecked.
                // Verify that the buttons will be clicked first and afterwards
                // verification will happen.

                // Note that when following two checkboxes are unchecked,
                // they are not visible, which means that it's impossible
                // Cypress to interact normally with them.
                // That's why {force: true} should be used
                cy.get('#sameas-on')
                    .find('input[type="checkbox"]').check({force: true})
                    .then(() => {
                        cy.get('#sameas-on')
                            .find('input[type="checkbox"]')
                            .scrollIntoView()
                            .should('be.checked');
                    });
                cy.get('#inference-on')
                    .find('input[type="checkbox"]').check({force: true})
                    .then(() => {
                        cy.get('#inference-on')
                            .find('input[type="checkbox"]')
                            .scrollIntoView()
                            .should('be.checked');
                    });
                cy.get('#defaultCount:checkbox').check()
                    .then(() => {
                        cy.get('#defaultCount:checkbox')
                            .should('be.visible')
                            .and('be.checked');
                    });
                getSaveButton().click()
                    .then(() => {
                        verifyUserSettingsUpdated();
                    });
            });

    });

    function getUserRepositoryTable() {
        return cy.get('.user-repositories .table');
    }

    function getUserRepository(name) {
        return getUserRepositoryTable().find(`.repository-name:contains('${name}')`).closest('tr');
    }

    function getUserRoleButtonGroup() {
        return cy.get('.user-role');
    }

    function getSaveButton() {
        return cy.get('#wb-user-submit').should('be.visible');
    }

    function waitUntilYASQUEBtnsAreVisible() {
        cy.waitUntil(() =>
            cy.get('#queryEditor #yasqe_buttons')
                .find('#buttons')
                .then(buttons =>
                    buttons && buttons.length > 0));
    }

    function waitUntilQueryValueEquals(query) {
        cy.waitUntil(() =>
            cy.get('#queryEditor .CodeMirror')
                .then(codeMirrorEl => codeMirrorEl && codeMirrorEl[0].CodeMirror.getValue().trim() === query.trim()));
    }

    function verifyUserSettingsUpdated() {
        cy.get('#toast-container')
            .find('.toast-success')
            .should('be.visible')
            .and('contain', 'The user admin was updated');
    }
});
