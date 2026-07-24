# Known issues

Documented workbench gotchas, including Chrome silently caching Basic Auth credentials.

## Silent Basic Auth Header Injection by Chrome

If you've ever filled in a **browser-native Basic Auth popup** in Chrome for the workbench login, **Chrome will silently remember and auto-send** those credentials in every subsequent request to that domain — *even across sessions and after logout*.

### Symptom:
You will see an `Authorization` header automatically added to requests like:

```
Authorization: Basic <base64-encoded-user:password>
```

This can be confirmed in the **Network** tab of DevTools, particularly in requests like:

```
GET /rest/security/authenticated-user
```

### Why it's a problem:
- It bypasses token-based authentication (e.g. JWT, OpenID).
- It breaks logout and user switching — Chrome keeps sending old credentials.
- It leads to inconsistent security state and misleading login behavior.

### How to fix it (Chrome):

To remove the cached Basic Auth credentials:

1. Open :
   ```
   chrome://settings/clearBrowserData
   ```
   and clear:
  - **Cookies and other site data**
  - **Cached images and files**

Note: Simply logging out will **not** remove Basic Auth credentials remembered by Chrome — **they are not managed by the code**.

---

See also: [Developers Guide](../developers-guide.md)
