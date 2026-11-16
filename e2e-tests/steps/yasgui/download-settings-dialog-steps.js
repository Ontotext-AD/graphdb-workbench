/**
 * Steps for the JSON-LD download settings dialog of the new SPARQL view, opened from "Download as" → JSON-LD.
 * PrimeNG renders the dialog and the options of its mode select at the end of the body, outside the page.
 */
export class DownloadSettingsDialogSteps {
    static getDialog() {
        return cy.getByTestId('download-settings-dialog');
    }

    static getModeSelect() {
        return this.getDialog().getByTestId('download-settings-mode-select');
    }

    static selectMode(index) {
        this.getModeSelect().click();
        cy.getByTestId('download-settings-mode-option').eq(index).click();
        // The list fades out over the fields below it; a click there would hit an option.
        cy.getByTestId('download-settings-mode-options').should('not.exist');
    }

    static getFrameInput() {
        return this.getDialog().getByTestId('download-settings-frame-input');
    }

    static typeFrame(text) {
        this.getFrameInput().type(text);
    }

    static export() {
        cy.getByTestId('download-settings-export-btn').click();
    }
}
