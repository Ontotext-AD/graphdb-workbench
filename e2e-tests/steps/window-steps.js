export class WindowSteps {
    static getClipboardTextContent() {
        return cy.window().its('navigator.clipboard').invoke('readText').then((text) => text);
    }
}
