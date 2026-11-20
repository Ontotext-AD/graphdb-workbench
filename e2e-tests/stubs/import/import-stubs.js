const REJECTED_MESSAGE = 'The transaction can no longer be stopped';

export class ImportStubs {
    static stubGetUploadedFiles(repositoryId, fixture) {
        cy.intercept({method: 'GET', pathname: `/rest/repositories/${repositoryId}/import/upload`}, {fixture}).as('getUploadedFiles');
    }

    static stubStopUserDataImportError(repositoryId) {
        cy.intercept({method: 'DELETE', pathname: `/rest/repositories/${repositoryId}/import/upload`}, {statusCode: 409, body: REJECTED_MESSAGE}).as('stopUserDataImport');
    }

    static stubResetUserDataStatusError(repositoryId) {
        cy.intercept({method: 'DELETE', pathname: `/rest/repositories/${repositoryId}/import/upload/status`}, {statusCode: 409, body: REJECTED_MESSAGE}).as('resetUserDataStatus');
    }
}
