import {ImportResource} from "../../models/import/import-resource";
import {md5HashGenerator} from "../../utils/hash-utils";

export const toImportResource = (importResourcesServerData) => {
    const hashGenerator = md5HashGenerator();
    return importResourcesServerData.map((importResourceServerData) => new ImportResource(importResourceServerData, hashGenerator));
};
