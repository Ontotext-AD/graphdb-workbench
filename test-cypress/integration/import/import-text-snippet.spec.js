import ImportSteps from '../../steps/import-steps';

describe('Import user data: Import text snippet', () => {

    let repositoryId;
    const INITIAL_DATA = "<urn:s1> <urn:p1> <urn:o1>.";
    const REPLACEMENT_DATA = "<urn:replaced-s1> <urn:replaced-p1> <urn:replaced-o1>.";
    const PRE_DEFINED_INITIAL_GRAPH_DATA = "<urn:graph1> {<urn:s1-custom> <urn:p1-custom> <urn:o1-custom>.}";
    const PRE_DEFINED_REPLACED_GRAPH_DATA = "<urn:graph1> {<urn:replaced-s1-custom> <urn:replaced-p1-custom> <urn:replaced-o1-custom>.}";

    const RDF_TEXT_SNIPPET_1 = '@prefix d:<http://learningsparql.com/ns/data#>.\n' +
        '@prefix dm:<http://learningsparql.com/ns/demo#>.\n\n' +
        'd:item342 dm:shipped "2011-02-14"^^<http://www.w3.org/2001/XMLSchema#date>.\n' +
        'd:item342 dm:quantity 4.\n' +
        'd:item342 dm:invoiced true.\n' +
        'd:item342 dm:costPerItem 3.50.';

    const RDF_TEXT_SNIPPET_2 = '@prefix ab:<http://learningsparql.com/ns/addressbook#>.\n\n' +
        'ab:richard ab:homeTel "(229)276-5135".\n' +
        'ab:richard ab:email "richard49@hotmail.com".\n' +
        'ab:richard ab:email "richard491@hotmail.com".';

    const TURTLESTAR_SNIPPET = '@prefix ex:<http:/base.org/> .\n' +
        'ex:foo ex:pred ex:obj .\n' +
        '<<ex:foo rdfs:label "label">> ex:author "guest" .\n' +
        'ex:obj ex:quote <<ex:meta ex:data ex:foo>> .\n' +
        '<<<<ex:foo rdfs:label "label">>  ex:data ex:foo>> ex:recursive true .';

    const TRIGSTAR_SNIPPET = '@prefix ex: <http://example.com/> .\n' +
        '@prefix dct: <http://purl.org/dc/terms/> .\n' +
        '@prefix foaf: <http://xmlns.com/foaf/0.1/> .\n' +
        '@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .\n' +
        'graph ex:rdfstar {\n' +
        '    ex:bob foaf:knows << ex:alice foaf:knows<<ex:bob dct:created ex:book>> >> .\n' +
        '    <<<< ex:bob dct:created ex:book >> foaf:knows ex:alice >> dct:source ex:otherbook .\n' +
        '    ex:bobshomepage dct:source<< ex:book dct:creator ex:alice  >> .\n' +
        '    << ex:book dct:creator ex:alice  >> dct:source  ex:bobshomepage .\n' +
        '    << ex:book dct:creator ex:alice >> dct:requires << ex:alice dct:created ex:book >> .\n' +
        '    <<<http://example.org/a>ex:b ex:c>>ex:valid "1999-08-16"^^xsd:date .\n' +
        '}';

    const JSONLD_TEXT_SNIPPET = '[\n' +
        '    {\n' +
        '        "@id": "http://www.w3.org/1999/02/22-rdf-syntax-ns#Property",\n' +
        '        "@type": [\n' +
        '            "http://www.w3.org/1999/02/22-rdf-syntax-ns#Property",\n' +
        '            "http://www.w3.org/2000/01/rdf-schema#Datatype",\n' +
        '            "http://www.w3.org/2000/01/rdf-schema#ContainerMembershipProperty"\n' +
        '        ]\n' +
        '    }' +
        ']';

    const BASE_URI = 'http://purl.org/dc/elements/1.1/';
    const CONTEXT = 'http://example.org/graph';
    const TEXT_SNIPPET = 'Text snippet';
    const JSONLD_FORMAT = 'JSON-LD';
    const VALID_SNIPPET_TURTLESTAR_FORMAT = 'Turtle*';
    const VALID_SNIPPET_TRIGSTAR_FORMAT = 'TriG*';
    const VALID_SNIPPET_RDF_FORMAT = 'Turtle';
    const RDF_ERROR_MESSAGE = 'RDF Parse Error:';
    const SUCCESS_MESSAGE = 'Imported successfully';

    beforeEach(() => {
        repositoryId = 'user-import-' + Date.now();
        cy.createRepository({id: repositoryId});
        ImportSteps.visitUserImport(repositoryId);
    });

    afterEach(() => {
        cy.deleteRepository(repositoryId);
    });

    it('Should import RDF text snippet successfully with Auto format selected', () => {
        ImportSteps.openImportTextSnippetDialog();
        ImportSteps.fillRDFTextSnippet(RDF_TEXT_SNIPPET_1);
        ImportSteps.clickImportTextSnippetButton();
        ImportSteps.importFromSettingsDialog();
        ImportSteps.verifyImportStatus(TEXT_SNIPPET, SUCCESS_MESSAGE);
    });

    it('Should import RDF text snippet with invalid RDF format selected', () => {
        ImportSteps.openImportTextSnippetDialog();
        ImportSteps.fillRDFTextSnippet(RDF_TEXT_SNIPPET_1);
        ImportSteps.selectRDFFormat(JSONLD_FORMAT);
        ImportSteps.clickImportTextSnippetButton();
        ImportSteps.importFromSettingsDialog();
        ImportSteps.verifyImportStatus(TEXT_SNIPPET, RDF_ERROR_MESSAGE);
    });

    it('Should import RDF text snippet successfully with valid RDF format selected', () => {
        ImportSteps.openImportTextSnippetDialog();
        ImportSteps.fillRDFTextSnippet(RDF_TEXT_SNIPPET_1);
        ImportSteps.selectRDFFormat(VALID_SNIPPET_RDF_FORMAT);
        ImportSteps.clickImportTextSnippetButton();
        ImportSteps.importFromSettingsDialog();
        ImportSteps.verifyImportStatus(TEXT_SNIPPET, SUCCESS_MESSAGE);
    });

    it('Should import Turtle* text snippet successfully with valid RDF star format selected', () => {
        ImportSteps.openImportTextSnippetDialog();
        ImportSteps.fillRDFTextSnippet(TURTLESTAR_SNIPPET);
        ImportSteps.selectRDFFormat(VALID_SNIPPET_TURTLESTAR_FORMAT);
        ImportSteps.clickImportTextSnippetButton();
        ImportSteps.importFromSettingsDialog();
        ImportSteps.verifyImportStatus(TEXT_SNIPPET, SUCCESS_MESSAGE);
    });

    it('Should import TriG* text snippet successfully with valid RDF star format selected', () => {
        ImportSteps.openImportTextSnippetDialog();
        ImportSteps.fillRDFTextSnippet(TRIGSTAR_SNIPPET);
        ImportSteps.selectRDFFormat(VALID_SNIPPET_TRIGSTAR_FORMAT);
        ImportSteps.clickImportTextSnippetButton();
        ImportSteps.importFromSettingsDialog();
        ImportSteps.verifyImportStatus(TEXT_SNIPPET, SUCCESS_MESSAGE);
    });

    it('Should import RDF text snippet successfully with filled base URI and context', () => {
        ImportSteps.openImportTextSnippetDialog();
        ImportSteps.fillRDFTextSnippet(RDF_TEXT_SNIPPET_2);
        ImportSteps.clickImportTextSnippetButton();
        ImportSteps.fillBaseURI(BASE_URI);
        ImportSteps.selectNamedGraph();
        ImportSteps.fillNamedGraph(CONTEXT);
        ImportSteps.importFromSettingsDialog();
        ImportSteps.verifyImportStatus(TEXT_SNIPPET, SUCCESS_MESSAGE);

        // Go to Graphs overview
        cy.visit('/graphs');
        cy.get('.ot-splash').should('not.be.visible');

        let graphName = CONTEXT.slice(0, CONTEXT.lastIndexOf('.'));

        // Verify that created graph can be found
        cy.get('.search-graphs').type(graphName).should('have.value', graphName);
        cy.get('#export-graphs').should('be.visible').should('contain', graphName);
    });

    it('Should import RDF snippet in the default graph (from data) and replace data in the default graph', () => {
        ImportSteps.openImportTextSnippetDialog();
        ImportSteps.fillRDFTextSnippet(INITIAL_DATA);
        ImportSteps.selectRDFFormat("TriG");
        ImportSteps.clickImportTextSnippetButton();
        importFromData(false, "http://www.openrdf.org/schema/sesame#nil");
        getDeleteImportEntryButton().click();
        verifyGraphData("The default graph", "urn:s1", "urn:p1", "urn:o1", "http://www.ontotext.com/explicit", false, "urn:s1");
        ImportSteps.visitUserImport(repositoryId);
        ImportSteps.openImportTextSnippetDialog();
        ImportSteps.fillRDFTextSnippet(REPLACEMENT_DATA);
        ImportSteps.selectRDFFormat("TriG");
        ImportSteps.clickImportTextSnippetButton();
        importFromData(true, "http://www.openrdf.org/schema/sesame#nil")
        verifyGraphData("The default graph", "urn:replaced-s1", "urn:replaced-p1", "urn:replaced-o1", "http://www.ontotext.com/explicit", true, "urn:s1");
    });

    it('Should import RDF snippet with a custom graph (from data) and replace data in the custom graph', () => {
        ImportSteps.openImportTextSnippetDialog();
        ImportSteps.fillRDFTextSnippet(PRE_DEFINED_INITIAL_GRAPH_DATA);
        ImportSteps.selectRDFFormat("TriG");
        ImportSteps.clickImportTextSnippetButton();
        importFromData(false, "http://www.openrdf.org/schema/sesame#nil");
        getDeleteImportEntryButton().click();
        verifyGraphData("urn:graph1", "urn:s1-custom", "urn:p1-custom", "urn:o1-custom", "urn:graph1", false, "urn:s1-custom");
        ImportSteps.visitUserImport(repositoryId);
        ImportSteps.openImportTextSnippetDialog();
        ImportSteps.fillRDFTextSnippet(PRE_DEFINED_REPLACED_GRAPH_DATA);
        ImportSteps.selectRDFFormat("TriG");
        ImportSteps.clickImportTextSnippetButton();
        importFromData(true, "urn:graph1");
        verifyGraphData("urn:graph1", "urn:replaced-s1-custom", "urn:replaced-p1-custom", "urn:replaced-o1-custom", "urn:graph1", true, "urn:s1-custom");
    });

    it('Should import RDF snippet in the default graph (The default graph) and replace data in the default graph', () => {
        ImportSteps.openImportTextSnippetDialog();
        ImportSteps.fillRDFTextSnippet(INITIAL_DATA);
        ImportSteps.selectRDFFormat("TriG");
        ImportSteps.clickImportTextSnippetButton();
        importInTheDefaultGraph(false);
        getDeleteImportEntryButton().click();
        verifyGraphData("The default graph", "urn:s1", "urn:p1", "urn:o1", "http://www.ontotext.com/explicit", false, "urn:s1");
        ImportSteps.visitUserImport(repositoryId);
        ImportSteps.openImportTextSnippetDialog();
        ImportSteps.fillRDFTextSnippet(REPLACEMENT_DATA);
        ImportSteps.selectRDFFormat("TriG");
        ImportSteps.clickImportTextSnippetButton();
        importInTheDefaultGraph(true);
        verifyGraphData("The default graph", "urn:replaced-s1", "urn:replaced-p1", "urn:replaced-o1", "http://www.ontotext.com/explicit", true, "urn:s1");
    });

    it('Should import RDF snippet in a named graph (Named graph) and replace data in the named graph', () => {
        ImportSteps.openImportTextSnippetDialog();
        ImportSteps.fillRDFTextSnippet(INITIAL_DATA);
        ImportSteps.selectRDFFormat("TriG");
        ImportSteps.clickImportTextSnippetButton();
        importInNamedGraph(false, "http://graph1");
        getDeleteImportEntryButton().click();
        verifyGraphData("http://graph1", "urn:s1", "urn:p1", "urn:o1", "http://graph1", false, "urn:s1");
        ImportSteps.visitUserImport(repositoryId);
        ImportSteps.openImportTextSnippetDialog();
        ImportSteps.fillRDFTextSnippet(REPLACEMENT_DATA);
        ImportSteps.selectRDFFormat("TriG");
        ImportSteps.clickImportTextSnippetButton();
        importInNamedGraph(true, "http://graph1");
        verifyGraphData("http://graph1", "urn:replaced-s1", "urn:replaced-p1", "urn:replaced-o1", "http://graph1", true, "urn:s1");
    });

    it('Should import JSON-LD text snippet successfully without URI', () => {
        ImportSteps.openImportTextSnippetDialog();
        ImportSteps.fillRDFTextSnippet(JSONLD_TEXT_SNIPPET);
        ImportSteps.selectRDFFormat(JSONLD_FORMAT);
        ImportSteps.clickImportTextSnippetButton();
        ImportSteps.selectNamedGraph();
        ImportSteps.fillNamedGraph(CONTEXT);
        ImportSteps.importFromSettingsDialog();
        ImportSteps.verifyImportStatus(TEXT_SNIPPET, SUCCESS_MESSAGE);

        // Go to Graphs overview
        cy.visit('/graphs');
        cy.get('.ot-splash').should('not.be.visible');

        const graphName = CONTEXT.slice(0, CONTEXT.lastIndexOf('.'));

        // Verify that created graph can be found
        cy.get('.search-graphs').type(graphName).should('have.value', graphName);
        cy.get('#export-graphs').should('be.visible').should('contain', graphName);
    });

    it('Should import JSON-LD text snippet successfully with URI and context', () => {
        ImportSteps.openImportTextSnippetDialog();
        ImportSteps.fillRDFTextSnippet(JSONLD_TEXT_SNIPPET);
        ImportSteps.selectRDFFormat(JSONLD_FORMAT);
        ImportSteps.clickImportTextSnippetButton();
        ImportSteps.fillBaseURI(BASE_URI);
        ImportSteps.selectNamedGraph();
        ImportSteps.fillNamedGraph(CONTEXT);
        ImportSteps.fillContextLink('https://w3c.github.io/json-ld-api/tests/compact/0007-context.jsonld');
        ImportSteps.importFromSettingsDialog();
        ImportSteps.verifyImportStatus(TEXT_SNIPPET, SUCCESS_MESSAGE);
        const graphName = CONTEXT.slice(0, CONTEXT.lastIndexOf('.'));
        // Verify that created graph can be found
        verifyGraphData(graphName, "rdf:Property", "rdf:Property", "rdf:Property", "http://example.org/graph", false);
    });
});

