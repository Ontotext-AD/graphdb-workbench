PluginRegistry.add('guide.step', [
    {
        'guideBlockName': 'select-repository',
        'getSteps': (options, GuideUtils) => {
            return [{
                'guideBlockName': 'clickable-element',
                'options': angular.extend({}, {
                    'title': 'guide.step_plugin.choose-repository.title',
                    'content': 'guide.step_plugin.choose-repository.content',
                    'elementSelector': GuideUtils.getGuideElementSelector('repositoriesGroupButton'),
                    'onNextClick': GuideUtils.clickOnGuideElement('repositoriesGroupButton'),
                }, options)
            }, {
                'guideBlockName': 'clickable-element',
                'options': angular.extend({}, {
                    advanceOn: undefined,
                    'title': 'guide.step_plugin.select-repository.title',
                    'content': 'guide.step_plugin.select-repository.content',
                    'elementSelector': GuideUtils.getGuideElementSelector(`repository-${options.repositoryId}-button`),
                    'onNextClick': () => {
                        $(GuideUtils.getGuideElementSelector(`repository-${options.repositoryId}-button`) + ' a').click();
                    },
                    onPreviousClick: (guide) => {
                        //Open menu if is not opened.
                        if (!GuideUtils.isVisible(GuideUtils.getGuideElementSelector(options.repositoryId), 0)) {
                            GuideUtils.clickOnGuideElement('repositoriesGroupButton')();
                        }
                        // TODO check if guide.back();
                    }
                }, options)
            }
            ];
        }
    }
]);
