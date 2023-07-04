import {JdbcDriverType} from "./jdbc-driver-type";

export class OntopDriverData {
    constructor() {
        this.classAvailable = false;
        this.downloadDriverUrl = '';
        this.driverClass = '';
        this.driverName = '';
        this.driverType = '';
        this.portRequired = false;
        this.urlTemplate = '';
    }

    static isGenericDriver(type) {
        return type === JdbcDriverType.GENERIC;
    }

    static isSnowflakeDriver(type) {
        return type === JdbcDriverType.SNOWFLAKE;
    }
}