//verifies that the data has been inserted in the given graph and that the new data has replaced the old one.
function verifyGraphData(graphName, s, p, o, c, checkForReplacedData, oldData) {
    cy.visit('/graphs');
    // wait a bit to give chance page loaded.
    cy.wait(1000);
    cy.get(`#export-graphs td a:contains(${graphName})`).click();
    cy.get(`.uri-cell:contains(${s})`).should('be.visible');
    cy.get(`.uri-cell:contains(${p})`).should('be.visible');
    cy.get(`.uri-cell:contains(${o})`).should('be.visible');
    cy.get(`.uri-cell:contains(${c})`).should('be.visible');

    if (checkForReplacedData) {
        cy.get(`.uri-cell:contains(${oldData})`).should('not.exist');
    }
}

function importFromData(shouldReplaceGraph, graphToReplace) {
    getImportFromDataRadioButton().click();
    if (shouldReplaceGraph) {
        getExistingDataReplacementCheckbox().click();
        getReplacedGraphsInputField().type(graphToReplace);
        getAddGraphToReplaceButton().click();
        getReplaceGraphConfirmationCheckbox().click();
    }
    getImportSettingsImportButton().click();
    getImportSuccessMessage().should('be.visible').and('contain', 'Imported successfully in')
}

function importInTheDefaultGraph(shouldReplaceGraph) {
    getImportInDefaultGraphRadioButton().click();
    if (shouldReplaceGraph) {
        getExistingDataReplacementCheckbox().click();
        getReplaceGraphConfirmationCheckbox().click();
    }
    getImportSettingsImportButton().click();
    getImportSuccessMessage().should('be.visible').and('contain', 'Imported successfully in')
}

