describe('Import/ OntoRefine', () => {

    let repositoryId;

    beforeEach(() => {
        repositoryId = 'onto-refine-' + Date.now();
        cy.createRepository({id: repositoryId});

        cy.server();
        cy.route('https://tools.wmflabs.org/openrefine-wikidata/en/api', response);

        cy.visit('/ontorefine');

        cy.get('.ot-splash').should('not.be.visible');
        getOntoRefineFrame().should('be.visible');
    });

    afterEach(() => {
        cy.deleteRepository(repositoryId);
    });

    const REFINE_TABS = ['Create Project', 'Open Project', 'Import Project', 'Language Settings'];
    const CREATE_PROJECT_TABS = ['This Computer', 'Web Addresses (URLs)', 'Clipboard'];

    it('should properly render OntoRefine transformation tool frame', () => {

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
        getCreateProjectPanel().should('not.be.visible');
        getOpenProjectPanel()
            .should('be.visible')
            // Should have no existing projects for new repositories
            .find('#no-project-message')
            .should('be.visible');

        // -------- Import project --------

        getOntoRefineTabs().eq(2).click();
        getOpenProjectPanel().should('not.be.visible');
        getImportProjectPanel()
            .should('be.visible')
            .find('#import-project-button')
            .should('be.visible');

        // -------- Language Settings --------

        getOntoRefineTabs().eq(3).click();
        getImportProjectPanel().should('not.be.visible');
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

    const response = {"name": "Wikidata (en)", "schemaSpace": "http://www.wikidata.org/prop/direct/", "preview": {"url": "https://tools.wmflabs.org/openrefine-wikidata/en/preview?id={{id}}", "width": 400, "height": 100}, "extend": {"propose_properties": {"service_path": "/en/propose_properties", "service_url": "https://tools.wmflabs.org/openrefine-wikidata"}, "property_settings": [{"name": "limit", "label": "Limit", "default": 0, "help_text": "Maximum number of values to return per row (0 for no limit)", "type": "number"}, {"name": "rank", "choices": [{"name": "Any rank", "value": "any"}, {"name": "Only the best rank", "value": "best"}, {"name": "Preferred and normal ranks", "value": "no_deprecated"}], "default": "best", "help_text": "Filter statements by rank", "type": "select", "label": "Ranks"}, {"name": "references", "choices": [{"name": "Any statement", "value": "any"}, {"name": "At least one reference", "value": "referenced"}, {"name": "At least one non-wiki reference", "value": "no_wiki"}], "default": "any", "help_text": "Filter statements by their references", "type": "select", "label": "References"}, {"name": "count", "label": "Return counts instead of values", "default": false, "help_text": "The number of values will be returned.", "type": "checkbox"}]}, "view": {"url": "https://www.wikidata.org/wiki/{{id}}"}, "suggest": {"entity": {"service_path": "/en/suggest/entity", "service_url": "https://tools.wmflabs.org/openrefine-wikidata", "flyout_service_path": "/en/flyout/entity?id=${id}"}, "property": {"service_path": "/en/suggest/property", "service_url": "https://tools.wmflabs.org/openrefine-wikidata", "flyout_service_path": "/en/flyout/property?id=${id}"}, "type": {"service_path": "/en/suggest/type", "service_url": "https://tools.wmflabs.org/openrefine-wikidata", "flyout_service_path": "/en/flyout/type?id=${id}"}}, "defaultTypes": [{"name": "entity", "id": "Q35120"}], "identifierSpace": "http://www.wikidata.org/entity/"};

});
