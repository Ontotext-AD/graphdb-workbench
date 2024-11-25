import { Config } from '@stencil/core';
import {sass} from '@stencil/sass';
import nodeResolve from '@rollup/plugin-node-resolve';

export const config: Config = {
  namespace: 'shared-components',
  outputTargets: [
    {
      type: 'dist',
      esmLoaderPath: '../loader',
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
        {src: '../node_modules/font-awesome/css/', dest: 'pages/css'},
        {src: '../node_modules/font-awesome/fonts/', dest: 'pages/fonts'},
        {src: '../../api/dist/ontotext-workbench-api.js', dest: 'resources/ontotext-workbench-api.js'},
      ]
    },
  ],
  testing: {
    browserHeadless: "new",
  },
  plugins: [
    sass(),
    nodeResolve(),
  ],
};