function importInNamedGraph(shouldReplaceGraph, graph) {
    getImportInNamedGraphRadioButton().click();
    getNamedGraphInputField().type(graph);
    if (shouldReplaceGraph) {
        getExistingDataReplacementCheckbox().click();
        getReplaceGraphConfirmationCheckbox().click();
    }
    getImportSettingsImportButton().click();
    getImportSuccessMessage().should('be.visible').and('contain', 'Imported successfully in')
}

function getImportFromDataRadioButton() {
    return cy.get('.from-data-btn');
}

function getImportInDefaultGraphRadioButton() {
    return cy.get('.default-graph-btn');
}

function getImportInNamedGraphRadioButton() {
    return cy.get('.named-graph-btn');
}

function getExistingDataReplacementCheckbox() {
    return cy.get('.existing-data-replacement');
}

function getReplacedGraphsInputField() {
    return cy.get('.replaced-graphs-input');
}

function getAddGraphToReplaceButton() {
    return cy.get('.add-graph-btn');
}

function getImportSettingsImportButton() {
    return cy.get('.import-settings-import-button');
}

function getReplaceGraphConfirmationCheckbox() {
    return cy.get('.graph-replace-confirm-checkbox');
}

function getNamedGraphInputField() {
    return cy.get('.named-graph-input');
}

function getImportSuccessMessage() {
    return cy.get('.text-success');
}

function getDeleteImportEntryButton() {
    return cy.get('.icon-trash');
}
