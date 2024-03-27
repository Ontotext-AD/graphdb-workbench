import {ImportResourceType} from "./import-resource-type";

export class ImportServerResource {
    constructor() {
        this.importResource = undefined;
        this.parent = undefined;
        this.name = '';
        this.selected = false;
        this.directories = [];
        this.files = [];
    }

    /**
     * Adds an import resource with rdf data to "ImportServerResource" tree.
     * @param {ImportServerResource} importServerResource - an import resource with rdf data.
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

    getOrCreateDirectory(directiveName) {
        let directive = this.directories.find((directive) => directive.name === directiveName);
        if (!directive) {
            directive = new ImportServerResource();
            directive.name = directiveName;
            this.directories.push(directive);
        }
        return directive;
    }

    getRoot() {
        if (this.parent === undefined) {
            return this;
        }
        return this.getRoot(this.parent);
    }

    isDirectory() {
        return ImportResourceType.DIRECTORY === this.importResource.type;
    }

    isFile() {
        return ImportResourceType.FILE === this.importResource.type;
    }

    isEmpty() {
        return this.directories.length === 0 && this.files.length === 0;
    }

    toList() {
        let result = [];
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
}
