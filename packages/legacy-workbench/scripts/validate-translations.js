const fs = require('fs');
const _ = require('lodash');

const localeEn = fs.readFileSync('src/i18n/locale-en.json', 'utf8');
const localeFr = fs.readFileSync('src/i18n/locale-fr.json', 'utf8');

function getAllKeys(obj, prefix = '') {
    return _.flatMap(obj, (value, key) => {
        const newPrefix = prefix ? `${prefix}.${key}` : key;
        if (_.isObject(value) && !_.isArray(value)) {
            return getAllKeys(value, newPrefix);
        }
        return newPrefix;
    });
}

const enObj = JSON.parse(localeEn);
const frObj = JSON.parse(localeFr);

const enKeys = getAllKeys(enObj);
const frKeys = getAllKeys(frObj);

const missingKeysInFrenchBundle = _.difference(enKeys, frKeys);

const difference = {
    missingKeysInFrenchBundle
};

if (!_.isEmpty(difference.missingInFr)) {
    fs.writeFileSync('translation-validation-result.json', JSON.stringify(difference, null, 2));
    process.exit(1);
}
