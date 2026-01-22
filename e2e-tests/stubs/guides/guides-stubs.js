export class GuidesStubs {
    static stubEnableAutocompleteGuide() {
        GuidesStubs.stubWithFixture('../fixtures/guides/autocomplete/enable-autocomplete-guide.json');
    }

    static stubCreateRepositoryGuide(guidesArray) {
        GuidesStubs.stubWithData(guidesArray);
    }

    static stubCreateAndConfigureAgentGuide() {
        GuidesStubs.stubWithFixture('../fixtures/guides/ttyg/configure-agent/configure-ttyg-agent-guide.json');
    }

    static stubTTYGConversationGuide() {
        GuidesStubs.stubWithFixture('../fixtures/guides/ttyg/conversation/ttyg-conversation-guide.json');
    }

    static stubClassHierarchyGuide() {
        GuidesStubs.stubWithFixture('../fixtures/guides/class-hierarchy/class-hierarchy-guide.json');
    }

    static stubClassRelationsGuide() {
        GuidesStubs.stubWithFixture('../fixtures/guides/class-relations/class-relations-guide.json');
    }

    static stubConnectorsGuide() {
        GuidesStubs.stubWithFixture('../fixtures/guides/connectors/connectors-guide.json');
    }

    static stubLuceneConnectorsGuide() {
        GuidesStubs.stubWithFixture('../fixtures/guides/connectors/lucene-connector-guide.json');
    }

    static stubCreateSimilarityIndexGuide() {
        GuidesStubs.stubWithFixture('../fixtures/guides/create-similarity-index/create-similarity-index-guide.json');
    }

    static stubDownloadGuideResourceGuide() {
        GuidesStubs.stubWithFixture('../fixtures/guides/download-guide-resource/download-guide-resource-guide.json');
    }

    static stubDownloadResource(resourcePath, resourceFile) {
        cy.intercept('GET', `/rest/guides/download/${resourcePath}/${resourceFile}`, {
            fixture: `guides/download-resource.ttl`,
        }).as('resource-download');;
    }

    static stubWithFixture(fixturePath) {
        cy.intercept('/rest/guides', {fixture: fixturePath}).as('getGuides');
    }

    static stubWithData(data) {
        cy.intercept('/rest/guides', {body: data}).as('getGuides');
    }
}
