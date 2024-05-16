const fs = require('fs');
const _ = require('lodash');

const localeEn = fs.readFileSync('src/i18n/locale-en.json', 'utf8');
const localeFr = fs.readFileSync('src/i18n/locale-fr.json', 'utf8');

const enObj = JSON.parse(localeEn);
const frObj = JSON.parse(localeFr);

const enKeys = _.keys(enObj);
const frKeys = _.keys(frObj);

const missingKeysInFrenchBundle = _.difference(enKeys, frKeys);

const difference = {
    missingKeysInFrenchBundle
};

if (!_.isEmpty(difference.missingInFr)) {
    fs.writeFileSync('translation-validation-result.json', JSON.stringify(difference, null, 2));
    process.exit(1);
}
