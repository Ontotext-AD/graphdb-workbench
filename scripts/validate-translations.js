/* eslint-disable no-console,no-undef */
const fs = require('fs');
const _ = require('lodash');

const localeEn = fs.readFileSync('src/i18n/locale-en.json', 'utf8');
const localeFr = fs.readFileSync('src/i18n/locale-fr.json', 'utf8');

// Verified identical translations - no warnings or errors about them
const identicalTranslations = [
    "#",
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
    "Format",
    "IRI",
    "Id",
    "Local",
    "Mode",
    "Pause",
    "Performance",
    "Plugins",
    "Port",
    "ROLE1",
    "Secret*",
    "Signature",
    "Support",
    "Top P",
    "Type:",
    "type",
    "Google Analytics (GA4)",
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
    "http://my-hostname:7200"
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

function isUntranslated(en, fr) {
    if (en === fr) {
        const isIdentical = identicalTranslations.indexOf(en) !== -1;
        const isTodo = toDoTranslations.indexOf(en) !== -1;
        if (isTodo) {
            console.warn("TODO translate: " + en);
        }
        return !isIdentical && !isTodo;
    } else if (toDoTranslations.indexOf(en) !== -1) {
        console.warn("TODO translate no longer identical - remove from TODO list: " + en + " => " + fr);
    }
}

function validate(enObj, frObj) {
    function compare(en, fr, compareFn) {
        if (compareFn(en, fr)) {
            return {en, fr};
        }
    }

    const enValues = {};
    const enKeys = getAllKeys(enObj, enValues);
    const frValues = {};
    const frKeys = getAllKeys(frObj, frValues);

    const missingKeysInFrenchBundle = _.differenceWith(enKeys, frKeys);
    const obsoleteKeysInFrenchBundle = _.differenceWith(frKeys, enKeys);

    const htmlTagDifferences = {};
    const placeholderDifferences = {};
    const untranslatedKeys = {};

    enKeys.forEach((key, i, enKeys) => {
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

        const untr = compare(en, fr, isUntranslated);
        if (untr) {
            untranslatedKeys[key] = untr;
        }
    });

    const isValid = _.isEmpty(missingKeysInFrenchBundle)
        && _.isEmpty(obsoleteKeysInFrenchBundle)
        && _.isEmpty(htmlTagDifferences)
        && _.isEmpty(placeholderDifferences)
        && _.isEmpty(untranslatedKeys);

    return {
        isValid,
        missingKeysInFrenchBundle,
        obsoleteKeysInFrenchBundle,
        htmlTagDifference: htmlTagDifferences,
        placeholderDifference: placeholderDifferences,
        untranslated: untranslatedKeys
    };
}

const enObj = JSON.parse(localeEn);
const frObj = JSON.parse(localeFr);

const report = validate(enObj, frObj);

if (!report.isValid) {
    const reportJson = JSON.stringify(report, null, 2);
    console.error("Problems with translation:");
    console.error(reportJson);
    fs.writeFileSync('translation-validation-result.json', reportJson);
    process.exit(1);
}
