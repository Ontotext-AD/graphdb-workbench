export class EnvironmentStubs {
    static PRODUCT_INFO_ALIAS = (isDefinition) => {
        return isDefinition ? 'productInfo' : '@productInfo';
    }

    static stubWbProdMode() {
        cy.window().then((win) => {
            win.wbDevMode = false;
        });
    }

    static stubWbDevMode() {
        cy.window().then((win) => {
            win.wbDevMode = true;
        });
    }

    static spyProductInfo() {
        cy.intercept('/rest/info/version?local=1').as('productInfo')
    }

    static stubProductInfo(productVersion) {
        cy.intercept('GET', '/rest/info/version?local=1', {
            statusCode: 200,
            body: {
                "productType": "free",
                productVersion,
                "connectors": "16.2.11-RC1",
                "sesame": "4.3.13",
                "Workbench": "2.8.0-TR5"
            }
        }).as(EnvironmentStubs.PRODUCT_INFO_ALIAS(true));

    }
}
