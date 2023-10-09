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
                        url: '/repository',
                        elementSelector: GuideUtils.getGuideElementSelector('createRepository'),
                        onNextClick: (guide) => GuideUtils.clickOnGuideElement('createRepository')().then(() => guide.next())

                    }, options)
                }, {
                    guideBlockName: 'clickable-element',
                    options: angular.extend({}, {
                        content: 'guide.step_plugin.create_repository.graph_db_repository.content',
                        url: '/repository/create',
                        elementSelector: GuideUtils.getGuideElementSelector('createGraphDBRepository'),
                        onNextClick: GuideUtils.clickOnGuideElement('createGraphDBRepository')
                    }, options)
                }, {
                    guideBlockName: 'input-element',
                    options: angular.extend({}, {
                        content: 'guide.step_plugin.create_repository.repository_id.content',
                        url: '/repository/create/graphdb',
                        elementSelector: repositoryIdInputSelector,
                        onNextValidate: () => Promise.resolve(GuideUtils.validateTextInput(repositoryIdInputSelector, repositoryId))
                    }, options)
                }
            ];

            if (options.rulesetName) {
                steps.push({
                    guideBlockName: 'clickable-element',
                    options: angular.extend({}, {
                        content: 'guide.step_plugin.create_repository.ruleset_dropdown.content',
                        url: '/repository/create/graphdb',
                        elementSelector: GuideUtils.getGuideElementSelector('graphDBRepositoryRulesetSelect'),
                        show: () => () => {
                            GuideUtils.validateTextInput(repositoryIdInputSelector, repositoryId);
                        },
                        rulesetName: options.rulesetName
                    }, options)
                });
            }
            steps.push({
                guideBlockName: 'clickable-element',
                options: angular.extend({}, {
                    content: 'guide.step_plugin.create_repository.save_button.content',
                    url: '/repository/create/graphdb',
                    elementSelector: GuideUtils.getGuideElementSelector('graphDBRepositoryCrateButton'),
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
