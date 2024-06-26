export class SavedQueriesDialog {
    static getSavedQueriesPopup() {
        return cy.get('.saved-queries-popup');
    }

    static getSavedQueries() {
        return this.getSavedQueriesPopup().find('.saved-query');
    }

    static selectSavedQueryByIndex(index) {
        this.getSavedQueries().eq(index).find('a').click();
    }

    static selectSavedQueryByName(name) {
        this.getSavedQueries().contains(name).click();
    }
    
    static getQueryByName(name) {
        return this.getSavedQueries().contains(name).realHover();
    }
    
    static getEditQueryButtonByName(name) {
        return this.getQueryByName(name).closest('.saved-query').find('.edit-saved-query');
    }

    static editQueryByName(name) {
        this.getEditQueryButtonByName(name).click();
    }

    static getDeleteQueryButtonByName(name) {
        return this.getQueryByName(name).closest('.saved-query').find('.delete-saved-query');
    }

    static deleteQueryByName(name) {
        this.getDeleteQueryButtonByName(name).click();
    }

    static getShareQueryButtonByName(name) {
        return this.getQueryByName(name).closest('.saved-query').find('.share-saved-query');
    }

    static shareQueryByName(name) {
        this.getShareQueryButtonByName(name).click();
    }
}
