import {SortingType} from "./sorting-type";
import {convertToBytes} from "../../utils/size-util";

export class ResourceListUtil {
    constructor(resourceList) {
        this.resourceList = resourceList || [];
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

    get getResourceList() {
        return this.resourceList;
    }

    setTypeFilter(filterByType) {
        this.filterByTypeOption = filterByType;
    }

    setNameFilter(filterByName) {
        this.filterByFileName = filterByName;
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

    /**
     * Sorts the resources based on the specified sorting type and order.
     * @param {string} sortedBy - The sorting type (e.g., NAME, SIZE, MODIFIED).
     * @param {boolean} sortAsc - Determines whether to sort in ascending order.
     */
    sortResources(sortedBy, sortAsc) {
        if (SortingType.NAME === sortedBy) {
            this.resourceList.sort(this.nameComparator(sortAsc));
        } else if (SortingType.SIZE === sortedBy) {
            this.resourceList.sort(this.sizeComparator(sortAsc));
        } else if (SortingType.MODIFIED === sortedBy) {
            this.resourceList.sort(this.modifiedOnComparator(sortAsc));
        } else if (SortingType.IMPORTED === sortedBy) {
            this.resourceList.sort(this.importedOnComparator(sortAsc));
        } else if (SortingType.CONTEXT === sortedBy) {
            this.resourceList.sort(this.contextComparator(sortAsc));
        }
    }

    nameComparator(asc) {
        return (r1, r2) => {
            return asc
                ? r1.importResource.name.localeCompare(r2.importResource.name)
                : r2.importResource.name.localeCompare(r1.importResource.name);
        };
    }

    sizeComparator(asc) {
        return (r1, r2) => {
            // The format of size returned by the backend has changed, but we need to keep the old format for backward compatibility.
            // Therefore, we convert the size to always be in bytes.
            const r1Size = convertToBytes(r1.importResource.size);
            const r2Size = convertToBytes(r2.importResource.size);
            return asc ? r1Size - r2Size : r2Size - r1Size;
        };
    }

    modifiedOnComparator(asc) {
        return (r1, r2) => {
            const r1ModifiedOn = r1.importResource.modifiedOn || Number.MAX_VALUE;
            const r2ModifiedOn = r2.importResource.modifiedOn || Number.MAX_VALUE;
            return asc ? r1ModifiedOn - r2ModifiedOn : r2ModifiedOn - r1ModifiedOn;
        };
    }

    importedOnComparator(asc) {
        return (r1, r2) => {
            const r1ImportedOn = r1.importResource.importedOn || Number.MAX_VALUE;
            const r2ImportedOn = r2.importResource.importedOn || Number.MAX_VALUE;
            return asc ? r1ImportedOn - r2ImportedOn : r2ImportedOn - r1ImportedOn;
        };
    }

    contextComparator(asc) {
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
