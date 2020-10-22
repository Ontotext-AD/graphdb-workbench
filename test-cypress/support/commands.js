import './repository-commands';
import './sparql-commands';
import './import-commands';

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
                iframe: $iframe,
            };
        },
    });
    return new Cypress.Promise(resolve => {
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
Cypress.Commands.add('form_request', (method, url, formData, done) => {
    const xhr = new XMLHttpRequest();
    xhr.open(method, url);
    xhr.onload = function () {
        done(xhr);
    };
    xhr.onerror = function () {
        done(xhr);
    };
    xhr.send(formData);
})
