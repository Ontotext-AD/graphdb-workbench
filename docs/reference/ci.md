# CI

The Jenkins pipeline that installs, builds, tests, validates, and analyzes the workbench, plus the separate code coverage job.

## Contents

- [Overview](#overview): what the pipeline does.
- [Important](#important): new `dist` folders must be added to the backend security config.
- [Pipeline Details](#pipeline-details): tools, environment, and the stages from install to the Cypress tests.
- [Reading SonarCloud results](#reading-sonarcloud-results): the quality gate and the issues of a PR, without logging in.
- [Post Actions](#post-actions): cleanup and failure notifications.
- [Notes](#notes): UID/GID and KSM.
- [Code Coverage Analysis](#code-coverage-analysis): the separate, manually triggered coverage job.

The `graphdb-workbench` project uses a Jenkins pipeline to automate installation, testing, building, validation, and SonarQube analysis.

## Overview

The pipeline is configured to execute the following steps:
- Install dependencies
- Build the project
- Run linting, validating and tests
- Perform SonarQube analysis
- Execute Cypress tests for shared components and the Workbench

---

## Important

If new static folders are created in the `dist` folder to be published (or old ones are renamed), they must be added to the BE Spring Security configuration. Failure to do so will prevent the server from serving these resources, causing the Workbench to malfunction.

---

## Pipeline Details

### Tools and Environment
- **Node.js**: 22 (via the `nodejs-22` Jenkins tool)
- **SonarQube**: Configured via `SONAR_ENVIRONMENT=SonarCloud`
- **Docker Compose**: Used to run Cypress tests
- **Cloud agent**: All stages run on `aws-large` nodes

### Stages

1. **Install**
  - Uses Docker to run `npm run install:ci`

2. **Build**
  - Runs `npm run build` in the same Dockerized environment

3. **Lint**
  - Runs `npm run lint`

4. **Validate**
  - Executes translation validation via `npm run validate`
  - Archives `translation-report.json` regardless of outcome

5. **Sonar**
  - Conditional analysis depending on branch:
    - For `master`: regular scan
    - For PRs: branch/target/ID passed as args

6. **Test**
  - Executes unit/integration tests via `npm run test`

7. **Shared-components Cypress Test**
  - Runs in `packages/shared-components`
  - Uses Docker Compose (`docker-compose.yaml`)
  - Archives Cypress screenshots and videos
  - Cleans up containers, volumes, and images post-run

8. **Workbench Cypress Test**
  - Skipped on `master` branch
  - Pulls a license file using Keeper Secrets Manager (KSM)
  - Copies license into `e2e-tests/fixtures`
  - Runs Workbench E2E Cypress tests via `docker-compose-test.yaml`
  - Cleans up Docker artifacts after run

---

## Reading SonarCloud results

The project is public on SonarCloud (key `Ontotext-AD_WB_migration_workbench`, from `sonar-project.js`), so its
Web API answers without a token. For PR `N`:

```bash
K=Ontotext-AD_WB_migration_workbench
# Quality gate: each condition with its threshold and actual value
curl -s "https://sonarcloud.io/api/qualitygates/project_status?projectKey=$K&pullRequest=N"
# Open issues on new code: rule, file, line, message
curl -s "https://sonarcloud.io/api/issues/search?componentKeys=$K&pullRequest=N&resolved=false"
# Duplication per file (the gate fails above 3% on new code)
curl -s "https://sonarcloud.io/api/measures/component_tree?component=$K&pullRequest=N&metricKeys=new_duplicated_lines_density&qualifiers=FIL"
```

The gate fails on any new bug, code smell or vulnerability, and on more than 3% duplicated lines in new code.
It does not block merging: the only required check on `master` is `continuous-integration/jenkins/pr-head`.

---

## Post Actions

- **Always**: Executes a workspace cleanup script managed by `configFileProvider`
- **On Failure**: Sends email notification to the triggering user


## Notes

- Test runners use the current user’s UID/GID for correct permissions
- KSM is used securely for pulling sensitive files like licenses

---

## Code Coverage Analysis
Code coverage is run in a separate Jenkins job, which is triggered manually on demand, typically for feature branches.

### How to Run It
Find the **graphdb-workbench-coverage** job in Jenkins.

Start it using the Build with Parameters option, specifying the Git branch you want to analyze.

After the job completes, the final HTML report with the results is available as a build artifact in Jenkins.

---

See also: [Developers Guide](../developers-guide.md)
