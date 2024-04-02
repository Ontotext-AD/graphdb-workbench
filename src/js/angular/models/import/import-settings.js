// "importSettings": {
//     "name": "bnodes.ttl",
//         "status": "NONE",
//         "message": "",
//         "context": "",
//         "replaceGraphs": [],
//         "baseURI": null,
//         "forceSerial": false,
//         "type": "file",
//         "format": null,
//         "data": null,
//         "timestamp": 1710867617127,
//         "contextLink": null,
//         "parserSettings": {
//         "preserveBNodeIds": false,
//             "failOnUnknownDataTypes": false,
//             "verifyDataTypeValues": false,
//             "normalizeDataTypeValues": false,
//             "failOnUnknownLanguageTags": false,
//             "verifyLanguageTags": true,
//             "normalizeLanguageTags": false,
//             "stopOnError": true
//     },
//     "hasContextLink": false
// }
// TODO: not used yet
export class ImportSettings {
    constructor() {
        this.name = '';
        this.status = 'NONE';
        this.message = '';
        this.context = '';
        this.replaceGraphs = [];
        this.baseURI = null;
        this.forceSerial = false;
        this.type = 'file';
        this.format = null;
        this.data = null;
        this.timestamp = Date.now();
        this.contextLink = null;
        this.parserSettings = {
            preserveBNodeIds: false,
            failOnUnknownDataTypes: false,
            verifyDataTypeValues: false,
            normalizeDataTypeValues: false,
            failOnUnknownLanguageTags: false,
            verifyLanguageTags: true,
            normalizeLanguageTags: false,
            stopOnError: true
        };
        this.hasContextLink = false;
    }
}
