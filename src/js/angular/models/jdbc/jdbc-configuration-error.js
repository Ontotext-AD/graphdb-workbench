export class JdbcConfigurationError extends Error {

    constructor(message, jdbcConfigurationInfo) {
        super(message);
        this.jdbcConfigurationInfo = jdbcConfigurationInfo;
    }
}
