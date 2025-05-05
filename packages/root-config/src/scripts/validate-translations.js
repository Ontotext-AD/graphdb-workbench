/* eslint-disable no-console, no-undef, quotes */
const fs = require('fs');
const path = require('path');
const _ = require('lodash');
// Either use SCRIPT_ROOT env param, or go up 4 levels to project root where packages/ lives
const baseDir = process.env.SCRIPT_ROOT || path.resolve(__dirname, '..', '..', '..', '..');
const packagesDir = path.join(baseDir, 'packages');

// Verified identical translations - no warnings or errors about them
const identicalTranslations = [
  "#",
  "Active",
  "Action",
  "Actions",
  "Agent: {{agentName}}",
  "BNodes",
  "Base IRI",
  "ChatGPT Retrieval",
  "ClientID*",
  "Cluster",
  "Cookies",
  "Document",
  "Documentation",
  "Description",
  "Format",
  "GraphQL",
  "GraphQL Playground",
  "IRI",
  "Id",
  "Local",
  "Mode",
  "Pause",
  "Performance",
  "Plugins",
  "Port",
  "ROLE1",
  "star-wars",
  "Star Wars",
  "Secret*",
  "Signature",
  "Support",
  "Top P",
  "Type:",
  "Type",
  "type",
  "Types",
  "Google Analytics (GA4)",
  "Index",
  "<div><span class=\"graph\">GRAPH</span><span class=\"wise\">WISE</span></div><div class=\"thrives\">AI THRIVES ON WHOLE DATA</div>",

  // File formats:
  "JSON",
  "JSON-LD",
  "NDJSON-LD",
  "SPARQL",
  "RDF",
  "RDF-XML",
  "JDBC",
  "Turtle",
  "Turtle*",
  "TriG",
  "TriG*",
  "TriX",
  "N3",
  "N-Triples",
  "N-Quads",

  // Repository types
  "Graphdb",
  "Ontop",
  "FedX",

  // No text - maybe they should never be translated?
  "{{abort}}",
  "{{progressMessage}}... {{timeHuman}}",
  "\n{{extraMessage}}",
  "{{n}}/{{nn}}",
  "{{'ttyg.helpInfo'|translate|trustAsHtml}}",
  "{{'ttyg.help.how.content2'|translate|trustAsHtml}}",
  "{{'ttyg.helpInfo'|translate|trustAsHtml}}",
  "",

  // Example values below - maybe they should never be translated?
  "http://example.com/context.jsonld",
  "http://example.com/frame.jsonld",
  "http://my-hostname:7200",
  "node-name:7300"
];

// Unverified identical or TO DO translations - printed as warnings
const toDoTranslations = [
  "A SPARQL CONSTRUCT query that returns the entire ontology or a subset sufficient to generate useful SPARQL queries.",
  "Account identifier",
  "Attach a remote GraphDB instance",
  "Dark", // Theme
  "Datatype",
  "Error retrieving RPC address: {{error}}",
  "Hit",
  "HttpPath",
  "Label IRI",
  "Leader", // we should decide if it's "leader" or "dirigeant" (we have both in the current translation)
  "Nullable",
  "Query copied successfully to clipboard.",
  "Saved SPARQL template",
  "Use <b>View resource</b> on this page",
  "Warehouse",
  "horizontal"
];

/**
 * Recursively collect all keys and values from a nested object.
 */
function getAllKeys(obj, valuesObj, prefix = '') {
  return _.flatMap(obj, (value, key) => {
    const newPrefix = prefix ? `${prefix}.${key}` : key;
    valuesObj[newPrefix] = value;
    if (_.isObject(value) && !_.isArray(value)) {
      return getAllKeys(value, valuesObj, newPrefix);
    }
    return newPrefix;
  });
}

/**
 * Detect differences in HTML tags between two strings.
 */
function hasHtmlTagDifference(en, fr) {
  function tagDiff(a, b) {
    const re = /(<[^<>]+>)/g;
    return _.difference(a.match(re), b.match(re));
  }
  if (!en || !fr) {
    return false;
  }
  return !_.isEmpty(tagDiff(en, fr)) || !_.isEmpty(tagDiff(fr, en));
}

/**
 * Detect differences in placeholders like {{…}} between two strings.
 */
function hasPlaceholderDifference(en, fr) {
  function placeholderDiff(a, b) {
    const re = /(\{\{.+?}})/g;
    return _.difference(a.match(re), b.match(re));
  }
  if (!en || !fr) {
    return false;
  }
  return !_.isEmpty(placeholderDiff(en, fr)) || !_.isEmpty(placeholderDiff(fr, en));
}

/**
 * Determine if a translation is untranslated (identical to English and not in identical/TODO lists).
 */
function isUntranslated(en, fr) {
  if (en === fr) {
    const isIdentical = identicalTranslations.indexOf(en) !== -1;
    const isTodo = toDoTranslations.indexOf(en) !== -1;
    if (isTodo) {
      console.warn("TODO translate: " + en);
    }
    return !isIdentical && !isTodo;
  } else if (toDoTranslations.indexOf(en) !== -1) {
    console.warn("TODO no longer identical - remove from TODO list: " + en + " => " + fr);
  }
  return false;
}

/**
 * Validate a translation bundle against English.
 */
