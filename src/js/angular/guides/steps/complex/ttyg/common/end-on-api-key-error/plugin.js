PluginRegistry.add('guide.step', [
    {
        guideBlockName: 'end-on-api-key-error',
        getSteps: (options, services) => {
            const GuideUtils = services.GuideUtils;
            options.mainAction = 'end-on-api-key-error';

            return [
                {
                    guideBlockName: 'guide-end',
                    options: angular.extend({}, {
                        title: 'guide.step_plugin.ttyg.missing-key.title',
                        content: 'guide.step_plugin.ttyg.missing-key.content',
                        url: '/ttyg',
                        beforeShowPromise: (guide, currentStepDescription) => {
                            // Check if error toast is visible waiting for 1 seconds
                            return GuideUtils.waitFor('.toast-message', 1)
                                .then((element) => {
                                    if (element.text().includes('graphdb.openai.api-key')) {
                                        // Error toast is visible, show this step and complete on next click
                                        currentStepDescription.onNextClick = (guide) => {
                                            guide.complete();
                                        };
                                    } else {
                                        // Toast is not visible, but not the correct, so we go on
                                        setTimeout(() => {
                                            guide.next();
                                        });
                                    }
                                })
                                .catch(() => {
                                    // Error toast is not visible, skip this step and move to next one
                                    // Using a timeout because the library executes logic to show the step in a then clause which causes current and next steps to show
                                    setTimeout(() => {
                                        guide.next();
                                    });
                                });
                        }
                    }, options)
                }
            ];
        }
    }
]);
