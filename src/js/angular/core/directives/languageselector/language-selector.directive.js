import 'angular/utils/local-storage-adapter';
angular
    .module('graphdb.framework.core.directives.languageselector.languageselector', [
        'graphdb.framework.utils.localstorageadapter'
    ])
    .directive('languageSelector', languageSelector)
    .service('$languageService', languageService);

const MENU_BTN_TRANSLATE_PREFIX = 'menu.btn.translate.';
const fileContent = require('../../../../../../src/i18n/locale-en.json');

languageSelector.$inject = ['$translate', 'LocalStorageAdapter', 'LSKeys', '$languageService'];

function languageSelector($translate, LocalStorageAdapter, LSKeys, $languageService) {
    return {
        templateUrl: 'js/angular/core/directives/languageselector/templates/languageSelector.html',
        restrict: 'E',
        link: function ($scope) {
            const userPreferredLang = LocalStorageAdapter.get(LSKeys.PREFERRED_LANG);
            const browserPreferredLanguages = navigator.languages;

            $scope.selectedLang = {};
            $scope.languages = [];

            // If some keys in i18n folder are not
            // translated they will be translated in English
            $translate.fallbackLanguage('en');

            $scope.changeLanguage = function (lang) {
                $scope.selectedLang = lang
                $translate.use(lang.key);
                LocalStorageAdapter.set(LSKeys.PREFERRED_LANG, lang.key);
                $languageService.setLanguage($scope.selectedLang.key);
                $scope.$broadcast('language-changed', {locale: lang.key});
            };

            function getPredefinedLanguages() {
                return new Promise(resolve => {
                    Object.keys(fileContent).forEach((value) => {
                        if (value.startsWith(MENU_BTN_TRANSLATE_PREFIX)) {
                            $scope.languages.push(
                                {
                                    key: value.substring(MENU_BTN_TRANSLATE_PREFIX.length),
                                    translation: value
                                });
                        }
                    });
                    setTimeout(() => {
                        resolve(true);
                    })
                })
            }

            getPredefinedLanguages()
                .then(function () {
                    // Get user preferred language from local storage adapter
                    if (userPreferredLang) {
                        $scope.selectedLang = $scope.languages.find(lang => lang.key === userPreferredLang);
                    } else if (browserPreferredLanguages) {
                        // Or browser languages ordered based on user preference
                        for (let language of browserPreferredLanguages) {
                            $scope.selectedLang = $scope.languages.find(lang => lang.key === language);
                            if ($scope.selectedLang) {
                                break;
                            }
                        }
                    } else {
                        // or fallback to English
                        $scope.selectedLang = $scope.languages.find(lang => lang.key === 'en');
                    }
                    $translate.use($scope.selectedLang.key);
                    $languageService.setLanguage($scope.selectedLang.key);
                });
        }
    };
}

function languageService() {
    this.language = 'en';
    this.setLanguage = function (lang) {
        this.language = lang;
    }

    this.getLanguage = function () {
        return this.language;
    }
}
