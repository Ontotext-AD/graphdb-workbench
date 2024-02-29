import ImportSteps from '../../steps/import-steps';

describe('Import screen validation - user data', () => {

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

    const IMPORT_URL = 'https://www.w3.org/TR/owl-guide/wine.rdf';
    const IMPORT_JSONLD_URL = 'https://example.com/0007-context.jsonld';
    const TEXT_SNIPPET = 'Text snippet';
    const JSONLD_FORMAT = 'JSON-LD';
    const VALID_URL_RDF_FORMAT = 'RDF/XML';
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

    it('Test import file via URL successfully with Auto format selected', () => {
        ImportSteps
            .openImportURLDialog(IMPORT_URL)
            .clickImportUrlButton()
            // Without changing settings
            .importFromSettingsDialog()
            .verifyImportStatus(IMPORT_URL, SUCCESS_MESSAGE);
    });

    it('Test import file via URL with invalid RDF format selected', () => {
        ImportSteps
            .openImportURLDialog(IMPORT_URL)
            .selectRDFFormat(JSONLD_FORMAT)
            .clickImportUrlButton()
            .importFromSettingsDialog()
            .verifyImportStatus(IMPORT_URL, RDF_ERROR_MESSAGE);
    });

    it('Test import file via URL successfully with valid RDF format selected', () => {
        ImportSteps
            .openImportURLDialog(IMPORT_URL)
            .selectRDFFormat(VALID_URL_RDF_FORMAT)
            .clickImportUrlButton()
            .importFromSettingsDialog()
            .verifyImportStatus(IMPORT_URL, SUCCESS_MESSAGE);
    });

    it('Test import RDF text snippet successfully with Auto format selected', () => {
        ImportSteps
            .openImportTextSnippetDialog()
            .fillRDFTextSnippet(RDF_TEXT_SNIPPET_1)
            .clickImportTextSnippetButton()
            .importFromSettingsDialog()
            .verifyImportStatus(TEXT_SNIPPET, SUCCESS_MESSAGE);
    });

    it('Test import RDF text snippet with invalid RDF format selected', () => {
        ImportSteps
            .openImportTextSnippetDialog()
            .fillRDFTextSnippet(RDF_TEXT_SNIPPET_1)
            .selectRDFFormat(JSONLD_FORMAT)
            .clickImportTextSnippetButton()
            .importFromSettingsDialog()
            .verifyImportStatus(TEXT_SNIPPET, RDF_ERROR_MESSAGE);
    });

    it('Test import RDF text snippet successfully with valid RDF format selected', () => {
        ImportSteps
            .openImportTextSnippetDialog()
            .fillRDFTextSnippet(RDF_TEXT_SNIPPET_1)
            .selectRDFFormat(VALID_SNIPPET_RDF_FORMAT)
            .clickImportTextSnippetButton()
            .importFromSettingsDialog()
            .verifyImportStatus(TEXT_SNIPPET, SUCCESS_MESSAGE);
    });

    it('Test import Turtle* text snippet successfully with valid RDF star format selected', () => {
        ImportSteps
            .openImportTextSnippetDialog()
            .fillRDFTextSnippet(TURTLESTAR_SNIPPET)
            .selectRDFFormat(VALID_SNIPPET_TURTLESTAR_FORMAT)
            .clickImportTextSnippetButton()
            .importFromSettingsDialog()
            .verifyImportStatus(TEXT_SNIPPET, SUCCESS_MESSAGE);
    });
    it('Test import TriG* text snippet successfully with valid RDF star format selected', () => {
        ImportSteps
            .openImportTextSnippetDialog()
            .fillRDFTextSnippet(TRIGSTAR_SNIPPET)
            .selectRDFFormat(VALID_SNIPPET_TRIGSTAR_FORMAT)
            .clickImportTextSnippetButton()
            .importFromSettingsDialog()
            .verifyImportStatus(TEXT_SNIPPET, SUCCESS_MESSAGE);
    });

    it('Test import RDF text snippet successfully with filled base URI and context', () => {
        ImportSteps
            .openImportTextSnippetDialog()
            .fillRDFTextSnippet(RDF_TEXT_SNIPPET_2)
            .clickImportTextSnippetButton()
            .fillBaseURI(BASE_URI)
            .selectNamedGraph()
            .fillNamedGraph(CONTEXT)
            .importFromSettingsDialog()
            .verifyImportStatus(TEXT_SNIPPET, SUCCESS_MESSAGE);

        // Go to Graphs overview
        cy.visit('/graphs');
        cy.get('.ot-splash').should('not.be.visible');

        let graphName = CONTEXT.slice(0, CONTEXT.lastIndexOf('.'));

        // Verify that created graph can be found
        cy.get('.search-graphs').type(graphName).should('have.value', graphName);
        cy.get('#export-graphs').should('be.visible').should('contain', graphName);
    });

    it('should allow to delete uploaded files', () => {
        ImportSteps
            .openImportURLDialog(IMPORT_URL)
            .clickImportUrlButton()
            .importFromSettingsDialog()
            .verifyImportStatus(IMPORT_URL, SUCCESS_MESSAGE)
            .removeUploadedFiles();
    });

    it('Import RDF snippet in the default graph (from data) and replace data in the default graph', () => {
        ImportSteps
            .openImportTextSnippetDialog()
            .fillRDFTextSnippet(INITIAL_DATA)
            .selectRDFFormat("TriG")
            .clickImportTextSnippetButton();
        importFromData(false, "http://www.openrdf.org/schema/sesame#nil");
        getDeleteImportEntryButton().click();
        verifyGraphData("The default graph", "urn:s1", "urn:p1", "urn:o1", "http://www.ontotext.com/explicit", false, "urn:s1");
        ImportSteps.visitUserImport(repositoryId);
        ImportSteps
            .openImportTextSnippetDialog()
            .fillRDFTextSnippet(REPLACEMENT_DATA)
            .selectRDFFormat("TriG")
            .clickImportTextSnippetButton();
        importFromData(true, "http://www.openrdf.org/schema/sesame#nil")
        verifyGraphData("The default graph", "urn:replaced-s1", "urn:replaced-p1", "urn:replaced-o1", "http://www.ontotext.com/explicit", true, "urn:s1");
    });

    it('Import RDF snippet with a custom graph (from data) and replace data in the custom graph', () => {
        ImportSteps
            .openImportTextSnippetDialog()
            .fillRDFTextSnippet(PRE_DEFINED_INITIAL_GRAPH_DATA)
            .selectRDFFormat("TriG")
            .clickImportTextSnippetButton();
        importFromData(false, "http://www.openrdf.org/schema/sesame#nil");
        getDeleteImportEntryButton().click();
        verifyGraphData("urn:graph1", "urn:s1-custom", "urn:p1-custom", "urn:o1-custom", "urn:graph1", false, "urn:s1-custom");
        ImportSteps.visitUserImport(repositoryId);
        ImportSteps
            .openImportTextSnippetDialog()
            .fillRDFTextSnippet(PRE_DEFINED_REPLACED_GRAPH_DATA)
            .selectRDFFormat("TriG")
            .clickImportTextSnippetButton();
        importFromData(true, "urn:graph1")
        verifyGraphData("urn:graph1", "urn:replaced-s1-custom", "urn:replaced-p1-custom", "urn:replaced-o1-custom", "urn:graph1", true, "urn:s1-custom");
    });

    it('Import RDF snippet in the default graph (The default graph) and replace data in the default graph', () => {
        ImportSteps
            .openImportTextSnippetDialog()
            .fillRDFTextSnippet(INITIAL_DATA)
            .selectRDFFormat("TriG")
            .clickImportTextSnippetButton();
        importInTheDefaultGraph(false);
        getDeleteImportEntryButton().click();
        verifyGraphData("The default graph", "urn:s1", "urn:p1", "urn:o1", "http://www.ontotext.com/explicit", false, "urn:s1");
        ImportSteps.visitUserImport(repositoryId);
        ImportSteps
            .openImportTextSnippetDialog()
            .fillRDFTextSnippet(REPLACEMENT_DATA)
            .selectRDFFormat("TriG")
            .clickImportTextSnippetButton();
        importInTheDefaultGraph(true);
        verifyGraphData("The default graph", "urn:replaced-s1", "urn:replaced-p1", "urn:replaced-o1", "http://www.ontotext.com/explicit", true, "urn:s1");
    });

    it('Import RDF snippet in a named graph (Named graph) and replace data in the named graph', () => {
        ImportSteps
            .openImportTextSnippetDialog()
            .fillRDFTextSnippet(INITIAL_DATA)
            .selectRDFFormat("TriG")
            .clickImportTextSnippetButton();
        importInNamedGraph(false, "http://graph1");
        getDeleteImportEntryButton().click();
        verifyGraphData("http://graph1", "urn:s1", "urn:p1", "urn:o1", "http://graph1", false, "urn:s1");
        ImportSteps.visitUserImport(repositoryId);
        ImportSteps
            .openImportTextSnippetDialog()
            .fillRDFTextSnippet(REPLACEMENT_DATA)
            .selectRDFFormat("TriG")
            .clickImportTextSnippetButton();
        importInNamedGraph(true, "http://graph1");
        verifyGraphData("http://graph1", "urn:replaced-s1", "urn:replaced-p1", "urn:replaced-o1", "http://graph1", true, "urn:s1");
    });

    it('should import JSON-LD text snippet successfully without URI', () => {
        ImportSteps
            .openImportTextSnippetDialog()
            .fillRDFTextSnippet(JSONLD_TEXT_SNIPPET)
            .selectRDFFormat(JSONLD_FORMAT)
            .clickImportTextSnippetButton()
            .selectNamedGraph()
            .fillNamedGraph(CONTEXT)
            .importFromSettingsDialog()
            .verifyImportStatus(TEXT_SNIPPET, SUCCESS_MESSAGE);

        // Go to Graphs overview
        cy.visit('/graphs');
        cy.get('.ot-splash').should('not.be.visible');

        const graphName = CONTEXT.slice(0, CONTEXT.lastIndexOf('.'));

        // Verify that created graph can be found
        cy.get('.search-graphs').type(graphName).should('have.value', graphName);
        cy.get('#export-graphs').should('be.visible').should('contain', graphName);
    });

    it('should import JSON-LD text snippet successfully with URI and context', () => {
        ImportSteps
            .openImportTextSnippetDialog()
            .fillRDFTextSnippet(JSONLD_TEXT_SNIPPET)
            .selectRDFFormat(JSONLD_FORMAT)
            .clickImportTextSnippetButton()
            .fillBaseURI(BASE_URI)
            .selectNamedGraph()
            .fillNamedGraph(CONTEXT)
            .fillContextLink('https://w3c.github.io/json-ld-api/tests/compact/0007-context.jsonld')
            .importFromSettingsDialog()
            .verifyImportStatus(TEXT_SNIPPET, SUCCESS_MESSAGE);
        const graphName = CONTEXT.slice(0, CONTEXT.lastIndexOf('.'));
        // Verify that created graph can be found
        verifyGraphData(graphName, "rdf:Property", "rdf:Property", "rdf:Property", "http://example.org/graph", false);
    });

    it('should import JSON-LD file via URL with correct request body', () => {
        stubPostJSONLDFromURL();
        ImportSteps
            .openImportURLDialog(IMPORT_JSONLD_URL)
            .selectRDFFormat(JSONLD_FORMAT)
            .clickImportUrlButton()
            .importFromSettingsDialog();
        cy.wait('@postJsonldUrl').then((xhr) => {
            expect(xhr.request.body.name).to.eq('https://example.com/0007-context.jsonld');
            expect(xhr.request.body.data).to.eq('https://example.com/0007-context.jsonld');
            expect(xhr.request.body.type).to.eq('url');
            expect(xhr.request.body.isJSONLD).to.be.true;
        });
    });

    it('should show error on invalid JSON-LD URL', () => {
        stubPostJSONLDFromURL();
        ImportSteps
            .openImportURLDialog(IMPORT_JSONLD_URL)
            .selectRDFFormat(JSONLD_FORMAT)
            .clickImportUrlButton()
            .importFromSettingsDialog()
            .verifyImportStatus(IMPORT_JSONLD_URL, 'https://example.com/0007-context.jsonld');
    });

    function stubPostJSONLDFromURL() {
        cy.intercept('POST', `/rest/repositories/${repositoryId}/import/upload/url`).as('postJsonldUrl');
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
});
