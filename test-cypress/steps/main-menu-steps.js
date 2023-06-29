export class MainMenuSteps {

    static getMainMenu() {
        return cy.get('.main-menu');
    }

    static getMenuButton(menuName) {
        return MainMenuSteps.getMainMenu().find('.menu-element').contains(menuName);
    }

    static clickOnMenu(menuName) {
        MainMenuSteps.getMenuButton(menuName).click();
    }

    static clickOnMenuImport() {
        MainMenuSteps.clickOnMenu('Import');
    }
}
