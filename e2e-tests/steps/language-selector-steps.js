export class LanguageSelectorSteps {
    static getLanguageSelectorDropdown() {
        return cy.get('.onto-language-selector').should('be.visible');
    }

    static openLanguageSelectorDropdown() {
        LanguageSelectorSteps.getLanguageSelectorDropdown().should('be.visible').click();
    }

    static changeLanguage(language) {
        LanguageSelectorSteps.openLanguageSelectorDropdown();
        this.getLanguageSelectorDropdown().find(`button.${language}`).click();
    }

    static switchToFr() {
        LanguageSelectorSteps.changeLanguage('fr');
    }

    static switchToEn() {
        LanguageSelectorSteps.changeLanguage('en');
    }

    static getLanguageChangeModal() {
        return cy.get('.modal-dialog');
    }

    static confirmLanguageChange() {
        this.getLanguageChangeModal().find('.confirm-btn').click();
    }

    static cancelLanguageChange() {
        this.getLanguageChangeModal().find('.cancel-btn').click();
    }
}
