PluginRegistry.add('guide.step', [
    {
        guideBlockName: 'select-ttyg-agent',
        getSteps: (options, services) => {
            const GuideUtils = services.GuideUtils;
            options.mainAction = 'select-ttyg-agent';

            return [
                {
                    guideBlockName: 'info-message',
                    options: angular.extend({}, {
                        content: 'guide.step_plugin.select-ttyg-agent.info.content',
                        url: '/ttyg',
                        class: 'select-ttyg-agent-guide-dialog',
                        skipPoint: true
                    }, options)
                },
                {
                    guideBlockName: 'clickable-element',
                    options: angular.extend({}, {
                        content: 'guide.step_plugin.select-ttyg-agent.open-agent-dropdown',
                        class: 'open-agent-dropdown-guide-dialog',
                        url: '/ttyg',
                        elementSelector: GuideUtils.getGuideElementSelector('select-agent-dropdown')
                    }, options)
                },
                {
                    guideBlockName: 'clickable-element',
                    options: angular.extend({}, {
                        content: 'guide.step_plugin.select-ttyg-agent.select-agent',
                        elementSelector: GuideUtils.getGuideElementSelector('select-agent-panel'),
                        class: 'select-your-agent-guide-dialog',
                        show: () => () => {
                            const elementToObserve = document.querySelector(GuideUtils.getGuideElementSelector('select-agent-dropdown'));
                            const dropdownToggleElement = document.querySelector(GuideUtils.getGuideElementSelector('select-agent-dropdown-toggle'));

                            options.observer = new MutationObserver(attributesChangeCallback);
                            options.observer.observe(elementToObserve, {attributes: true});

                            function attributesChangeCallback(mutationList) {
                                for (const mutation of mutationList) {
                                    if (mutation.type === 'attributes') {
                                        const selectedAgent = GuideUtils.isGuideElementVisible('selected-agent')
                                        const isOpened = mutation.target.classList.contains('open');

                                        if (!(isOpened || selectedAgent)) {
                                            dropdownToggleElement.click();
                                        }
                                    }
                                }
                            }
                        },
                        onNextValidate: () => Promise.resolve(GuideUtils.isGuideElementVisible('selected-agent')),
                        hide: () => () => {
                            options.observer.disconnect();
                        }
                    }, options)
                }
            ];
        }
    }
]);
