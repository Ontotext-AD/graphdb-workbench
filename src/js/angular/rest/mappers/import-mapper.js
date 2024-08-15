import {ImportResource} from "../../models/import/import-resource";
import {md5HashGenerator} from "../../utils/hash-utils";

export const toImportResource = (importResourcesServerData) => {
    const hashGenerator = md5HashGenerator();
    return importResourcesServerData.map((importResourceServerData) => new ImportResource(importResourceServerData, hashGenerator));
};

export const fileToImportResource = (file) => {
    const hashGenerator = md5HashGenerator();
    return new ImportResource({
        name: file.name,
        size: file.size,
        type: 'file',
        modifiedOn: file.lastModified,
        file: file
    }, hashGenerator);
};

/**
 * Converts a list of files to a list of import resources.
 * @param {File[]} files
 * @return {ImportResource[]}
 */
export const filesToImportResource = (files, initialStatus) => {
    const hashGenerator = md5HashGenerator();
    const resources = files.map((file) => {
        return new ImportResource({
            name: file.name,
            size: file.size,
            type: 'file',
            modifiedOn: file.lastModified,
            file: file,
            status: initialStatus
        }, hashGenerator);
    });
    return resources;
};
