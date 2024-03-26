import {ImportResourceStatus} from "./import-resource-status";
import {ImportParsingSettings} from "./import-parsing-settings";

/**
 * DTO represents a resource that describes an import resource of rdf data.
 */
export class ImportResource {

    constructor() {
        this.name = undefined;
        this.status = ImportResourceStatus.NONE;
        this.message = undefined;
        this.context = undefined;
        /**
         *
         * @type {string[]}
         */
        this.replaceGraphs = [];
        this.baseURI = undefined;
        this.forceSerial = false;
        /**
         * Specifies the type of the import resource. It must be one of the values defined in {@link ImportResourceType}.
         * @type {string | undefined}
         */
        this.type = undefined;
         /**
         * Specifies the format of RDF data. This property is relevant only for resources of type {@link ImportResourceType.URL} or {@link ImportResourceType.TEXT}.
         * It must be one of the values defined in {@link ImportResourceFormat}.
         * @type {string | undefined}
         */
        this.format = undefined;

        /**
         * @type {string | undefined}
         */
        this.data = undefined;

        /**
         * @type {number | undefined}
         */
        this.timestamp = undefined;

        /**
         * The property is used when importing JSONLD files only
         * @type {string | undefined}
         */
        this.contextLink = undefined;

        this.parserSettings = new ImportParsingSettings();

        /**
         * This field of ImportSettings will be used to forward "X-Request-Id" type headers (if any) to thread that will execute the import of file.
         * @type {string | undefined}
         */
        this.requestIdHeadersToForward = undefined;


    }

}
