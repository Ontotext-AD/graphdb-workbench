export class YasguiLoader {

    static getLoader() {
        return cy.get('loader-component');
    }

    static verifyMessage(message) {
        YasguiLoader.getLoader().contains(message);
    }
}
