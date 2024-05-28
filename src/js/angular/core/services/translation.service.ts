import * as angular from 'angular';
const modules = [];

angular.module('graphdb.framework.core.services.translation-service', modules)
    .service('TranslationService', TranslationService);

TranslationService.$inject = ['$translate'];

function TranslationService($translate) {

    const supportedLanguages = ['en', 'fr'];
    let allTranslations;

    const getTranslations = () => {
        if (!allTranslations) {
            allTranslations = {};
            supportedLanguages.forEach((langKey) => {
                return allTranslations[langKey] = $translate.getTranslationTable(langKey);
            });
        }
        return allTranslations;
    };

    return {
        getTranslations
    };
}
