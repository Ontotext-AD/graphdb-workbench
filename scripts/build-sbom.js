// Writes dist/sbom.cdx.json, the CycloneDX 1.6 SBOM of the Workbench build.
//
// - npm packages: cyclonedx-npm --omit dev, for each package with its own lockfile.
// - Libraries outside npm: the hand-written SBOMs in MERGED_SBOMS.
//
// Fails the build when the SBOM is not valid CycloneDX 1.6, a component has no name,
// version or purl, the AngularJS fork is missing or listed under the upstream name,
// or cyclonedx-npm lists a dev-only dependency.

const { execFileSync } = require('child_process');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const CDX = require('@cyclonedx/cyclonedx-library');

const ROOT = path.resolve(__dirname, '..');
const OUTPUT = path.join(ROOT, 'dist/sbom.cdx.json');
const CYCLONEDX_NPM = path.join(ROOT, 'node_modules/.bin/cyclonedx-npm');

const NPM_PACKAGES = [
  '.',
  'packages/api',
  'packages/legacy-workbench',
  'packages/root-config',
  'packages/shared-components',
  'packages/workbench'
];

const MERGED_SBOMS = [
  'sbom/vendored-libraries.cdx.json'
];

const SUPPLIER = { name: 'Ontotext', url: ['https://www.ontotext.com/'] };
const ANGULAR_FORK_GROUP = '@ontotext';
const ANGULAR_FORK_UPSTREAM_VERSION = '1.3.20';
const PACKAGE_PATH_PROPERTY = 'cdx:npm:package:path';
const EXTRANEOUS_PROPERTY = 'cdx:npm:package:extraneous';

function hasProperty(component, name) {
  return (component.properties || []).some((property) => property.name === name && property.value === 'true');
}

/**
 * Runs cyclonedx-npm in a package. Leaves out extraneous packages, which an earlier install left
 * in node_modules and no package.json requires, and the packages only they depend on.
 */
function runCycloneDxNpm(packageDir) {
  const output = execFileSync(CYCLONEDX_NPM, [
    '--omit', 'dev',
    '--flatten-components',
    '--spec-version', '1.6',
    '--output-format', 'JSON'
  ], { cwd: path.join(ROOT, packageDir), encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  const sbom = JSON.parse(output);
  const required = requiredRefs(sbom);
  sbom.components = sbom.components.filter((component) => required.has(component['bom-ref']));
  return sbom;
}

function requiredRefs(sbom) {
  const extraneous = new Set(sbom.components
    .filter((component) => hasProperty(component, EXTRANEOUS_PROPERTY))
    .map((component) => component['bom-ref']));
  const dependsOn = new Map((sbom.dependencies || []).map((dependency) => [dependency.ref, dependency.dependsOn || []]));
  const required = new Set();
  const pending = [sbom.metadata.component['bom-ref']];
  while (pending.length) {
    const ref = pending.pop();
    if (!required.has(ref) && !extraneous.has(ref)) {
      required.add(ref);
      pending.push(...(dependsOn.get(ref) || []));
    }
  }
  return required;
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, file), 'utf8'));
}

function allComponents(components = []) {
  return components.flatMap((component) => [component, ...allComponents(component.components)]);
}

function isAngularFork(component) {
  return component.group === ANGULAR_FORK_GROUP && component.name.startsWith('angular');
}

/**
 * Records that an @ontotext/angular* package is a fork of the upstream AngularJS package.
 */
function withAngularForkPedigree(component) {
  if (!isAngularFork(component)) {
    return component;
  }
  const upstream = {
    type: 'library',
    name: component.name,
    version: ANGULAR_FORK_UPSTREAM_VERSION,
    purl: `pkg:npm/${component.name}@${ANGULAR_FORK_UPSTREAM_VERSION}`
  };
  return { ...component, pedigree: { ancestors: [upstream] } };
}

function fullName(component) {
  return component.group ? `${component.group}/${component.name}` : component.name;
}

/**
 * Collects name@version of the packages that the lockfiles install for production.
 * A package is dev-only when every lockfile marks it as dev.
 */
function productionPackages() {
  const packages = new Set();
  for (const packageDir of NPM_PACKAGES) {
    const lockfile = readJson(path.join(packageDir, 'package-lock.json'));
    for (const [location, entry] of Object.entries(lockfile.packages)) {
      if (!location || entry.dev || entry.link) {
        continue;
      }
      const name = entry.name || location.slice(location.lastIndexOf('node_modules/') + 'node_modules/'.length);
      packages.add(`${name}@${entry.version}`);
    }
  }
  return packages;
}

class SbomBuilder {
  constructor(rootSbom) {
    this.root = { ...rootSbom.metadata.component, supplier: SUPPLIER };
    this.tools = rootSbom.metadata.tools;
    this.components = new Map();
    this.dependencies = new Map();
  }

