const getRepositoryName = (services, options) => {
    return services.$repositories.getRepositories().find((repo) => repo.id === options.repositoryId) ? options.repositoryId : options.repositoryIdBase;
};

const getRepositoryElementSelector = (services, options) => {
    return services.GuideUtils.getGuideElementSelector(`repository-id-${getRepositoryName(services, options)}`);
};

const setRepositorySelectorAutoClose = (autoClose) => {
    const component = document.querySelector('.onto-repository-selector');
    if (component) {
        // Enable auto-close when the guide step is closed.
        component.autoClose = autoClose;
    }
}

const REPOSITORIES_DEFAULT_TITLE = 'guide.step_plugin.repositories.default-title'

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
                    elementSelector: '.onto-repository-selector',
                    class: 'repositories-group-button',
                    onNextClick: GuideUtils.clickOnElement('.onto-repository-selector .onto-dropdown-button')
                }, options)
            }, {
                guideBlockName: 'clickable-element',
                options: angular.extend({}, {
                    content: 'guide.step_plugin.select-repository.content',
                    elementSelector: () => {
                        return getRepositoryElementSelector(services, options);
                    },
                    class: 'repository-select-button',
                    advanceOn: undefined,
                    beforeShowPromise: () => services.GuideUtils.waitFor(getRepositoryElementSelector(services, options), 1)
                        .catch((error) => {
                            services.toastr.error(services.$translate.instant('guide.unexpected.error.message'));
                            throw (error);
                        }),
                    show: (guide) => () => {
                        setRepositorySelectorAutoClose(false);
                        // Added listener to the element.
                        $(getRepositoryElementSelector(services, options))
                            .on('mouseup.selectRepositoryButtonClick', function () {
                                guide.next();
                            });
                    },
                    onNextClick: (guide) => {
                        $(getRepositoryElementSelector(services, options)).off('mouseup.selectRepositoryButtonClick');
                        GuideUtils.clickOnElement(getRepositoryElementSelector(services, options))().then(() => guide.next());
                    },
                    hide: () => () => {
                        setRepositorySelectorAutoClose(true);
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
        guideBlockName: 'repositories-select-repository',
        getSteps: (options, services) => {
            const GuideUtils = services.GuideUtils;
            const repositoryId = getRepositoryName(services, options);
            const selectRepositoryRowSelector = GuideUtils.getGuideElementSelector(`repository-${repositoryId}`);
            const selectRepositoryButtonWrapperSelector = `${selectRepositoryRowSelector} ${GuideUtils.getGuideElementSelector('select-repository-button-wrapper')}`;
            const selectRepositoryButtonSelector = `${selectRepositoryButtonWrapperSelector} ${GuideUtils.getGuideElementSelector('select-repository-button')}`;
            return [
                {
                    guideBlockName: 'clickable-element',
                    options: {
                        content: 'guide.step_plugin.repositories.select-repository.content',
                        // If mainAction is set the title will be set automatically
                        ...(options.mainAction ? {} : {title: REPOSITORIES_DEFAULT_TITLE}),
                        url: 'repository',
                        elementSelector: selectRepositoryButtonWrapperSelector,
                        class: 'repositories-select-repository',
                        onNextClick: () => GuideUtils.clickOnElement(selectRepositoryButtonSelector)(),
                        ...options
                    }
                }
            ]
        }
    }
]);
