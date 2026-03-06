#!/usr/bin/env node

/**
 * build-themes.js
 *
 * Reads all CSS custom properties (variables) from the graphwise-styleguide
 * distribution files and copies them into the project's theme CSS files:
 *
 *   node_modules/graphwise-styleguide/dist/variables-light.css  →  src/css/light-mode.css
 *   node_modules/graphwise-styleguide/dist/variables-dark.css   →  src/css/dark-mode.css
 */

'use strict';

const fs = require('fs');
const path = require('path');

const DIST_DIR = path.resolve(__dirname, '../../node_modules/graphwise-styleguide/dist');
const CSS_DIR = path.resolve(__dirname, '../css');

const THEMES = [
  {
    src: path.join(DIST_DIR, 'variables-light.css'),
    dest: path.join(CSS_DIR, 'light-mode.css'),
    selector: ':root'
  },
  {
    src: path.join(DIST_DIR, 'variables-dark.css'),
    dest: path.join(CSS_DIR, 'dark-mode.css'),
    selector: ':root.dark'
  }
];

/**
 * Extracts the inner content (everything between the first `{` and the matching
 * closing `}`) of the first rule block found in the given CSS source string.
 *
 * @param {string} css - Raw CSS source text.
 * @returns {string} The indented variable declarations, preserving comments.
 */
function extractVariables(css) {
  const openIdx = css.indexOf('{');
  if (openIdx === -1) {
    throw new Error('No opening brace found in source CSS.');
  }

  let depth = 0;
  let closeIdx = -1;

  for (let i = openIdx; i < css.length; i++) {
    if (css[i] === '{') {
      depth++;
    } else if (css[i] === '}') {
      depth--;
      if (depth === 0) {
        closeIdx = i;
        break;
      }
    }
  }

  if (closeIdx === -1) {
    throw new Error('No matching closing brace found in source CSS.');
  }

  // Return the content between the braces (trim trailing whitespace/newlines).
  return css.slice(openIdx + 1, closeIdx).replace(/\n+$/, '\n');
}

/**
 * Builds the output CSS file content.
 *
 * @param {string} selector - The CSS selector, e.g. `:root` or `:root.dark`.
 * @param {string} variables - The raw variable block content.
 * @returns {string}
 */
function buildOutput(selector, variables) {
  return [
    '/**',
    ' * Do not edit directly, this file was auto-generated.',
    ' */',
    '',
    `${selector} {`,
    variables,
    '}',
    ''
  ].join('\n');
}

let hasError = false;

for (const theme of THEMES) {
  try {
    console.log(`Processing: ${path.relative(process.cwd(), theme.src)}`);

    if (!fs.existsSync(theme.src)) {
      throw new Error(`Source file not found: ${theme.src}`);
    }

    const srcCss = fs.readFileSync(theme.src, 'utf8');
    const variables = extractVariables(srcCss);
    const output = buildOutput(theme.selector, variables);

    fs.mkdirSync(path.dirname(theme.dest), {recursive: true});
    fs.writeFileSync(theme.dest, output, 'utf8');

    console.log(`  ✔  Written: ${path.relative(process.cwd(), theme.dest)}`);
  } catch (err) {
    console.error(`  ✖  Error processing ${path.basename(theme.src)}: ${err.message}`);
    hasError = true;
  }
}

if (hasError) {
  process.exit(1);
}

