# Theme (light, dark, follow the OS)

The Workbench renders in a light or a dark theme. The user picks `Light`, `Dark` or `System (Currently <Light|Dark>)`
on My Settings; the choice is stored in the browser, not with the user account, and applies from the first render
of every later page load. In `System` mode the theme follows the OS color scheme live, without a reload; an
explicit `Light` or `Dark` ignores the OS. Changes to colors, CSS variables, theme stylesheets or code-editor themes
break this most often.

## Sub-features

- `theme-light` explicit Light: `:root` has no `dark` class, body background `rgb(255, 255, 255)`.
- `theme-dark` explicit Dark: `:root.dark`, body background `rgb(6, 7, 9)`; the SPARQL editor uses the `moxer`
  CodeMirror theme.
- `theme-os` System mode: the applied theme equals the OS `prefers-color-scheme` and switches live when the OS
  scheme changes; with nothing stored the app behaves the same.
- `theme-settings` the My Settings select (`#themeSelect`) shows the stored mode, warns `Save changes to apply the
  new theme.` on change, and applies it on Save (`#wb-user-submit`).

## How to get to it (user POV)

- Setup → My Settings (`/settings`) → card "Workbench settings" → "Choose theme" → Save.
- OS mode: the OS/browser dark-mode switch while `System` is selected.

## Driving it with verify-workbench

Preconditions: a container stack (`container.sh up --run-id $RID`), `PW="$V/scripts/pw.sh $RID"`,
`$PW open @/repository`. Proven on 4.0.0-TR19 (GraphDB 12.0.0-TR23).

- **Light / dark.** `$PW theme dark` → `{"stored":"dark","osPrefersDark":false,"applied":"dark","bodyBackground":"rgb(6, 7, 9)"}`;
  `$PW screenshot --filename=theme-dark.png`. `$PW theme light` → `"applied":"light"`, `rgb(255, 255, 255)`.
  `theme` writes the setting and reloads, so the screenshot shows the first render in that theme.
- **Follow the OS.** `$PW theme os dark` → `"stored":"system","osPrefersDark":true,"applied":"dark"`;
  `$PW theme os light` → `"applied":"light"`. Live switch, no reload:
  `$PW js "window.__noReload = 1"`, `$PW set-color-scheme dark`,
  `$PW js "[window.__noReload, document.documentElement.classList.contains('dark')]"` → `[1, true]`.
- **Explicit mode ignores the OS.** `$PW theme dark`, `$PW set-color-scheme light`,
  `$PW js "document.documentElement.classList.contains('dark')"` → `true`.
- **Settings page (user path).** `$PW goto @/settings`, `$PW wait '#themeSelect'`,
  `$PW js "[...document.querySelectorAll('#themeSelect option')].map(o => (o.selected ? '* ' : '  ') + o.textContent.trim())"`
  → `* System (Currently Dark)` after `theme os dark`; `$PW select '#themeSelect' 'Light'`, `$PW click '#wb-user-submit'`
  → `localStorage['ontotext.gdb.application.settings']` is `{"theme":"default","themeMode":"light"}`, `:root` not dark.
  Proof: `$PW screenshot '#workbench-settings' --filename=theme-settings.png`.
- **A style change.** Read the value back in both themes: `$PW theme dark`, `$PW css '<selector>' color`, then
  `$PW theme light` and again; `css` lists the rule and the resolved `--gw-*` variables.

## Gotchas

- Storage: `localStorage['ontotext.gdb.application.settings']` JSON, `themeMode` = `light` | `dark` | `system`
  (`ApplicationSettingsStorageService`). Absent `themeMode` behaves like `system`. The legacy
  `ls.workbench-settings` key is migrated once on load.
- Headless Chrome reports `prefers-color-scheme: light`; `set-color-scheme` / `theme os dark` stays in effect for
  the session, also across reloads. `clear-color-scheme` removes it.
- `set-color-scheme` alone does not change an explicit Light/Dark choice: run `theme os` first.
- The playwright-cli browser profile is in memory: a re-opened session (pw.sh exit 75) starts with the default
  (`system`, OS light) theme again.
