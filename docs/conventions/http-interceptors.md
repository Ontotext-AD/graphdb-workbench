# HTTP interceptors

Rules for request/response preprocessing in the API layer, which supports request and response interceptor chains.

## When adding request/response behavior

- Prefer implementing an interceptor over scattering request-mutation logic across call sites.
- Pay attention to interceptor `priority` ordering (higher priority runs first).

## Relevant locations

- `packages/api/src/services/interceptor/...`
- `packages/root-config/src/bootstrap/interceptors/interceptors-registration.ts`

## See also

- Deep dive (chain mechanics, implementing and registering an interceptor): [reference/http-interceptors.md](../reference/http-interceptors.md)
- [Developers Guide hub](../developers-guide.md)
