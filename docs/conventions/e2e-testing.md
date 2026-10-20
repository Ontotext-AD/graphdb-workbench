# E2E testing conventions (Cypress)

> Specs describe **what the user does and sees**. Every selector lives in a
> **steps class**, every `cy.intercept` in a **stubs class**. A spec contains only
> step calls, assertions, and the `Given / When / Then` narrative.

This is the guide for the Cypress suites in `e2e-tests/`. Treat the rules as
rules: where one genuinely doesn't fit, deviate on purpose and leave a comment
saying why. Much of the existing suite predates these rules (class selectors,
`cy.get` in specs); write new and touched specs to them.

Unit tests (Jest) follow [testing.md](testing.md) instead.

## Contents

1. [Principles](#1-principles): the six rules everything else follows; no selectors in specs is the most important.
2. [Running the tests](#2-running-the-tests): the backend, the dev server, and running one spec.
3. [Directory structure](#3-directory-structure): the suites and the shared `steps`, `stubs`, `fixtures`, `support` folders.
4. [Naming](#4-naming): file, class, fixture, alias, `data-test`, and `describe`/`it` title patterns.
5. [Steps classes](#5-steps-classes-page-objects): page objects with static getters, actions, and `verifyX`; `BaseSteps`, composite steps.
6. [Selectors](#6-selectors): `data-test` first, then ARIA; PrimeNG overlays outside the page root; translated text.
7. [Stubbing & network control](#7-stubbing--network-control-cyintercept): stubs classes (`stubX`/`spyX`), waiting on aliases, fixtures.
8. [Custom commands](#8-custom-commands): for REST seeding, imports, and auth.
9. [Writing a spec](#9-writing-a-spec): structure, state, `Given / When / Then`, assertions, an example.
10. [Do / Don't](#10-do--dont) and [Checklist](#11-checklist).

---

## 1. Principles

1. **Behaviour, not implementation.** A spec reads as user intentions and expected
   outcomes. How the DOM is queried is hidden behind steps.
2. **No selectors in specs.** All DOM access lives in steps classes. This is the
   most important rule.
3. **Structure mirrors features.** Specs, steps, stubs, and fixtures are grouped by
   feature, so related files sit together.
4. **Small, targeted tests.** One scenario per test. Long scenarios only when the
   feature genuinely requires an ordered sequence.
5. **Readable narrative.** Multi-step tests spell out `Given / When / Then` as
   comments (see §9.2).
6. **Deterministic and isolated.** A test passes on its own and in any order. It
   creates the state it needs.

---

## 2. Running the tests

The specs run against the **real backend**: a GraphDB at `http://localhost:7200`,
with the workbench dev server (`npm run start` from the repo root) on
`http://localhost:9000` proxying to it. Every config sets `baseUrl` to
`http://localhost:9000`.

Run **one spec, or a part of one** — never the whole suite locally. From
`e2e-tests/`:

```bash
npx cypress run --config-file cypress-legacy.config.js --spec e2e-legacy/repository/repositories.spec.js --browser chrome
npx cypress open --config-file cypress-legacy.config.js   # interactive
```

The `cy:*` scripts in `e2e-tests/package.json` run whole suites and are for CI.

---

## 3. Directory structure

```
e2e-tests/
├── e2e-legacy/          # Main suite (cypress-legacy.config.js) — one folder per feature
│   └── repository/
│       ├── repositories.spec.js
│       └── repository-picker-tooltip.spec.js
├── e2e-security/        # Security suite (cypress-security.config.js)
├── e2e-flaky/           # Quarantined flaky specs (cypress-flaky.config.js)
├── steps/               # Steps classes — all DOM access lives here
│   ├── base-steps.js    # BaseSteps — generic helpers
│   ├── application-steps.js
│   ├── header-steps.js  # One cohesive shared component per file
│   └── repositories/    # Feature folders for multi-file features
├── stubs/               # cy.intercept stub/spy classes
│   └── repositories/
│       └── repositories-stubs.js
├── fixtures/            # JSON response payloads, per feature
│   └── repositories/
│       └── get-repositories.json
└── support/             # Custom commands (*-commands.js) and the support file
```

The security suite has its own guide: [security testing](../reference/security-testing.md).
Don't run or fix `e2e-flaky/` specs as part of verifying a change.

**Split specs by capability.** Don't put every test for a feature in one file:
`repositories.spec.js`, `rename-repository-restrictions.spec.js`,
`repository-picker-tooltip.spec.js`, and so on.

---

## 4. Naming

| Asset | Convention | Example |
| --- | --- | --- |
| Spec file | `e2e-legacy/<feature>/<capability>.spec.js` | `repository/repository-picker-tooltip.spec.js` |
| Steps class | `<Feature><Page>Steps` | `RepositoryPickerListSteps` |
| Steps file | `<feature>-<page>-steps.js` | `repository-picker-list-steps.js` |
| Stubs class | `<Feature>Stubs` | `RepositoriesStubs` |
| Stubs file | `<feature>-stubs.js` | `repositories-stubs.js` |
| Fixture file | `fixtures/<feature>/<verb>-<noun>[-<variant>].json` | `fixtures/repositories/get-repositories.json` |
| Intercept alias | camelCase verb + noun | `getRepositories`, `runningRepositorySize` |
| `data-test` | kebab-case, prefixed with the component/page | `graph-navigator-settings-btn` |

- `describe` title: the human-readable feature/page name — `'Repository picker repository information'`.
- `it` title: lowercase `'should <expected outcome>'` —
  `'should show the repository id and the statement counts of a running repository'`.

---

## 5. Steps classes (page objects)

We use the page-object pattern through `Steps` classes, so selectors live in one
place and a DOM change never touches a spec.

### 5.1 Rules

- **All selectors live in steps classes. Never in specs.**
- Methods are `static`. Steps are stateless namespaces, not instances.
- A steps class owns **one page or one cohesive component** (header, a dialog,
  the repository picker).
- Start every page's queries from a **page-root getter** (`getView()` /
  `getPage()`), and scope children from it. Exception: overlays rendered outside
  the page (see §6.2).
- **Getters** (`getX`) locate and return a chainable. They don't assert. The spec
  decides what to check.
- **Actions** (`openX`, `focusRepository`, `submitForm`) perform a user
  interaction, named after the user's intent.
- **Verifiers** (`verifyX`) are the one place where steps assert. Use them for
  rich, repeated structures (see §5.3).
- When a getter or action you need is missing, add it to the steps class — don't
  reach for `cy.get` in the spec.

### 5.2 `BaseSteps`

Generic helpers shared by several steps classes live in `steps/base-steps.js`;
extend `BaseSteps`. Keep it small and truly generic. Feature logic belongs in the
feature's steps.

### 5.3 Composite steps

A composite step does a bigger job, like checking every row of a table against
expected data.

- Used in **one spec only**: write it as a plain function in that spec file,
  outside the `describe`.
- **Reused**: move it into the steps class as a static `verifyX` method.

---

## 6. Selectors

### 6.1 Use `data-test`

Select by the **`data-test`** attribute, through the `getByTestId` command
(`support/commands.js`), which builds `[data-test="..."]`:

```html
<button data-test="graph-navigator-settings-btn">
```

```js
static getSettingsButton() {
    return this.getView().getByTestId('graph-navigator-settings-btn');
}
```

- If the element you need has no `data-test`, **add one to the template** in the
  same change. Don't fall back to a fragile selector.
- Second choice: ARIA roles and labels (`[role="dialog"]`, `[aria-label="…"]`),
  when the element is inherently identified by its accessibility role.
- **Avoid** in new selectors: styling classes (`.p-button`), deep descendant
  chains, and position-based CSS (`:nth-child`). They change for visual reasons.
- Use `.eq(i)` on a list of `data-test` matches rather than position selectors.

### 6.2 PrimeNG overlays render outside the page

Several PrimeNG pieces are **not inside the page component's DOM**:

- Any overlay with `appendTo="body"` (selects, menus, popovers) is moved to the
  end of `<body>`.
- Toasts and the confirm dialog are declared once, outside the page.

So a page-root query will **never** find them. Query these from
`ApplicationSteps` (or a dedicated overlay steps class) starting at `cy.get('body')`
or at the overlay's own `data-test`/role.

### 6.3 Text and translations

Tests run in English.

- Checking visible text is fine when the text **is** the outcome (an error message,
  a repository id from test data). Assert against the English string.
- Don't use translated text to **locate** elements. Use `data-test`.
- A test that switches language must say so in its `Given`, and must not leave
  anything behind for the next test.

---

## 7. Stubbing & network control (`cy.intercept`)

The specs run against the **real backend** for true end-to-end coverage. Stub only
when you must force a state the real backend can't easily produce: errors, empty
states, edge-case data, enterprise-only responses, slow responses.

### 7.1 Stubs classes

All `cy.intercept` calls go in a **stubs class**. Two kinds:

- **Stubs** (`stubX`) return a canned response to control what the app sees.
- **Spies** (`spyX`) let a real request through and give it an alias, so a test can
  `cy.wait('@alias')`.

```js
export class EnvironmentStubs {
    static spyProductInfo() {
        cy.intercept('/rest/info/version?local=1').as('productInfo');
    }

    static stubProductInfo(productVersion) {
        cy.intercept('GET', '/rest/info/version?local=1', {
            statusCode: 200,
            body: {productType: 'free', productVersion}
        }).as('productInfo');
    }
}
```

### 7.2 Rules

- **Wait on aliases** (`cy.wait('@productInfo')`), never on fixed times
  (`cy.wait(500)`).
- Register the intercept **before** the navigation or action that triggers it.
- A stub and its matching spy may share an alias, so the spec's `cy.wait` doesn't
  care which one is active.
- Put non-trivial payloads in **fixtures**. A one-field object (`{statusCode: 500}`)
  can stay inline in the stubs class.
- Model error and empty states as named stub methods (`stubXError`, `stubXEmpty`),
  never as inline objects in a spec.

---

## 8. Custom commands

Custom commands live in `support/*-commands.js`. Add them **only** for setup that
isn't DOM interaction:

- creating or deleting data through the REST API (`cy.createRepository(...)`,
  `cy.deleteRepository(...)`);
- importing files or datasets (`cy.importServerFile(...)`);
- security and user setup (`cy.switchOnSecurity()`, `cy.loginAs(...)`).

Never add a custom command for clicking, typing, or finding elements. That is
what steps are for. `getByTestId` is the one generic DOM helper, and it is used
inside steps, not in specs. Some existing commands (`cy.pasteQuery`,
`cy.verifyResultsMessage`, …) predate this rule; don't add more like them.

A command returns its Cypress chain so callers can chain on it.

---

## 9. Writing a spec

### 9.1 Structure

- One `describe` per feature/page. Use nested `context` blocks for tests that share
  a precondition.
- Set up state in `beforeEach`. Give created resources unique names
  (`'picker-tooltip-running-' + Date.now()`) so runs never collide.
- Cleaning up in `afterEach` (e.g. `cy.deleteRepository`) is fine, but **no test
  may depend on it**: `afterEach` doesn't run if the run is interrupted. Each test
  creates the state it needs instead of assuming a clean server.

### 9.2 Given / When / Then

Document the scenario with comments. `Given` is setup (stubs, seeded data), `When`
is the user's action, `Then` is the observable outcome. Use `And` / `But` for
continuations.

- **Required** for any test with more than one step or assertion.
- **Optional** for a one-liner whose step names already say it all.
- Keep each comment next to the line that does it. If an expectation is known but
  can't be implemented yet, keep the comment with a `// TODO:`.

### 9.3 Assertions

- Assert in the spec, on chainables returned by getters. The exception is
  `verifyX` steps (§5.3).
- Assert **what the user can observe**: visibility, text, count, URL,
  enabled/disabled. Not component internals.
- Prefer specific checks (`should('have.text', repositoryId)`) over bare
  existence checks when the value matters.
- Only test functionality the change could break; accessibility (keyboard, ARIA,
  screen-reader) checks are out of scope.

### 9.4 Example

From `e2e-legacy/repository/repository-picker-tooltip.spec.js`:

```js
describe('Repository picker repository information', () => {
    let runningRepositoryId;

    beforeEach(() => {
        runningRepositoryId = 'picker-tooltip-running-' + Date.now();
        cy.createRepository({id: runningRepositoryId});
        // A new repository is not running. Requesting its size starts it.
        cy.initializeRepository(runningRepositoryId);
        RepositoriesStubs.spyGetRepositorySize(runningRepositoryId, 'runningRepositorySize');
        GraphNavigatorSteps.visit();
    });

    afterEach(() => {
        cy.deleteRepository(runningRepositoryId);
    });

    it('should show the repository id and the statement counts of a running repository', () => {
        // When I move the keyboard focus to a running repository in the picker
        RepositoryPickerListSteps.focusRepository(runningRepositoryId);

        // Then I expect the repository information to show the repository id
        RepositoryPickerListSteps.getRepositoryInfoPart('title').should('have.text', runningRepositoryId);
        // And the statement counts, loaded from the server
        cy.wait('@runningRepositorySize');
        RepositoryPickerListSteps.getRepositoryInfoPart('total').should('contain.text', 'Total statements');
    });
});
```

---

## 10. Do / Don't

**Do**
- Keep specs free of selectors: steps + assertions only.
- Select by `data-test`. Add one to the template when it's missing.
- Query body-level PrimeNG overlays and toasts from `ApplicationSteps`, not the page root.
- Write `Given / When / Then` for multi-step tests.
- Split specs by capability, one scenario per test.
- Wait on intercept aliases.
- Set up fresh, uniquely named state before each test.
- In guide tests, perform the action the step asks for; don't advance with the guide's Next button.

**Don't**
- Put `cy.get(...)` or `cy.intercept(...)` in a spec.
- Select by styling class, translated text, or DOM position in new code.
- Add custom commands for DOM interaction.
- Share state between tests or depend on their order.
- Use `cy.wait(<ms>)`.
- Depend on `afterEach` for a clean starting state.
- Silence ESLint for Node globals (`process`) in Cypress config; add them to `languageOptions.globals`.
- Wrap a Cypress command in `.then()` when you don't use what it yields — it opts out of the retry mechanism.
- Put conditional logic in steps or specs. A steps method does one thing.
- Stub with a request-handler function when a fixture would do. Stubs only stub; assertions go in the spec.
- Click with `{ force: true }` — it clicks through overlays and hides real bugs. Close or wait out what covers the element.

---

## 11. Checklist

Before calling a test done:

- [ ] The spec has **no selectors or intercepts**. All DOM access is in steps, all
      `cy.intercept` in stubs.
- [ ] New selectors use `data-test` (added to the template if missing).
- [ ] Body-level overlays and toasts are queried from outside the page root.
- [ ] Multi-step tests have `Given / When / Then` comments that match the code.
- [ ] File, class, alias, and `describe`/`it` names follow §4.
- [ ] Non-trivial payloads are feature-scoped fixtures.
- [ ] The test sets up its own uniquely named state and doesn't depend on `afterEach`.
- [ ] No `cy.wait(ms)`. Sync on aliases or UI state.
- [ ] The spec passes when run on its own.
