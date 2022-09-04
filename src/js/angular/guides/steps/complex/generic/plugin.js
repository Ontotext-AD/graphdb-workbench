PluginRegistry.add('guide.step', [
    {
        'guideBlockName': 'generic-message',
        'getSteps': (options, GuideUtils) => {
            return [{
                'guideBlockName': 'info-message',
                'options': angular.extend({}, {
                    'title': options.title,
                    'content': options.content
                }, options)
            }];
        }
    }
]);
