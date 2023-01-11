export class LanguageSelectorSteps {
    static getLanguageSelectorDropdown() {
        return cy.get('#languageGroupDrop').should('be.visible');
    }

    static openLanguageSelectorDropdown() {
        LanguageSelectorSteps.getLanguageSelectorDropdown().should('be.visible').click();
    }

    static changeLanguage(language) {
        LanguageSelectorSteps.openLanguageSelectorDropdown();
        cy.get('#lang-select-' + language).click();
    }

    static switchToFr() {
        LanguageSelectorSteps.changeLanguage('fr');
    }

    static switchToEn() {
        LanguageSelectorSteps.changeLanguage('en');
    }
}
