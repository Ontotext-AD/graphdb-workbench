import { LicenseStubs } from "../../../stubs/license-stubs";
import { VisualGraphSteps } from "../../../steps/visual-graph-steps";
import { HtmlUtil } from "../../../utils/html-util";

/**
 * RDF snippet with the necessary data to test all possible label scenarios:
 * 1. (ex:node1) Node with a plain text label;
 * 2. (ex:node2) Node with an HTML label;
 * 3. (ex:node3) Node with a label that contains a new line ("\n") character;
 * 4. (ex:node4) Node with a long label.
 *
 * @type {string}
 */
const RDF_SNIPPETS_WITH_NODE_LABELS_DATA =
    '@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .\n' +
    '@prefix ex: <http://example.com/> .\n' +
    '\n' +
    '# Define Nodes with Labels\n' +
    'ex:node1 rdfs:label "Node One" .\n' +
    'ex:node2 rdfs:label "Node<br>Two" .\n' +
    'ex:node3 rdfs:label "Node\\nThree" .\n' +
    'ex:node4 rdfs:label "A longer label for Node Four" .\n' +
    '\n' +
    '# Relationships Between Nodes\n' +
    'ex:node1 ex:connectedTo ex:node2 .\n' +
    'ex:node1 ex:connectedTo ex:node3 .\n' +
    'ex:node1 ex:connectedTo ex:node4 .\n';

describe("Node Basics", () => {

    let repositoryId;

    beforeEach(() => {
        cy.clearLocalStorage('ls.graphs-viz');
        repositoryId = 'graphRepo-node-labels-' + Date.now();
        cy.createRepository({ id: repositoryId });
        cy.presetRepository(repositoryId);
        // cy.importServerFile(repositoryId, FILE_WITH_NODE_LABELS_DATA);
        cy.importRDFTextSnippet(repositoryId, RDF_SNIPPETS_WITH_NODE_LABELS_DATA);
        LicenseStubs.spyGetLicense();
    });

    afterEach(() => {
        cy.clearLocalStorage('ls.graphs-viz');
        cy.deleteRepository(repositoryId);
    });

    it('should allow the node label to be displayed on multiple lines only when a new line character is used', () => {
        // When: I open a visual graph of a node that has links to other nodes.
        VisualGraphSteps.openNodeLabelGraph();

        // Then: I expect:
        // The label of ex:node1 to be displayed as is, because it is short plain text.
        VisualGraphSteps.getNodeLabel('http://example.com/node1').should('have.html', 'Node One');

        // The label of ex:node2 to be displayed with all HTML tags removed.
        VisualGraphSteps.getNodeLabel('http://example.com/node2').should('have.html', 'NodeTwo');

        // The label of ex:node3 to be displayed with the new line character replaced by a <br> tag.
        VisualGraphSteps.getNodeLabel('http://example.com/node3').should('have.html', 'Node<br>Three');

        // The label of ex:node4 to be displayed with a long label (no truncation).
        VisualGraphSteps.getNodeLabel('http://example.com/node4').should('have.html', 'A longer label for Node Four');

        // The label of ex:node4 should be truncated with ellipsis because it has a long label.
        HtmlUtil.verifyEllipsis(VisualGraphSteps.getNodeLabel('http://example.com/node4'));
    });
});
