# Cypress Testcontainers Setup

This document describes how the Cypress end-to-end (E2E) test infrastructure works using [Testcontainers](https://node.testcontainers.org/). The setup allows you to run Cypress tests against containerized instances of **GraphDB** and **Workbench**, providing an isolated and reproducible testing environment.

---

## Overview

The E2E test suite spins up Docker containers for:

- **GraphDB** 
- **Workbench** 

Cypress tests are then executed against the running containers using dynamic port allocation.

---

## Structure

### Scripts

#### `package.json`
```json
"scripts": {
  "cy:run-testcontainers": "cypress run --config-file cypress-testcontainers.config.js",
  "parallel": "NO_COLOR=1 cypress-parallel -s cy:run-testcontainers -t 3 -d e2e-legacy/"
}
```

- `cy:run-testcontainers` – Runs Cypress using the dynamic testcontainers config.
- `parallel` – Runs tests in parallel using `cypress-parallel`.

---

## Testcontainers Workflow

### 1. **Plugin Setup (`e2e-tests/plugins/index.js`)**

- Defines Cypress tasks to:
  - `startGraphDb` – starts a GraphDB Docker container
  - `startWorkbench` – builds and starts the Workbench container
  - `stopGraphDb` – stops the GraphDB container
  - `stopWorkbench` – stops the Workbench container

- Uses a shared Docker network to enable communication between containers.

### 2. **Runtime Hooks (`support/e2e.js`)**

- `before()`:
  - Launches GraphDB
  - Then launches Workbench using the GraphDB connection

- `after()`:
  - Cleans up containers (GraphDB and Workbench are stopped)

### 3. **Cypress Config (`cypress-testcontainers.config.js`)**

- Dynamically finds a free port
- Builds `baseUrl` for Cypress test execution
- Injects `freePort` into Cypress env config

---

## Docker Setup

### 1. **`cypress.Dockerfile`**
Creates a Cypress test runner image with:
- E2E tests
- Frontend build
- Supporting CI scripts

### 2. **`workbench.Dockerfile`**
Builds a containerized Workbench with a custom NGINX config:
- Proxies `/rest`, `/repositories`, and `/protocol` to GraphDB

### 3. **`docker-compose-testcontainers.yaml`**
Runs the Cypress test runner inside Docker with access to Docker socket:
```yaml
services:
  cypress-tests:
    build:
      context: .
      dockerfile: cypress.Dockerfile
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - ./e2e-tests:/workbench/e2e-tests
    environment:
      - IS_DOCKER=true
```

---

## Custom NGINX Template

`scripts/ci/default.conf.template` is used in `workbench.Dockerfile` to dynamically inject the `GRAPHDB_URL` into NGINX.

The script `scripts/ci/start-workbench.sh` handles this substitution and starts NGINX.

---

## 🛠 How to Run

### Locally (Node)

```bash
npm run cy:run-testcontainers
```

### Parallel

```bash
npm run parallel
```

### In Docker (via Compose)

```bash
docker-compose -f docker-compose-testcontainers.yaml up --build
```

---

## Cleanup

Testcontainers are stopped automatically after tests via Cypress `after()` hook. If you stop tests early, dangling containers might remain — clean them using:

```bash
docker ps -a
docker stop <id> && docker rm <id>
```

---

## Notes

- Uses port substitution and dynamic config to avoid clashes.
- Containers share a network, enabling hostname-based proxying.
- Ensure `docker` is installed and running, with access to the Docker socket.

---

## Using `.env` for Configuration

The Cypress + Testcontainers setup now supports configuration via a `.env` file.

### Supported Variables (example)
```env
GDB_VERSION=11.0.2-TR1
...
```

### 🔧 How It Works

- The `.env` file is copied into the Docker image at `/workbench/.env`:
  ```dockerfile
  COPY .env /workbench/.env
  ```

- In `e2e-tests/plugins/index.js`, it is loaded explicitly:
  ```js
  require('dotenv').config({ path: '/workbench/.env' });
  ```

- This makes environment variables like `GDB_VERSION` available via `process.env.GDB_VERSION`.

> ✅ Note: Avoid relying on the default `.env` loading path; always use an explicit `path` in Docker-based projects.
