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
