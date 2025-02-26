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
                        class: 'create-repository-guide-dialog',
                        url: '/repository',
                        elementSelector: GuideUtils.getGuideElementSelector('createRepository'),
                        onNextClick: (guide) => GuideUtils.clickOnGuideElement('createRepository')().then(() => guide.next())

                    }, options)
                }, {
                    guideBlockName: 'clickable-element',
                    options: angular.extend({}, {
                        content: 'guide.step_plugin.create_repository.graph_db_repository.content',
                        class: 'create-gdb-repository-guide-dialog',
                        url: '/repository/create',
                        elementSelector: GuideUtils.getGuideElementSelector('createGraphDBRepository'),
                        onNextClick: GuideUtils.clickOnGuideElement('createGraphDBRepository')
                    }, options)
                }, {
                    guideBlockName: 'input-element',
                    options: angular.extend({}, {
                        content: 'guide.step_plugin.create_repository.repository_id.content',
                        class: 'gdb-repository-id-input-guide-dialog',
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
                        class: 'gdb-repository-ruleset-select-guide-dialog',
                        elementSelector: GuideUtils.getGuideElementSelector('graphDBRepositoryRulesetSelect'),
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
                                   url: '/repository/create/graphdb',
                                   class: 'gdb-repository-enable-fts-guide-dialog',
                                   extraContent: 'guide.step_plugin.create_repository.enable-fts.extra-content',
                                   extraContentClass: 'alert alert-help text-left',
                                   elementSelector: GuideUtils.getGuideElementSelector('enable-fts-search'),
                                   onNextValidate: () => Promise.resolve(GuideUtils.isChecked(GuideUtils.getGuideElementSelector('enable-fts-search')))
                               }, options)
                           });
            }
            steps.push({
                guideBlockName: 'clickable-element',
                options: angular.extend({}, {
                    content: 'guide.step_plugin.create_repository.save_button.content',
                    url: '/repository/create/graphdb',
                    class: 'create-repository-button-guide-dialog',
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
