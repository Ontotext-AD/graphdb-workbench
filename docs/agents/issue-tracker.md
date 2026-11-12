# Issue tracker: Jira

Issues and specs for this repo live in Jira, project `GDB` (keys `GDB-<n>`). Use the Atlassian MCP tools;
resolve `cloudId` once via `getAccessibleAtlassianResources` and reuse it.

## Conventions

- **Draft first**: write the issue title/body in chat; call `createJiraIssue` only after the user explicitly approves.
- **Read**: `getJiraIssue` + `listJiraIssueComments`.
- **List / search**: `searchJiraIssuesUsingJql`, e.g. `project = GDB AND labels = needs-triage AND statusCategory != Done`.
- **Comment**: `addOrEditJiraIssueComment`.
- **Labels**: `editJiraIssue` (update the `labels` field).
- **Close / change status**: `transitionJiraIssue` (look up the available transitions first).
- Product/scope decisions made in a session go into the issue's acceptance criteria or comments.
- Branches and commits reference the key: `GDB-<n>-short-desc`, `GDB-<n>: ...`.

## Pull requests as a triage surface

**PRs as a request surface: no.** _(Set to `yes` if this repo treats external PRs as feature requests; `/triage` reads this flag.)_

## When a skill says "publish to the issue tracker"

Draft the Jira issue in chat; create it in project `GDB` after approval.

## When a skill says "fetch the relevant ticket"

`getJiraIssue` for the `GDB-<n>` key, plus its comments.

## Wayfinding operations

Used by `/wayfinder`. The **map** is an Epic with **child** issues as tickets.

- **Map**: an Epic labelled `wayfinder:map` (Notes / Decisions-so-far / Fog in the description).
- **Child ticket**: an issue whose parent is the Epic, labelled `wayfinder:<research|prototype|grilling|task>`.
- **Blocking**: a Jira "is blocked by" issue link. A ticket is unblocked when every blocker is Done.
- **Frontier**: the Epic's open, unassigned children with no open blockers; the first by rank wins.
- **Claim**: assign the ticket to the current user (`atlassianUserInfo`).
- **Resolve**: comment with the answer, transition to Done, and append a pointer to the map's Decisions-so-far.
