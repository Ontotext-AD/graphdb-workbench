import SparqlSteps from "../../steps/sparql-steps";
import {QueryStubs} from "../../stubs/query-stubs";

describe('Formatting of SPARQL result bindings.', () => {
    let repositoryId;

    beforeEach(() => {
        repositoryId = 'sparql-' + Date.now();
        SparqlSteps.createRepoAndVisit(repositoryId);
    });

    afterEach(() => {
        cy.deleteRepository(repositoryId);
    });

    it('should format result cell properly if result binding is IRI', () => {
        // When I execute a query that returns IRI result.
        SparqlSteps.typeQuery('select * where { values (?x ) { (<http://example.com/foobarbaz/meow/123>) }}');
        SparqlSteps.executeQuery();

        // Then I expect "/" character and "://" sequence to be followed by <wbr> tag.
        SparqlSteps.getResultCellLink(0, 1).then(function($el) {
            expect($el.html()).to.eq('http://<wbr>example.com/<wbr>foobarbaz/<wbr>meow/<wbr>123');
        });
        // and break-word is applied,
        SparqlSteps.getResultCellLink(0, 1).should('have.css', 'word-wrap', 'break-word');
        SparqlSteps.getResultUriCell(0, 1).should('have.attr', 'lang', 'xx');
    });

    it('should format properly result cell if result binding is literal and has language tag', () => {
        // When I execute a query that returns literal result.
        SparqlSteps.typeQuery('select * where { values (?x ) { ("some text "@en-GB) }}');
        SparqlSteps.executeQuery();

        SparqlSteps.getResultNoUriCell(0, 1).then(function($el) {
            expect($el.html()).to.eq('"some text "<sup>@en-GB</sup>');
        });
        // Then I expect break-word is applied,
        SparqlSteps.getResultNoUriCell(0, 1).should('have.css', 'word-wrap', 'break-word');
        // language attribute is applied.
        SparqlSteps.getResultLiteralCell(0, 1).should('have.attr', 'lang', 'en-GB');
        SparqlSteps.getResultLiteralCell(0, 1).should('have.css', 'hyphens', 'auto');
    });

    it('should format properly result cell if result binding is literal and has not language tag', () => {
        // When I execute a query that returns literal result.
        SparqlSteps.typeQuery('select * where { values (?x ) { ("some text ") }}');
        SparqlSteps.executeQuery();

        // Then I expect break-word is applied,
        SparqlSteps.getResultNoUriCell(0, 1).should('have.css', 'word-wrap', 'break-word');
        // language attribute is applied.
        SparqlSteps.getResultLiteralCell(0, 1).should('have.attr', 'lang', 'xx');
        SparqlSteps.getResultLiteralCell(0, 1).should('have.css', 'hyphens', 'auto');
    });

    it('should format result cell properly if result binding is literal and contains data type value', () => {
        // When I execute a query that returns literal result.
        SparqlSteps.typeQuery('select * where { values (?x ) { ("some text with data type 2.0^^xsd:floatsup") }}');
        SparqlSteps.executeQuery();

        // Then I expect "^^" to be prefixed with <wbr> tag,
        SparqlSteps.getResultNoUriCell(0, 1).then(function($el) {
            expect($el.html()).to.eq("\"some text with data type 2.0<wbr>^^xsd:<wbr>floatsup\"");
        });

        // and I expect break-word is applied,
        SparqlSteps.getResultCell(0, 1).should('have.css', 'word-wrap', 'break-word');
        // and language attribute is applied.
        SparqlSteps.getResultLiteralCell(0, 1).should('have.attr', 'lang', 'xx');
        SparqlSteps.getResultLiteralCell(0, 1).should('have.css', 'hyphens', 'auto');
    });

    it('should format bnode', () => {
        // When I execute a query that returns bnode.
        QueryStubs.stubSparqlHistoryResponse(repositoryId);
        SparqlSteps.executeQuery();

        // Then I expect the "_:" prefix of bnode to not be followed by <wbr> tag,
        SparqlSteps.getResultNoUriCell(0, 1).then(function($el) {
            expect($el.html()).to.eq('_:83222b124ff949648bd78ee778d22f601149');
        });
    });
});
