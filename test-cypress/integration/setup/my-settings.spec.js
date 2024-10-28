import {SparqlEditorSteps} from "../../steps/sparql-editor-steps";
import {YasqeSteps} from "../../steps/yasgui/yasqe-steps";

// Disable the default user data setup stub because we want to actually change it in this test
Cypress.env('set_default_user_data', false);

describe('My Settings', () => {

    let repositoryId;
    const testResultCountQuery = "select * where { \n" +
        "\t?s ?p ?o .\n" +
        "} limit 1001";
    const FILE_TO_IMPORT = 'wine.rdf';

    beforeEach(() => {
        repositoryId = 'my-settings-' + Date.now();
        cy.createRepository({id: repositoryId});
        cy.importServerFile(repositoryId, FILE_TO_IMPORT);
        cy.setDefaultUserData();
        visitSettingsView();
    });

    afterEach(() => {
        cy.deleteRepository(repositoryId);
    });

    it('Initial state', () => {
        // Password change field is for admin.
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
        clickLabelBtn('#sameas-on')
            .then(() => {
                cy.get('#sameas-on')
                    .find('.switch:checkbox')
                    .should('not.be.visible');
            });

        clickLabelBtn('#inference-on')
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
                SparqlEditorSteps.visitSparqlEditorPage();

                //verify disabled default inference, sameAs and total results count
                YasqeSteps.getIncludeInferredStatementsButton().should('have.class', 'icon-inferred-off');
                YasqeSteps.getExpandResultsOverSameAsButton().should('have.class', 'icon-same-as-off');

                //clear default query and paste a new one that will generate more than 1000 results
                YasqeSteps.clearEditor();
                YasqeSteps.pasteQuery(testResultCountQuery);

                YasqeSteps.executeQuery();

                //return to My Settings to revert the changes
                visitSettingsView();
                // Wait for loader to disappear
                cy.get('.ot-loader').should('not.be.visible');

                turnOnLabelBtn('#sameas-on');
                turnOnLabelBtn('#inference-on');
                cy.get('#defaultCount:checkbox').check()
                    .then(() => {
                        cy.get('#defaultCount:checkbox')
                            .should('be.visible')
                            .and('be.checked');
                    });
            });
    });

    it('Should test the "Show schema ON/OFF by default in visual graph" setting in My Settings', () => {
        const DRY_GRAPH = "http://www.w3.org/TR/2003/PR-owl-guide-20031209/wine#Dry";
        //Verify that schema statements are ON in My settings
        cy.get('#schema-on').find('.switch:checkbox').should('be.checked');
        cy.enableAutocomplete(repositoryId);
        //Verify that schema statements ON is reflected in Visual graph
        visitVisualGraphView();
        cy.searchEasyVisualGraph(DRY_GRAPH);
        cy.get('.visual-graph-settings-btn').scrollIntoView().click();
        cy.get('.rdf-info-side-panel .filter-sidepanel').should('be.visible');
        cy.get('.include-schema-statements').should('be.visible').and('be.checked');
        saveGraphSettings()
            .then(() => cy.get('.predicate').should('contain','type'));

        //Set schema statements OFF in my settings
        visitSettingsView();

        clickLabelBtn('#schema-on').then(() => {
            cy.get('#schema-on')
                .find('.switch:checkbox')
                .should('not.be.visible');
        });

        getSaveButton()
            .click()
            .then(() => {
                verifyUserSettingsUpdated();
            });

        //Verify that schema statements OFF is reflected in Visual graph
        visitVisualGraphView();

        cy.searchEasyVisualGraph(DRY_GRAPH);

        cy.get('.visual-graph-settings-btn').click();
        cy.get('.rdf-info-side-panel .filter-sidepanel').should('be.visible');
        cy.get('.include-schema-statements')
            .scrollIntoView().should('be.visible').click()
            .then(($el) => {
                cy.wrap($el).trigger('mouseleave', {force: true});
                cy.get('.include-schema-statements').scrollIntoView()
                    .should('be.visible').and('not.be.checked');
                saveGraphSettings()
                    .then(() => cy.get('.predicate').should('not.exist'));
            });
        //return to My Settings to revert the changes
        visitSettingsView();
        // Wait for loader to disappear
        cy.get('.ot-loader').should('not.be.visible');
        clickLabelBtn('#schema-on')
            .then(() => {
                cy.waitUntil(() =>
                    cy.get('#schema-on')
                        .find('input[type="checkbox"]')
                        .scrollIntoView()
                        .then(input => input && input.attr('checked')));
            });
    });

    it('Saving administrator credentials with checked unset password should show modal window to warn user about' +
        ' unsetting the password', () => {
        // User role is administrator
        cy.get('#noPassword:checkbox').check()
            .then(() => {
                cy.get('#noPassword:checkbox')
                    .should('be.checked');
            });
        getSaveButton().click()
            .then(() => {
                cy.get('.modal-dialog').find('.lead').contains('If you unset the password and then enable security,' +
                    ' this administrator will not be able to log into GraphDB through the workbench.');
            });
    });

    it('sameAs button should be disabled if inference is turned off', () => {
        clickLabelBtn('#inference-on')
            .then(() => {
                cy.get('#inference-on')
                    .find('.switch:checkbox')
                    .should('not.be.visible');
            });

        cy.get('#sameas-on')
            .find('.switch:checkbox')
            .should('not.be.visible');
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
        return cy.get('#wb-user-submit').scrollIntoView().should('be.visible');
    }

    function verifyUserSettingsUpdated() {
        cy.waitUntil(() =>
            cy.get('#toast-container')
                .then(toast => toast && toast.text().includes('The user admin was updated')));
    }

    function saveGraphSettings() {
        return cy.get('.save-settings-btn')
            .scrollIntoView()
            .should('be.visible')
            .click();
    }

    function visitSettingsView() {
        cy.visit('/settings', {
            onBeforeLoad: (win) => {
                win.localStorage.setItem('ls.repository-id', repositoryId);
            }
        });
        cy.window()
            .then(() => cy.url().should('eq', `${Cypress.config('baseUrl')}/settings`));
        // Everything should be related to admin user.
        cy.get('.login-credentials').should('be.visible');
        cy.get('#wb-user-username').should('be.visible')
            .and('have.value', 'admin')
            .and('have.attr', 'readonly', 'readonly');
    }

    function visitVisualGraphView() {
        cy.visit('/graphs-visualizations');
        cy.window();
    }

    function clickLabelBtn(btnId) {
        return cy.get(btnId)
            .find('.switch.mr-0').scrollIntoView().should('be.visible').click();
    }

    function turnOnLabelBtn(btnId) {
        cy.get(btnId)
            .find('input[type="checkbox"]').check({force: true})
            .then(() => {
                cy.waitUntil(() =>
                    cy.get(btnId)
                        .find('input[type="checkbox"]')
                        .scrollIntoView()
                        .then(input => input && input.attr('checked')));
            });
    }
});
