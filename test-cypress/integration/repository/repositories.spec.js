describe('Repositories', () => {

    let repositoryId;

    beforeEach(() => {
        repositoryId = 'repo-' + Date.now();

        cy.visit('/repository');

        waitUntilRepositoriesPageIsLoaded();
    });

    afterEach(() => {
        cy.deleteRepository(repositoryId);
    });

    function waitUntilRepositoriesPageIsLoaded() {
        // Workbench loading screen should not be visible
        cy.get('.ot-splash').should('not.be.visible');

        getRepositoriesDropdown().should('be.visible').and('not.be.disabled');
        getCreateRepositoryButton().should('be.visible').and('not.be.disabled');
    }

    it('should allow creation of repositories with default settings', () => {
        // There should be a default repository location
        getLocationsList()
            .should('have.length', 1)
            .and('contain', 'Local');

        createRepository();

        cy.url().should('include', '/repository/create');

        // Create a repository by supplying only an identifier
        getRepositoryCreateForm().should('be.visible');
        getRepositoryIdField()
            .should('have.value', '')
            .type(repositoryId)
            .should('have.value', repositoryId);

        saveRepository();

        // Verify we are back at the setup page after saving
        cy.url().should((url) => {
            expect(url.endsWith('/repository')).to.equal(true);
        });

        // Check the repo is present in the list of repos and we are not yet connected to it
        getRepositoryFromList(repositoryId)
            .should('be.visible')
            .find('.icon-connection-off')
            .should('be.visible');

        // Verify it's configuration can be downloaded
        getRepositoryFromList(repositoryId)
            .find('.repository-actions .download-repository-config-btn')
            .should('be.visible')
            .and('not.be.disabled');

        // Connect to the repository via the menu
        getRepositoriesDropdown().click().within(() => {
            // It should have not selected the new repo

            // Note: The better test here should verify for .no-selected-repository presence but in Travis it seems there is a selected
            // repository although Cypress clears cookies before each test OR the dropdown is not yet fully loaded which is strange
            // because the test has been running for several seconds before this check
            cy.get('#btnReposGroup').should('not.contain', repositoryId);

            // The dropdown should contain the newly created repository
            cy.get('.dropdown-menu .dropdown-item')
                .contains(repositoryId)
                .closest('a')
                // Force the click because Cypress sometimes determines that the item has 0x0 dimensions
                .click({force: true});

            // Should visualize the selected repo
            cy.get('.no-selected-repository').should('not.be.visible');
            cy.get('.active-repository')
                .should('be.visible')
                .and('contain', repositoryId);
        });

        // The repo should be connected after selecting it from the menu
        getRepositoryConnectionOnBtn(repositoryId).should('be.visible');

        // And it should not be present in the dropdown items
        getRepositoriesDropdown()
            .click()
            .find('.dropdown-menu .dropdown-item')
            .should('not.contain', repositoryId);
    });

    it('should disallow creation of repositories without mandatory settings', () => {
        createRepository();
        saveRepository();

        getRepositoryCreateForm().should('be.visible');
        getRepositoryIdField().should('have.attr', 'placeholder', 'This field is required');

        getToast()
            .find('.toast-error')
            .should('be.visible')
            .and('contain', 'Repository id cannot be empty');
    });

    it('should allow creation of repositories with custom settings', () => {
        const repoTitle = 'Repo title for ' + repositoryId;
        const newBaseUrl = 'http://example.org/wine#';

        createRepository();

        getRepositoryIdField().type(repositoryId);
        getRepositoryTitleField()
            .should('have.value', '')
            .type(repoTitle)
            .should('have.value', repoTitle);

        // Should be disabled before changing the rule set
        getRepositoryDisableSameAsCheckbox()
            .should('be.checked');

        // RDFS-Plus (Optimized) -> OWL-Horst (Optimized)
        getRepositoryRulesetMenu()
            .should('have.value', '7')
            .select('8')
            .should('have.value', '8');

        // Should be automatically enabled when the rule set is changed to one of the OWL rule set
        getRepositoryDisableSameAsCheckbox()
            .should('not.be.checked');

        getRepositoryBaseURLField()
            .should('have.value', 'http://example.org/owlim#')
            .clear()
            .type(newBaseUrl)
            .should('have.value', newBaseUrl);

        getRepositoryContextIndexCheckbox()
            .should('not.be.checked')
            .check()
            .should('be.checked');

        saveRepository();

        // Go to edit and check if everything is properly saved
        editRepository(repositoryId);

        cy.url().should('include', '/repository/edit/' + repositoryId);

        getRepositoryCreateForm().should('be.visible');
        getRepositoryIdField().should('have.value', repositoryId);
        getRepositoryTitleField().should('have.value', repoTitle);
        // OWL-Horst (Optimized) has become 9
        getRepositoryRulesetMenu().should('have.value', '9');
        getRepositoryDisableSameAsCheckbox().should('not.be.checked');
        getRepositoryBaseURLField().should('have.value', newBaseUrl);
        getRepositoryContextIndexCheckbox().should('be.checked');
    });

    it('should allow to switch between repositories', () => {
        const secondRepoId = 'second-repo-' + Date.now();
        createRepository();
        typeRepositoryId(repositoryId);
        saveRepository();

        createRepository();
        typeRepositoryId(secondRepoId);
        saveRepository();

        // Connect to the first repo via the connection icon
        // Note: Not using within() because the whole row will be re-rendered & detached
        getRepositoryConnectionOffBtn(repositoryId)
            .should('be.visible')
            .and('not.be.disabled')
            // Forcefully clicking it due to https://github.com/cypress-io/cypress/issues/695
            .click({force: true})
            .should('not.exist');

        // See it is connected and the second is not
        getRepositoryConnectionOnBtn(repositoryId).should('be.visible');
        getRepositoryConnectionOffBtn(secondRepoId).should('be.visible');
        getRepositoriesDropdown()
            .find('.active-repository')
            .should('contain', repositoryId);

        // Choose the second from the dropdown
        selectRepoFromDropdown(secondRepoId);

        // See it is connected and the first is disconnected
        getRepositoryConnectionOffBtn(repositoryId).should('be.visible');
        getRepositoryConnectionOnBtn(secondRepoId).should('be.visible');
        getRepositoriesDropdown()
            .find('.active-repository')
            .should('contain', secondRepoId);
        // The first should return back to the dropdown items
        getRepositoriesDropdown()
            .click()
            .find('.dropdown-menu .dropdown-item')
            .should('contain', repositoryId);
        // Hide the menu
        getRepositoriesDropdown().click();

        // Make the first one default, clear the cookies and reload the page
        // Note: the first one should be cleared in afterEach() preventing other tests to select it by default
        getRepositoryFromList(repositoryId)
            .find('.pin-repository-btn')
            .should('not.have.class', 'active')
            .click()
            .should('have.class', 'active');
        // The currently selected repository is kept as a cookie
        cy.clearCookies();
        cy.visit('/repository');

        // Should automatically select the default repository
        getRepositoriesDropdown()
            .find('.active-repository')
            .should('contain', repositoryId);

        // TODO: Could push the repo in an array and afterEach can delete all of them
        cy.deleteRepository(secondRepoId);
    });

    it('should allow to edit existing repository', () => {
        const newTitle = 'Title edit';
        const newBaseUrl = 'http://example.org/wine#';

        createRepository();
        typeRepositoryId(repositoryId);
        typeRepositoryTitle('Title');
        saveRepository();

        editRepository(repositoryId);

        // Some fields should be disabled
        getRepositoryRulesetMenu().should('be.disabled');
        getRepositoryDisableSameAsCheckbox().should('be.disabled');

        typeRepositoryTitle(newTitle);
        typeRepositoryBaseURL(newBaseUrl);
        getRepositoryContextIndexCheckbox().check();

        getSaveRepositoryButton().click();
        confirmModal();
        waitLoader();

        // See the title is rendered in the repositories list
        getRepositoryFromList(repositoryId).should('contain', newTitle);

        // Go to edit again to verify changes
        editRepository(repositoryId);

        getRepositoryTitleField().should('have.value', newTitle);
        getRepositoryBaseURLField().should('have.value', newBaseUrl);
        getRepositoryContextIndexCheckbox().should('be.checked');
    });

    it('should allow to delete existing repository', () => {
        createRepository();
        typeRepositoryId(repositoryId);
        saveRepository();

        selectRepoFromDropdown(repositoryId);

        getRepositoryFromList(repositoryId)
            .find('.repository-actions .delete-repository-btn')
            // Forcefully clicking it due to https://github.com/cypress-io/cypress/issues/695
            .should('be.visible')
            .and('not.be.disabled')
            .click({force: true});

        confirmModal();

        getRepositoriesList().should('not.contain', repositoryId);

        // Check the repo has been deselected and is not present in the repo dropdown menu
        getRepositoriesDropdown().click().within(() => {
            cy.get('#btnReposGroup').should('not.contain', repositoryId);
            cy.get('.dropdown-menu .dropdown-item').should('not.contain', repositoryId);
        });
    });

    const REPO_LIST_ID = '#wb-repositories-repositoryInGetRepositories';

    function getRepositoriesList() {
        return cy.get(REPO_LIST_ID);
    }

    function getLocationsList() {
        return cy.get('.locations-table tr');
    }

    function getRepositoryFromList(repository) {
        return getRepositoriesList()
            .find('.repository')
            .contains(repository)
            // Return the whole repo row
            .closest('.repository');
    }

    function getRepositoryConnectionOffBtn(id) {
        return getRepositoryFromList(id).find('.icon-connection-off');
    }

    function getRepositoryConnectionOnBtn(id) {
        return getRepositoryFromList(id).find('.icon-connection-on');
    }

    function editRepository(repositoryId) {
        getRepositoryFromList(repositoryId)
            .should('be.visible')
            .find('.repository-actions .edit-repository-btn')
            // Forcefully clicking it due to https://github.com/cypress-io/cypress/issues/695
            .should('be.visible')
            .and('not.be.disabled')
            .click({force: true});
    }

    function getCreateRepositoryButton() {
        return cy.get('#wb-repositories-addRepositoryLink');
    }

    function createRepository() {
        getCreateRepositoryButton().click();
    }

    function getRepositoriesDropdown() {
        return cy.get('#repositorySelectDropdown');
    }

    function getRepositoryCreateForm() {
        return cy.get('#newRepoForm');
    }

    function getRepositoryIdField() {
        return getRepositoryCreateForm().find('#id');
    }

    function typeRepositoryId(id) {
        getRepositoryIdField().type(id);
    }

    function getRepositoryTitleField() {
        return getRepositoryCreateForm().find('#title');
    }

    function typeRepositoryTitle(title) {
        getRepositoryTitleField().clear().type(title);
    }

    function getRepositoryRulesetMenu() {
        return getRepositoryCreateForm().find('#ruleset');
    }

    function getRepositoryDisableSameAsCheckbox() {
        return getRepositoryCreateForm().find('#disableSameAs');
    }

    function getRepositoryBaseURLField() {
        return getRepositoryCreateForm().find('#baseURL');
    }

    function typeRepositoryBaseURL(baseURL) {
        return getRepositoryBaseURLField().clear().type(baseURL);
    }

    function getRepositoryContextIndexCheckbox() {
        return getRepositoryCreateForm().find('#enableContextIndex');
    }

    function getSaveRepositoryButton() {
        return cy.get('#addSaveRepository');
    }

    function saveRepository() {
        getSaveRepositoryButton().click();
        waitLoader();
    }

    function waitLoader() {
        cy.get('.ot-loader').should('not.be.visible');
    }

    function selectRepoFromDropdown(repositoryId) {
        getRepositoriesDropdown()
            .click()
            .find('.dropdown-menu .dropdown-item')
            .contains(repositoryId)
            .closest('a')
            // Force the click because Cypress sometimes determines that the item has 0x0 dimensions
            .click({force: true});
    }

    function confirmModal() {
        cy.get('.modal')
            .should('be.visible')
            .and('not.have.class', 'ng-animate')
            .find('.modal-footer .btn-primary')
            .click();
    }

    function getToast() {
        return cy.get('#toast-container');
    }
});
