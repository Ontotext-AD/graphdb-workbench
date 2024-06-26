export class JdbcStubs {
    static stubJdbcCreateError() {
        cy.intercept('POST', '/rest/sql-views/tables', {
            statusCode: 500,
            response: {
                error: 'Internal Server Error'
            }
        }).as('create-jdbc-configuration-error');
    }

    static stubJdbcUpdateError() {
        cy.intercept('PUT', '/rest/sql-views/tables/**', {
            statusCode: 500,
            response: {
                error: 'Internal Server Error'
            }
        }).as('update-jdbc-configuration-error');
    }
}
