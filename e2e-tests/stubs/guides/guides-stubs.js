export class GuidesStubs {
    static stubEnableAutocompleteGuide() {
        GuidesStubs.stubWithFixture('../fixtures/guides/autocomplete/enable-autocomplete-guide.json');
    }

    static stubWithFixture(fixturePath) {
        cy.intercept('/rest/guides', {fixture: fixturePath}).as('getGuides');
    }
}
