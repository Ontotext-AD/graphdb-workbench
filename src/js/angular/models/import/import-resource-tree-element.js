import {ImportResourceType} from "./import-resource-type";

/**
 * Resources have parent-child relations. This class represents one resource element from the parent-child relation tree.
 */
export class ImportResourceTreeElement {
    constructor() {
        this.importResource = undefined;
        this.parent = undefined;
        this.indent = 0;
        this.name = '';
        this.selected = false;
        this.directories = [];
        this.files = [];
    }

    /**
     * Adds an import resource with rdf data to import resource parent-child tree.
     * @param {ImportResourceTreeElement} importServerResource - an import resource with rdf data.
     */
    addResource(importServerResource) {
        if (importServerResource.isFile()) {
            this.files.push(importServerResource);
            return;
        }
        if (importServerResource.isDirectory()) {
            this.directories.push(importServerResource);
            return;
        }
        throw new Error('Unsupported resource type!');
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
        if (this.parent === undefined) {
            return this;
        }
        return this.getRoot(this.parent);
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
        return this.importResource.isFile();
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

    setSelection(selected) {
        this.selected = selected;
        this.files.forEach((file) => file.setSelection(selected));
        this.directories.forEach((directory) => directory.setSelection(selected));
    }

    getAllSelected() {
        const allSelected = [];
        if (this.selected) {
            allSelected.push(this);
        }

        this.files.forEach((file) => allSelected.push(...file.getAllSelected()));
        this.directories.forEach((directory) => allSelected.push(...directory.getAllSelected()));

        return allSelected;
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
        if (this.importResource.name.includes(searchText)) {
            return true;
        }
        if (this.files.some((file) => file.importResource.name.includes(searchText))) {
            return true;
        }
        for (const directory of this.directories) {
            const foundResource = directory.hasTextInResourcesName(searchText);
            if (foundResource) {
                return foundResource;
            }
        }

        return false;
    }

    hasTextInDirectoriesName(searchText) {
        if (this.isDirectory() && this.name.includes(searchText)) {
            return true;
        }

        for (const directory of this.directories) {
            const foundResource = directory.hasTextInDirectoriesName(searchText);
            if (foundResource) {
                return foundResource;
            }
        }

        return false;
    }

    hasTextInFilesName(searchText) {
        if (this.isFile() &&this.name.includes(searchText)) {
            return true;
        }

        if (this.files.some((file) => file.importResource.name.includes(searchText))) {
            return true;
        }

        for (const directory of this.directories) {
            const foundResource = directory.hasTextInFilesName(searchText);
            if (foundResource) {
                return foundResource;
            }
        }
        return false;
    }
}
