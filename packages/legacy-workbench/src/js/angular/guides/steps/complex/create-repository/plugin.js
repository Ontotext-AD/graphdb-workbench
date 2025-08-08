const REPOSITORIES_CREATE_DEFAULT_TITLE = 'guide.step-action.create-repository';

PluginRegistry.add('guide.step', [
    {
        guideBlockName: 'repositories-create-repository',
        getSteps: (options, services) => {
            const GuideUtils = services.GuideUtils;
            return [
                {
                    guideBlockName: 'clickable-element',
                    options: {
                        content: 'guide.step_plugin.create_repository.create_repository_button.content',
                        // If mainAction is set the title will be set automatically
                        ...(options.mainAction ? {} : { title: REPOSITORIES_CREATE_DEFAULT_TITLE }),
                        class: 'create-repository',
                        ...options,
                        url: 'repository',
                        elementSelector: GuideUtils.getGuideElementSelector('createRepository'),
                        onNextClick: GuideUtils.clickOnGuideElement('createRepository')
                    }
                }
            ];
        }
    },
    {
        guideBlockName: 'repositories-create-graphdb',
        getSteps: (options, services) => {
            const GuideUtils = services.GuideUtils;
            return [
                {
                    guideBlockName: 'clickable-element',
                    options: {
                        content: 'guide.step_plugin.create_repository.graph_db_repository.content',
                        // If mainAction is set the title will be set automatically
                        ...(options.mainAction ? {} : { title: REPOSITORIES_CREATE_DEFAULT_TITLE }),
                        class: 'create-gdb-repository',
                        ...options,
                        url: 'repository/create',
                        elementSelector: GuideUtils.getGuideElementSelector('createGraphDBRepository'),
                        disablePreviousFlow: false,
                        onNextClick: GuideUtils.clickOnGuideElement('createGraphDBRepository')
                    }
                }
            ];
        }
    },
    {
        guideBlockName: 'repositories-id-input',
        getSteps: (options, services) => {
            const GuideUtils = services.GuideUtils;
            const repositoryIdInputSelector = GuideUtils.getGuideElementSelector('graphDBRepositoryIdInput');
            return [
                {
                    guideBlockName: 'input-element',
                    options: {
                        content: 'guide.step_plugin.create_repository.repository_id.content',
                        // If mainAction is set the title will be set automatically
                        ...(options.mainAction ? {} : { title: REPOSITORIES_CREATE_DEFAULT_TITLE }),
                        class: 'gdb-repository-id-input',
                        ...options,
                        url: 'repository/create/graphdb',
                        elementSelector: repositoryIdInputSelector,
                        disablePreviousFlow: false,
                        onNextValidate: () =>
                            Promise.resolve(
                                GuideUtils.validateTextInput(
                                    repositoryIdInputSelector,
                                    options.repositoryId
                                )
                            )
                    }
                }
            ];
        }
    },
    {
        guideBlockName: 'repositories-ruleset-dropdown',
        getSteps: (options, services) => {
            const GuideUtils = services.GuideUtils;
            const repositoryIdInputSelector = GuideUtils.getGuideElementSelector('graphDBRepositoryIdInput');
            return [
                {
                    guideBlockName: 'clickable-element',
                    options: {
                        content: 'guide.step_plugin.create_repository.ruleset_dropdown.content',
                        // If mainAction is set the title will be set automatically
                        ...(options.mainAction ? {} : { title: REPOSITORIES_CREATE_DEFAULT_TITLE }),
                        class: 'gdb-repository-ruleset-select',
                        ...options,
                        url: 'repository/create/graphdb',
                        elementSelector: GuideUtils.getGuideElementSelector('graphDBRepositoryRulesetSelect'),
                        disablePreviousFlow: false,
                        show: () => () => {
                            GuideUtils.validateTextInput(repositoryIdInputSelector, options.repositoryId);
                        }
                    }
                }
            ];
        }
    },
    {
        guideBlockName: 'repositories-enable-fts',
        getSteps: (options, services) => {
            const GuideUtils = services.GuideUtils;
            return [
                {
                    guideBlockName: 'clickable-element',
                    options: {
                        content: 'guide.step_plugin.create_repository.enable-fts.content',
                        // If mainAction is set the title will be set automatically
                        ...(options.mainAction ? {} : { title: REPOSITORIES_CREATE_DEFAULT_TITLE }),
                        class: 'gdb-repository-enable-fts',
                        extraContent: 'guide.step_plugin.create_repository.enable-fts.extra-content',
                        extraContentClass: 'alert alert-help text-left',
                        ...options,
                        url: 'repository/create/graphdb',
                        elementSelector: GuideUtils.getGuideElementSelector('enable-fts-search'),
                        disablePreviousFlow: false,
                        onNextValidate: () =>
                            Promise.resolve(
                                GuideUtils.isChecked(
                                    GuideUtils.getGuideElementSelector('enable-fts-search', 'input')
                                )
                            )
                    }
                }
            ];
        }
    },
    {
        guideBlockName: 'repositories-save',
        getSteps: (options, services) => {
            const GuideUtils = services.GuideUtils;
            const repositoryIdInputSelector = GuideUtils.getGuideElementSelector('graphDBRepositoryIdInput');
            return [
                {
                    guideBlockName: 'clickable-element',
                    options: {
                        content: 'guide.step_plugin.create_repository.save_button.content',
                        // If mainAction is set the title will be set automatically
                        ...(options.mainAction ? {} : { title: REPOSITORIES_CREATE_DEFAULT_TITLE }),
                        class: 'create-repository-button',
                        ...options,
                        url: 'repository/create/graphdb',
                        elementSelector: GuideUtils.getGuideElementSelector('graphDBRepositoryCrateButton'),
                        disablePreviousFlow: false,
                        show: () => () => {
                            GuideUtils.validateTextInput(repositoryIdInputSelector, options.repositoryId);
                        },
                        onNextClick: GuideUtils.clickOnGuideElement('graphDBRepositoryCrateButton')
                    }
                }
            ];
        }
    },
    {
        guideBlockName: 'create-repository',
        getSteps: (options, services) => {
            options.mainAction = 'create-repository';

            const steps = [
                {
                    guideBlockName: 'click-main-menu',
                    options: {
                        menu: 'repositories',
                        showIntro: true,
                        ...options
                    }
                },
                { guideBlockName: 'repositories-create-repository', options: { ...options } },
                { guideBlockName: 'repositories-create-graphdb', options: { ...options } },
                { guideBlockName: 'repositories-id-input', options: { ...options } }
            ];

            if (options.rulesetName) {
                steps.push({ guideBlockName: 'repositories-ruleset-dropdown', options: { ...options } });
            }
            if (options.fts) {
                steps.push({ guideBlockName: 'repositories-enable-fts', options: { ...options } });
            }

            steps.push({ guideBlockName: 'repositories-save', options: { ...options } });

            return steps;
        }
    }
]);