  /**
   * Adds the components of an SBOM, keyed by purl, and its dependency graph.
   * The SBOM's own component maps to the component with the same purl, or to the Workbench.
   */
  add(sbom) {
    const refs = new Map();
    const ownComponent = sbom.metadata && sbom.metadata.component;
    const components = allComponents(sbom.components);
    for (const component of components) {
      const ref = component.purl || component['bom-ref'];
      refs.set(component['bom-ref'], ref);
      if (!this.components.has(ref)) {
        this.components.set(ref, this.flatten(component, ref));
      }
    }
    if (ownComponent) {
      const ownRef = ownComponent.purl && this.components.has(ownComponent.purl) ? ownComponent.purl : this.root['bom-ref'];
      refs.set(ownComponent['bom-ref'], ownRef);
    }
    for (const dependency of (sbom.dependencies || []).filter((candidate) => refs.has(candidate.ref))) {
      const dependsOn = (dependency.dependsOn || []).filter((ref) => refs.has(ref)).map((ref) => refs.get(ref));
      this.dependOn(refs.get(dependency.ref), dependsOn);
    }
    if (!ownComponent) {
      this.dependOn(this.root['bom-ref'], (sbom.components || []).map((component) => refs.get(component['bom-ref'])));
    }
  }

  /**
   * Copies a component without its nested components, which are added on their own, and without
   * its path in node_modules, which differs between the packages.
   */
  flatten(component, ref) {
    const flat = { ...component, 'bom-ref': ref };
    delete flat.components;
    const properties = (component.properties || []).filter((property) => property.name !== PACKAGE_PATH_PROPERTY);
    if (properties.length) {
      flat.properties = properties;
    } else {
      delete flat.properties;
    }
    return withAngularForkPedigree(flat);
  }

  dependOn(ref, dependsOn) {
    const existing = this.dependencies.get(ref) || new Set();
    dependsOn.forEach((dependency) => existing.add(dependency));
    this.dependencies.set(ref, existing);
  }

  build() {
    return {
      bomFormat: 'CycloneDX',
      specVersion: '1.6',
      serialNumber: `urn:uuid:${crypto.randomUUID()}`,
      version: 1,
      metadata: {
        timestamp: new Date().toISOString(),
        tools: this.tools,
        authors: [{ name: SUPPLIER.name }],
        supplier: SUPPLIER,
        component: this.root
      },
      components: [...this.components.values()],
      dependencies: [...this.dependencies.entries()].map(([ref, dependsOn]) => ({ ref, dependsOn: [...dependsOn] }))
    };
  }
}

function checkComponents(sbom) {
  const problems = [];
  const components = allComponents(sbom.components);
  for (const component of components) {
    if (!component.name || !component.version || !component.purl) {
      problems.push(`${component['bom-ref']} has no name, version or purl`);
    }
  }

  const angularFork = components.filter(isAngularFork);
  if (!angularFork.some((component) => component.name === 'angular')) {
    problems.push(`${ANGULAR_FORK_GROUP}/angular is missing`);
  }
  for (const fork of angularFork) {
    const upstream = components.filter((component) => !component.group && component.name === fork.name);
    upstream.forEach((component) => problems.push(`${component.purl} is listed instead of the fork ${fork.purl}`));
  }
  return problems;
}

function checkNoDevDependencies(npmSboms) {
  const production = productionPackages();
  return npmSboms
    .flatMap((sbom) => allComponents(sbom.components))
    .filter((component) => !production.has(`${fullName(component)}@${component.version}`))
    .map((component) => `${component.purl} is a dev-only dependency`);
}

async function validateSchema(sbom) {
  const validator = new CDX.Validation.JsonStrictValidator(CDX.Spec.Version.v1dot6);
  const errors = await validator.validate(JSON.stringify(sbom));
  return errors ? [`not valid CycloneDX 1.6: ${JSON.stringify(errors, null, 2)}`] : [];
}

async function main() {
  const npmSboms = NPM_PACKAGES.map(runCycloneDxNpm);
  const builder = new SbomBuilder(npmSboms[0]);
  npmSboms.forEach((sbom) => builder.add(sbom));
  MERGED_SBOMS.map(readJson).forEach((sbom) => builder.add(sbom));
  const sbom = builder.build();

  const problems = [...await validateSchema(sbom), ...checkComponents(sbom), ...checkNoDevDependencies(npmSboms)];
  if (problems.length) {
    console.error(`[ERROR] ${path.relative(ROOT, OUTPUT)}:\n  ${problems.join('\n  ')}`);
    process.exit(1);
  }

  fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
  fs.writeFileSync(OUTPUT, JSON.stringify(sbom, null, 2));
  console.info(`${path.relative(ROOT, OUTPUT)}: ${sbom.components.length} components`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
