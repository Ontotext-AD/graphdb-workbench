export class OntopConnectionInformation {
    constructor(driverType = 'generic') {
        this.driverType = driverType;
        this.hostName = '';
        this.port = undefined;
        this.databaseName = '';
        this.username = '';
        this.password = '';
        this.driverClass = '';
        this.url = '';
        this.urlUserInput = '';
    }
}
