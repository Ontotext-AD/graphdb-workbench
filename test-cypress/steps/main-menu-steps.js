export class MainMenuSteps {

    static getMainMenu() {
        return cy.get('.main-menu');
    }

    static getMenuButton(menuName) {
        return MainMenuSteps.getMainMenu().find('.menu-element').contains(menuName);
    }

    static clickOnMenu(menuName) {
        // Forced it because some element as "Explore" for example has CSS pointer-events: none
        MainMenuSteps.getMenuButton(menuName).click({force: true});
    }

    static clickOnMenuImport() {
        MainMenuSteps.clickOnMenu('Import');
    }

    static clickOnExplore() {
        MainMenuSteps.clickOnMenu('Explore');
    }

    static getSubMenus() {
        return cy.get('.sub-menu-item');
    }

    static getSubMenuButton(submenuName) {
        return MainMenuSteps.getSubMenus().contains(submenuName);
    }

    static clickOnSubMenu(submenuName) {
        MainMenuSteps.getMenuButton(submenuName).click();
    }

    static clickOnGraphsOverview() {
        MainMenuSteps.clickOnSubMenu('Graphs overview');
    }
}
