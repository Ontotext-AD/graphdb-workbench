import {BaseSteps} from "./base-steps";

export class SystemInformationSteps extends BaseSteps {

    static visit() {
        cy.visit('sysinfo');
    }

    static getSystemInformationView() {
        return this.getByTestId('system-info-page');
    }

    static getSystemInformationContent() {
        return this.getSystemInformationView().getByTestId('system-info-content');
    }

    /////////////////////////////
    // Application Info Tab
    /////////////////////////////
    static getApplicationInfoTab() {
        return this.getSystemInformationContent().getByTestId('application-info-tab');
    }

    static getGraphDBInfo() {
        return this.getApplicationInfoTab().getByTestId('graphdb-info');
    }

    static getOperatingSystemInfo() {
        return this.getApplicationInfoTab().getByTestId('operation-system-info');
    }

    static getServerReport() {
        return this.getApplicationInfoTab().getByTestId('server-report');
    }

    static getNewReportButton() {
        return this.getServerReport().getByTestId('new-report-btn');
    }

    static getServerReportDownloadButton() {
        return this.getServerReport().getByTestId('download-report-btn');
    }

    /////////////////////////////
    // JVM Arguments Tab
    /////////////////////////////
    static getJVMArgumentsTab() {
        return this.getSystemInformationContent().getByTestId('jvm-arguments-tab');
    }

    ////////////////////////////////
    // Configuration Parameters Tab
    ////////////////////////////////
    static getConfigurationParametersTab() {
        return this.getSystemInformationContent().getByTestId('configuration-parameters-tab');
    }

    static verifyInitialState() {
        this.getSystemInformationView().should('exist');
        this.getSystemInformationContent().should('be.visible');
        this.getApplicationInfoTab().should('exist');
        this.getGraphDBInfo().should('exist');
        this.getJVMArgumentsTab().should('exist');
        this.getConfigurationParametersTab().should('exist');
        this.getOperatingSystemInfo().should('exist');
        this.getServerReport().should('exist');
        this.getServerReportDownloadButton().should('exist');
        this.getNewReportButton().should('exist');
    }
}
