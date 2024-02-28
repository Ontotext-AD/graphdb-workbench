const reloadAndOpenInfoPanel = (services, clasInstanceSelector, resolve, reject) => {
    services.$location.path('/hierarchy').search({});
    return services.GuideUtils.waitFor(clasInstanceSelector, 3)
        .then(() => {
            services.GuideUtils.classHierarchyFocus(clasInstanceSelector);
            // Wait a little time animation to complete.
            return services.GuideUtils.deferredShow(500)();
        });
};

PluginRegistry.add('guide.step', [
    {
        guideBlockName: 'class-hierarchy',
        getSteps: (options, services) => {
            const GuideUtils = services.GuideUtils;
            options.mainAction = 'class-hierarchy';

            const steps = [
                {
                    guideBlockName: 'click-main-menu',
                    options: angular.extend({}, {
                        menu: 'class-hierarchy',
                        showIntro: true
                    }, options)
                }, {
                    guideBlockName: 'read-only-element',
                    options: angular.extend({}, {
                        content: 'guide.step_plugin.class_hierarchy_intro.content',
                        url: '/hierarchy',
                        elementSelector: '#classChart',
                        placement: 'left'
                    }, options)
                }
            ];

            if (options.introExtraContent) {
                steps.push({
                    guideBlockName: 'read-only-element',
                    options: angular.extend({}, {
                        content: '',
                        extraContent: options.introExtraContent,
                        url: '/hierarchy',
                        elementSelector: '#classChart #main-group',
                        class: 'clas-hierarchy-intro-guide-dialog',
                        placement: 'left'
                    }, options)
                });
            }

            if (angular.isArray(options.zoomIris)) {
                options.zoomIris.forEach((zoomIri) => {
                    const selector = GuideUtils.getGuideElementSelector('class-' + zoomIri.iri);
                    steps.push({
                        guideBlockName: 'clickable-element',
                        options: angular.extend({}, {
                            content: 'guide.step_plugin.class_hierarchy_zoom.content',
                            url: '/hierarchy',
                            placement: 'left',
                            elementSelector: selector,
                            class: 'class-hierarchy-zoom-content-guide-dialog',
                            onNextClick: (guide, step) => {
                                GuideUtils.classHierarchyZoom(step.elementSelector);
                                guide.next();
                            }
                        }, options, zoomIri)
                    });
                    if (zoomIri.postExtraContent) {
                        steps.push({
                            guideBlockName: 'read-only-element',
                            options: angular.extend({}, {
                                content: '',
                                extraContent: zoomIri.postExtraContent,
                                url: '/hierarchy',
                                placement: 'left',
                                beforeShowPromise: GuideUtils.deferredShow(800),
                                elementSelector: selector,
                                class: 'class-hierarchy-instances-guide-dialog'
                            }, options)
                        });
                    }
                });
            }

            return steps;
        }
    },
    {
        guideBlockName: 'class-hierarchy-instances',
        getSteps: (options, services) => {
            const GuideUtils = services.GuideUtils;
            const $location = services.$location;
            const $route = services.$route;
            options.title = 'guide.step_plugin.class-hierarchy-instances.title';
            const closeButtonSelector = GuideUtils.getGuideElementSelector('close-info-panel');
            const clasInstanceSelector = GuideUtils.getGuideElementSelector('class-' + options.iri);
            const steps = [
                {
                    guideBlockName: 'clickable-element',
                    options: angular.extend({}, {
                        content: 'guide.step_plugin.class-hierarchy-instances.content',
                        url: '/hierarchy',
                        elementSelector: clasInstanceSelector,
                        class: 'class-hierarchy-instance-guide-dialog',
                        placement: 'top',
                        onNextClick: (guide) => {
                            GuideUtils.classHierarchyFocus(clasInstanceSelector);
                            guide.next();
                        },
                        initPreviousStep: () => {
                            if (!GuideUtils.isVisible(closeButtonSelector)) {
                                return reloadAndOpenInfoPanel({$location, $route, GuideUtils}, clasInstanceSelector);
                            }
                            return Promise.resolve();
                        }
                    }, options)
                },
                {
                    guideBlockName: 'read-only-element',
                    options: angular.extend({}, {
                        content: 'guide.step_plugin.class-hierarchy-instances-side-panel.content',
                        url: '/hierarchy',
                        elementSelector: '.rdf-info-side-panel div',
                        class: 'class-hierarchy-side-panel-info-guide-dialog',
                        canBePaused: false,
                        placement: 'left',
                        beforeShowPromise: GuideUtils.deferredShow(800),
                        onPreviousClick: () => new Promise(function (resolve) {
                            GuideUtils.waitFor(closeButtonSelector, 1)
                                .then(() => $(closeButtonSelector).trigger('click'));
                            resolve();
                        })
                    }, options)
                }
            ];

            if (angular.isArray(options.focusInstances)) {
                options.focusInstances.forEach((focusInstance) => {
                    if (!angular.isObject(focusInstance)) {
                        focusInstance = {
                            instance: focusInstance
                        };
                    }
                    steps.push({
                        guideBlockName: 'read-only-element',
                        options: angular.extend({}, {
                            content: 'guide.step_plugin.class-hierarchy-instances-focus.content',
                            url: '/hierarchy',
                            canBePaused: false,
                            elementSelector: GuideUtils.getGuideElementSelector('instance-' + focusInstance.instance),
                            class: 'class-hierarchy-side-bar-instance-info-guide-dialog',
                            focusInstance: focusInstance.instance,
                            extraContent: focusInstance.message
                        }, options)
                    });
                });
            }

            const instanceCountSelector = GuideUtils.getGuideElementSelector('instances-count');
            if (options.followCountLink) {
                steps.push({
                    guideBlockName: 'clickable-element',
                    options: angular.extend({}, {
                        content: 'guide.step_plugin.class-hierarchy-instances-count.content',
                        url: '/hierarchy',
                        canBePaused: false,
                        elementSelector: instanceCountSelector,
                        class: 'class-hierarchy-side-panel-instances-count-guide-dialog',
                        onNextClick: (guide, step) => {
                            GuideUtils.waitFor(step.elementSelector, 3)
                                .then(() => $(step.elementSelector).trigger('click'));
                            guide.next();
                        }
                    }, options)
                });

                steps.push({
                    guideBlockName: 'read-only-element',
                    options: angular.extend({}, {
                        content: 'guide.step_plugin.class-hierarchy-instances-query.content',
                        url: '/sparql',
                        elementSelector: GuideUtils.CSS_SELECTORS.SPARQL_EDITOR_SELECTOR,
                        beforeShowPromise: () => GuideUtils.waitFor(GuideUtils.CSS_SELECTORS.SPARQL_EDITOR_SELECTOR, 3)
                            .then(() => GuideUtils.deferredShow(500)()),
                        class: 'class-hierarchy-instances-query-guide-dialog',
                        scrollToHandler: GuideUtils.scrollToTop
                    }, options)
                });
                steps.push({
                    guideBlockName: 'read-only-element',
                    options: angular.extend({}, {
                        content: 'guide.step_plugin.class-hierarchy-instances-results.content',
                        extraContent: options.showExtraCommentSparql !== false ?
                            'guide.step_plugin.class-hierarchy-instances-results.extraContent' : null,
                        url: '/sparql',
                        placement: 'top',
                        elementSelector: GuideUtils.CSS_SELECTORS.SPARQL_RESULTS_SELECTOR,
                        class: 'class-hierarchy-instances-results-guide-dialog',
                        fileName: options.fileName,
                        scrollToHandler: GuideUtils.scrollToTop,
                        onNextClick: (guide) => {
                            window.history.back();
                            guide.next();
                        },
                        initPreviousStep: () => Promise.resolve()
                    }, options)
                });
            }

            steps.push({
                guideBlockName: 'clickable-element',
                options: angular.extend({}, {
                    content: 'guide.step_plugin.class-hierarchy-instances-side-panel-close.content',
                    url: '/hierarchy',
                    canBePaused: false,
                    elementSelector: closeButtonSelector,
                    class: 'class-hierarchy-side-panel-close-guide-dialog',
                    placement: 'left',
                    // If we followed the count link we come back here from another view
                    // and the side panel needs time to open
                    beforeShowPromise: options.followCountLink ? GuideUtils.deferredShow(1500) : Promise.resolve(),
                    advanceOn: {
                        selector: closeButtonSelector,
                        event: 'click'
                    },
                    onNextClick: () => GuideUtils.waitFor(closeButtonSelector, 3)
                        .then(() => $(closeButtonSelector).trigger('click')),
                    initPreviousStep: (services, stepId) => {

                        const currentStepId = services.ShepherdService.getCurrentStepId();
                        // If method is called from same step just click count link
                        if (currentStepId === stepId && options.followCountLink) {
                            return GuideUtils.waitFor(instanceCountSelector, 3)
                                .then(() => {
                                    $(instanceCountSelector).trigger('click');
                                    return GuideUtils.waitFor(GuideUtils.CSS_SELECTORS.SPARQL_RESULTS_SELECTOR, 3)
                                        .then(() => GuideUtils.deferredShow(50)());
                                });
                        }
                        // If is called from other step we have to reload and open the info panel.
                        return reloadAndOpenInfoPanel({$location, $route, GuideUtils}, clasInstanceSelector);
                    }
                }, options)
            });

            return steps;
        }
    }
]);
