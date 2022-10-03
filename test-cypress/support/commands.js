import 'cypress-localstorage-commands';
import './repository-commands';
import './sparql-commands';
import './import-commands';
import './settings-commands';
import './visual-graph-commands';
import 'cypress-wait-until';
import 'cypress-file-upload';


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
Cypress.Commands.add("form_request", (url, formData) => {
    return cy
        .server()
        .route("POST", url)
        .as("formRequest")
        .window()
        .then(win => {
            var xhr = new win.XMLHttpRequest();
            xhr.open("POST", url);
            xhr.send(formData);
        })
        .wait("@formRequest");
});
