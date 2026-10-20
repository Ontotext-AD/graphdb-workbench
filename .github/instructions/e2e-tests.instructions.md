---
applyTo: "e2e-tests/**"
---

# Review rules — Cypress e2e tests

Source of truth: `docs/conventions/e2e-testing.md`. Keep this checklist in sync when it changes. Flag a
violation with the rule and the section.

- Specs hold no selectors: no `cy.get(...)` or `cy.intercept(...)` in a spec. DOM access lives in steps classes,
  network stubs in stubs classes.
- Steps classes own one page or cohesive component, start queries from a page-root getter, assert only in
  `verifyX` methods, and do one thing (no conditional logic).
- Select by `data-test` via `getByTestId`; never by styling class, translated text or DOM position. PrimeNG
  overlays and toasts are queried from `ApplicationSteps`.
- Wait on intercept aliases, never `cy.wait(<ms>)`. No `{ force: true }` clicks. No `.then()` around a command
  whose value isn't used.
- Stubs prefer fixtures over request-handler functions and only stub; assertions go in the spec.
- Each test sets up fresh, uniquely named state (e.g. a repository name per spec); no shared state, no reliance
  on order or on `afterEach`.
- `Given / When / Then` for multi-step tests; one scenario per test; specs split by capability.
- Naming: `e2e-legacy/<feature>/<capability>.spec.js`, `<feature>-<page>-steps.js`, kebab-case `data-test`
  prefixed with the component or page.
- Custom commands return their Cypress chain; no new commands for DOM interaction.
- Guide tests perform the action each step asks for instead of clicking the guide's Next button.
- No `eslint-disable` for Node globals in Cypress config; add them to `languageOptions.globals`.
- No `.only` left in specs.
