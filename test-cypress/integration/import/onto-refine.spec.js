describe('Import/ OntoRefine', () => {

    let repositoryId;

    beforeEach(() => {
        repositoryId = 'onto-refine-' + Date.now();
        cy.createRepository({id: repositoryId});

        cy.visit('/ontorefine');
        cy.window();

        cy.get('.ot-splash').should('not.exist');
        getOntoRefineFrame().should('be.visible');
    });

    afterEach(() => {
        cy.deleteRepository(repositoryId);
    });

    const REFINE_TABS = ['Create Project', 'Open Project', 'Import Project', 'Language Settings'];
    const CREATE_PROJECT_TABS = ['This Computer', 'Web Addresses (URLs)', 'Clipboard'];

    xit('should properly render OntoRefine transformation tool frame', () => {

        // Refine should provide navigation tabs
        getOntoRefineTabs()
            .should('be.visible')
            .and('have.length', 4)
            .each(($tab, $index) => expect($tab.text()).to.equal(REFINE_TABS[$index]))
            .eq(0)
            // The first tab should be automatically selected
            .should('have.class', 'selected')
            .and('be.visible');

        // -------- Create project --------

        // The create project panel should be rendered by default and provide its own tabs
        getCreateProjectPanel().should('be.visible');
        getCreateProjectPanelTabs()
            .should('be.visible')
            .and('have.length', 3)
            .each(($tab, $index) => expect($tab.text()).to.equal(CREATE_PROJECT_TABS[$index]))
            .eq(0)
            .should('have.class', 'selected')
            .and('be.visible');

        // The upload panel should be opened by default
        getCreateProjectPanelBody()
            .find('.upload-parent #upload')
            .should('be.visible');

        // Go to URL panel
        getCreateProjectPanelTabs().eq(1).click();
        getCreateProjectPanelBody()
            .find('.default-importing-web-url')
            .should('be.visible');

        // Go to Clipboard panel
        getCreateProjectPanelTabs().eq(2).click();
        getCreateProjectPanelBody()
            .find('#default-importing-clipboard-textarea')
            .should('be.visible');

        // -------- Open project --------

        // Go to Open project and check if the panels are properly switched
        getOntoRefineTabs().eq(1).click();
        getCreateProjectPanel().should('not.exist');
        getOpenProjectPanel()
            .should('be.visible')
            // Should have no existing projects for new repositories
            .find('#no-project-message')
            .should('be.visible');

        // -------- Import project --------

        getOntoRefineTabs().eq(2).click();
        getOpenProjectPanel().should('not.exist');
        getImportProjectPanel()
            .should('be.visible')
            .find('#import-project-button')
            .should('be.visible');

        // -------- Language Settings --------

        getOntoRefineTabs().eq(3).click();
        getImportProjectPanel().should('not.exist');
        getLanguageSettingsPanel()
            .should('be.visible')
            .find('#set-lang-button')
            .should('be.visible');
    });

    function getOntoRefineFrame() {
        return cy.get('#ontorefine-iframe').iframe();
    }

    function getOntoRefineLeftPanel() {
        return getOntoRefineFrame().find('#left-panel');
    }

    function getOntoRefineTabs() {
        return getOntoRefineLeftPanel().find('#action-area-tabs .action-area-tab');
    }

    function getOntoRefineRightPanel() {
        return getOntoRefineFrame().find('#right-panel');
    }

    function getCreateProjectPanel() {
        return getOntoRefineRightPanel().find('#create-project-ui-source-selection-layout');
    }

    function getCreateProjectPanelTabs() {
        return getCreateProjectPanel().find('#create-project-ui-source-selection-tabs .create-project-ui-source-selection-tab')
    }

    function getCreateProjectPanelBody() {
        return getCreateProjectPanel().find('#create-project-ui-source-selection-tab-bodies')
    }

    function getOpenProjectPanel() {
        return getOntoRefineRightPanel().find('#projects-container');
    }

    function getImportProjectPanel() {
        // TODO Note: The third and fourth tab bodies have the same identifier....
        return getOntoRefineRightPanel().find('.action-area-tab-body').eq(2);
    }

    function getLanguageSettingsPanel() {
        return getOntoRefineRightPanel().find('.action-area-tab-body').eq(3);
    }

});
