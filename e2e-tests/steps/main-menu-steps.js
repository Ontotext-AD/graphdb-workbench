export class MainMenuSteps {

    static getMainMenu() {
        return cy.get('onto-navbar');
    }

    static openHomePage() {
        MainMenuSteps.getMainMenu().find('.home-page').click();
    }

    static getMenuButton(menuName) {
        return MainMenuSteps.getMainMenu().find('.menu-element').contains(menuName);
    }

    static getSubMenuButtonByName(menuName) {
        return MainMenuSteps.getMainMenu().find('.sub-menu-link').contains(menuName);
    }

    static getMenuImport() {
        return MainMenuSteps.getMenuButton('Import');
    }

    static getMenuSparql() {
        return MainMenuSteps.getMenuButton('SPARQL');
    }

    static clickOnSparqlMenu() {
        MainMenuSteps.getMenuSparql().click();
    }

    static openGraphQlMenu() {
        return this.clickOnSubmenuTriggerElement('GraphQL');
    }

    static clickOnEndpointManagement() {
        this.openGraphQlMenu();
        this.clickOnSubMenu('Endpoint Management');
    }

    static clickOnGraphQLPlayground() {
        this.openGraphQlMenu();
        this.clickOnSubMenu('GraphQL Playground');
    }

    static getSubmenuAutocomplete() {
        return MainMenuSteps.getSubMenuButton("sub-menu-autocomplete");
    }

    static getSubmenuClassHierarchy() {
        return MainMenuSteps.getSubMenuButton("menu-class-hierarchy");
    }

    static getSubmenuVisualGraph() {
        return MainMenuSteps.getSubMenuButton("sub-menu-visual-graph");
    }

    static clickOnMenu(menuName) {
        // Forced it because some element as "Explore" for example has CSS pointer-events: none
        MainMenuSteps.getMenuButton(menuName).click({force: true});
    }
    
    static clickOnSubmenuTriggerElement(menuName) {
        MainMenuSteps.getMainMenu().find('.menu-element-root').contains(menuName).parent().click();
    }

    static clickOnMenuImport() {
        MainMenuSteps.clickOnMenu('Import');
    }

    static clickOnExplore() {
        MainMenuSteps.clickOnSubmenuTriggerElement('Explore');
    }

    static getSubMenus() {
        return MainMenuSteps.getMainMenu().find('.sub-menu');
    }

    static getSubMenuButton(testId) {
        return this.getSubMenus().getByTestId(testId);
    }

    static clickOnSubMenu(submenuName) {
        MainMenuSteps.getMenuButton(submenuName).click();
    }

    static clickOnGraphsOverview() {
        this.clickOnExplore();
        this.getSubMenuButton('sub-menu-graph-overview').click();
    }

    static clickOnClassHierarchy() {
        this.clickOnExplore();
        this.getSubMenuButton('menu-class-hierarchy').click();
    }

    static clickOnVisualGraph() {
        this.clickOnExplore();
        this.getSubMenuButton('sub-menu-visual-graph').click();
    }

    static clickOnClassRelationships() {
        this.clickOnExplore();
        this.getSubMenuButton('sub-menu-class-relationships').click();
    }

    static clickOnSimilarity() {
        this.clickOnExplore();
        this.getSubMenuButton('sub-menu-similarity').click();
    }

    // --------------------------
    // --     Monitoring menu  --
    // --------------------------
    static getMenuMonitoring() {
        return MainMenuSteps.getMainMenu().getByTestId('menu-monitoring');
    }

    static clickOnMenuMonitoring () {
        this.getMenuMonitoring().click();
    }

    static clickOnQueryAndUpdate() {
        this.clickOnMenuMonitoring();
        this.getSubMenuButton('sub-menu-queries-and-updates').click();
    }

    static clickOnBackupAndRestore() {
        this.clickOnMenuMonitoring();
        this.getSubMenuButton('sub-menu-backup-and-restore').click();
    }


    static clickOnSystemMonitoring() {
        this.clickOnMenuMonitoring();
        this.getSubMenuButton('sub-menu-system-monitoring').click();
    }

    // --------------------------
    // --     Setup menu  --
    // --------------------------
    static getMenuSetup() {
        return MainMenuSteps.getMainMenu().getByTestId('menu-setup');
    }

    static clickOnMenuSetup() {
        this.getMenuSetup().click();
    }

    static clickOnRepositories() {
        this.clickOnMenuSetup();
        this.getSubMenuButton('sub-menu-repositories').click();
    }

    static clickOnACLManagement() {
        this.clickOnMenuSetup();
        this.getSubMenuButton('sub-menu-acl-management').click();
    }

    static clickOnUsersAndAccess() {
        this.clickOnMenuSetup();
        this.getSubMenuButton('sub-menu-users-and-access').click();
    }

    static clickOnLicense() {
        this.clickOnMenuSetup();
        this.getSubMenuButton('sub-menu-license').click();
    }

    static clickOnSparqlTemplates() {
        this.clickOnMenuSetup();
        this.getSubMenuButton('sub-menu-sparql-templates').click();
    }

    static clickOnJDBC() {
        this.clickOnMenuSetup();
        this.getSubMenuButton('sub-menu-jdbc').click();
    }

    static clickOnRDFRank() {
        this.clickOnMenuSetup();
        this.getSubMenuButton('sub-menu-rdf-rank').click();
    }

    static clickOnConnectors() {
        this.clickOnMenuSetup();
        this.getSubMenuButton('sub-menu-connectors').click();
    }

    static clickOnMySettings() {
        this.clickOnMenuSetup();
        this.getSubMenuButton('sub-menu-my-settings').click();
    }

    static clickOnAutocomplete() {
        this.clickOnMenuSetup();
        this.getSubmenuAutocomplete().click();
    }

    static clickOnNamespaces() {
        this.clickOnMenuSetup();
        this.getSubMenuButton('sub-menu-namespaces').click();
    }

    static clickOnPlugins() {
        this.clickOnMenuSetup();
        this.getSubMenuButton('sub-menu-plugins').click();
    }

    // --------------------------
    // --     Help menu  --
    // --------------------------

    static getMenuHelp() {
        return MainMenuSteps.getMainMenu().getByTestId('menu-help');
    }

    static clickOnMenuHelp() {
        this.getMenuHelp().click();
    }

    static clickOnInteractiveGuides() {
        this.clickOnMenuHelp();
        this.getSubMenuButton('sub-menu-guide').click();
    }

    static clickOnRestApiDocumentation() {
        this.clickOnMenuHelp();
        this.getSubMenuButton('sub-menu-rest-api').click();
    }

    static clickOnSystemInformation() {
        this.clickOnMenuHelp();
        this.getSubMenuButton('sub-menu-system-information').click();
    }

    static clickOnCluster() {
        this.clickOnMenuSetup();
        this.getSubMenuButton('sub-menu-cluster').click();
    }

    // --------------------------
    // --     Lab menu  --
    // --------------------------
    static getMenuLab() {
        return this.getMainMenu().getByTestId('menu-lab');
    }

    static clickOnMenuLab() {
        return this.getMenuLab().click();
    }

    static clickOnTTYG() {
        this.clickOnMenuLab();
        this.getSubMenuButton('sub-menu-ttyg').click();
    }

    // --------------------------
    // --     Explore menu  --
    // --------------------------
    static getMenuExplore() {
        return MainMenuSteps.getMainMenu().getByTestId('menu-explore');
    }
}
