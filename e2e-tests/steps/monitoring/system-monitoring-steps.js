import {BaseSteps} from "../base-steps";

export class SystemMonitoringSteps extends BaseSteps {
    static visit() {
        cy.visit('/monitor/system');
    }

    static getSystemMonitoringPage() {
        return this.getByTestId('system-monitoring-page');
    }

    static getCPUUsageChart() {
        return this.getSystemMonitoringPage().getByTestId('cpu-usage-chart');
    }

    static getFileDescriptorChart() {
        return this.getSystemMonitoringPage().getByTestId('file-descriptor-chart');
    }

    static getHeapMemoryChart() {
        return this.getSystemMonitoringPage().getByTestId('heap-memory-chart');
    }

    static getOffHeapMemoryChart() {
        return this.getSystemMonitoringPage().getByTestId('off-heap-memory-chart');
    }

    static getDiskStorageChart() {
        return this.getSystemMonitoringPage().getByTestId('disk-storage-chart');
    }

    static verifyInitialStateWithSelectedRepository() {
        this.getSystemMonitoringPage().should('be.visible');
        this.getCPUUsageChart().should('be.visible');
        this.getFileDescriptorChart().should('be.visible');
        this.getHeapMemoryChart().should('be.visible');
        this.getOffHeapMemoryChart().should('be.visible');
        this.getDiskStorageChart().should('be.visible');
    }
}
