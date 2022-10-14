PluginRegistry.add('guide.step', [
    {
        guideBlockName: 'select-repository-dropdown',
        getSteps: (options, services) => {
            const GuideUtils = services.GuideUtils;
            options.mainAction = 'select-repository';

            const repositoryButtonSelector = GuideUtils.getGuideElementSelector(`repository-${options.repositoryId}-button`);
            return [{
                guideBlockName: 'clickable-element',
                options: angular.extend({}, {
                    skipPoint: true,
                    content: 'guide.step_plugin.choose-repository.content',
                    elementSelector: GuideUtils.getGuideElementSelector('repositoriesGroupButton'),
                    onNextClick: (guide) => GuideUtils.clickOnGuideElement('repositoriesGroupButton')().then(() => guide.next())
                }, options)
            }, {
                guideBlockName: 'clickable-element',
                options: angular.extend({}, {
                    content: 'guide.step_plugin.select-repository.content',
                    elementSelector: repositoryButtonSelector,
                    beforeShowPromise: () => new Promise(function (resolve, reject) {
                        services.GuideUtils.waitFor(repositoryButtonSelector, 1)
                            .then(() => resolve())
                            .catch((error) => {
                                services.toastr.error(services.$translate.instant('guide.unexpected.error.message'));
                                reject(error);
                            });
                    }),
                    onNextClick: (guide) => GuideUtils.clickOnGuideElement(`repository-${options.repositoryId}-button`)().then(() => guide.next()),
                    canBePaused: false
                }, options)
            }
            ];
        }
    },
    {
        guideBlockName: 'select-repository-plug',
        getSteps: (options, services) => {
            const GuideUtils = services.GuideUtils;
            return [{
                guideBlockName: 'clickable-element',
                options: angular.extend({}, {
                    content: 'guide.step_plugin.select-repository-plug.content',
                    elementSelector: GuideUtils.getGuideElementSelector(`repository-${options.repositoryId}-plug`),
                    onNextClick: GuideUtils.getGuideElementSelector(`repository-${options.repositoryId}-plug`)
                }, options)
            }
            ];
        }
    }
]);
