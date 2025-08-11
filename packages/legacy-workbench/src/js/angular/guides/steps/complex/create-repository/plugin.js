PluginRegistry.add('guide.step', [
    {
        guideBlockName: 'create-repository',
        getSteps: (options, services) => {
            const GuideUtils = services.GuideUtils;
            options.mainAction = 'create-repository';

            const repositoryIdInputSelector = GuideUtils.getGuideElementSelector('graphDBRepositoryIdInput');
            const repositoryId = options.repositoryId;
            const steps = [
                {
                    guideBlockName: 'click-main-menu',
                    options: angular.extend({}, {
                        menu: 'repositories',
                        showIntro: true
                    }, options)
                }, {
                    guideBlockName: 'clickable-element',
                    options: angular.extend({}, {
                        content: 'guide.step_plugin.create_repository.create_repository_button.content',
                        class: 'create-repository',
                        url: 'repository',
                        elementSelector: GuideUtils.getGuideElementSelector('createRepository'),
                        onNextClick: GuideUtils.clickOnGuideElement('createRepository')
                    }, options)
                }, {
                    guideBlockName: 'clickable-element',
                    options: angular.extend({}, {
                        content: 'guide.step_plugin.create_repository.graph_db_repository.content',
                        class: 'create-gdb-repository',
                        url: 'repository/create',
                        elementSelector: GuideUtils.getGuideElementSelector('createGraphDBRepository'),
                        disablePreviousFlow: false,
                        onNextClick: GuideUtils.clickOnGuideElement('createGraphDBRepository')
                    }, options)
                }, {
                    guideBlockName: 'input-element',
                    options: angular.extend({}, {
                        content: 'guide.step_plugin.create_repository.repository_id.content',
                        class: 'gdb-repository-id-input',
                        url: 'repository/create/graphdb',
                        elementSelector: repositoryIdInputSelector,
                        disablePreviousFlow: false,
                        onNextValidate: () => Promise.resolve(GuideUtils.validateTextInput(repositoryIdInputSelector, repositoryId))
                    }, options)
                }
            ];

            if (options.rulesetName) {
                steps.push({
                    guideBlockName: 'clickable-element',
                    options: angular.extend({}, {
                        content: 'guide.step_plugin.create_repository.ruleset_dropdown.content',
                        url: 'repository/create/graphdb',
                        class: 'gdb-repository-ruleset-select',
                        elementSelector: GuideUtils.getGuideElementSelector('graphDBRepositoryRulesetSelect'),
                        disablePreviousFlow: false,
                        show: () => () => {
                            GuideUtils.validateTextInput(repositoryIdInputSelector, repositoryId);
                        }
                    }, options)
                });
            }
            if(options.fts) {
                steps.push({
                               guideBlockName: 'clickable-element',
                               options: angular.extend({}, {
                                   content: 'guide.step_plugin.create_repository.enable-fts.content',
                                   url: 'repository/create/graphdb',
                                   class: 'gdb-repository-enable-fts',
                                   extraContent: 'guide.step_plugin.create_repository.enable-fts.extra-content',
                                   extraContentClass: 'alert alert-help text-left',
                                   elementSelector: GuideUtils.getGuideElementSelector('enable-fts-search'),
                                   disablePreviousFlow: false,
                                   onNextValidate: () => Promise.resolve(GuideUtils.isChecked(GuideUtils.getGuideElementSelector('enable-fts-search', 'input')))
                               }, options)
                           });
            }
            steps.push({
                guideBlockName: 'clickable-element',
                options: angular.extend({}, {
                    content: 'guide.step_plugin.create_repository.save_button.content',
                    url: 'repository/create/graphdb',
                    class: 'create-repository-button',
                    elementSelector: GuideUtils.getGuideElementSelector('graphDBRepositoryCrateButton'),
                    disablePreviousFlow: false,
                    show: () => () => {
                        GuideUtils.validateTextInput(repositoryIdInputSelector, repositoryId);
                    },
                    onNextClick: GuideUtils.clickOnGuideElement('graphDBRepositoryCrateButton')
                }, options)
            });

            return steps;
        }
    }
]);
