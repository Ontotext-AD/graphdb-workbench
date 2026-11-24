---
name: verify-workbench
description: Drive the running GraphDB Workbench UI like a user and keep screenshot + REST read-back evidence, on a throwaway per-run GraphDB container serving one checkout's build (optionally behind a context path, as a cluster, or with security/OpenID) or on the shared dev stack. Use to prove a UI change works in the running app, for a quick screenshot of a page, a before/after visual compare against master, a smoke sweep of every route, an accessibility check, or replaying one e2e spec.
---

# Verify GraphDB Workbench

Helpers live in `.claude/skills/verify-workbench/scripts/` (`V=.claude/skills/verify-workbench` from the repo
root). Each one's `--help` owns its flags and exit codes: read that, not the source.

## Quick look (a screenshot of a checkout)

```bash
V=.claude/skills/verify-workbench; RID=look-$(date +%H%M%S)
$V/scripts/container.sh up --run-id $RID --tree <worktree>   # READY: <url> (~1 min build; --no-build reuses dist/)
$V/scripts/doctor.sh --run-id $RID                           # exit 0 = drivable
$V/scripts/pw.sh $RID open @/repository
$V/scripts/pw.sh $RID wait '<selector of what you want to see>'
$V/scripts/pw.sh $RID screenshot --filename=look.png          # lands in ~/.cache/verify-workbench/runs/$RID/playwright/
$V/scripts/cleanup.sh --run-id $RID
```

Proving a change works, rather than looking at it → read on.

## Pick a stack

Nothing in the page tells you whose code you see (every worktree has the same version), so the stack decides it.

| Case | Stack | Start |
|---|---|---|
| Default: any worktree, final verification, the user busy in the main tree | container | `container.sh up --run-id $RID` |
| Routing, navigation, URL building | container + context path | `container.sh up … --context /graphdb` |
| Login, free access, OpenID | container + security | `container.sh up`, then `security.sh $RID …` |
| Cluster status, nodes, replication, proxy | cluster | `cluster.sh up --run-id $RID [--proxy]` |
| Quick iterations on the main checkout with the user's running stack, its GraphDB security off | dev stack | `launch.sh` |

Read [reference/stacks.md](reference/stacks.md) before the first `up` of a session, and whenever a stack needs
more than `up` (license, heap, rebuild, restart, a sibling repo's change, handing a stack to the user).

## Helpers

```bash
$V/scripts/container.sh up|rebuild|restart|down|url --run-id ID   # per-run GraphDB container serving one tree
$V/scripts/cluster.sh up|status|nodes|url --run-id ID             # per-run GraphDB cluster, optional proxy
$V/scripts/security.sh <run-id> on|off|free-access|login|oidc-up|oidc-down|status   # container runs only
$V/scripts/launch.sh                         # start or reuse the dev stack (main checkout only)
$V/scripts/doctor.sh [--run-id ID]           # read-only health check; run first and after anything surprising
$V/scripts/repo.sh <run-id> <suffix>...      # repositories verify-<run-id>-<suffix> (ruleset, params, FedX, …)
$V/scripts/setup.sh <run-id> location|graph-config …   # GraphDB-wide setup, container runs only
$V/scripts/pw.sh <run-id> <command|helper> [args]   # interactive driving: playwright-cli + helpers
$V/scripts/drive.sh <one spec> --run-id ID   # one Cypress spec, the only way to run Cypress here
$V/scripts/check-paths.sh <run-id>           # context stack: no request left the context path
$V/scripts/compare.sh --run-id ID (route | name=route)...   # before/after screenshots vs a baseline ref
$V/scripts/smoke.sh <run-id> [--baseline RUN-ID]   # every route: errors + screenshot
$V/scripts/a11y.sh <run-id> [route...]       # IBM Equal Access check; read reference/a11y.md first
$V/scripts/cleanup.sh --run-id ID            # tear the run down; without arguments: list recorded runs
```

## A run

1. **Stack.** Start it (table above), then `doctor.sh [--run-id $RID]` → exit 0 (WARNs allowed).
2. **Map.** A mapped feature → its recipe via [features/README.md](features/README.md); use its proven commands
   and its Gotchas before inventing selectors.
3. **Setup data** through REST (`repo.sh`, `setup.sh`), everything named `verify-<run-id>-*`; the behaviour
   being proven goes through the UI.
4. **Drive.** Interactive `pw.sh` is the default for exploring and proving; `drive.sh` replays a spec. Both in
   [reference/driving.md](reference/driving.md): read it before the first `pw.sh` or `drive.sh` call of a
   session.
5. **Evidence.** Screenshot of the resulting state plus a REST read-back of the side effect, then look at the
   final screenshot. Proof standard, noise list, `compare.sh`, `smoke.sh`, `a11y.sh`:
   [reference/evidence.md](reference/evidence.md).
6. **Cleanup.** `cleanup.sh --run-id $RID` after the last drive and after every failed iteration (when the user
   takes the stack over, only when they ask).

## Rules every run keeps

- **One driver per stack**: one `drive.sh` or `pw.sh` sequence at a time; parallel work gets its own stack.
- **Your run only**: drive and delete only what your run id names. Run state is shared by every agent on the
  machine, so `cleanup.sh --all-runs`/`--all-repos` run only when the user asks.
- **The user's dev stack and GraphDB stay as they are**: stop only a stack `launch.sh` started; leave its
  security and login alone.
- **Wait on a condition**, never `sleep`: `pw.sh wait|wait-url|wait-fn`, Monitor for background runs.
- **Proven in the running app**: style through a `pw.sh css` read-back, library behaviour by driving it;
  source reading is a hypothesis.
- **Expected noise** is only what `scripts/compare/noise.txt` lists; every other console error or failed
  request is a finding.
- **Read exit codes directly**: run `up`, `drive.sh` and `doctor.sh` unpiped (behind `| tail` you read
  `tail`'s exit code).

Traps that cost runs before: [reference/gotchas.md](reference/gotchas.md), read it when something behaves
unexpectedly. Feature map maintenance: `/maintain-verification-skill`.
