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

    static editQueryByName(name) {
        this.getSavedQueries().contains(name).realHover().closest('.saved-query').find('.edit-saved-query').click();
    }

    static deleteQueryByName(name) {
        this.getSavedQueries().contains(name).realHover().closest('.saved-query').find('.delete-saved-query').click();
    }

    static shareQueryByName(name) {
        this.getSavedQueries().contains(name).realHover().closest('.saved-query').find('.share-saved-query').click();
    }
}
