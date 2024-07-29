import 'cypress-localstorage-commands';
import './repository-commands';
import './sparql-commands';
import './import-commands';
import './settings-commands';
import './visual-graph-commands';
import 'cypress-wait-until';

/**
 * Loads fixtures from the given paths recursively and returns them as an array.
 *
 * Emits an alias in form file-0, file-1, file-2, etc. for each fixture file loaded.
 *
 * @param {[string]} remainingPaths - file paths to load
 * @param {[object]} loadedContents - array of already loaded contents
 * @return {Cypress.Chainable<unknown>}
 */
function loadFixtures(remainingPaths, loadedContents) {
    return cy.fixture(remainingPaths[0]).as(`file-${loadedContents.length}`).then((contents) => {
        loadedContents.push(contents);
        if (remainingPaths.length > 1) {
            return loadFixtures(remainingPaths.slice(1), loadedContents);
        }
        return cy.wrap(loadedContents);
    });
}

// defined as: fixtures<Contents = unknown>(paths: string[]): Chainable<Contents[]>;
Cypress.Commands.add('fixtures', (paths) => {
    return loadFixtures(paths, []);
});

/**
 * Cypress cannot directly work with iframes due to https://github.com/cypress-io/cypress/issues/136
 *
 * This command acts as a workaround that encapsulates the frame's content and makes it queryable and assertable.
 */
Cypress.Commands.add('iframe', {prevSubject: 'element'}, ($iframe) => {
    Cypress.log({
        name: 'iframe',
        consoleProps() {
            return {
                iframe: $iframe
            };
        }
    });
    return new Cypress.Promise((resolve) => {
        // Directly resolve the body if it is loaded, otherwise wait
        if ($iframe.contents().find('body').children().length > 0) {
            resolve($iframe.contents().find('body'));
        } else {
            $iframe.on('load', () => {
                resolve($iframe.contents().find('body'));
            });
        }
    });
});

// Performs an XMLHttpRequest instead of a cy.request (able to send data as
// FormData - multipart/form-data)
Cypress.Commands.add("form_request", (url, formData) => {
    return cy.intercept({
        method: "POST",
        url,
        times: 1
    })
        .as('formRequest')
        .window()
        .then((win) => {
            var xhr = new win.XMLHttpRequest();
            xhr.open("POST", url);
            xhr.send(formData);
        })
        .wait('@formRequest');
});

/**
 *  Toast success container for some reason
 *  is overlapping a needed button
 *  @author Sava Savov sava.savov@ontotext.com
 */

Cypress.Commands.add("hideToastContainer", (url, formData) => {
    cy.get('.toast-success')
        .then((toastContainer) => toastContainer && toastContainer.remove());
});
