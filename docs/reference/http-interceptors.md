# HTTP interceptors

The request/response interceptor chains that let the workbench act on HTTP traffic before requests are sent or after responses are received.

## Contents

- [What it is](#what-it-is): intercepting `HttpService` requests and responses.
- [How does it work](#how-does-it-work): the request and response chains, and how a chain stops.
- [What can it be used for](#what-can-it-be-used-for): e.g. adding auth headers.
- [Order of execution](#order-of-execution): `priority`, highest first.
- [How to implement and register a new interceptor](#how-to-implement-and-register-a-new-interceptor): extending `HttpInterceptor` and the two ways to register it.

## What it is
The system can intercept HTTP requests and responses done by the [HttpService](../../packages/api/src/services/http/http.service.ts).
This allows us to perform certain actions upon requests, before they are sent, or after a response has been received.

## How does it work
There are two chains of interceptors: a request chain and a response chain, both held by
[InterceptorService](../../packages/api/src/services/interceptor/interceptor.service.ts).

1. A request first goes through the request chain (`InterceptorService#preProcess`). Each interceptor whose
   `shouldProcess(request)` returns `true` gets to `process` it, and the result is passed to the next one.
2. The `HttpService` sends the final request to the backend.
3. The response goes through the response chain (`InterceptorService#postProcess`) the same way before it is returned
   to the caller.

There is no explicit mechanism for cancelling a request/response, but throwing an error or rejecting the promise stops
either chain.

## What can it be used for
For example, the [AuthRequestInterceptor](../../packages/api/src/interceptor/auth/auth-request-interceptor.ts) adds
auth headers to each request before it is sent to the backend. The response chain has `UnauthenticatedInterceptor`
and `UnauthorizedInterceptor`.

## Order of execution
Each interceptor has a `priority` property, which defaults to `0`. The highest priority runs first. The chain is
re-sorted every time interceptors are registered.

## How to implement and register a new interceptor
1. Create a class that extends the abstract [HttpInterceptor](../../packages/api/src/models/interceptor/http-interceptor.ts).
   The generic type sets the chain: `HttpRequest` for a request interceptor, `Response` for a response interceptor.
   `process` returns a promise.

Example request interceptor:
```typescript
import {HttpInterceptor, HttpRequest} from '@ontotext/workbench-api';

export class MyRequestInterceptor extends HttpInterceptor<HttpRequest> {
  shouldProcess(request: HttpRequest): boolean {
    // implementation
  }

  process(request: HttpRequest): Promise<HttpRequest> {
    // implementation
  }
}
```

Example response interceptor:
```typescript
import {HttpInterceptor} from '@ontotext/workbench-api';

export class MyResponseInterceptor extends HttpInterceptor<Response> {
  shouldProcess(response: Response): boolean {
    // implementation
  }

  process(response: Response): Promise<Response> {
    // implementation
  }
}
```

2. Register the interceptor. There are two ways.

The first is to add it to the relevant list in
[interceptors-registration.ts](../../packages/root-config/src/bootstrap/interceptors/interceptors-registration.ts),
which registers them on application bootstrap:
```typescript
const REQUEST_INTERCEPTORS = [
  new AuthRequestInterceptor(),
  new MyRequestInterceptor(),
];

const RESPONSE_INTERCEPTORS = [
  new UnauthenticatedInterceptor(),
  new UnauthorizedInterceptor(),
  new MyResponseInterceptor(),
];
```

The second is to call `registerRequestInterceptors` and/or `registerResponseInterceptors` on the `InterceptorService`.
They add to the interceptors already registered; they don't replace them.

```typescript
import {HttpInterceptorList, InterceptorService, service} from '@ontotext/workbench-api';

const interceptorService = service(InterceptorService);
interceptorService.registerRequestInterceptors(new HttpInterceptorList([new MyRequestInterceptor()]));
interceptorService.registerResponseInterceptors(new HttpInterceptorList([new MyResponseInterceptor()]));
```

---

See also: [Developers Guide](../developers-guide.md)
