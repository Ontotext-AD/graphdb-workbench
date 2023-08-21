export class YasguiLoader {

    static getLoader(index = 0) {
        return cy.get('loader-component');
    }

    static verifyMessage(message, index = 0) {
        YasguiLoader.getLoader(index).shadow().contains(message);
    }
}
