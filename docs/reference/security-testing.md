# Security testing

The end-to-end Security Suite that validates authentication, password enforcement, and role-based access.

The **Security Suite** under `e2e-tests/e2e-security/` validates:

- Turning security on/off
- Login flows with good and bad credentials
- Password change enforcement
- Role-based access for:
  - Read-only users (SPARQL & GraphQL)
  - Read/write users
  - GraphQL-only users (mutation restrictions)
  - Repository-admin users

> **Note:** For now these security tests are intended for **local** execution only.  
> They use a dedicated Cypress config file (`e2e-tests/cypress-security.config.js`)  
> and can be run with:
>
> ```bash
> # open interactive:
> npm run cy:open-security
>
> # headless CI style:
> npm run cy:run-security
> ```
>
> Make sure the workbench is served at `http://localhost:9000` (this is the Cypress `baseUrl`)  
> and that the GraphDB backend is running at `http://localhost:7200` (the dev-server proxy target),  
> initialized with a clean state before you start.
> 
> You should use GraphDB Enterprise Edition with a GraphQL extended support license when running the security tests

---

See also: [Developers Guide](../developers-guide.md)
