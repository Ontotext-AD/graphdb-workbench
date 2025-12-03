import {QueryStubs} from '../../stubs/yasgui/query-stubs.js';
import SparqlSteps from '../../steps/sparql-steps.js';
import {YasqeSteps} from '../../steps/yasgui/yasqe-steps.js';

describe('YASQE Themes', () => {

  let repositoryId;
  const THEME_PERSISTENCE_KEY = 'ls.workbench-settings';
  beforeEach(() => {
    cy.removeLocalStorage(THEME_PERSISTENCE_KEY);
    repositoryId = 'yasqe-theme-' + Date.now();
    QueryStubs.stubQueryCountResponse();
    cy.createRepository({id: repositoryId});
    cy.presetRepository(repositoryId);
    cy.enableAutocomplete(repositoryId);
  });

  afterEach(() => {
    cy.deleteRepository(repositoryId);
    cy.removeLocalStorage(THEME_PERSISTENCE_KEY);
  });
  
  it('should apply the default theme if theme is not persisted in local store', () => {
    // GIVEN: No theme is persisted.
    cy.removeLocalStorage(THEME_PERSISTENCE_KEY);
    // WHEN: A page is visited with ontotext-yasgui-web-component rendered in it.
    SparqlSteps.visit();
    YasqeSteps.getYasqe().should('be.visible');
    // THEN the default theme should be applied.
    YasqeSteps.getCodeMirrorEl().should('have.class', 'cm-s-default');
  });

  it('should apply the default theme if the light theme is persisted in local store', () => {
    // GIVEN: light theme is persisted to local store
    cy.setLocalStorage(THEME_PERSISTENCE_KEY, JSON.stringify({"theme":"default-theme","mode":"light"}));

    // WHEN: A page is visited with ontotext-yasgui-web-component rendered in it.
    SparqlSteps.visit();
    YasqeSteps.getYasqe().should('be.visible');
    // THEN the default theme should be applied.
    YasqeSteps.getCodeMirrorEl().should('have.class', 'cm-s-default');
  });

  it('should apply the moxer theme if the dark theme is persisted in local store', () => {
    // GIVEN: dark theme is persisted to local store
    cy.setLocalStorage(THEME_PERSISTENCE_KEY, JSON.stringify({"theme":"default-theme","mode":"dark"}));

    // WHEN: A page is visited with ontotext-yasgui-web-component rendered in it.
    SparqlSteps.visit();
    YasqeSteps.getYasqe().should('be.visible');
    // THEN the moxer theme should be applied.
    YasqeSteps.getCodeMirrorEl().should('have.class', 'cm-s-moxer');
  });
});
