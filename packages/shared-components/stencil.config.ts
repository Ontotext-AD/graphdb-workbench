import { Config } from '@stencil/core';
import {sass} from '@stencil/sass';

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
      ]
    },
  ],
  testing: {
    browserHeadless: "new",
  },
  plugins: [
    sass(),
  ],
  rollupPlugins: {
    before: [
      {
        name: 'external-single-spa',
        resolveId(source) {
          if (source === 'single-spa') {
            return { id: source, external: true };
          }
          return null;
        },
      },
    ],
  },
};
