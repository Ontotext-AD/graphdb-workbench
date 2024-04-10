import {ImportResourceTreeElement} from "../../models/import/import-resource-tree-element";
import {ImportResource} from "../../models/import/import-resource";
import {ImportResourceStatus} from "../../models/import/import-resource-status";

export const toImportResource = (importResourcesServerData) => {
    return importResourcesServerData.map((importResourceServerData) => new ImportResource(importResourceServerData));
};

export const INDENT = 30;
const PREFIX_AND_SUFFIX_CONTEXT_LENGTH = 30;
const MAX_CONTEXT_LENGTH = PREFIX_AND_SUFFIX_CONTEXT_LENGTH * 2 + 3;

/**
 * Convert list with {@link ImportResource} to a list of {@link ImportResourceTreeElement}.
 * @param {ImportResource[]} importResources list of {@link ImportResource}
 * @return {ImportResourceTreeElement} the root of the import user resource tree.
 */
export const toImportUserDataResource = (importResources) => {
    const root = new ImportResourceTreeElement();
    importResources
        .toSorted((a, b) => b.modifiedOn - a.modifiedOn)
        .forEach((resource) => addResourceToTree(root, resource));
    calculateElementIndent(root);
    setupAfterTreeInitProperties(root);
    return root;
};

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
    calculateElementIndent(root);
    setupAfterTreeInitProperties(root);
    return root;
};

/**
 * Adds the <code>resource</code> into the tree with root <code>root</code>.
 * @param {ImportResourceTreeElement} root
 * @param {ImportResource} resource
 */
const addResourceToTree = (root, resource) => {
    const path = getPath(resource);
    let directoryPath;
    if (resource.isDirectory()) {
        directoryPath = path;
    } else {
        directoryPath = path.slice(0, path.length - 1);
    }

    const resourceParent = getOrCreateParent(root, directoryPath);

    if (resource.isFile()) {
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

/**
 * Returns the path of the resource.
 * @param {ImportResource} resource
 * @return {string[]}
 */
const getPath = (resource) => {
    if (resource.isURL()) {
        return [resource.name];
    }
    // Matches either '/' or '\'.
    const pathSeparatorRegex = /[/\\]/;
    if (pathSeparatorRegex.test(resource.name)) {
        return resource.name.split(pathSeparatorRegex);
    } else {
        return [resource.name];
    }
};

const calculateElementIndent = (importResourceElement) => {
    importResourceElement.indent = (8 + getParentsCount(importResourceElement) * INDENT) + 'px';
    importResourceElement.directories.forEach((directory) => calculateElementIndent(directory));
    importResourceElement.files.forEach((file) => calculateElementIndent(file));
};

const setupAfterTreeInitProperties = (importResourceElement) => {
    if (!importResourceElement.isRoot()) {
        importResourceElement.isImportable = isImportable(importResourceElement.importResource);
        importResourceElement.hasOngoingImport = hasOngoingImport(importResourceElement.importResource);
        importResourceElement.canResetStatus = canResetStatus(importResourceElement.importResource);
        importResourceElement.hasStatusInfo = importResourceElement.importResource.status === 'DONE' || importResourceElement.importResource.status === 'ERROR';
        setupShortedContext(importResourceElement);
    }
    importResourceElement.directories.forEach((directory) => setupAfterTreeInitProperties(directory));
    importResourceElement.files.forEach((file) => setupAfterTreeInitProperties(file));
};

/**
 * Setts shortedContext property if context is too long.
 * @param {ImportResourceTreeElement} importResourceElement
 */
const setupShortedContext = (importResourceElement) => {
    const context = importResourceElement.importResource ? importResourceElement.importResource.context : '' || '';
    if (context.length > MAX_CONTEXT_LENGTH) {
        importResourceElement.shorthedContext = context.substring(0, PREFIX_AND_SUFFIX_CONTEXT_LENGTH) + '...' + context.substring(context.length - PREFIX_AND_SUFFIX_CONTEXT_LENGTH);
    }
};

const isImportable = (importResource) => {
    return importResource.isFile() && importResource.status !== ImportResourceStatus.IMPORTING && importResource.status !== ImportResourceStatus.UPLOADING && importResource.status !== ImportResourceStatus.PENDING && importResource.status !== ImportResourceStatus.INTERRUPTING;
};

const hasOngoingImport = (importResource) => {
    return importResource.status === ImportResourceStatus.IMPORTING || importResource.status === ImportResourceStatus.UPLOADING || importResource.status === ImportResourceStatus.PENDING || importResource.status === ImportResourceStatus.INTERRUPTING;
};

const canResetStatus = (importResource) => {
    return importResource.status === ImportResourceStatus.DONE || importResource.status === ImportResourceStatus.ERROR;
};

const getParentsCount = (importResourceElement) => {
    let parentCount = 0;
    if (importResourceElement.parent === undefined) {
        return parentCount;
    }

    let parent = importResourceElement.parent;
    while (parent) {
        parent = parent.parent;
        parentCount++;
    }
    return parentCount - 1;
};
