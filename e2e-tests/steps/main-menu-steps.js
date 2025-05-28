export class MainMenuSteps {

    static getMainMenu() {
        return cy.get('.navbar-component');
    }

    static openHomePage() {
        MainMenuSteps.getMainMenu().find('.home-page').click();
    }

    static getMenuButton(menuName) {
        return MainMenuSteps.getMainMenu().find('.menu-element').contains(menuName);
    }

    static getMenuImport() {
        return MainMenuSteps.getMenuButton('Import');
    }

    static getMenuExplore() {
        return MainMenuSteps.getMenuButton('Explore');
    }

    static getMenuSetup() {
        return MainMenuSteps.getMenuButton('Setup');
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
        return MainMenuSteps.getSubMenuButton("Autocomplete");
    }

    static getSubmenuClassHierarchy() {
        return MainMenuSteps.getSubMenuButton("Class hierarchy");
    }

    static getSubmenuVisualGraph() {
        return MainMenuSteps.getSubMenuButton("Visual graph");
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

    static getSubMenuButton(submenuName) {
        return MainMenuSteps.getSubMenus().contains(submenuName);
    }

    static clickOnSubMenu(submenuName) {
        MainMenuSteps.getMenuButton(submenuName).click();
    }

    static clickOnGraphsOverview() {
        this.clickOnExplore();
        this.getSubMenuButton('Graphs overview').click();
    }

    static clickOnClassHierarchy() {
        this.clickOnExplore();
        this.getSubMenuButton('Class hierarchy').click();
    }

    static clickOnVisualGraph() {
        this.clickOnExplore();
        this.getSubMenuButton('Visual graph').click();
    }
}
