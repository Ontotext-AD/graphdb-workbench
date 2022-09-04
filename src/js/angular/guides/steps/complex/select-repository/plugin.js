PluginRegistry.add('guide.step', [
    {
        'guideBlockName': 'select-repository-dropdown',
        'getSteps': (options, GuideUtils) => {
            return [{
                'guideBlockName': 'clickable-element',
                'options': angular.extend({}, {
                    'title': 'guide.step_plugin.choose-repository.title',
                    'content': 'guide.step_plugin.choose-repository.content',
                    'elementSelector': GuideUtils.getGuideElementSelector('repositoriesGroupButton'),
                    'onNextClick': (guide) => {
                        GuideUtils.clickOnGuideElement('repositoriesGroupButton')();
                        guide.next();
                    }
                }, options)
            }, {
                'guideBlockName': 'clickable-element',
                'options': angular.extend({}, {
                    'title': 'guide.step_plugin.select-repository.title',
                    'content': 'guide.step_plugin.select-repository.content',
                    'elementSelector': GuideUtils.getGuideElementSelector(`repository-${options.repositoryId}-button`),
                    'onNextClick': (guide) => {
                        $(GuideUtils.getGuideElementSelector(`repository-${options.repositoryId}-button`))
                            .trigger('click');
                        guide.next();
                    }
                }, options)
            }
            ];
        }
    },
    {
        'guideBlockName': 'select-repository-plug',
        'getSteps': (options, GuideUtils) => {
            return [{
                'guideBlockName': 'clickable-element',
                'options': angular.extend({}, {
                    'title': 'guide.step_plugin.select-repository-plug.title',
                    'content': 'guide.step_plugin.select-repository-plug.content',
                    'elementSelector': GuideUtils.getGuideElementSelector(`repository-${options.repositoryId}-plug`),
                    'onNextClick': GuideUtils.getGuideElementSelector(`repository-${options.repositoryId}-plug`)
                }, options)
            }
            ];
        }
    }
]);
