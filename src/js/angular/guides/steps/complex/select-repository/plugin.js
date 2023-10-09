const getRepositoryName = (services, options) => {
    return services.$repositories.getRepositories().find((repo) => repo.id === options.repositoryId) ? options.repositoryId : options.repositoryIdBase;
};

const getRepositoryElementSelector = (services, options) => {
    return services.GuideUtils.getGuideElementSelector(`repository-${getRepositoryName(services, options)}-button`);
};

PluginRegistry.add('guide.step', [
    {
        guideBlockName: 'select-repository-dropdown',
        getSteps: (options, services) => {
            const GuideUtils = services.GuideUtils;
            options.mainAction = 'select-repository';
            options.getRepositoryId = () => getRepositoryName(services, options);

            return [{
                guideBlockName: 'clickable-element',
                options: angular.extend({}, {
                    skipPoint: true,
                    content: 'guide.step_plugin.choose-repository.content',
                    elementSelector: GuideUtils.getGuideElementSelector('repositoriesGroupButton'),
                    class: 'repositories-group-button-guide-dialog',
                    onNextClick: (guide) => GuideUtils.clickOnGuideElement('repositoriesGroupButton')().then(() => guide.next())
                }, options)
            }, {
                guideBlockName: 'clickable-element',
                options: angular.extend({}, {
                    content: 'guide.step_plugin.select-repository.content',
                    elementSelector: () => {
                        return getRepositoryElementSelector(services, options);
                    },
                    class: 'repository-select-button-guide-dialog',
                    advanceOn: undefined,
                    beforeShowPromise: () => new Promise(function (resolve, reject) {
                        services.GuideUtils.waitFor(getRepositoryElementSelector(services, options), 1)
                            .then(() => resolve())
                            .catch((error) => {
                                services.toastr.error(services.$translate.instant('guide.unexpected.error.message'));
                                reject(error);
                            });
                    }),
                    show: (guide) => () => {
                        $('#repositorySelectDropdown').addClass('autoCloseOff');
                        // Added listener to the element.
                        $(getRepositoryElementSelector(services, options))
                            .on('mouseup.selectRepositoryButtonClick', function () {
                                guide.next();
                            });
                    },
                    onNextClick: (guide) => {
                        $(getRepositoryElementSelector(services, options)).off('mouseup.selectRepositoryButtonClick');
                        $('#repositorySelectDropdown').removeClass('autoCloseOff');
                        GuideUtils.clickOnElement(getRepositoryElementSelector(services, options))().then(() => guide.next());
                    },
                    hide: () => () => {
                        $('#repositorySelectDropdown').removeClass('autoCloseOff');
                        // Remove ths listener from element. It is important when step is hided.
                        $(getRepositoryElementSelector(services, options)).off('mouseup.selectRepositoryButtonClick');
                    },
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
