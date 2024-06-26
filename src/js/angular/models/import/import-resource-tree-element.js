import {ImportResourceStatus} from "./import-resource-status";
import {cloneDeep} from 'lodash';

/**
 * Resources have parent-child relations. This class represents one resource element from the parent-child relation tree.
 */
export class ImportResourceTreeElement {
    constructor() {
        /**
         * @type {ImportResource}
         */
        this.importResource = undefined;
        /**
         * @type {ImportResourceTreeElement}
         */
        this.parent = undefined;
        /**
         * @type {boolean}
         */
        this.partialSelected = false;
        /**
         * @type {number}
         */
        this.indent = 0;

        /**
         * @type {boolean}
         */
        this.isImportable = false;
        /**
         * @type {boolean}
         */
        this.hasOngoingImport = false;
        /**
         * @type {boolean}
         */
        this.hasStatusInfo = false;
        /**
         * @type {boolean}
         */
        this.canResetStatus = false;
        /**
         * @type {string}
         */
        this.name = '';
        /**
         * If name is too long it have to be shortened with ellipses in the middle.
         * @type {string}
         */
        this.shortenedName = '';
        /**
         * @type {string}
         */
        this.path = '';
        /**
         * If context link is too long it have to be shortened with ellipses in the middle.
         * @type {string}
         */
        this.shortenedContext = '';
        /**
         * @type {boolean}
         */
        this.selected = false;
        /**
         * @type {ImportResourceTreeElement[]}
         */
        this.directories = [];
        /**
         * @type {ImportResourceTreeElement[]}
         */
        this.files = [];
        /**
         * @type {boolean}
         */
        this.isImportedBiggerThanModified = false;
        /**
         * @type {boolean}
         */
        this.isModifiedBiggerThanImported = false;
        /**
         * @type {boolean}
         */
        this.isEditable = false;
        /**
         * @type {string}
         */
        this.iconClass = '';

        this.shortenedMessage = '';
    }

    /**
     * Adds an import resource with rdf data to import resource parent-child tree.
     * @param {ImportResourceTreeElement} importResourceElement - an import resource with rdf data.
     */
    addResource(importResourceElement) {
        if (importResourceElement.isFile()) {
            this.files.push(importResourceElement);
            return;
        }
        if (importResourceElement.isDirectory()) {
            this.directories.push(importResourceElement);
            return;
        }
        throw new Error('Unsupported resource type!');
    }

    removeResource(importResourceElement) {
        if (importResourceElement.isFile()) {
            this.files = this.files.filter((file) => importResourceElement.importResource.name !== file.importResource.name);
        } else {
            this.directories = this.directories.filter((directory) => importResourceElement.importResource.name !== directory.importResource.name);
        }
    }

    remove() {
        if (!this.isRoot()) {
            this.parent.removeResource(this);
        }
    }

    /**
     * Searches for a resource with the specified <code>directoryName</code> or creates one if hte resource is not found.
     *
     * @param {string} directoryName - the name of the resource being searched for.
     *
     * @return {ImportResourceTreeElement} the found or newly created resource.
     */
    getOrCreateDirectory(directoryName) {
        let directory = this.directories.find((directory) => directory.name === directoryName);
        if (!directory) {
            directory = new ImportResourceTreeElement();
            directory.name = directoryName;
            this.directories.push(directory);
        }
        return directory;
    }

    /**
     * @return {ImportResourceTreeElement} - the root resource of the paren-child tree.
     */
    getRoot() {
        if (this.isRoot()) {
            return this;
        }
        return this.parent.getRoot();
    }

    isRoot() {
        return this.parent === undefined;
    }

    /**
     * Checks if current {@link ImportResourceTreeElement} is container of other resources.
     *
     * @return {boolean} true if the resource contains other resources.
     */
    isDirectory() {
        return this.importResource.isDirectory();
    }

    /**
     * Checks if current {@link ImportResourceTreeElement} has rdf data.
     *
     * @return {boolean} true if the resource contains rdf data.
     */
    isFile() {
        return !this.isRoot() && this.importResource.isFile();
    }

    /**
     * Checks if resource contains other resources.
     *
     * @return {boolean} true if resource contain rdf resources.
     */
    isEmpty() {
        return this.directories.length === 0 && this.files.length === 0;
    }

    /**
     * Returns flattening view of resources parent-child relation tree.
     *
     * @return {ImportResourceTreeElement[]} flattening view of resources.
     */
    toList() {
        const result = [];
        if (this.parent) {
            // skip the root element.
            result.push(this);
        }
        this.directories.forEach((directory) => {
            result.push(...directory.toList());
        });
        result.push(...this.files);
        return result;
    }

    /**
     * Recursively updates the selected value of the current element and its children.
     *
     * @param {boolean} selected - Indicates whether the element and its children should be marked as selected.
     * @param {boolean} isStartPoint - If true, marks the current node as the initial point of recursion. Subsequent
     *      calls to the function will have isStartPoint set to false. After recursion is complete, the
     *      updatePartialSelected function of the root element will be called to update the partialSelected
     *      property of every element. This reduces the calculation of partialSelected by performing
     *      it once when all elements are updated.
     */
    setSelection(selected, isStartPoint = true) {
        this.selected = selected;
        this.files.forEach((file) => file.setSelection(selected, false));
        this.directories.forEach((directory) => directory.setSelection(selected, false));
        if (isStartPoint) {
            this.getRoot().updateSelectionState();
        }
    }

