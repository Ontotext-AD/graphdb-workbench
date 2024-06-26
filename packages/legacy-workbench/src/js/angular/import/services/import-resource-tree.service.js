import {ImportResourceType} from "../../models/import/import-resource-type";
import {ImportResourceTreeElement} from "../../models/import/import-resource-tree-element";
import {ImportResourceStatus} from "../../models/import/import-resource-status";

export const INDENT = 30;
const PREFIX_AND_SUFFIX_LENGTH = 30;
const MAX_CONTEXT_LENGTH = PREFIX_AND_SUFFIX_LENGTH * 2 + 3;
const MAX_NAME_LENGTH = PREFIX_AND_SUFFIX_LENGTH * 4 + 3;
const MAX_MESSAGE_LENGTH = 150;


export const serverImportResourceTypeToIconMapping = new Map();
serverImportResourceTypeToIconMapping.set(ImportResourceType.DIRECTORY, 'icon-folder');
serverImportResourceTypeToIconMapping.set(ImportResourceType.FILE, 'icon-file');

export const userImportResourceTypeToIconMapping = new Map();
userImportResourceTypeToIconMapping.set(ImportResourceType.DIRECTORY, 'icon-folder');
userImportResourceTypeToIconMapping.set(ImportResourceType.FILE, 'icon-upload');
userImportResourceTypeToIconMapping.set(ImportResourceType.URL, 'icon-link');
userImportResourceTypeToIconMapping.set(ImportResourceType.TEXT, 'icon-sparql');

export class ImportResourceTreeService {
    /**
     * Convert list with {@link ImportResource} to a list of {@link ImportResourceTreeElement}.
     * @param {ImportResource[]} importResources list of {@link ImportResource}
     * @param {boolean} isUserImport - true if resource is from user.
     * @return {ImportResourceTreeElement} the root of the import user resource tree.
     */
    static toImportResourceTree(importResources, isUserImport) {
        const root = new ImportResourceTreeElement();
        importResources.forEach((resource) => {
            ImportResourceTreeService.addResourceToTree(root, resource, isUserImport);
        });
        return root;
    }

    /**
     * Merges the tree <code>importResourceElement</code> with the passed new resources (<code>newResources</code>). This includes adding an import resource if it does not exist in the tree,
     * removing it from the tree if the resource is not present in <code>newResources</code>, and updating the tree resource if it exists.
     *
     * @param {ImportResourceTreeElement} importResourceElement - The tree where the new resources will be merged.
     * @param {ImportResource[]} newResources - A list of the new resources.
     * @param {boolean} isUserImport
     */
    static mergeResourceTree(importResourceElement, newResources, isUserImport) {
        // Removes missing files.
        importResourceElement.getRoot().toList().forEach((resource) => {
            const newResource = newResources.find((newResource) => {
                return newResource.name === resource.importResource.name
            });
            if (!newResource) {
                resource.remove();
            }
        });

        newResources.forEach((resource) => {
            const existingResource = importResourceElement.getResourceByName(resource.name);
            if (existingResource) {
                // if resource is already in the tree just update imported resource.
                existingResource.importResource = resource;
            } else {
                ImportResourceTreeService.addResourceToTree(importResourceElement, resource, isUserImport);
            }
        });
    }

    /**
     * Adds the <code>resource</code> into the tree with root <code>root</code>.
     * @param {ImportResourceTreeElement} root
     * @param {ImportResource} resource
     * @param {boolean} isUserImport - true if resource is from user.
     *
     * @return {ImportResourceTreeElement} added resource tree element.
     */
    static addResourceToTree(root, resource, isUserImport) {
        const path = ImportResourceTreeService.getPath(resource);
        let directoryPath;
        if (resource.isDirectory()) {
            directoryPath = path;
        } else {
            directoryPath = path.slice(0, path.length - 1);
        }

        const resourceParent = ImportResourceTreeService.getOrCreateParent(root, directoryPath);

        if (resource.isFile()) {
            const importResourceElement = new ImportResourceTreeElement();
            importResourceElement.parent = resourceParent;
            importResourceElement.importResource = resource;
            importResourceElement.path = path.join('/');
            importResourceElement.name = path[path.length - 1];
            resourceParent.addResource(importResourceElement);
            ImportResourceTreeService.setIcon(importResourceElement, isUserImport);
            return importResourceElement;
        } else {
            resourceParent.importResource = resource;
            resourceParent.path = path.join('/');
            ImportResourceTreeService.setIcon(resourceParent, isUserImport);
            return resourceParent;
        }
    }

    static setIcon(importResourceElement, isUserImport) {
        if (isUserImport) {
            importResourceElement.iconClass = userImportResourceTypeToIconMapping.get(importResourceElement.importResource.type);
        } else {
            importResourceElement.iconClass = serverImportResourceTypeToIconMapping.get(importResourceElement.importResource.type);
        }
    }

