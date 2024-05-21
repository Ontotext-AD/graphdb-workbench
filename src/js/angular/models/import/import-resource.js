import {ImportResourceStatus} from "./import-resource-status";
import {ImportParsingSettings} from "./import-parsing-settings";
import {ImportResourceType} from "./import-resource-type";
import {generateMD5Hash} from "../../utils/hash-utils";

/**
 * DTO represents a resource that describes an import resource of rdf data.
 */
export class ImportResource {

    constructor(importResourceServerData) {
        this.hash = generateMD5Hash(JSON.stringify(importResourceServerData));
        this.name = importResourceServerData ? importResourceServerData.name : undefined;
        this.status = importResourceServerData ? importResourceServerData.status : ImportResourceStatus.NONE;
        this.message = importResourceServerData && importResourceServerData.message ? importResourceServerData.message : '';
        this.context = importResourceServerData && importResourceServerData.context ? importResourceServerData.context : '';
        /**
         *
         * @type {string[]}
         */
        this.replaceGraphs = importResourceServerData ? importResourceServerData.replaceGraphs : [];
        this.baseURI = importResourceServerData ? importResourceServerData.baseURI : undefined;
        this.forceSerial = importResourceServerData ? importResourceServerData.forceSerial : false;
        /**
         * Specifies the type of the import resource. It must be one of the values defined in {@link ImportResourceType}.
         * @type {string | undefined}
         */
        this.type = importResourceServerData ? importResourceServerData.type : undefined;
         /**
         * Specifies the format of RDF data. This property is relevant only for resources of type {@link ImportResourceType.URL} or {@link ImportResourceType.TEXT}.
         * It must be one of the values defined in {@link ImportResourceFormat}.
         * @type {string | undefined}
         */
        this.format = importResourceServerData ? importResourceServerData.format : undefined;

        /**
         * @type {string | undefined}
         */
        this.data = importResourceServerData ? importResourceServerData.data : undefined;

        /**
         * @type {number | undefined}
         */
        this.modifiedOn = importResourceServerData ? importResourceServerData.lastModified : undefined;

        /**
         * @type {number | undefined}
         */
        this.importedOn = importResourceServerData ? importResourceServerData.imported : undefined;

        /**
         * @type {string}
         */
        this.size = importResourceServerData ? importResourceServerData.size : '';

        /**
         * @type {number}
         */
        this.addedStatements = importResourceServerData ? importResourceServerData.addedStatements : 0;

        /**
         * @type {number}
         */
        this.removedStatements = importResourceServerData ? importResourceServerData.removedStatements : 0;

        /**
         * @type {number}
         */
        this.numReplacedGraphs = importResourceServerData ? importResourceServerData.numReplacedGraphs : 0;

        this.parserSettings = importResourceServerData ? importResourceServerData.parserSettings : new ImportParsingSettings();

        /**
         * This field of ImportSettings will be used to forward "X-Request-Id" type headers (if any) to thread that will execute the import of file.
         * @type {string | undefined}
         */
        this.requestIdHeadersToForward = importResourceServerData ? importResourceServerData.requestIdHeadersToForward : undefined;
    }

    isDirectory() {
        return ImportResourceType.DIRECTORY === this.type;
    }

    isFile() {
        return ImportResourceType.FILE === this.type || ImportResourceType.URL === this.type || ImportResourceType.TEXT === this.type;
    }

    isURL() {
        return ImportResourceType.URL === this.type;
    }

    isText() {
        return ImportResourceType.TEXT === this.type;
    }
}
