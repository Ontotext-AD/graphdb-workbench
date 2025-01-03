import ImportSteps from "./import-steps";

export class ImportServerFilesSteps extends ImportSteps {

    static getResourcesTable() {
        return ImportSteps.getView().find('#import-server import-resource-tree');
    }

    static getHelpMessage() {
        return this.getView().find('.server-files-import-help');
    }

    static getSelectedTypeFilterButton() {
        return this.getResourcesTable().find('.import-resource-type-filter .active');
    }

    static getShowAllResourceTypesButton() {
        return this.getResourcesTable().find('.show-all-resources-btn');
    }

    static getShowOnlyFoldersButton() {
        return this.getResourcesTable().find('.show-only-folders-btn');
    }

    static selectFoldersOnlyFilter() {
        this.getShowOnlyFoldersButton().click();
    }

    static getShowOnlyFilesButton() {
        return this.getResourcesTable().find('.show-only-files-btn');
    }

    static selectFilesOnlyFilter() {
        this.getShowOnlyFilesButton().click();
    }
}
