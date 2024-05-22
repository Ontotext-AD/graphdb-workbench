import {ImportResourceTreeElement} from "../../models/import/import-resource-tree-element";
import {ImportResource} from "../../models/import/import-resource";
import {ImportResourceStatus} from "../../models/import/import-resource-status";
import {ImportResourceType} from "../../models/import/import-resource-type";
import {md5HashGenerator} from "../../utils/hash-utils";

export const toImportResource = (importResourcesServerData) => {
    const hashGenerator = md5HashGenerator();
    return importResourcesServerData.map((importResourceServerData) => new ImportResource(importResourceServerData, hashGenerator));
};

export const INDENT = 30;
const PREFIX_AND_SUFFIX_LENGTH = 30;
const MAX_CONTEXT_LENGTH = PREFIX_AND_SUFFIX_LENGTH * 2 + 3;
const MAX_NAME_LENGTH = PREFIX_AND_SUFFIX_LENGTH * 4 + 3;


const serverImportResourceTypeToIconMapping = new Map();
serverImportResourceTypeToIconMapping.set(ImportResourceType.DIRECTORY, 'icon-folder');
serverImportResourceTypeToIconMapping.set(ImportResourceType.FILE, 'icon-file');

const userImportResourceTypeToIconMapping = new Map();
userImportResourceTypeToIconMapping.set(ImportResourceType.DIRECTORY, 'icon-folder');
userImportResourceTypeToIconMapping.set(ImportResourceType.FILE, 'icon-upload');
userImportResourceTypeToIconMapping.set(ImportResourceType.URL, 'icon-link');
userImportResourceTypeToIconMapping.set(ImportResourceType.TEXT, 'icon-sparql');

/**
 * Convert list with {@link ImportResource} to a list of {@link ImportResourceTreeElement}.
 * @param {ImportResource[]} importResources list of {@link ImportResource}
 * @return {ImportResourceTreeElement} the root of the import user resource tree.
 */
export const toImportUserDataResource = (importResources) => {
    const root = new ImportResourceTreeElement();
    importResources
        .toSorted((a, b) => b.modifiedOn - a.modifiedOn)
        .forEach((resource) => {
            const importResourceElement = addResourceToTree(root, resource);
            importResourceElement.iconClass = userImportResourceTypeToIconMapping.get(resource.type);
        });
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
    importResources.forEach((resource) => {
        const importResourceElement = addResourceToTree(root, resource);
        importResourceElement.iconClass = serverImportResourceTypeToIconMapping.get(resource.type);
    });
    calculateElementIndent(root);
    setupAfterTreeInitProperties(root);
    return root;
};

/**
 * Adds the <code>resource</code> into the tree with root <code>root</code>.
 * @param {ImportResourceTreeElement} root
 * @param {ImportResource} resource
 *
 * @return {ImportResourceTreeElement} added resource tree element.
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
        importServerResource.path = path.join('/');
        importServerResource.name = path[path.length - 1];
        resourceParent.addResource(importServerResource);
        return importServerResource;
    } else {
        resourceParent.importResource = resource;
        resourceParent.path = path.join('/');
        return resourceParent;
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
        importResourceElement.isEditable = importResourceElement.importResource.isText();
        setupShortenedContext(importResourceElement);
        setupShortenedName(importResourceElement);
        setupImportedAndModifiedComparableProperties(importResourceElement);
    }
    importResourceElement.directories.forEach((directory) => setupAfterTreeInitProperties(directory));
    importResourceElement.files.forEach((file) => setupAfterTreeInitProperties(file));
};

/**
 * Setts shortedContext property if context is too long.
 * @param {ImportResourceTreeElement} importResourceElement
 */
const setupShortenedContext = (importResourceElement) => {
    const context = importResourceElement.importResource ? importResourceElement.importResource.context : '' || '';
    if (context.length > MAX_CONTEXT_LENGTH) {
        importResourceElement.shortenedContext = context.substring(0, PREFIX_AND_SUFFIX_LENGTH) + '...' + context.substring(context.length - PREFIX_AND_SUFFIX_LENGTH);
    }
};

/**
 * Setts shortenedName property if name is too long.
 * @param {ImportResourceTreeElement} importResourceElement
 */
const setupShortenedName = (importResourceElement) => {
    const name = importResourceElement.name || '';
    if (name.length > MAX_NAME_LENGTH) {
        importResourceElement.shortenedName = name.substring(0, PREFIX_AND_SUFFIX_LENGTH) + '...' + name.substring(name.length - PREFIX_AND_SUFFIX_LENGTH);
    }
};

const setupImportedAndModifiedComparableProperties = (importResourceElement) => {
    const importResource = importResourceElement.importResource;
    if (importResource) {
        if (importResource.importedOn === 0 || importResource.modifiedOn === 0 || importResource.importedOn === importResource.modifiedOn) {
            return;
        }
        importResourceElement.isImportedBiggerThanModified = importResource.importedOn > importResource.modifiedOn;
        importResourceElement.isModifiedBiggerThanImported = !importResourceElement.isImportedBiggerThanModified;
    }
};

const isImportable = (importResource) => {
    return importResource.status !== ImportResourceStatus.IMPORTING && importResource.status !== ImportResourceStatus.UPLOADING && importResource.status !== ImportResourceStatus.PENDING && importResource.status !== ImportResourceStatus.INTERRUPTING;
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
