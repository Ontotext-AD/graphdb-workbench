PluginRegistry.add('guide.step', [
    {
        'guideBlockName': 'create-repository',
        'getSteps': (options, GuideUtils) => {
            const steps = [
                {
                    'guideBlockName': 'click-main-menu',
                    'options': angular.extend({}, {
                        'label': 'menu_setup',
                        'menuSelector': 'menu-setup',
                        'submenuSelector': 'sub-menu-repositories'
                    }, options)
                }, {
                    'guideBlockName': 'clickable-element',
                    'options': angular.extend({}, {
                        'title': 'guide.step_plugin.create_repository.create_repository_button.title',
                        'content': 'guide.step_plugin.create_repository.create_repository_button.content',
                        'url': '/repository',
                        'elementSelector': GuideUtils.getGuideElementSelector('createRepository'),
                        'onNextClick': (guide) => {
                            GuideUtils.clickOnGuideElement('createRepository')();
                            guide.next();
                        }
                    }, options)
                }, {
                    'guideBlockName': 'clickable-element',
                    'options': angular.extend({}, {
                        'title': 'guide.step_plugin.create_repository.graph_db_repository.title',
                        'content': 'guide.step_plugin.create_repository.graph_db_repository.content',
                        'url': '/repository/create',
                        'elementSelector': GuideUtils.getGuideElementSelector('createGraphDBRepository'),
                        'onNextClick': GuideUtils.clickOnGuideElement('createGraphDBRepository')
                    }, options)
                }, {
                    'guideBlockName': 'input-element',
                    'options': angular.extend({}, {
                        'title': 'guide.step_plugin.create_repository.repository_id.title',
                        'content': 'guide.step_plugin.create_repository.repository_id.content',
                        'url': '/repository/create/graphdb',
                        'elementSelector': GuideUtils.getGuideElementSelector('graphDBRepositoryIdInput'),
                        'onNextValidate': (step) => GuideUtils.validateTextInput(step.elementSelector, step.repositoryId)
                    }, options)
                }
            ];

            if (!!options.rulesetName) {
                steps.push({
                    'guideBlockName': 'clickable-element',
                    'options': angular.extend({}, {
                        'title': 'guide.step_plugin.create_repository.ruleset_dropdown.title',
                        'content': 'guide.step_plugin.create_repository.ruleset_dropdown.content',
                        'url': '/repository/create/graphdb',
                        'elementSelector': GuideUtils.getGuideElementSelector('graphDBRepositoryRulesetSelect'),
                        'rulesetName': options.rulesetName
                    }, options)
                });
            }
            steps.push({
                'guideBlockName': 'clickable-element',
                'options': angular.extend({}, {
                    'title': 'guide.step_plugin.create_repository.save_button.title',
                    'content': 'guide.step_plugin.create_repository.save_button.content',
                    'url': '/repository/create/graphdb',
                    'elementSelector': GuideUtils.getGuideElementSelector('graphDBRepositoryCrateButton'),
                    'onNextClick': GuideUtils.clickOnGuideElement('graphDBRepositoryCrateButton')
                }, options)
            });

            return steps;
        }
    }
]);
