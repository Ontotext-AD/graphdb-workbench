## Build-time feature toggles design

### Overview
1. Single source of truth: a feature-flags.json file
   Create a file at the repo root (alongside configuration.default.json):
   assets/feature-flags.json
```
{
  "enableGraphQL": true,
  "enableTTYG": true,
  "enableClusterManagement": false,
  "enableNewWorkbench": true
}
```
This is a static file that gets copied to dist/assets/ at build time via the existing CopyPlugin in webpack.config.common.js — no extra config needed since the assets/ directory is already copied wholesale.

2. Inject flags at build time via DefinePlugin
   In webpack.config.common.js, read the file and inject it as a global constant (just like __LANGUAGES__ already works):
```
const featureFlags = JSON.stringify(
    JSON.parse(fs.readFileSync(path.resolve(__dirname, 'assets/feature-flags.json'), 'utf8'))
);

// In the DefinePlugin:
new webpack.DefinePlugin({
    version: JSON.stringify(require("./package.json").version),
    __LANGUAGES__: languagesConfig,
    __FEATURE_FLAGS__: featureFlags   // <-- add this
})
```
Dead code elimination at build time: if a flag is false, bundlers (especially in production mode) will tree-shake the unreachable branches.

3. A shared service in the api package
   Since both microfrontends import from @ontotext/workbench-api, put the feature flag logic there:
   packages/api/src/feature-flags.ts

```
declare const __FEATURE_FLAGS__: Record<string, boolean>;

export const FeatureFlags: Record<string, boolean> = __FEATURE_FLAGS__;

export function isFeatureEnabled(flag: string): boolean {
    return FeatureFlags[flag] === true;
}
```
Both the Angular workbench and the AngularJS legacy workbench can consume this at runtime via the API package.

4. Angular workbench: extend environment.ts
   You can also mirror the flags in environment.ts for Angular-idiomatic usage:
   environments/environment.ts

```
declare const __FEATURE_FLAGS__: Record<string, boolean>;

export const environment = {
  production: false,
  features: __FEATURE_FLAGS__
};
```

5. Usage:
In new workbench it can be used like this:
```
import { environment } from '../environments/environment';
if (environment.features['enableGraphQL']) { ... }
```

In the legacy, access the global directly (it's a compile-time constant):
```
if (__FEATURE_FLAGS__.enableClusterManagement) {
    // register module / route
}
```

Or inject it as an Angular constant:
```
angular.module('app').constant('FEATURE_FLAGS', __FEATURE_FLAGS__);
```

6. Per-environment overrides (optional)
   If you need different flags for dev vs prod, you can have:
   assets/feature-flags.json — defaults
   assets/feature-flags.dev.json — dev overrides
   Then in webpack.config.common.js or the dev/prod configs, choose which file to read based on argv.env.BUILD_MODE.
