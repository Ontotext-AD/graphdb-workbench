import { Config } from '@stencil/core';
import {sass} from '@stencil/sass';
import nodePolyfills from 'rollup-plugin-node-polyfills';

const path = `${__dirname}/src/pages/fake-server.js`;

export const config: Config = {
  namespace: 'shared-components',
  // Runs once before any component loads; shims the Node `process` global that
  // Reactodia's transitive deps (n3 / readable-stream) expect. See src/global/app.ts.
  globalScript: 'src/global/app.ts',
  sourceMap: false,
  outputTargets: [
    {
      type: 'dist',
      esmLoaderPath: '../loader'
    },
    // {
    //   type: 'dist-custom-elements',
    //   customElementsExportBehavior: 'single-export-module',
    //   externalRuntime: false,
    // },
    {
      type: 'docs-readme',
    },
    {
      type: 'www',
      serviceWorker: null, // disable service workers
      copy: [
        {src: 'pages'},
        {src: 'assets'},
        {src: '../../root-config/node_modules/remixicon/fonts/remixicon.css', dest: 'pages/css/remixicon.css'},
        {src: '../../root-config/node_modules/remixicon/fonts', dest: 'pages/css'},
        {src: '../../root-config/src/vendor/icons.css', dest: 'pages/css/icons.css'},
        {src: '../../root-config/src/styles/fonts', dest: 'pages/styles/fonts'},
        {src: '../../api/dist/ontotext-workbench-api.js', dest: 'resources/ontotext-workbench-api.js'},
      ]
    },
  ],
  testing: {
    browserHeadless: 'shell',
    moduleNameMapper: {
      '^@ontotext/workbench-api$': '<rootDir>/../api/dist/ontotext-workbench-api.d.ts',
    },
    moduleDirectories: ["node_modules"],
    modulePathIgnorePatterns: ["<rootDir>/cypress/"],
    transform: {
      '^.+\\.(js|mjs|jsx|ts|tsx)$': 'ts-jest',
    },
  },
  plugins: [
    sass(),
  ],
  // Reactodia pulls in node-oriented RDF tooling (n3 / readable-stream) that
  // references the "buffer" and "stream" builtins. Polyfill them for the browser bundle.
  rollupPlugins: {
    after: [
      nodePolyfills(),
    ],
  },
  devServer: {
    requestListenerPath: path
  },
  // https://github.com/stenciljs/core/issues/4284
  // https://github.com/stenciljs/core/issues/5215
  // The main slot was not appearing in the DOM
  extras: {
    experimentalSlotFixes: true
  }
};
