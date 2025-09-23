# Styleguide Module

## Usage Workflow

This workflow describes how to update and integrate design tokens and styles from Figma into the styleguide module and the application.

### 1. Update in Figma
- The UX developer updates the styleguide and design tokens in Figma.

### 2. Publish Tokens
- The UX developer publishes the updated tokens to the `graphwise-styleguide` repository, or exports them as a file and provides them to the UI developers.

### 3. Update Tokens in Repo
- The UI developer updates the tokens in the graphwise-styleguide repository with the new version from Figma.

### 4. Rebuild Stylesheet
- The UI developer rebuilds the `variables.css` stylesheet using the new tokens in the graphwise-styleguide repository.

### 5. Publish New Package Version
- The UI developer publishes a new version of the graphwise-styleguide package to NPM, following semantic versioning.

### 6. Install Updated Styleguide
- The UI developer installs the new styleguide version in the Workbench by updating `/packages/styleguide/package.json`.

### 7. Optimize Styleguide
- The UI developer runs `npm run build` in the `packages/styleguide` module. This script optimizes the styleguide by purging unused variables, ensuring only those used in the application remain.

## Notes
- Always follow semantic versioning when publishing updates.
- Ensure that unused variables are purged during the build process for optimal performance.
- Coordinate closely between UX and UI teams for smooth updates.


