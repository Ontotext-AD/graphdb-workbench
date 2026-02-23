import {PlaygroundEditorSteps} from "../../steps/graphql/playground-editor-steps.js";
import {GraphqlPlaygroundSteps} from "../../steps/graphql/graphql-playground-steps.js";

describe('Graphiql Editor Themes', () => {
    let repositoryId;
    const THEME_PERSISTENCE_KEY = 'ls.workbench-settings';

    beforeEach(() => {
        repositoryId = 'graphiql-editor-themes-' + Date.now();
        cy.createRepository({id: repositoryId});
        cy.presetRepository(repositoryId);
        cy.importServerFile(repositoryId, 'swapi-dataset.ttl');
        cy.uploadGraphqlSchema(repositoryId, 'graphql/soml/swapi-schema.yaml', 'swapi');
        cy.uploadGraphqlSchema(repositoryId, 'graphql/soml/swapi-schema-planets.yaml', 'swapi-planets');
    });

    afterEach(() => {
        cy.deleteRepository(repositoryId);
    });

    it('should apply the default theme if theme is not persisted in local store', () => {
        // GIVEN: I have opened the workbench and no theme is persisted in local storage.

        // WHEN: I visit the GraphQL Playground page
        GraphqlPlaygroundSteps.visit();
        // THEN: the default "graphiql" theme class should be applied to the CodeMirror instances.
        verifyTheme('graphiql');
    });

    it('should apply the light theme if the light theme is persisted in local store', () => {
        // GIVEN: I have opened the workbench and the light theme is persisted in local storage.
        cy.setLocalStorage(THEME_PERSISTENCE_KEY, JSON.stringify({"theme":"default-theme","mode":"light"}));

        // WHEN: I visit the GraphQL Playground page
        GraphqlPlaygroundSteps.visit();
        // THEN: the default "graphiql" theme class should be applied to the CodeMirror instances.
        verifyTheme('graphiql');
    });

    it('should apply the moxer theme if the dark theme is persisted in local store', () => {
        // GIVEN: I have opened the workbench and the dark theme is persisted in local storage.
        cy.setLocalStorage(THEME_PERSISTENCE_KEY, JSON.stringify({"theme":"default-theme","mode":"dark"}));

        /// WHEN: I visit the GraphQL Playground page
        GraphqlPlaygroundSteps.visit();
        // THEN: the "moxer" theme class should be applied to the CodeMirror instances.
        verifyTheme('moxer');
    });

    it('should not change the theme if the active endpoint is changed', () => {
        // GIVEN: I have opened the workbench and the dark theme is persisted in local storage.
        cy.setLocalStorage(THEME_PERSISTENCE_KEY, JSON.stringify({"theme":"default-theme","mode":"dark"}));
        /// AND: I visit the GraphQL Playground page
        GraphqlPlaygroundSteps.visit();
        //the "moxer" theme class should be applied to the CodeMirror instances.
        verifyTheme('moxer');

        // WHEN: I change the active endpoint
        GraphqlPlaygroundSteps.selectEndpoint('swapi-planets');

        // THEN: the theme should not change, and the "moxer" theme class should still be applied to the CodeMirror instances.
        verifyTheme('moxer');
    });

    const verifyTheme = (theme) => {
        PlaygroundEditorSteps.getResponseCodeMirror().should('have.class', `cm-s-${theme}`);
        PlaygroundEditorSteps.getGraphiqlEditorsCodeMirror().should('have.class', `cm-s-${theme}`);
        PlaygroundEditorSteps.openVariables();
        PlaygroundEditorSteps.getActiveGraphiqlEditorToolCodeMirror().should('have.class', `cm-s-${theme}`);
        PlaygroundEditorSteps.openHeaders();
        PlaygroundEditorSteps.getActiveGraphiqlEditorToolCodeMirror().should('have.class', `cm-s-${theme}`);
    }
});
