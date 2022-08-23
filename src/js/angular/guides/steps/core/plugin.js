const BASIC_STEP = {
    'title': '',
    'content': '',
    'elementSelector': '',
    'placement': 'bottom',
    'url': '',
    'type': 'read-only-element',
    'maxWaitTime': 3,
    'canBePaused': true,
    'onNextClick': undefined,
    'onPreviousClick': undefined
};

PluginRegistry.add('guide.step', [
    {
        'guideBlockName': 'clickable-element',
        'getStep': (options) => {
            return angular.extend({}, BASIC_STEP, options, {
                'type': 'clickable'
            });
        }
    },
    {
        'guideBlockName': 'read-only-element',
        'getStep': (options) => {
            return angular.extend({}, BASIC_STEP, options, {
                'type': 'readonly',
            });
        }
    },
    {
        'guideBlockName': 'input-element',
        'getStep': (options) => {
            return angular.extend({}, BASIC_STEP, options, {
                'type': 'input',
            });
        }
    }
]);
