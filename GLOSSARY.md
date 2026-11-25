# GraphDB Workbench

The web UI for GraphDB. It is served from the same origin as the GraphDB instance it talks to.

## Language

### Connectivity

**Connection status**:
The single, application-wide state of the Workbench's ability to reach GraphDB: unknown, online, offline or backend unreachable.
_Avoid_: Network status, backend status, health

**Unknown**:
The Connection status before the first check completes, so that nothing reports a false online or a false failure at startup.

**Online**:
GraphDB responds, whatever the browser reports about the network. Internet access plays no part: a Workbench that reaches GraphDB on localhost or in a LAN is online.
_Avoid_: Connected, internet available

**Offline**:
GraphDB does not respond and the browser reports that it has no network.
_Avoid_: No internet, internet connection lost

**Backend unreachable**:
GraphDB does not respond while the browser reports that it has a network; the cause may be the server or anything in between, such as a proxy.
_Avoid_: Backend down, server down, GraphDB down

**Availability failure**:
A request that failed because GraphDB did not respond, as confirmed by a fresh check, rather than because of an ordinary error. It raises no notification of its own.
_Avoid_: Network error, connection error