    /**
     * Creates directory path (if no created yet) and returns the inner parent .
     * @param {ImportResourceTreeElement} importResourceElement - the root parent directory.
     * @param {string[]} directoryPath - the list with directory names that have to be created.
     *
     * @return {ImportResourceTreeElement} the inner parent.
     */
    static getOrCreateParent(importResourceElement, directoryPath) {
        let parent = importResourceElement;
        directoryPath.forEach((directoryName) => {
            const directory = parent.getOrCreateDirectory(directoryName);
            directory.parent = parent;
            parent = directory;
        });
        return parent;
    }

    /**
     * Returns the path of the resource.
     * @param {ImportResource} resource
     * @return {string[]}
     */
    static getPath(resource) {
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
    }

    static calculateElementIndent(importResourceElement) {
        importResourceElement.indent = (8 + ImportResourceTreeService.getParentsCount(importResourceElement) * INDENT) + 'px';
        importResourceElement.directories.forEach((directory) => ImportResourceTreeService.calculateElementIndent(directory));
        importResourceElement.files.forEach((file) => ImportResourceTreeService.calculateElementIndent(file));
    }

    static setupAfterTreeInitProperties(importResourceElement) {
        if (!importResourceElement.isRoot()) {
            importResourceElement.isImportable = ImportResourceTreeService.isImportable(importResourceElement.importResource);
            importResourceElement.hasOngoingImport = ImportResourceTreeService.hasOngoingImport(importResourceElement.importResource);
            importResourceElement.canResetStatus = ImportResourceTreeService.canResetStatus(importResourceElement.importResource);
            importResourceElement.hasStatusInfo = importResourceElement.importResource.status === 'DONE' || importResourceElement.importResource.status === 'ERROR';
            importResourceElement.isEditable = importResourceElement.importResource.isText();
            ImportResourceTreeService.setupShortenedMessage(importResourceElement);
            ImportResourceTreeService.setupShortenedContext(importResourceElement);
            ImportResourceTreeService.setupShortenedName(importResourceElement);
            ImportResourceTreeService.setupImportedAndModifiedComparableProperties(importResourceElement);
        }
        importResourceElement.directories.forEach((directory) => ImportResourceTreeService.setupAfterTreeInitProperties(directory));
        importResourceElement.files.forEach((file) => ImportResourceTreeService.setupAfterTreeInitProperties(file));
    }

    /**
     * Setts shortedMessage property if message is too long.
     * @param {ImportResourceTreeElement} importResourceElement
     */
    static setupShortenedMessage(importResourceElement) {
        const message = importResourceElement.importResource ? importResourceElement.importResource.message : '' || '';
        if (message.length > MAX_MESSAGE_LENGTH) {
            importResourceElement.shortenedMessage = message.substring(0, MAX_MESSAGE_LENGTH) + '...';
        }
    }

    /**
     * Setts shortedContext property if context is too long.
     * @param {ImportResourceTreeElement} importResourceElement
     */
    static setupShortenedContext(importResourceElement) {
        const context = importResourceElement.importResource ? importResourceElement.importResource.context : '' || '';
        if (context.length > MAX_CONTEXT_LENGTH) {
            importResourceElement.shortenedContext = context.substring(0, PREFIX_AND_SUFFIX_LENGTH) + '...' + context.substring(context.length - PREFIX_AND_SUFFIX_LENGTH);
        }
    }

    /**
     * Setts shortenedName property if name is too long.
     * @param {ImportResourceTreeElement} importResourceElement
     */
    static setupShortenedName(importResourceElement) {
        const name = importResourceElement.name || '';
        if (name.length > MAX_NAME_LENGTH) {
            importResourceElement.shortenedName = name.substring(0, PREFIX_AND_SUFFIX_LENGTH) + '...' + name.substring(name.length - PREFIX_AND_SUFFIX_LENGTH);
        }
    }

    static setupImportedAndModifiedComparableProperties(importResourceElement) {
        const importResource = importResourceElement.importResource;
        if (importResource) {
            if (importResource.importedOn === 0 || importResource.modifiedOn === 0 || importResource.importedOn === importResource.modifiedOn) {
                return;
            }
            importResourceElement.isImportedBiggerThanModified = importResource.importedOn > importResource.modifiedOn;
            importResourceElement.isModifiedBiggerThanImported = !importResourceElement.isImportedBiggerThanModified;
        }
    }

    static isImportable(importResource) {
        return importResource.status !== ImportResourceStatus.IMPORTING && importResource.status !== ImportResourceStatus.UPLOADING && importResource.status !== ImportResourceStatus.PENDING && importResource.status !== ImportResourceStatus.INTERRUPTING;
    }

    static hasOngoingImport(importResource) {
        return importResource.status === ImportResourceStatus.IMPORTING || importResource.status === ImportResourceStatus.UPLOADING || importResource.status === ImportResourceStatus.PENDING || importResource.status === ImportResourceStatus.INTERRUPTING;
    }

    static canResetStatus(importResource) {
        return importResource.status === ImportResourceStatus.DONE || importResource.status === ImportResourceStatus.ERROR;
    }

    static getParentsCount(importResourceElement) {
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
    }
}
