export class GuidesStubs {
    static stubEnableAutocompleteGuide() {
        GuidesStubs.stubWithFixture('../fixtures/guides/autocomplete/enable-autocomplete-guide.json');
    }

    static stubCreateRepositoryGuide(guidesArray) {
        GuidesStubs.stubWithData(guidesArray);
    }

    static stubClassHierarchyGuide() {
        GuidesStubs.stubWithFixture('../fixtures/guides/class-hierarchy/class-hierarchy-guide.json');
    }

    static stubClassRelationsGuide() {
        GuidesStubs.stubWithFixture('../fixtures/guides/class-relations/class-relations-guide.json');
    }

    static stubWithFixture(fixturePath) {
        cy.intercept('/rest/guides', {fixture: fixturePath}).as('getGuides');
    }

    static stubWithData(data) {
        cy.intercept('/rest/guides', {body: data}).as('getGuides');
    }
}
