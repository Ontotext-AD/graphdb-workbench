// Helpers for verify-workbench specs. drive.sh copies this file next to the spec,
// so import it as './verify-support'. Steps classes resolve as 'steps/...'.

/** Repository id scoped to this run, so cleanup.sh can find it: verify-<RUN_ID>-<suffix>. */
export function verifyRepoId(suffix) {
    return `verify-${Cypress.env('RUN_ID')}-${suffix}`;
}

/**
 * Screenshot stored in <evidence>/screenshots/<spec>.cy.js/<name>.png. Captures the Cypress runner:
 * command log (the action) + URL bar + app (the resulting state). Do not switch to capture 'viewport':
 * it resizes the app, and the SPARQL result table re-renders into an endless spinner on resize.
 */
export function proof(name) {
    cy.screenshot(name, {capture: 'runner', overwrite: true});
}

/** Writes a JSON side-effect record (e.g. a REST read-back) to <evidence>/side-effects/<name>.json. */
export function recordSideEffect(name, data) {
    cy.writeFile(`${Cypress.env('EVIDENCE_DIR')}/side-effects/${name}.json`, data);
}

/** Read-only SPARQL SELECT against a repository; yields the SPARQL JSON results. */
export function sparqlSelect(repositoryId, query) {
    return cy.request({
        method: 'POST',
        url: `/repositories/${repositoryId}`,
        form: true,
        body: {query},
        headers: {Accept: 'application/sparql-results+json'}
    }).its('body');
}

/**
 * Collects uncaught app exceptions into `errors` instead of failing the test, for a step with a
 * known, already-reported app error. Always assert on `errors` afterwards and record it as evidence;
 * never use this to hide unknown failures.
 */
export function collectAppErrors(errors) {
    cy.on('uncaught:exception', (err) => {
        errors.push(err.message);
        return false;
    });
}
