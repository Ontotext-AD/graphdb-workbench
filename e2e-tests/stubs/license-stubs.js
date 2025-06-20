export class LicenseStubs {

    static spyGetLicense() {
        cy.intercept('GET', '/rest/graphdb-settings/license').as('get-license');
    }

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

    static stubLicenseNotSet() {
        cy.intercept('GET', '/rest/graphdb-settings/license', {
            statusCode: 200,
            body:{
                "installationId": null,
                "message": "No license was set",
                "productType": "unknown",
                "licenseCapabilities": [],
                "present": false,
                "valid": false,
                "version": "Invalid",
                "product": "Invalid",
                "licensee": "Invalid",
                "typeOfUse": "Invalid",
                "maxCpuCores": 0,
                "usageRestriction": "Invalid",
                "expiryDate": 0,
                "latestPublicationDate": 0
            }
        }).as('licenseNotSet');
    }

    static stubNoValidLicense() {
        cy.intercept('GET', '/rest/graphdb-settings/license', {
            statusCode: 200,
            body:{
                "installationId": null,
                "message": "The license key expired on 2025-01-31",
                "valid": false,
                "productType": "enterprise",
                "licenseCapabilities": [
                    "Lucene connector",
                    "Solr connector",
                    "Elasticsearch connector",
                    "OpenSearch connector",
                    "Kafka connector",
                    "Cluster"
                ],
                "version": null,
                "product": "GRAPHDB_ENTERPRISE",
                "licensee": "ONTOTEXT_INTERNAL",
                "typeOfUse": "Non-commercial research only",
                "usageRestriction": null,
                "expiryDate": 1738274400000,
                "latestPublicationDate": null,
                "maxCpuCores": null,
                "present": true
            }
        }).as('noValidLicense');
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
            "present": true,
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
            "installationId": "1234-abcd-5678",
            "usageRestriction": null
        };
    }

    static enterpriseLicense() {
        return {
            message: "OK",
            present: true,
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
            installationId: "1234-abcd-5678",
            usageRestriction: null
        };
    }

    static evaluationLicense() {
        return {
            message: "OK",
            present: true,
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
            installationId: "1234-abcd-5678",
            usageRestriction: null
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

    static stubLicenseHardcoded(hardcoded = false) {
        cy.intercept('GET', '/rest/graphdb-settings/license/hardcoded', {
            statusCode: 200,
            body: hardcoded + ''
        }).as('license-hardcoded');
    }
}
