# Cluster management

An administrator opens Setup › Cluster and sees the cluster as a ring of nodes: the leader highlighted, links
between nodes, and a settings panel listing each node's endpoint, RPC address and state (LEADER / FOLLOWER). From
`Edit cluster` they remove a node from the group or add one back; the ring and the states update after save.
Behind an external cluster proxy the same Workbench is served by the proxy and talks to the leader.

## Sub-features

- `cluster-status` — ring view (`.id-host-background` labels `nodeN:7200`) and the settings panel's Nodes tab
  (`cluster-nodes .nodes-list li`: endpoint, RPC address, `Node state`, `(Local)` on the node that answered).
- `cluster-remove-node` — Edit cluster › node row `×` › `Confirm detach` › `Save changes`.
- `cluster-add-node` — Edit cluster › `Add node` › location URL › row save › `Save changes`.
- `cluster-repo-replication` — a repository created through the proxy exists on every node.
- `cluster-replace-node`, `cluster-properties-edit`, `cluster-delete`, multi-region — exist, not driven yet.
- REST API page "Try it out" through the proxy (GDB-15784: requests go to `http://node1:7200`) — not driven.

## How to get to it (user POV)

- Menu `Setup` › `Cluster` (route `/cluster`). With no cluster the page offers to create one.
- Gear button top right (`.preview-cluster-config-btn`) › panel `Cluster configuration` › tab `Nodes`
  (`.nav-tabs.configuration-tabs .nav-item`, index 1).
- `Edit cluster` (`.edit-cluster-nodes-modal-btn`, shown only when there is a leader) › modal with one row per
  node (`.cluster-group tbody tr.node[data-endpoint="http://nodeN:7200"]`).

## Driving it with verify-workbench

Preconditions:

- A cluster run: `$V/scripts/cluster.sh up --run-id $RID --proxy [--tree <wt>] [--no-build]` prints the node
  URLs, `leader: …` and `READY: <proxy URL>`; `$V/scripts/doctor.sh --run-id $RID` exits 0. pw.sh `@/` is the
  proxy (node1 without `--proxy`). `cluster.sh status --run-id $RID` prints every node's view of the group.
- A 10.x image serves only its own Workbench: `--gdb-version 10.7.0 --bundled-ui`.

With `PW="$V/scripts/pw.sh $RID"` (proven 2026-11-24 on 12.0.0-TR23 + master dist through the proxy, 3 nodes):

- **Status.** `$PW open @/cluster` → `$PW wait '.id-host-background' 30000` →
  `$PW click '.preview-cluster-config-btn'` → `$PW wait '.nav-tabs.configuration-tabs .nav-item'` →
  `$PW click '.nav-tabs.configuration-tabs .nav-item >> nth=1'` → `$PW wait 'cluster-nodes .nodes-list li .state'`
  → `$PW eval "[...document.querySelectorAll('cluster-nodes .nodes-list li')].map(li=>li.innerText.replace(/\s+/g,' ').trim()).join(' | ')"`
  reads `http://node1:7200 RPC address: node1:7300 Node state: FOLLOWER | … | … LEADER (Local)`; it matches
  `cluster.sh status`. Proofs `01-cluster-view-proxy.png`, `02-cluster-nodes-tab-proxy.png`.
- **Repository through the proxy.** The Repositories recipe (`repositories.md`, Playwright sequence) on the proxy
  URL, then read back each node: `for u in $($V/scripts/cluster.sh nodes --run-id $RID | awk '{print $2}'); do
  curl -s $u/rest/repositories | jq -c 'map(.id)'; done` — the id on every node. Proof
  `03-repo-created-via-proxy.png`, side effect `repos-per-node.txt`.
- **Remove node3.** `$PW goto @/cluster` → `$PW wait '.edit-cluster-nodes-modal-btn' 30000` →
  `$PW click '.edit-cluster-nodes-modal-btn'` → `$PW run-code "async page => { await
  page.locator('.cluster-group tbody tr.node[data-endpoint=\"http://node3:7200\"] .delete-node-btn').click({force: true}); return 'ok'; }"`
  → `$PW click 'role=dialog[name="Confirm detach"] >> role=button[name="Yes"]'` (the row's location cell gets
  class `deleting`) → `$PW click 'role=button[name="Save changes"]'` → `$PW wait-gone '.cluster-group' 60000`.
  `cluster.sh status`: node1/node2 list only node1+node2; node3 sees `NO_CLUSTER`. The ring shows two nodes.
  Proofs `04-edit-cluster-remove-node3.png`, `06-after-remove-node3.png`, side effect `status-after-remove.txt`.
- **Add node3 back.** `$PW click '.edit-cluster-nodes-modal-btn'` → `$PW wait 'cluster-nodes-configuration .add-node-btn'`
  → `$PW click 'cluster-nodes-configuration .add-node-btn'` → `$PW wait '.edit-node-row .location-cell [name="location"]'`
  → `$PW fill '.edit-node-row .location-cell [name="location"]' 'http://node3:7200'` →
  `$PW click '.edit-node-row .save-rule-btn'` (row reads `Node will be added`) →
  `$PW click 'role=button[name="Save changes"]'` → `$PW wait-gone '.cluster-group' 60000`; toast `Cluster updated
  successfully`. Poll `cluster.sh status` until node3 sees itself FOLLOWER (within a minute); its repositories match
  the others'. Proofs `07-add-node3.png`, `08-after-add-node3.png`, side effect `status-after-add.txt`.
- **10.x (proven on 10.7.0, bundled Workbench 2.7.0, proxy).** `cluster.sh up --run-id $RID --proxy
  --gdb-version 10.7.0 --bundled-ui` → the Status sequence up to the gear: the panel lists node1 LEADER, node2/3
  FOLLOWER (10.x has no tabs; the Nodes list is in the panel body). `$V/scripts/repo.sh $RID r1` through the
  proxy appears on all three nodes.
- No Cypress spec yet: `drive.sh` would replay against the proxy URL; the e2e `ClusterPageSteps`,
  `ClusterConfigurationSteps`, `ClusterNodesConfigurationSteps` (`e2e-tests/steps/cluster/`) hold the selectors.

## Gotchas

- The node delete button sits under the modal's `div.modal`, which intercepts a normal click: click it with
  `{force: true}` (the e2e steps do the same).
- Node heap below 2g: creating a repository fails with `Failed to initialize repository` (`OutOfMemoryError` in
  the leader's log) and 400 in the UI. `cluster.sh` defaults to 2g per node.
- The cluster nodes need one shared `graphdb.auth.token.secret`; `cluster.sh` generates it per run. The proxy
  starts only with `GDB_HEAP_SIZE` (an `-Xmx512m` alone fails: "Initial heap size set to a larger value than
  the maximum heap size").
- A current (4.x) dist/ on a 10.x image never finishes loading (406 for `/resources/*.js`): use `--bundled-ui`.
  `doctor.sh` then WARNs "served bundle != dist" — expected for that run.
- `container.sh restart --run-id $RID` restarts node1 only; the group re-elects a leader within ~30 s (a
  CANDIDATE term first). `container.sh rebuild` restages dist/ for every node and the proxy (shared mount).
- Through the proxy, the panel marks the node that answered as `(Local)` — the leader, not node1.
- GDB-15784 (reported, not driven here): the REST API page's "Try it out" behind the external proxy sends
  requests to `http://node1:7200`.
