export class VisualGraphSplitButtonSteps {
    static getGraphExploreSplitButton() {
        return cy.get('onto-graph-explore-split-button');
    }

    static getVisualizeMainButton() {
        return VisualGraphSplitButtonSteps.getGraphExploreSplitButton().find('.explore-visual-graph-button');
    }

    static clickOnVisualizeMainButton() {
        VisualGraphSplitButtonSteps.getVisualizeMainButton().click();
    }

    static getDropdownToggleButton() {
        return VisualGraphSplitButtonSteps.getGraphExploreSplitButton().find('.onto-dropdown-button');
    }

    static toggleGraphConfigDropdown() {
        VisualGraphSplitButtonSteps.getDropdownToggleButton().click();
    }

    static getGraphConfigs() {
        return VisualGraphSplitButtonSteps.getGraphExploreSplitButton().find('.onto-dropdown-menu-item');
    }

    static getGraphConfig(index = 0) {
        return VisualGraphSplitButtonSteps.getGraphConfigs().eq(index);
    }

    static selectGraphConfig(index = 0) {
        VisualGraphSplitButtonSteps.getGraphConfig(index).click();
    }

    static getCreateGraphConfigLink() {
        return VisualGraphSplitButtonSteps.getGraphExploreSplitButton().find('.graph-create-link');
    }

    static clickCreateGraphConfigLink() {
        VisualGraphSplitButtonSteps.getCreateGraphConfigLink().click();
    }

    static getNoConfigurationsMessage() {
        return VisualGraphSplitButtonSteps.getGraphExploreSplitButton().find('.no-configurations-message');
    }
}
