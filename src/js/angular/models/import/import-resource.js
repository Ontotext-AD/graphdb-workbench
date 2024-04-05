import {ImportResourceStatus} from "./import-resource-status";
import {ImportParsingSettings} from "./import-parsing-settings";
import {ImportResourceType} from "./import-resource-type";

/**
 * DTO represents a resource that describes an import resource of rdf data.
 */
export class ImportResource {

    constructor(importResourceServerData) {
        this.name = importResourceServerData ? importResourceServerData.name : undefined;
        this.status = importResourceServerData ? importResourceServerData.status : ImportResourceStatus.NONE;
        this.message = importResourceServerData ? importResourceServerData.message : undefined;
        this.context = importResourceServerData ? importResourceServerData.context : undefined;
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
        this.modifiedOn = importResourceServerData ? importResourceServerData.timestamp : undefined;

        /**
         * @type {number | undefined}
         */
        this.importedOn = importResourceServerData ? importResourceServerData.timestamp : undefined;

        /**
         * The property is used when importing JSONLD files only
         * @type {string | undefined}
         */
        this.contextLink = importResourceServerData ? importResourceServerData.contextLink : undefined;

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
}
