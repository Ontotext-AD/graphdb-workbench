import {VIEW_SPARQL_EDITOR} from "../../../models/sparql/constants";

// This key is also present in the LSKeys enum in src/js/angular/models/local-storage/local-storage.service.js.
// We don't import it here because this service is not registered in the AngularJS app.
const OLD_YASGUI_PERSISTENCE_KEY = 'ls.tabs-state';
const NEW_YASGUI_PERSISTENCE_KEY = `yagui__${VIEW_SPARQL_EDITOR}`;
const MIGRATION_STATUS = {
    COMPLETED: 'completed',
    FAILED: 'failed',
    REJECTED: 'rejected'
};

/**
 * Service for migrating the old yasgui persistence to the new one.
 */
export const YasguiPersistenceMigrationService = (function () {

    /**
     * Checks if migration is needed by checking if the old yasgui persistence is present in local storage.
     * @return {boolean} true if migration is needed, false otherwise
     */
    const isMigrationNeeded = () => {
        const yasguiData = getPersistedData(NEW_YASGUI_PERSISTENCE_KEY);
        let isMigrated = false;
        if (yasguiData) {
            isMigrated = yasguiData.val.migration &&
                (yasguiData.val.migration.status === MIGRATION_STATUS.COMPLETED || yasguiData.val.migration.status === MIGRATION_STATUS.REJECTED);
        }
        return !!(localStorage.getItem(OLD_YASGUI_PERSISTENCE_KEY) && !isMigrated);
    };

    /**
     * Migrates the old yasgui persistence to the new one.
     * Migration follows the following steps:
     * 1. Get the persisted data for the old yasgui in sparql view from local storage
     * 2. Get the persisted data for the new yasgui in sparql view from local storage
     * 3. Migrate the data for each tab from the old yasgui to the new one by copying the tab name, id, query, sameAs and inference
     * 4. Persist the migrated data for the new yasgui in sparql view to local storage
     * 5. Rename the old yasgui persistence key to prevent further migrations
     *
     * The old yasgui persistence key is changed to prevent further automatic migrations.
     *
     * @param {string} newTabTitle the title of a new tab
     */
    const migrateYasguiPersistence = (newTabTitle) => {
        // make sure the old sparql view data object properties cannot be changed
        let oldSparqlViewData = getPersistedData(OLD_YASGUI_PERSISTENCE_KEY);
        oldSparqlViewData = Object.freeze(oldSparqlViewData);
        // get persisted data for the new yasgui in sparql view from local storage
        let sparqlViewData = getPersistedData(NEW_YASGUI_PERSISTENCE_KEY);
        if (!sparqlViewData) {
           sparqlViewData = buildDefaultSparqlViewData();
        }
        // migrate the data for each tab from the old yasgui to the new one
        oldSparqlViewData.map((oldTab) => {
            return {
                id: oldTab.id,
                name: oldTab.name,
                yasqe: {
                    value: oldTab.query,
                    sameAs: oldTab.sameAs,
                    infer: oldTab.inference,
                    pageSize: 1000,
                    pageNumber: 1
                },
                yasr: {
                    response: null,
                    settings: {
                        selectedPlugin: "extended_table",
                        pluginsConfig: {}
                    }
                },
                requestConfig: {
                    method: "POST"
                }
            };
        }).forEach((newTab, index) => {
            // replace the old tab id with a new one to conform with the new yasgui tab id format
            newTab.id = '_' + generateTabId();
            // process tab name
            newTab.name = newTab.name || generateMigratedTabName(index, newTabTitle);
            addTabId(sparqlViewData, newTab.id);
            addTab(sparqlViewData, newTab);
        });
        // set the active tab id to be the first one
        sparqlViewData.val.active = sparqlViewData.val.tabs[0];
        // set a flag to indicate that the migration has been completed
        setMigrationStatus(sparqlViewData, MIGRATION_STATUS.COMPLETED);
        // persist the migrated data for the new yasgui in sparql view to local storage
        persistJSONValue(NEW_YASGUI_PERSISTENCE_KEY, sparqlViewData);
    };

    const buildDefaultSparqlViewData = () => {
        return {
            val: {
                active: null,
                tabs: [],
                tabConfig: {}
            }
        };
    };

    const setMigrationStatus = (sparqlViewData, migrationStatus, error = null) => {
        sparqlViewData.val.migration = {
            date: new Date().toISOString(),
            status: migrationStatus,
            error: error
        };
    };

    /**
     * Rejects the migration by setting a marker in the new model.
     */
    const rejectMigration = () => {
        const yasguiData = getPersistedData(NEW_YASGUI_PERSISTENCE_KEY);
        setMigrationStatus(yasguiData, MIGRATION_STATUS.REJECTED);
        persistJSONValue(NEW_YASGUI_PERSISTENCE_KEY, yasguiData);
    };

    const addTabId = (sparqlViewData, tabId) => {
        sparqlViewData.val.tabs.push(tabId);
    };

    const addTab = (sparqlViewData, tab) => {
        sparqlViewData.val.tabConfig[tab.id] = tab;
    };

    const getPersistedData = (persistenceKey): any => {
        let persistenceData = localStorage.getItem(persistenceKey);
        if (!persistenceData) {
            return;
        }
        persistenceData = JSON.parse(persistenceData);
        return persistenceData;
    };

    /**
     * Reverts the migration by removing the migrated tabs and tab ids from the new yasgui persistence.
     */
    const revertMigration = () => {
        const sparqlViewData = getPersistedData(NEW_YASGUI_PERSISTENCE_KEY);
        removePersistedTabIds(sparqlViewData);
        removePersistedTabs(sparqlViewData);
        persistJSONValue(NEW_YASGUI_PERSISTENCE_KEY, sparqlViewData);
    };

    const removePersistedTabIds = (sparqlViewData) => {
        sparqlViewData.val.tabs = sparqlViewData.val.tabs.filter((tabId) => !tabId.startsWith('_'));
    };

    const removePersistedTabs = (sparqlViewData) => {
        for (const tabId in sparqlViewData.val.tabConfig) {
            if (tabId.startsWith('_')) {
                delete sparqlViewData.val.tabConfig[tabId];
            }
        }
    };

    const persistJSONValue = (key, JSONvalue) => {
        localStorage.setItem(key, JSON.stringify(JSONvalue));
    };

    const generateMigratedTabName = (index, newTabTitle) => {
        return `${newTabTitle} ${index}`;
    };

    const generateTabId = () => {
        return Math.random().toString(36).substring(7);
    };

    return {
        isMigrationNeeded,
        revertMigration,
        migrateYasguiPersistence,
        rejectMigration
    };
})();
