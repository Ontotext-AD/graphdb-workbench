import {GuideSteps} from '../../../steps/guides/guide-steps.js';
import {GuideDialogSteps} from '../../../steps/guides/guide-dialog-steps.js';
import {GuidesStubs} from '../../../stubs/guides/guides-stubs.js';
import {ConnectorsSteps} from '../../../steps/setup/connectors-steps.js';

describe('Connectors guide', () => {
    let repositoryId;

    beforeEach(() => {
        repositoryId = 'connectors-guide-' + Date.now();
        cy.createRepository({id: repositoryId});
        cy.presetRepository(repositoryId);
    });

    afterEach(() => {
        cy.deleteRepository(repositoryId);
    });

    describe('General connectors guide steps', () => {
        const instanceName = 'LuceneConnector';
        beforeEach(() => {
            GuidesStubs.stubConnectorsGuide();
            cy.createConnector(repositoryId, 'lucene', instanceName);

            GuideSteps.visit();
            GuideSteps.verifyGuidesListExists();
            cy.wait('@getGuides');
            GuideSteps.runFirstGuide();
        });
        it('Should test connectors steps', () => {
            GuideDialogSteps.assertDialogWithTitleIsVisible('Connectors');
            GuideDialogSteps.assertDialogWithContentIsVisible('GraphDB Connectors let you integrate external components and services with your repository data. They extend what your applications can do and stay automatically in sync with repository updates.');
            GuideDialogSteps.clickOnNextButton();

            GuideDialogSteps.assertDialogWithTitleIsVisible('Connectors');
            GuideDialogSteps.assertDialogWithContentIsVisible('Specific GraphDB Connectors provide different connection possibilities.');
            GuideDialogSteps.clickOnNextButton();

            GuideDialogSteps.assertDialogWithTitleIsVisible('Connectors');
            GuideDialogSteps.assertDialogWithContentIsVisible('Each section represents a single connector instance. For every instance, you can use the buttons on the right to copy, repair, or delete it.');
            GuideDialogSteps.clickOnNextButton();

            GuideDialogSteps.assertDialogWithTitleIsVisible('Connectors');
            GuideDialogSteps.assertDialogWithContentIsVisible('To view the configuration of a connector, click on its name. This will expand the connector details.');
            ConnectorsSteps.expandConnector('Lucene', instanceName);

            GuideDialogSteps.assertDialogWithTitleIsVisible('Connectors');
            GuideDialogSteps.assertDialogWithContentIsVisible('The creation parameters for luc:createConnector define how a connector instance is created. They are provided in a JSON object with parameter names as keys. Some parameters are required, others optional, and values can be simple types, lists, or objects');
            GuideDialogSteps.clickOnNextButton();

            GuideDialogSteps.assertDialogWithTitleIsVisible('Connectors');
            GuideDialogSteps.assertDialogWithContentIsVisible('A parameter can define how an instance is created. Its value may be a simple type, a list, or an object, and it can be required or optional.');
            GuideDialogSteps.clickOnNextButton();

            GuideDialogSteps.assertDialogWithTitleIsVisible('Connectors');
            GuideDialogSteps.assertDialogWithContentIsVisible('Click on View SPARQL Query to view the connector creation query.');
            ConnectorsSteps.viewSPARQLQuery('Lucene', instanceName);

            GuideDialogSteps.assertDialogWithTitleIsVisible('Connectors');
            GuideDialogSteps.assertDialogWithContentIsVisible('The dialog displays the SPARQL query used to create the connector. You can copy it to execute manually or integrate it into automation scripts.');
            GuideDialogSteps.clickOnNextButton();

            GuideDialogSteps.assertDialogWithTitleIsVisible('Connectors');
            GuideDialogSteps.assertDialogWithContentIsVisible('Click on close button to close the dialog');
            ConnectorsSteps.closeSPARQLQueryDialog();

            GuideDialogSteps.assertDialogWithTitleIsVisible('End of guide');
            GuideDialogSteps.assertDialogWithContentIsVisible('This guide has ended.');
        });
    });

    describe('Lucene connector guide steps', () => {
        const instanceName = 'NamedIndividuals';
        beforeEach(() => {
            GuidesStubs.stubLuceneConnectorsGuide();
            cy.createConnector(repositoryId, 'lucene', instanceName);

            GuideSteps.visit();
            GuideSteps.verifyGuidesListExists();
            cy.wait('@getGuides');
            GuideSteps.runFirstGuide();
        });
        it.only('Should test Lucene connector steps', () => {
            GuideDialogSteps.assertDialogWithTitleIsVisible('Lucene connector');
            GuideDialogSteps.assertDialogWithContentIsVisible('The Lucene Connector in GraphDB enables extremely fast keyword and faceted (aggregation) searches. Unlike traditional setups where indexing is handled externally, this connector stays automatically synchronized with your repository data, ensuring accurate and up-to-date search results at all times.');
            GuideDialogSteps.clickOnNextButton();

            GuideDialogSteps.assertDialogWithTitleIsVisible('Lucene connector');
            GuideDialogSteps.assertDialogWithContentIsVisible('This is the Lucene connector named NamedIndividuals. You can copy, restart, or delete it using the icons on the right.');
            GuideDialogSteps.clickOnNextButton();

            GuideDialogSteps.assertDialogWithTitleIsVisible('Lucene connector');
            GuideDialogSteps.assertDialogWithContentIsVisible('Click on NamedIndividuals to view its configuration.');
            ConnectorsSteps.expandConnector('Lucene', instanceName);

            GuideDialogSteps.assertDialogWithTitleIsVisible('Lucene connector');
            GuideDialogSteps.assertDialogWithContentIsVisible('The fields define exactly what parts of each entity will be synchronized as well as the specific details on the connector side. The field is the smallest synchronization unit, and it maps a property chain from GraphDB to a field in Lucene. The fields are specified as a list of field objects. At least one field object is required.');
            GuideDialogSteps.clickOnNextButton();

            GuideDialogSteps.assertDialogWithTitleIsVisible('Lucene connector');
            GuideDialogSteps.assertDialogWithContentIsVisible('The Field name defines the mapping on the connector side and is specified as a string. It is also used at query time to reference the field.');
            GuideDialogSteps.clickOnNextButton();

            GuideDialogSteps.assertDialogWithTitleIsVisible('Lucene connector');
            GuideDialogSteps.assertDialogWithContentIsVisible('The Property chain defines the mapping on the GraphDB side. A property chain is a sequence of triples where the entity IRI is the subject of the first triple, its object is the subject of the next triple, and so on. A single-element property chain corresponds to a direct property. Property chains are specified as a list of IRIs, with at least one required.');
            GuideDialogSteps.clickOnNextButton();

            GuideDialogSteps.assertDialogWithTitleIsVisible('Lucene connector');
            GuideDialogSteps.assertDialogWithContentIsVisible('The Indexed option determines whether the field is searchable with Lucene queries. By default, indexing is enabled.');
            GuideDialogSteps.clickOnNextButton();

            GuideDialogSteps.assertDialogWithTitleIsVisible('Lucene connector');
            GuideDialogSteps.assertDialogWithContentIsVisible('The Stored option determines whether the field’s values are stored in Lucene. By default, fields are stored (true).');
            GuideDialogSteps.clickOnNextButton();

            GuideDialogSteps.assertDialogWithTitleIsVisible('Lucene connector');
            GuideDialogSteps.assertDialogWithContentIsVisible('The Analyzed option determines whether literal fields are processed by the analyzer when indexed. IRIs are never analyzed. By default, fields are analyzed (true).');
            GuideDialogSteps.clickOnNextButton();

            GuideDialogSteps.assertDialogWithTitleIsVisible('Lucene connector');
            GuideDialogSteps.assertDialogWithContentIsVisible('The Multivalued option specifies whether multiple values for RDF properties are synchronized to Lucene. True by default; if false, only a single value is synchronized.');
            GuideDialogSteps.clickOnNextButton();

            GuideDialogSteps.assertDialogWithTitleIsVisible('Lucene connector');
            GuideDialogSteps.assertDialogWithContentIsVisible('The Facet option specifies whether the field is available for faceted searches in Lucene. Managed by the facet option (boolean, true by default).');
            GuideDialogSteps.clickOnNextButton();

            GuideDialogSteps.assertDialogWithTitleIsVisible('Lucene connector');
            GuideDialogSteps.assertDialogWithContentIsVisible('This lucene connector configuration contains multiple field mappings. They determine which values are searchable, filterable, or retrievable during query execution.');
            GuideDialogSteps.clickOnNextButton();

            GuideDialogSteps.assertDialogWithTitleIsVisible('Lucene connector');
            GuideDialogSteps.assertDialogWithContentIsVisible('For more information please visit GraphDB documentation');
            GuideDialogSteps.getContentLink()
                .should('have.attr', 'href')
                .and('include', 'my-custom-link.html');
            GuideDialogSteps.clickOnNextButton();

            GuideDialogSteps.assertDialogWithTitleIsVisible('Lucene connector');
            GuideDialogSteps.assertDialogWithContentIsVisible('The Languages option defines which RDF literal languages are mapped to the connector. You can provide a list of language ranges to include specific languages, or an empty range to include literals without a language tag.');
            GuideDialogSteps.clickOnNextButton();

            GuideDialogSteps.assertDialogWithTitleIsVisible('Lucene connector');
            GuideDialogSteps.assertDialogWithContentIsVisible('The Types option specifies RDF types of entities to synchronize, given as a list of IRIs (at least one required).Special values: $any: sync entities with at least one RDF type.$untyped: sync entities even if they have no RDF type.');
            GuideDialogSteps.clickOnNextButton();

            GuideDialogSteps.assertDialogWithTitleIsVisible('Lucene connector');
            GuideDialogSteps.assertDialogWithContentIsVisible('Click on View SPARQL Query to view the Lucene connector creation query.');
            ConnectorsSteps.viewSPARQLQuery('Lucene', instanceName);

            GuideDialogSteps.assertDialogWithTitleIsVisible('Lucene connector');
            GuideDialogSteps.assertDialogWithContentIsVisible('The dialog displays the SPARQL query used to create the Lucene connector. You can copy it to execute manually or integrate it into automation scripts.');
            GuideDialogSteps.clickOnNextButton();

            GuideDialogSteps.assertDialogWithTitleIsVisible('Connectors');
            GuideDialogSteps.assertDialogWithContentIsVisible('Click on close button to close the dialog');
            ConnectorsSteps.closeSPARQLQueryDialog();

            GuideDialogSteps.assertDialogWithTitleIsVisible('End of guide');
            GuideDialogSteps.assertDialogWithContentIsVisible('This guide has ended.');
        });
    });
});
