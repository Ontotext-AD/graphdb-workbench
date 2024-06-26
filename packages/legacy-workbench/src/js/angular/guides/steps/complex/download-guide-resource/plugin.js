PluginRegistry.add('guide.step', [
    {
        guideBlockName: 'download-guide-resource',
        getSteps: (options, services) => {
            return {
                guideBlockName: 'info-message',
                options: angular.extend({}, {
                    title: 'guide.step_plugin.download-guide-resource.title',
                    content: 'guide.step_plugin.download-guide-resource.content',
                    canBePaused: true,
                    forceReload: true
                }, options)
            };
        }
    }]
);
