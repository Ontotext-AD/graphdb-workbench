import {ImportResourceTreeElement} from "../../models/import/import-resource-tree-element";
import {ImportResourceType} from "../../models/import/import-resource-type";
const path = require('path');

/**
 * Convert list with {@link ImportResource} to {@link ImportResourceTreeElement} tree.
 *
 * @param {ImportResource[]} importResources
 *
 * @return {ImportResourceTreeElement} the root of the import server resource tree.
 */
export const toImportServerResource = (importResources) => {
    const root = new ImportResourceTreeElement();
    importResources.forEach((resource) => addResourceToTree(root, resource));
    return root;
};

/**
 * Adds the <code>resource</code> into the tree with root <code>root</code>.
 * @param {ImportResourceTreeElement} root
 * @param {ImportResource} resource
 */
const addResourceToTree = (root, resource) => {
    const path = getPath(resource);
    let directoryPath = [];
    if (ImportResourceType.DIRECTORY === resource.type) {
        directoryPath = path;
    } else {
        directoryPath = path.slice(0, path.length - 1);
    }

    const resourceParent = getOrCreateParent(root, directoryPath);

    if (ImportResourceType.FILE === resource.type) {
        const importServerResource = new ImportResourceTreeElement();
        importServerResource.parent = resourceParent;
        importServerResource.importResource = resource;
        importServerResource.name = path[path.length - 1];
        resourceParent.addResource(importServerResource);
    } else {
        resourceParent.importResource = resource;
    }
};

/**
 * Creates directory path (if no created yet) and returns the inner parent .
 * @param {ImportResourceTreeElement} importServerResource - the root parent directory.
 * @param {string[]} directoryPath - the list with directory names that have to be created.
 *
 * @return {ImportResourceTreeElement} the inner parent.
 */
const getOrCreateParent = (importServerResource, directoryPath) => {
    let parent = importServerResource;
    directoryPath.forEach((directoryName) => {
        const directory = parent.getOrCreateDirectory(directoryName);
        directory.parent = parent;
        parent = directory;
    });
    return parent;
};

const getPath = (resource) => {
    // Matches either '/' or '\'.
    const pathSeparatorRegex = /[/\\]/;
    if (pathSeparatorRegex.test(resource.name)) {
        return resource.name.split(pathSeparatorRegex);
    } else {
        return [resource.name];
    }
};
