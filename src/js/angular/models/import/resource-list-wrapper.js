export class ResourceListUtil {
    constructor(resources, filterByTypeOption, filterByFileName) {
        this.resourceList = resources.toList() || [];
        this.filterByTypeOption = filterByTypeOption;
        this.filterByFileName = filterByFileName;
    }

    get areAllDisplayedImportResourcesSelected() {
        const filteredResources = this.getFilteredResources();
        return filteredResources.every((resource) => resource.selected);
    }

    get areAllDisplayedImportResourcesPartialSelected() {
        const filteredResources = this.getFilteredResources();
        const hasUnselected = filteredResources.some((resource) => !resource.selected);
        const hasSelected = filteredResources.some((resource) => resource.selected);
        return hasSelected && hasUnselected;
    }

    areAllDisplayedResourcesSelectedOrPartial() {
        return !!(this.areAllDisplayedImportResourcesSelected || this.areAllDisplayedImportResourcesPartialSelected);
    }

    setFilterByType(filterByType) {
        this.filterByTypeOption = filterByType;
    }

    setFilterByName(filterByFileName) {
        this.filterByFileName = filterByFileName;
    }

    setResourceList(resources) {
        this.resourceList = resources.toList() || [];
    }

    filterByType(resource) {
        switch (this.filterByTypeOption) {
            case TYPE_FILTER_OPTIONS.ALL:
                return true;
            case TYPE_FILTER_OPTIONS.FILE:
                return resource.isFile();
            case TYPE_FILTER_OPTIONS.DIRECTORY:
                return resource.isDirectory();
            default:
                return false;
        }
    }

    filterByName(resource) {
        if (!this.filterByFileName) {
            return true;
        }

        if (this.filterByTypeOption === TYPE_FILTER_OPTIONS.DIRECTORY) {
            return resource.hasTextInDirectoriesName(this.filterByFileName);
        }

        if (this.filterByTypeOption === TYPE_FILTER_OPTIONS.FILE) {
            return resource.hasTextInFilesName(this.filterByFileName);
        }

        return resource.hasTextInResourcesName(this.filterByFileName);
    }

    getFilteredResources() {
        return this.resourceList.filter((resource) => this.filterByType(resource) && this.filterByName(resource));
    }
}
const TYPE_FILTER_OPTIONS = {
    'FILE': 'FILE',
    'DIRECTORY': 'DIRECTORY',
    'ALL': 'ALL'
};