function validate(enObj, frObj) {
  function compare(en, fr, fn) {
    if (fn(en, fr)) {
      return { en, fr };
    }
  }

  const enValues = {};
  const enKeys = getAllKeys(enObj, enValues);
  const frValues = {};
  const frKeys = getAllKeys(frObj, frValues);

  const missingKeys = _.difference(enKeys, frKeys);
  const obsoleteKeys = _.difference(frKeys, enKeys);

  const htmlTagDifferences = {};
  const placeholderDifferences = {};
  const untranslated = {};

  enKeys.forEach((key) => {
    const en = enValues[key];
    const fr = frValues[key];

    const htmlDiff = compare(en, fr, hasHtmlTagDifference);
    if (htmlDiff) {
      htmlTagDifferences[key] = htmlDiff;
    }
    const pDiff = compare(en, fr, hasPlaceholderDifference);
    if (pDiff) {
      placeholderDifferences[key] = pDiff;
    }
    const untranslatedKey = compare(en, fr, isUntranslated);
    if (untranslatedKey) {
      untranslated[key] = untranslatedKey;
    }
  });
  const isValid = _.isEmpty(missingKeys) && _.isEmpty(obsoleteKeys) && _.isEmpty(htmlTagDifferences) && _.isEmpty(placeholderDifferences) && _.isEmpty(untranslated);
  return {
    isValid,
    missingKeys,
    obsoleteKeys,
    htmlTagDifferences: htmlTagDifferences,
    placeholderDifferences: placeholderDifferences,
    untranslated
  };
}

/**
 * Merge all i18n JSON files from 'src/assets/i18n' or 'src/i18n' under each package,
 * accept only 'xx.json' or 'locale-xx.json', track origin package for each key.
 */
function mergeTranslationBundles() {
  const packagesNames = fs
    .readdirSync(packagesDir)
    .filter(name => {
      const fullPath = path.join(packagesDir, name);
      return fs.statSync(fullPath).isDirectory() && name !== 'legacy-workbench';
    });

  const bundles = {};
  const origins = {};
  const localeRegex = /^(?:locale-)?([a-z]{2})\.json$/;

  packagesNames.forEach(pkg => {
    const pkgRoot = path.join(packagesDir, pkg);
    const candidateDirs = [
      path.join(pkgRoot, 'src', 'assets', 'i18n'),
      path.join(pkgRoot, 'src', 'i18n'),
    ];

    candidateDirs.forEach(dir => {
      if (fs.existsSync(dir) && fs.statSync(dir).isDirectory()) {
        fs.readdirSync(dir).forEach(file => {
          const matchArray = file.match(localeRegex);
          if (!matchArray) {
            return;
          }
          const lang = matchArray[1];
          const content = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'));
          const flat = {};
          getAllKeys(content, flat);
          bundles[lang] = bundles[lang] || {};
          origins[lang] = origins[lang] || {};
          Object.entries(flat).forEach(([key, val]) => {
            origins[lang][key] = origins[lang][key] || [];
            origins[lang][key].push(pkg);
            if (!bundles[lang][key]) {
              bundles[lang][key] = val;
            }
          });
        });
      }
    });
  });

  return { bundles, origins };
}

function main() {
  const { bundles, origins } = mergeTranslationBundles();
  const enBundle = bundles['en'] || {};
  const enOrigins = origins['en'] || {};

  // Build conflict groups
  const conflictGroups = {};
  Object.entries(origins).forEach(([lang, map]) => {
    conflictGroups[lang] = {};
    Object.entries(map).forEach(([key, packages]) => {
      if (packages.length > 1) {
        const conflictedPackages = [...packages].sort().join(',');
        conflictGroups[lang][conflictedPackages] = conflictGroups[lang][conflictedPackages] || { duplicatedKeys: [] };
        conflictGroups[lang][conflictedPackages].duplicatedKeys.push(key);
      }
    });
  });

  // Validate translations
  const reports = {};
  let hasErrors = false;

  Object.entries(bundles).forEach(([lang, bundle]) => {
    if (lang === 'en') {
      return;
    }
    const res = validate(enBundle, bundle);
    Object.entries(res).forEach(([type, data]) => {
      if (type === 'isValid' || _.isEmpty(data)){
        return;
      }
      hasErrors = true;
      if (Array.isArray(data)) {
        data.forEach(key => {
          const owners = type === 'missingKeys' ? enOrigins[key] : origins[lang][key];
          owners.forEach(pkg => {
            reports[pkg] = reports[pkg] || {};
            reports[pkg][lang] = reports[pkg][lang] || {};
            reports[pkg][lang][type] = reports[pkg][lang][type] || [];
            reports[pkg][lang][type].push(key);
          });
        });
      } else {
        Object.entries(data).forEach(([key, diff]) => {
          const owners = enOrigins[key];
          owners.forEach(pkg => {
            reports[pkg] = reports[pkg] || {};
            reports[pkg][lang] = reports[pkg][lang] || {};
            reports[pkg][lang][type] = reports[pkg][lang][type] || {};
            reports[pkg][lang][type][key] = diff;
          });
        });
      }
    });
  });

  // Always write report with conflictGroups and reports
  const reportName = 'translation-report.json';
  const reportPath = path.join(baseDir, reportName);
  fs.writeFileSync(reportPath, JSON.stringify({ conflictGroups, reports }, null, 2));

  if (hasErrors) {
    if (process.env.CI) {
      console.error('Issues found. Report available in Jenkins build artifacts.');
    } else {
      console.error(`Issues found. See ${reportPath}`);
    }
    process.exit(1);
  } else {
    console.info('All translations are valid across projects.');
    process.exit(0);
  }
}

if (require.main === module) {
  console.info(`Using baseDir: ${baseDir}`);
  main();
}

module.exports = {
  getAllKeys,
  hasHtmlTagDifference,
  hasPlaceholderDifference,
  isUntranslated,
  validate,
  mergeTranslationBundles,
};
