# Stacks

Which stack a run drives, and how each one behaves. Flags and exit codes: `<script> --help`.

## Container stack (`container.sh`) — the default

A throwaway GraphDB container of its own serving the production build of **one checkout**
(`graphdb.workbench.home`), on the first free port from 7210. One per run, any number in parallel.

- `up --run-id $RID [--tree PATH]` (tree defaults to the git toplevel of `$PWD`): `npm run install:local` when
  the tree has no `node_modules` (never plain `npm install`), `npm run build` (~1 min warm; a build that cannot
  resolve a module reinstalls and retries once; a failure of only the SBOM step is a WARN), stages `dist/` and
  the import fixtures into `~/.cache/verify-workbench/state/stacks/$RID/`, starts compose project
  `verify-wb-<rid>`, prints `evidence: <dir>` and `READY: <url>`. Every other helper reads the run record.
- **Verify a worktree.** `up` WARNs on the main checkout (the build rewrites the `dist/` the user's own stacks
  may serve) and FAILs (exit 5) before building when `dist/` is not writable. A baseline gets its own worktree
  of `master` (or `compare.sh` builds it).
- **Image, license, heap:** defaults and overrides in `container.sh --help`. The image follows the **tree's**
  `.env`, so two worktrees on different branches may run different GraphDB versions. Handle the license file
  by path only.
- **Data** lives in the container: an empty GraphDB, security off. `restart` keeps it, `cleanup.sh` removes it.
- **Source change:** `container.sh rebuild --run-id $RID`, then `pw.sh $RID reload`. `--no-build` on `up` or
  `rebuild` reuses the tree's current `dist/`.
- **Heap.** Every repository costs heap (the template has FTS on and a 10M entity index), so many
  repositories, a heavy query or parallel drives still exhaust it: `400 Java heap space` on create, repositories
  INACTIVE, specs hang (exit 125), `doctor.sh --run-id` FAILs. Delete each feature's repositories once driven;
  recover with `container.sh restart --run-id $RID --heap 6g`.
- **JVM options:** `--java-opts '-Dk=v ...'` (they win over the stack's own); `rebuild`/`restart` keep them,
  `restart --java-opts ''` clears them.
- **After a reboot** every container of the run is Exited: `container.sh restart --run-id $RID` starts them all
  again (sidecars included) with their data.
- **Extra containers** (a sidecar, a second network): start them with `--label verify-wb.run=<rid>` and name
  them `verify-wb-<rid>-<name>`; `cleanup.sh --run-id` removes them with the stack, `container.sh restart`
  starts them again.

## Context path (`--context /graphdb`)

nginx in front (`graphdb.external-url=<url>/`), serving only under the prefix; anything else answers 404
`outside context path`. Use it for every navigation, routing or URL-building change. Drive with `pw.sh` and
finish with `check-paths.sh`; `drive.sh` refuses context stacks (exit 65). Recipe: `features/context-path.md`.

## Security and OpenID (`security.sh`)

Container runs only. `security.sh $RID on|off|free-access|login|oidc-up|oidc-down|status`; recipes in
`features/security-login.md` and `features/security-oidc.md`. Local admin is `admin`/`root`; `repo.sh` and
`setup.sh` log in with it once security is on. A security spec (`e2e-security/…`) leaves security on:
`drive.sh` switches it off again on a container stack. While security is on, `doctor.sh --run-id` WARNs (FAILs
only on the dev stack).

## Cluster (`cluster.sh`)

`cluster.sh up --run-id $RID [--proxy]` starts N nodes serving the tree's `dist/`,
creates the cluster, waits for a leader and prints `READY: <url>` (the proxy with `--proxy`, else node1).
`pw.sh @/`, `drive.sh`, `doctor.sh --run-id` (which FAILs while a node sees no leader) and `cleanup.sh` use it
like a container stack; `container.sh rebuild`/`restart` work on it too. Always start clusters through
`cluster.sh`: a hand-written compose is invisible to cleanup. A 10.x image: `--gdb-version 10.7.0 --bundled-ui`
(its own Workbench; a 4.x `dist/` never loads there). Recipe: `features/cluster.md`.

## Dev stack (`launch.sh`)

`http://localhost:9000` (single-spa root-config; Angular app from `:9002`, API bundle from `:9003`, REST proxied
to GraphDB `:7200`). One per machine, hot reload, usually the user's, serving the **main checkout**. Use it only
for quick iterations on the main checkout while the user's stack runs.

- **Prerequisite, not managed here:** GraphDB at `http://localhost:7200` with security **off**. Security on or
  GraphDB down → `doctor.sh` FAILs: tell the user and use a container stack. The user's GraphDB stays as it is:
  no logging in, no switching security.
- `launch.sh` reuses a stack this checkout already serves (`REUSING …`, exit 0: shared, never stopped), exits 9
  when another checkout serves `:9000`, else runs `npm run start` in its own process group and waits until the
  three servers answer (cold start: minutes).
- Ports are hard-coded, so isolation is per *data*: repositories `verify-<run-id>-*`.
- Source edits under `packages/*/src` hot-reload; webpack/config changes need a restart, and only of a stack
  `launch.sh` started (`cleanup.sh --stop-stack`, then `launch.sh`).
- GraphDB-wide setup (remote locations, graph configs, `SystemRepository`) belongs on container stacks: on the
  dev GraphDB it outlives cleanup. Saved visual graphs named `verify-<run-id>-*` are the exception: cleanup
  deletes them.

## A sibling repository's change (npm-linked `ontotext-yasgui-web-component`)

Build the sibling checkout, `npm link <its path>` in `packages/root-config` of the worktree under test, then
`container.sh rebuild`; leave the resulting `package-lock.json` change out of any commit. On the dev stack
`doctor.sh` WARNs while yasgui is linked (FAIL when its `dist/` is missing): say in the evidence which yasgui
build the page ran.

## Handing a stack to the user

When the user wants to look themselves: keep the stack up, give the `READY` URL (and `pw.sh $RID open --headed`
when they want to watch), and run `cleanup.sh --run-id` only when they ask.
