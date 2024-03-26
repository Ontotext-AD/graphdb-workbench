import {ImportServerResource} from "../../models/import/import-server-resource";
import {ImportResourceType} from "../../models/import/import-resource-type";

/**
 * Convert list with {@link ImportResource} to {@link ImportServerResource} tree.
 *
 * @param {ImportResource[]} importResources
 *
 * @return {ImportServerResource} the root of the import server resource tree.
 */
export const toImportServerResource = (importResources) => {
    const root = new ImportServerResource();
    importResources.forEach((resource) => addResourceToTree(root, resource));
    return root;
};

/**
 * Adds the <code>resource</code> into the tree with root <code>root</code>.
 * @param {ImportServerResource} root
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
        const importServerResource = new ImportServerResource();
        importServerResource.parent = resourceParent;
        importServerResource.importResource = resource;
        resourceParent.addResource(importServerResource);
    } else {
        resourceParent.importResource = resource;
    }
};

/**
 * Creates directory path (if no created yet) and returns the inner parent .
 * @param {ImportServerResource} importServerResource - the root parent directory.
 * @param {string[]} directoryPath - the list with directory names that have to be created.
 *
 * @return {ImportServerResource} the inner parent.
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
    const SINGLE_SLASH_REGEX = /\//;

    if (SINGLE_SLASH_REGEX.test(resource.name)) {
        return resource.name.split(SINGLE_SLASH_REGEX);
    }

    return [resource.name];
};
