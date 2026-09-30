import {BaseSteps} from "./base-steps.js";

/**
 * Steps for the repository picker list (`app-repository-picker-list`) of the new workbench, which lists the
 * repositories the user can select and, when allowed, offers the creation of a new one.
 */
export class RepositoryPickerListSteps extends BaseSteps {

    static getRepositoryPickerList() {
        return this.getByTestId('repository-picker-list');
    }

    static getRepositoryRows() {
        return this.getRepositoryPickerList().find(this.buildTestIdAttr('repository-picker-row'));
    }

    static getRepositoryRow(repositoryId) {
        return this.getRepositoryRows()
            .contains(this.buildTestIdAttr('repository-picker-repository-id'), repositoryId)
            .parents(this.buildTestIdAttr('repository-picker-row'));
    }

    static getRepositorySelectButton(repositoryId) {
        return this.getRepositoryRow(repositoryId).find(this.buildTestIdAttr('repository-picker-select-btn'));
    }

    static selectRepository(repositoryId) {
        // The select button is shown only while the row is hovered.
        this.getRepositoryRow(repositoryId).realHover();
        this.getRepositorySelectButton(repositoryId).click();
    }

    static getCreateRepositoryButton() {
        return this.getRepositoryPickerList().find(this.buildTestIdAttr('repository-picker-create-btn'));
    }

    static clickCreateRepositoryButton() {
        this.getCreateRepositoryButton().click();
    }
}
