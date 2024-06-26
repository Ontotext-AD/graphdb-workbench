const modules = [];

angular.module('graphdb.framework.core.services.translation-service', modules)
    .service('TranslationService', TranslationService);

TranslationService.$inject = ['$translate', '$languageService'];

function TranslationService($translate, $languageService) {

    const supportedLanguages = $languageService.getSupportedLanguages();
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
