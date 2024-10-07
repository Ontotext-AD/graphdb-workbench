import 'angular/utils/local-storage-adapter';
import 'angular/core/services/event-emitter-service';
angular
    .module('graphdb.framework.core.directives.languageselector.languageselector', [
        'graphdb.framework.utils.localstorageadapter', 'graphdb.framework.utils.event-emitter-service'
    ])
    .directive('languageSelector', languageSelector)
    .service('$languageService', [languageService]);

languageSelector.$inject = ['$translate', 'LocalStorageAdapter', 'LSKeys', '$languageService', 'EventEmitterService'];

function languageSelector($translate, LocalStorageAdapter, LSKeys, $languageService, eventEmitterService) {
    return {
        templateUrl: 'js/angular/core/directives/languageselector/templates/languageSelector.html',
        restrict: 'E',
        link: function ($scope) {
            const userPreferredLang = LocalStorageAdapter.get(LSKeys.PREFERRED_LANG);
            const browserPreferredLanguages = navigator.languages;

            $scope.selectedLang = {};
            $scope.languages = [
                {
                    key: 'en',
                    name: 'English'
                },
                {
                    key: 'fr',
                    name: 'Français'
            }];

            // If some keys in i18n folder are not
            // translated they will be translated in English
            $translate.fallbackLanguage('en');

            function setAndPersistLanguage(lang) {
                $scope.selectedLang = lang;
                $translate.use(lang.key);
                LocalStorageAdapter.set(LSKeys.PREFERRED_LANG, lang.key);
                $languageService.setLanguage($scope.selectedLang.key);
                $scope.$broadcast('language-changed', {locale: lang.key});
            }

            $scope.changeLanguage = function (lang) {
                if ($languageService.getLanguage() !== lang.key) {
                    const eventData = {locale: lang.key, cancel: false};
                    eventEmitterService.emit('before-language-change', eventData, (eventData) => {
                        if (!eventData || !eventData.cancel) {
                           setAndPersistLanguage(lang);
                        }
                    });
                }
            };

            $scope.getLanguageTooltip = function (lang) {
                if (!lang || !$scope.selectedLang) {
                    return '';
                }
                if ($scope.selectedLang.key !== lang.key) {
                    return $translate.instant('change.language.tooltip', {}, undefined, lang.key) + ' ' + lang.name;
                } else {
                    return $translate.instant('current.language.tooltip', {}, undefined, lang.key);
                }
            };

            function getPreferredLanguage() {
                return new Promise((resolve) => {
                    // Get user preferred language from local storage adapter
                    if (userPreferredLang) {
                        $scope.selectedLang = $scope.languages.find((lang) => lang.key === userPreferredLang);
                    } else if (browserPreferredLanguages) {
                        // Or browser languages ordered based on user preference
                        for (const language of browserPreferredLanguages) {
                            $scope.selectedLang = $scope.languages.find((lang) => lang.key === language);
                            if ($scope.selectedLang) {
                                break;
                            }
                        }
                    }
                    setTimeout(() => {
                        resolve(true);
                    });
                });
            }

            getPreferredLanguage()
                .then(function () {
                    if (!$scope.selectedLang) {
                        // or fallback to English
                        $scope.selectedLang = $scope.languages.find((lang) => lang.key === 'en');
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
    };

    this.getLanguage = function () {
        return this.language;
    };
}
