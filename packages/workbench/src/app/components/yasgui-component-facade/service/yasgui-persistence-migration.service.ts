import {Injectable} from '@angular/core';
import {VIEW_SPARQL_EDITOR} from '../models/constants';

const OLD_YASGUI_PERSISTENCE_KEY = 'ls.tabs-state';
const NEW_YASGUI_PERSISTENCE_KEY = `yagui__${VIEW_SPARQL_EDITOR}`;

const enum MigrationStatus {
  COMPLETED = 'completed',
  FAILED = 'failed',
  REJECTED = 'rejected'
}

interface YasqeConfig {
  value: string | undefined;
  sameAs: boolean | undefined;
  infer: boolean | undefined;
  pageSize: number;
  pageNumber: number;
}

interface YasrSettings {
  selectedPlugin: string;
  pluginsConfig: Record<string, unknown>;
}

interface YasrConfig {
  response: null;
  settings: YasrSettings;
}

interface RequestConfig {
  method: string;
}

interface Tab {
  id: string;
  name: string;
  yasqe: YasqeConfig;
  yasr: YasrConfig;
  requestConfig: RequestConfig;
}

interface MigrationInfo {
  date: string;
  status: string;
  error: unknown;
}

interface SparqlViewVal {
  active: string | null;
  tabs: string[];
  tabConfig: Record<string, Tab>;
  migration?: MigrationInfo;
}

interface SparqlViewData {
  val: SparqlViewVal;
}

interface OldTab {
  id: string;
  name: string;
  query: string;
  sameAs: boolean;
  inference: boolean;
}

/**
 * Service for migrating the old yasgui persistence to the new one.
 */
@Injectable({
  providedIn: 'root'
})
export class YasguiPersistenceMigrationService {

  /**
   * Checks if migration is needed by checking if the old yasgui persistence is present in local storage.
   * @returns true if migration is needed, false otherwise
   */
  isMigrationNeeded(): boolean {
    const yasguiData = this.getPersistedData<SparqlViewData>(NEW_YASGUI_PERSISTENCE_KEY);
    let isMigrated = false;
    if (yasguiData) {
      isMigrated = !!(yasguiData.val.migration &&
        (yasguiData.val.migration.status === MigrationStatus.COMPLETED ||
          yasguiData.val.migration.status === MigrationStatus.REJECTED));
    }
    return !!(localStorage.getItem(OLD_YASGUI_PERSISTENCE_KEY) && !isMigrated);
  }

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
   * @param newTabTitle the title of a new tab
   */
  migrateYasguiPersistence(newTabTitle: string): void {
    // make sure the old sparql view data object properties cannot be changed
    const oldSparqlViewData: readonly OldTab[] = Object.freeze(
      this.getPersistedData<OldTab[]>(OLD_YASGUI_PERSISTENCE_KEY) ?? []
    );
    // get persisted data for the new yasgui in sparql view from local storage
    let sparqlViewData = this.getPersistedData<SparqlViewData>(NEW_YASGUI_PERSISTENCE_KEY);
    sparqlViewData ??= this.buildDefaultSparqlViewData();

    // migrate the data for each tab from the old yasgui to the new one
    oldSparqlViewData.map((oldTab): Tab => ({
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
          selectedPlugin: 'extended_table',
          pluginsConfig: {}
        }
      },
      requestConfig: {
        method: 'POST'
      }
    })).forEach((newTab, index) => {
      // replace the old tab id with a new one to conform with the new yasgui tab id format
      newTab.id = '_' + this.generateTabId();
      // process tab name
      newTab.name = newTab.name || this.generateMigratedTabName(index, newTabTitle);
      this.addTabId(sparqlViewData, newTab.id);
      this.addTab(sparqlViewData, newTab);
    });
    // set the active tab id to be the first one
    sparqlViewData.val.active = sparqlViewData.val.tabs[0];
    // set a flag to indicate that the migration has been completed
    this.setMigrationStatus(sparqlViewData, MigrationStatus.COMPLETED);
    // persist the migrated data for the new yasgui in sparql view to local storage
    this.persistJSONValue(NEW_YASGUI_PERSISTENCE_KEY, sparqlViewData);
  }

  /**
   * Rejects the migration by setting a marker in the new model.
   */
  rejectMigration(): void {
    const yasguiData = this.getPersistedData<SparqlViewData>(NEW_YASGUI_PERSISTENCE_KEY);
    if (yasguiData) {
      this.setMigrationStatus(yasguiData, MigrationStatus.REJECTED);
      this.persistJSONValue(NEW_YASGUI_PERSISTENCE_KEY, yasguiData);
    }
  }

  /**
   * Reverts the migration by removing the migrated tabs and tab ids from the new yasgui persistence.
   */
  revertMigration(): void {
    const sparqlViewData = this.getPersistedData<SparqlViewData>(NEW_YASGUI_PERSISTENCE_KEY);
    if (sparqlViewData) {
      this.removePersistedTabIds(sparqlViewData);
      this.removePersistedTabs(sparqlViewData);
      this.persistJSONValue(NEW_YASGUI_PERSISTENCE_KEY, sparqlViewData);
    }
  }

  private buildDefaultSparqlViewData(): SparqlViewData {
    return {
      val: {
        active: null,
        tabs: [],
        tabConfig: {}
      }
    };
  }

  private setMigrationStatus(sparqlViewData: SparqlViewData, migrationStatus: MigrationStatus, error: unknown = null): void {
    sparqlViewData.val.migration = {
      date: new Date().toISOString(),
      status: migrationStatus,
      error
    };
  }

  private addTabId(sparqlViewData: SparqlViewData, tabId: string): void {
    sparqlViewData.val.tabs.push(tabId);
  }

  private addTab(sparqlViewData: SparqlViewData, tab: Tab): void {
    sparqlViewData.val.tabConfig[tab.id] = tab;
  }

  private getPersistedData<T>(persistenceKey: string): T | undefined {
    const persistenceData = localStorage.getItem(persistenceKey);
    if (!persistenceData) {
      return undefined;
    }
    return JSON.parse(persistenceData) as T;
  }

  private removePersistedTabIds(sparqlViewData: SparqlViewData): void {
    sparqlViewData.val.tabs = sparqlViewData.val.tabs.filter((tabId) => !tabId.startsWith('_'));
  }

  private removePersistedTabs(sparqlViewData: SparqlViewData): void {
    for (const tabId in sparqlViewData.val.tabConfig) {
      if (tabId.startsWith('_')) {
        delete sparqlViewData.val.tabConfig[tabId];
      }
    }
  }

  private persistJSONValue(key: string, value: unknown): void {
    localStorage.setItem(key, JSON.stringify(value));
  }

  private generateMigratedTabName(index: number, newTabTitle: string): string {
    return `${newTabTitle} ${index}`;
  }

  private generateTabId(): string {
    return Math.random().toString(36).substring(7);
  }
}

