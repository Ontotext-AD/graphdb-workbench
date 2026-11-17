# GraphDB Workbench

The web UI for GraphDB. It is served from the same origin as the GraphDB instance it talks to.

## Language

### Connectivity

**Connection status**:
The single, application-wide state of the Workbench's ability to reach GraphDB: unknown, online, offline or backend unreachable.
_Avoid_: Network status, backend status, health

**Offline**:
GraphDB does not respond and the browser reports that it has no network.
_Avoid_: No internet, internet connection lost

**Backend unreachable**:
GraphDB does not respond while the browser reports that it has a network; the cause may be the server or anything in between, such as a proxy.
_Avoid_: Backend down, server down, GraphDB down

**Availability failure**:
A request that failed because GraphDB did not respond, as confirmed by a fresh check, rather than because of an ordinary error. It raises no notification of its own.
_Avoid_: Network error, connection error