    /**
     * Recursively updates "selected" and "partialSelected" state of the current element and its children.
     */
    updateSelectionState() {
        this.directories.forEach((directory) => directory.updateSelectionState());
        if (this.parent && this.isDirectory()) {
            const hasUnselectedChildren = this.hasUnselectedChildren();
            const hasSelectedChildren = this.hasSelectedChildren();
            this.selected = hasSelectedChildren && !hasUnselectedChildren;
            this.partialSelected = hasSelectedChildren && hasUnselectedChildren;
        }
    }

    /**
     * Checks if there is at least one unselected child.
     * @return {boolean} - True if there is at least one unselected child, or false otherwise.
     */
    hasUnselectedChildren() {
        return this.files.some((file) => !file.selected) || this.directories.some((directory) => !directory.selected || directory.hasUnselectedChildren());
    }

    /**
     * Checks if there is at least one selected child.
     * @return {boolean} - True if there is at least one selected child, or false otherwise.
     */
    hasSelectedChildren() {
        return this.files.some((file) => file.selected) || this.directories.some((directory) => directory.selected || directory.hasSelectedChildren());
    }

    selectAllWithStatus(statuses) {
        if (this.importResource && statuses.indexOf(this.importResource.status) > -1) {
            this.selected = true;
        }
        this.files.forEach((file) => file.selectAllWithStatus(statuses));
        this.directories.forEach((directory) => directory.selectAllWithStatus(statuses));
    }

    /**
     * Returns all selected resources for import. This method accounts for the case where if a directory is selected,
     * then its children are not collected. We do this because we want to avoid the server to double import the same
     * resources.
     * @return {ImportResourceTreeElement[]}
     */
    getAllSelectedForImport() {
        const allSelected = [];
        const isRoot = this.isRoot();
        // If this is not the root, and it is selected, then push it to the list. This can be a file or directory which
        // has all files in it selected.
        if (!isRoot && this.selected) {
            allSelected.push(this);
        }
        // If it is the root or a partially selected directory, then recurse through all the children.
        if (isRoot || (this.isDirectory() && !this.selected)) {
            this.files.forEach((file) => allSelected.push(...file.getAllSelectedForImport()));
            this.directories.forEach((directory) => allSelected.push(...directory.getAllSelectedForImport()));
        }

        // clone them to ensure that upcoming from the server changes in the resources
        // will not interfere with the selected resources list
        return cloneDeep(allSelected);
    }

    getAllSelected() {
        const allSelected = [];
        if (!this.isRoot() && this.selected) {
            allSelected.push(this);
        }

        this.files.forEach((file) => allSelected.push(...file.getAllSelected()));
        this.directories.forEach((directory) => allSelected.push(...directory.getAllSelected()));

        // clone them to ensure that upcoming from the server changes in the resources
        // will not interfere with the selected resources list
        return cloneDeep(allSelected);
    }

    getSelectedImportedResources() {
       return this.getAllSelected()
            .some((treeResource) => {
                return treeResource.importResource.status === ImportResourceStatus.DONE;
            });
    }

    deselectAll() {
        this.files.forEach((file) => file.deselectAll());
        this.directories.forEach((directory) => directory.deselectAll());
        this.selected = false;
        this.partialSelected = false;
    }

    getAllSelectedFiles() {
        const allSelected = [];
        if (!this.isRoot() && this.selected) {
            allSelected.push(this.importResource);
        }

        this.files.forEach((file) => allSelected.push(...file.getAllSelectedFiles()));
        this.directories.forEach((directory) => allSelected.push(...directory.getAllSelectedFiles()));

        return allSelected;
    }

    /**
     * Returns the names of all selected files.
     * @return {string[]}
     */
    getAllSelectedFilesNames() {
        return this.getAllSelectedFiles().map((file) => file.name);
    }

    getResourceByName(resourceName) {
        if (this.importResource && this.importResource.name === resourceName) {
            return this;
        }
        const resource = this.files.find((file) => file.importResource.name === resourceName);
        if (resource) {
            return resource;
        }

        for (const directory of this.directories) {
            const foundResource = directory.getResourceByName(resourceName);
            if (foundResource) {
                return foundResource;
            }
        }
        return null;
    }

    hasTextInResourcesName(searchText) {
        if (this.importResource.name.toLowerCase().includes(searchText.toLowerCase())) {
            return true;
        }

        if (this.files.some((file) => file.importResource.name.toLowerCase().includes(searchText.toLowerCase()))) {
            return true;
        }

        return this.directories.some((directory) => directory.hasTextInDirectoriesName(searchText));
    }

    hasTextInDirectoriesName(searchText) {
        if (this.isDirectory() && this.name.toLowerCase().includes(searchText.toLowerCase())) {
            return true;
        }

        return this.directories.some((directory) => directory.hasTextInDirectoriesName(searchText));
    }

    hasTextInFilesName(searchText) {
        if (this.isFile() &&this.name.toLowerCase().includes(searchText.toLowerCase())) {
            return true;
        }

        if (this.files.some((file) => file.importResource.name.toLowerCase().includes(searchText.toLowerCase()))) {
            return true;
        }

        return this.directories.some((directory) => directory.hasTextInFilesName(searchText));
    }

    sort(compareFunction) {
        this.directories.sort(compareFunction);
        this.files.sort(compareFunction);
        this.directories.forEach((directory) => directory.sort(compareFunction));
    }

    getSize() {
        return this.toList().length;
    }
}
