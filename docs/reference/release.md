# Release

The Jenkins release pipeline that versions, builds, and publishes the workbench and its Cypress E2E tests to npm.

## Jenkins Release Pipeline Documentation

This Jenkins pipeline facilitates the release process for the `graphdb-workbench` project. It automates versioning, building, and publishing to npm, ensuring a smooth release workflow.

---

### Key Features

- Cloud-based execution using `aws-small` agents
- Publishes both the main project and Cypress E2E tests to npm
- Uses Keeper Secrets Manager (KSM) for secure credentials
- Slack integration for release notifications (optional)
- Git tagging and pushing included
- Automatically cleans up after both success and failure

---

### Tools and Environment

- **Node.js**: Runs using Docker image `node:22-bullseye`
- **Keeper Secrets Manager (KSM)**: Used for npm and Git credentials
- **Git**: Auto-tags the release and pushes changes to GitHub

---

### Pipeline Parameters Details

- `GIT_BRANCH`: Git branch to release from (default: `master`)
- `RELEASE_VERSION`: Required version to release
- `NOTIFY_SLACK`: Whether to send a Slack notification
- `SLACK_CHANNEL`: Slack channel to notify (if enabled)

---

### Pipeline Stages

#### 1. **Prepare & Publish**
- Checks out the selected Git branch
- Runs:
  ```bash
  npm run install:ci
  npm run build
  ```
- Runs the same preparation in `e2e-tests/`
- Uses KSM to set up the `.npmrc` auth token
- Publishes both main and E2E packages to npm
- Logs current npm user with `npm whoami`

---

### Post Actions

#### On Success:
- Commits and tags the release:
  ```bash
  git commit -a -m 'Release ${RELEASE_VERSION}'
  git tag -a v${RELEASE_VERSION} -m 'Release v${RELEASE_VERSION}'
  ```
- Uses KSM for Git credentials and pushes changes + tags
- Optionally sends Slack notification if enabled

#### On Failure:
- Sends an email to the build user
- Restores `.npmrc` and removes any local tokens

---

### Notes

- Builds have a timeout of 15 minutes and cannot run concurrently
- `.npmrc` is mounted into the container and cleaned afterward
- Slack integration is optional and safely wrapped with fallback

---

See also: [Developers Guide](../developers-guide.md)
