import {SortingType} from "./sorting-type";
import {convertToBytes} from "../../utils/size-util";

export class CheckboxControlModel {
    constructor(resourceList, filterByTypeOption, filterByFileName) {
        this.resources = resourceList.toList() || [];
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
        return this.resources.filter((resource) => this.filterByType(resource) && this.filterByName(resource));
    }

    /**
     * Sorts the resources based on the specified sorting type and order.
     * @param {string} sortedBy - The sorting type (e.g., NAME, SIZE, MODIFIED).
     * @param {boolean} sortAsc - Determines whether to sort in ascending order.
     */
    sortResources(sortedBy, sortAsc) {
        if (SortingType.NAME === sortedBy) {
            this.resources.sort(this.compareByName(sortAsc));
        } else if (SortingType.SIZE === sortedBy) {
            this.resources.sort(this.compareBySize(sortAsc));
        } else if (SortingType.MODIFIED === sortedBy) {
            this.resources.sort(this.compareByModified(sortAsc));
        } else if (SortingType.IMPORTED === sortedBy) {
            this.resources.sort(this.compareByImportedOn(sortAsc));
        } else if (SortingType.CONTEXT === sortedBy) {
            this.resources.sort(this.compareByContext(sortAsc));
        }
    }

    compareByName(asc) {
        return (r1, r2) => {
            return asc
                ? r1.importResource.name.localeCompare(r2.importResource.name)
                : r2.importResource.name.localeCompare(r1.importResource.name);
        };
    }

    compareBySize(asc) {
        return (r1, r2) => {
            // The format of size returned by the backend has changed, but we need to keep the old format for backward compatibility.
            // Therefore, we convert the size to always be in bytes.
            const r1Size = convertToBytes(r1.importResource.size);
            const r2Size = convertToBytes(r2.importResource.size);
            return asc ? r1Size - r2Size : r2Size - r1Size;
        };
    }

    compareByModified(asc) {
        return (r1, r2) => {
            const r1ModifiedOn = r1.importResource.modifiedOn || Number.MAX_VALUE;
            const r2ModifiedOn = r2.importResource.modifiedOn || Number.MAX_VALUE;
            return asc ? r1ModifiedOn - r2ModifiedOn : r2ModifiedOn - r1ModifiedOn;
        };
    }

    compareByImportedOn(asc) {
        return (r1, r2) => {
            const r1ImportedOn = r1.importResource.importedOn || Number.MAX_VALUE;
            const r2ImportedOn = r2.importResource.importedOn || Number.MAX_VALUE;
            return asc ? r1ImportedOn - r2ImportedOn : r2ImportedOn - r1ImportedOn;
        };
    }

    compareByContext(asc) {
        return (r1, r2) => {
            return asc
                ? r1.importResource.context.localeCompare(r2.importResource.context)
                : r2.importResource.context.localeCompare(r1.importResource.context);
        };
    }

}
const TYPE_FILTER_OPTIONS = {
    'FILE': 'FILE',
    'DIRECTORY': 'DIRECTORY',
    'ALL': 'ALL'
};
