const BASIC_STEP = {
    'title': '',
    'content': '',
    'elementSelector': undefined,
    'placement': 'bottom',
    'url': undefined,
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
            const notOverridable = {
                'type': 'clickable',
            };
            return angular.extend({}, BASIC_STEP, options, notOverridable);
        }
    },
    {
        'guideBlockName': 'read-only-element',
        'getStep': (options) => {
            const notOverridable = {
                'type': 'readonly',
            };
            return angular.extend({}, BASIC_STEP, options, notOverridable);
        }
    },
    {
        'guideBlockName': 'input-element',
        'getStep': (options) => {
            const notOverridable = {
                'type': 'readonly',
            };
            return angular.extend({}, BASIC_STEP, options, notOverridable);
        }
    }
]);
