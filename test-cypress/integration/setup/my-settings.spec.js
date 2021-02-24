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
    });

    beforeEach(() => {
        cy.presetRepository(repositoryId);

        cy.visit('/settings');
        // Wait for loader to disappear
        cy.get('.ot-loader').should('not.be.visible');
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

    it('should change settings for admin and verify changes are reflected in SAPRQL editor', () => {
        cy.get('.sparql-editor-settings').should('be.visible');

        //turn off inference, sameAs and count total results
        cy.get('#sameas-on label').click();
        cy.get('#sameas-on').find('.switch:checkbox').should('not.be.checked');
        cy.get('#inference-on label').click();
        cy.get('#inference-on').find('.switch:checkbox').should('not.be.checked');
        cy.get('#defaultCount:checkbox').uncheck();
        cy.get('#defaultCount:checkbox').should('not.be.checked');
        getSaveButton().click();

        //Go to SPARQL editor and verify changes are persisted for the admin user
        cy.visit('/sparql');
        cy.get('.ot-splash').should('not.be.visible');

        cy.get('#queryEditor .CodeMirror').should(codeMirrorEl => {
            const cm = codeMirrorEl[0].CodeMirror;
            expect(cm.getValue().trim().length > 0).to.be.true;
        });

        //clear default query and paste a new one that will generate more than 1000 results
        cy.get('#queryEditor .CodeMirror').find('textarea').type(Cypress.env('modifierKey') + 'a{backspace}', {force: true});
        cy.get('#queryEditor .CodeMirror').find('textarea').
            invoke('val', testResultCountQuery).trigger('change', {force: true});

        cy.get('#queryEditor .CodeMirror').should(codeMirrorEl => {
            const cm = codeMirrorEl[0].CodeMirror;
            expect(cm.getValue().trim().length > 0).to.be.true;
        });

        cy.get('#wb-sparql-runQuery').click();
        cy.get('.ot-loader-new-content').should('not.be.visible');

        //verify disabled default inference, sameAs and total results count
        cy.get('#inference ')
            .find('.icon-inferred-off')
            .should('be.visible');

        cy.get('#sameAs ')
            .find('.icon-sameas-off')
            .should('be.visible');

        cy.get('.results-info .text-xs-right')
            .should('be.visible')
            .and('contain', 'Showing results from 1 to 1,000 of at least 1,001');

        //return to My Settings to revert the changes
        cy.visit('/settings');
        // Wait for loader to disappear
        cy.get('.ot-loader').should('not.be.visible');
        cy.get('#sameas-on label').click();
        cy.get('#sameas-on').find('.switch:checkbox').should('be.checked');
        cy.get('#inference-on label').click();
        cy.get('#inference-on').find('.switch:checkbox').should('be.checked');
        cy.get('#defaultCount:checkbox').check();
        cy.get('#defaultCount:checkbox').should('be.checked');
        getSaveButton().click();
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
        return cy.get('#wb-user-submit');
    }
});
