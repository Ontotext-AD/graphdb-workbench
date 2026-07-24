# HTTP interceptors

The request/response interceptor chains that let the workbench act on HTTP traffic before requests are sent or after responses are received.

## HTTP interceptors

### What it is
The system can intercept HTTP requests and responses done by the [HttpService](/packages/api/src/services/http/http.service.ts).
This allows us to perform certain actions upon requests, before they are sent, or after a response has been received.

### How does it work
There are two chains of interceptors. A request interceptor chain and a response interceptor chain.
Once a request is triggered it will first be processed by the request interceptor chain:
[InterceptorService#preProcess](/packages/api/src/services/interceptor/interceptor.service.ts)
The finished request object will then be used to form the actual HTTP Request to the backend in the HttpService
The resulting response will be processed by the response interceptor chain, before being finally returned to the caller.

Currently, there is no explicit mechanism for cancelling a request/response, but throwing an error, or rejecting
the promise will stop either chain.

### What can it be used for
An example can be made with the [AuthRequestInterceptor](/packages/api/src/interceptor/auth/auth-request-interceptor.ts),
which is used to add auth headers to each request, before it is sent to the backend

### Order of execution
Interceptors are executed based on their priority. Each interceptor has a `priority` property, which defaults to 0.
Higher priority indicates execution priority as well. The highest number will be executed first, lower numbers will be next.

### How to implement and register a new interceptor
1. Create a class, which extends the abstract [http-interceptor.ts](/packages/api/src/models/interceptor/http-interceptor.ts)
The generic type determines, what type of interceptor it will be.
Request interceptors should provide `HttpRequest` in the generic type, whereas response interceptors should provide `Response`

Example request interceptor:
```typescript
import {HttpInterceptor} from './http-interceptor';
import {HttpRequest} from './http-request';

class MyRequestInterceptor extends HttpInterceptor<HttpRequest> {
  shouldProcess(request: HttpRequest) {
    // implementation
  }
  
  process(request: HttpRequest) {
    // implementation
  }
}
```

Example response interceptor:
```typescript
import {HttpInterceptor} from './http-interceptor';

class MyResponseInterceptor extends HttpInterceptor<Response> {
  shouldProcess(response: Response) {
    // implementation
  }
  
  process(response: Response) {
    // implementation
  }
}
```

2. Register the interceptor
You can register the interceptor in two ways. The first is to add it to the relevant interceptor list,
which is in [interceptors-registration.js](/packages/root-config/src/bootstrap/interceptors/interceptors-registration.ts), which will add it on application bootstrap.
Example:
```typescript
/**
 * An array of HTTP request interceptors to be used in the application.
 */
const REQUEST_INTERCEPTORS = new HttpInterceptorList([
  new MyRequestInterceptor()
]);

/**
 * An array of HTTP response interceptors to be used in the application.
 */
const RESPONSE_INTERCEPTORS = new HttpInterceptorList([
  new MyResponseInterceptor()
]);
```
The second way is, by using the `registerRequestInterceptors` and/or `registerResponseInterceptors` in
[interceptor.service.ts](../../packages/api/src/services/interceptor/interceptor.service.ts)

Example:

```typescript
import {ServiceProvider} from './service.provider';

const interceptorService = ServiceProvider.get(InterceptorService);
interceptorService.registerRequestInterceptors(new HttpInterceptorList([new MyRequestInterceptor()]));
interceptorService.registerResponseInterceptors(new HttpInterceptorList([new MyResponseInterceptor()]));
```

---

See also: [Developers Guide](../developers-guide.md)
