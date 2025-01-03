export class CreateGraphqlEndpointSteps {
    static visit() {
        return cy.visit('/graphql/endpoint/create');
    }

    static getView() {
        return cy.get('.create-graphql-endpoint-view');
    }

    static getSourceRepositorySelector() {
        return this.getView().find('.source-repository-selector');
    }

    static getSelectedSourceRepository() {
        return this.getSourceRepositorySelector().find('option:selected');
    }

    static getActiveStep() {
        return this.getView().find('.wizard-step.active');
    }

    // ===================================
    // Schema source view
    // ===================================

    static getSelectSchemaSourceView() {
        return this.getView().find('.select-schema-source-view');
    }

    static getSchemaSourceTypes() {
        return this.getSelectSchemaSourceView().find('.schema-source-type input[type=radio]');
    }

    static getSelectedSchemaSource() {
        return this.getSelectSchemaSourceView().find('.schema-source-type input[type=radio]:checked');
    }

    static selectOntologiesAndShaclShapesOption() {
        this.getSelectSchemaSourceView().find(`.schema-source-type input[type=radio]`).eq(1).click();
    }

    // ===================================
    // Graphql schema shapes view
    // ===================================

    static getGraphqlSchemaShapesView() {
        return this.getView().find('.graphql-schema-shapes');
    }

    static getGraphqlSchemaShapesNotFound() {
        return this.getGraphqlSchemaShapesView().find('.no-shapes');
    }

    static getGraphqlSchemaSelector() {
        return this.getGraphqlSchemaShapesView().find('.graphql-shapes-selector .shuttle-multiselect');
    }

    static getSelectedGraphqlShapesCountBanner() {
        return this.getGraphqlSchemaSelector().find('.toolbar-right .selected-items-message');
    }

    static getAvailableGraphqlShapes() {
        return this.getGraphqlSchemaSelector().find('.available-options .option-item');
    }

    static getAvailableGraphqlShape(index) {
        return this.getAvailableGraphqlShapes().eq(index);
    }

    static getSelectedGraphqlShapes() {
        return this.getGraphqlSchemaSelector().find('.selected-options .option-item');
    }

    static getSelectedGraphqlShape(index) {
        return this.getSelectedGraphqlShapes().eq(index);
    }

    static selectAllGraphqlShapes() {
        this.getGraphqlSchemaSelector().find('.add-all-btn').click();
    }

    static deselectAllGraphqlShapes() {
        this.getGraphqlSchemaSelector().find('.remove-all-btn').click();
    }

    static selectGraphqlShape(index) {
        this.getAvailableGraphqlShapes().eq(index).find('.add-btn').click();
    }

    static deselectAllGraphqlShape(index) {
        this.getSelectedGraphqlShapes().eq(index).find('.remove-btn').click();
    }

    static filterSelectedGraphqlShapes(term) {
        this.getGraphqlSchemaSelector().find('.toolbar-left .filter-selected').clear().type(term);
    }

    static clearSelectedGraphqlShapesFilter() {
        this.getGraphqlSchemaSelector().find('.toolbar-left .filter-selected').clear();
    }

    // ===================================
    // Ontologies and SHACL shapes view
    // ===================================

    static getOntologiesAndShaclShapesView() {
        return this.getView().find('.ontologies-and-shacl-shapes');
    }

    static getGraphSourceTypes() {
        return this.getOntologiesAndShaclShapesView().find('.graph-source-type input[type=radio]');
    }

    static getSelectedGraphSource() {
        return this.getOntologiesAndShaclShapesView().find('.graph-source-type input[type=radio]:checked');
    }

    static selectUseAllGraphsOption() {
        this.getOntologiesAndShaclShapesView().find(`.graph-source-type input[type=radio]`).eq(0).click();
    }

    static selectUseShaclShapeGraphsOption() {
        this.getOntologiesAndShaclShapesView().find(`.graph-source-type input[type=radio]`).eq(1).click();
    }

    static selectPickGraphsOption() {
        this.getOntologiesAndShaclShapesView().find(`.graph-source-type input[type=radio]`).eq(2).click();
    }

    static getGraphsNotFound() {
        return this.getOntologiesAndShaclShapesView().find('.use-all-graphs .no-graphs');
    }

    static getAllGraphsWillBeUsedMessage() {
        return this.getOntologiesAndShaclShapesView().find('.use-all-graphs .all-graphs-selected');
    }

    static getPickGraphsNoGraphsFound() {
        return this.getOntologiesAndShaclShapesView().find('.select-graphs .no-graphs');
    }

    static getShaclShapeGraphsNotFound() {
        return this.getOntologiesAndShaclShapesView().find('.use-all-shacl-shape-graphs .no-shacl-shapes');
    }

    static getEndpointParamsForm() {
        return this.getView().find('.endpoint-params-form');
    }

    // Endpoint ID field
    static getEndpointIdField() {
        return this.getEndpointParamsForm().find('.endpoint-id');
    }

    static getEndpointIdFieldInput() {
        return this.getEndpointIdField().find('input');
    }

    static typeEndpointId(endpointId) {
        this.getEndpointIdFieldInput().clear().type(endpointId);
    }

    // Endpoint label field
    static getEndpointLabelField() {
        return this.getEndpointParamsForm().find('.endpoint-label');
    }

    static getEndpointLabelFieldInput() {
        return this.getEndpointLabelField().find('input');
    }

    static typeEndpointLabel(endpointLabel) {
        this.getEndpointLabelFieldInput().clear().type(endpointLabel);
    }

    static getEndpointDescriptionField() {
        return this.getEndpointParamsForm().find('.endpoint-description');
    }

    static getEndpointDescriptionFieldInput() {
        return this.getEndpointDescriptionField().find('textarea');
    }

    static typeEndpointDescription(endpointDescription) {
        this.getEndpointDescriptionFieldInput().clear().type(endpointDescription);
    }

    // Vocabulary prefix select
    static getVocabularyPrefixSelectField() {
        return this.getEndpointParamsForm().find('.vocabulary-prefix');
    }

    static getVocabularyPrefixSelect() {
        return this.getVocabularyPrefixSelectField().find('select');
    }

    static getVocabularyPrefixSelectOptions() {
        return this.getVocabularyPrefixSelect().find('option');
    }

    static getVocabularyPrefixSelectSelectedOption() {
        return this.getVocabularyPrefixSelect().find('option:selected');
    }

    static selectVocabularyPrefix(prefix) {
        this.getVocabularyPrefixSelect().select(prefix);
    }

    // Graphs selector
    static getGraphsSelector() {
        return this.getOntologiesAndShaclShapesView().find('.graphs-selector .shuttle-multiselect');
    }

    static getAvailableGraphs() {
        return this.getGraphsSelector().find('.available-options .option-item');
    }

    static getSelectedGraphs() {
        return this.getGraphsSelector().find('.selected-options .option-item');
    }

    static getSelectedGraphsCountBanner() {
        return this.getGraphsSelector().find('.toolbar-right .selected-items-message');
    }

    static selectAllGraphs() {
        this.getGraphsSelector().find('.add-all-btn').click();
    }

    // ===================================
    // Configure endpoint view
    // ===================================

    static getConfigureEndpointView() {
        return this.getView().find('.endpoint-configuration-view');
    }

    static getGenerationSettingsForm() {
        return this.getConfigureEndpointView().find('.generation-settings-form');
    }

    // ===================================
    // Generate endpoint view
    // ===================================

    static getGenerateEndpointView() {
        return this.getView().find('.generate-endpoint-view');
    }

    // ===================================
    // Wizard actions
    // ===================================

    static getCancelButton() {
        return this.getView().find('.cancel-btn');
    }

    static cancelEndpointCreation() {
        this.getCancelButton().click();
    }

    static getNextStepButton() {
        return this.getView().find('.next-btn');
    }

    static next() {
        this.getNextStepButton().click();
    }

    static getBackButton() {
        return this.getView().find('.back-btn');
    }

    static back() {
        this.getBackButton().click();
    }
}
