export class LicenseStubs {

    static stubFreeLicense() {
        cy.intercept('GET', '/rest/graphdb-settings/license', {
            statusCode: 200,
            body: LicenseStubs.freeLicense()
        }).as('freeLicense');
    }

    static stubEnterpriseLicense() {
        cy.intercept('GET', '/rest/graphdb-settings/license', {
            statusCode: 200,
            body: LicenseStubs.enterpriseLicense()
        }).as('enterpriseLicense');
    }

    static stubEvaluationLicense() {
        cy.intercept('GET', '/rest/graphdb-settings/license', {
            statusCode: 200,
            body: LicenseStubs.evaluationLicense()
        }).as('evaluationLicense');
    }


    static freeLicense() {
        return {
            "message": "OK",
            "valid": true,
            "version": "10.7",
            "expiryDate": null,
            "licensee": "Freeware",
            "product": "GRAPHDB_LITE",
            "maxCpuCores": 1,
            "typeOfUse": "THE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.",
            "latestPublicationDate": null,
            "licenseCapabilities": [
                "Lucene connector"
            ],
            "productType": "free",
            "installationId": "1234-abcd-5678"
        };
    }

    static enterpriseLicense() {
        return {
            message: "OK",
            valid: true,
            version: null,
            expiryDate: 8640000000000000,
            licensee: "ONTOTEXT_INTERNAL",
            product: "GRAPHDB_ENTERPRISE",
            maxCpuCores: null,
            typeOfUse: "Non-commercial research only",
            latestPublicationDate: null,
            licenseCapabilities: [
                "OpenSearch connector",
                "Lucene connector",
                "Kafka connector",
                "Solr connector",
                "Cluster",
                "Elasticsearch connector"
            ],
            productType: "enterprise",
            installationId: "1234-abcd-5678"

        };
    }

    static evaluationLicense() {
        return {
            message: "OK",
            valid: true,
            version: null,
            expiryDate: 8640000000000000,
            licensee: "ONTOTEXT_INTERNAL",
            product: "GRAPHDB_ENTERPRISE",
            maxCpuCores: null,
            typeOfUse: "this is an evaluation license",
            latestPublicationDate: null,
            licenseCapabilities: [
                "OpenSearch connector",
                "Lucene connector",
                "Kafka connector",
                "Solr connector",
                "Cluster",
                "Elasticsearch connector"
            ],
            productType: "enterprise",
            installationId: "1234-abcd-5678"
        };
    }

    static stubGoogleCalls() {
        cy.intercept('GET', 'https://www.googletagmanager.com/**', {
            statusCode: 503
        });
        cy.intercept('POST', 'https://region1.google-analytics.com/**', {
            statusCode: 500
        });
    }
}
