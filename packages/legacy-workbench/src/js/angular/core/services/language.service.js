/**
 * @ngdoc provider
 * @name $languageServiceProvider
 * @module graphdb.framework.core.services.language-service
 * @description
 * Provider for configuring and accessing language settings in the application.
 * This provider allows configuring default and available languages during the
 * application configuration phase.
 */
angular.module('graphdb.framework.core.services.language-service', [])
    .provider('$languageService', function () {
        const LANGUAGES = __LANGUAGES__ || {
            defaultLanguage: 'en',
            availableLanguages: [{key: 'en', name: 'English'}]
        };
        let language = LANGUAGES.defaultLanguage;

        this.getDefaultLanguage = function () {
            return LANGUAGES.defaultLanguage;
        };

        this.$get = function () {
            const setLanguage = (lang) => {
                language = lang;
            };

            const getLanguage = () => language;
            const getDefaultLanguage = () => LANGUAGES.defaultLanguage;
            const getAvailableLanguages = () => LANGUAGES.availableLanguages;
            const getSupportedLanguages = () => LANGUAGES.availableLanguages.map((lang) => lang.key);

            return {
                setLanguage,
                getLanguage,
                getDefaultLanguage,
                getAvailableLanguages,
                getSupportedLanguages
            };
        };
    });
