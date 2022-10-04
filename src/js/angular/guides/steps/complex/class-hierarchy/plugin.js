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
                        elementSelector: '#classChart',
                        placement: 'top'
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
                            elementSelector: selector,
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
                                elementSelector: selector
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
            options.title = 'guide.step_plugin.class-hierarchy-instances.title';

            const steps = [
                {
                    guideBlockName: 'clickable-element',
                    options: angular.extend({}, {
                        content: 'guide.step_plugin.class-hierarchy-instances.content',
                        url: '/hierarchy',
                        elementSelector: GuideUtils.getGuideElementSelector('class-' + options.iri),
                        onNextClick: (guide, step) => {
                            GuideUtils.classHierarchyFocus(step.elementSelector);
                            guide.next();
                        }
                    }, options)
                },
                {
                    guideBlockName: 'read-only-element',
                    options: angular.extend({}, {
                        content: 'guide.step_plugin.class-hierarchy-instances-side-panel.content',
                        url: '/hierarchy',
                        elementSelector: '.rdf-info-side-panel div',
                        canBePaused: false,
                        placement: 'left',
                        beforeShowPromise: GuideUtils.deferredShow(800)
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
                            focusInstance: focusInstance.instance,
                            extraContent: focusInstance.message
                        }, options)
                    });
                });
            }

            if (options.followCountLink) {
                const selector = GuideUtils.getGuideElementSelector('instances-count');
                steps.push({
                    guideBlockName: 'clickable-element',
                    options: angular.extend({}, {
                        content: 'guide.step_plugin.class-hierarchy-instances-count.content',
                        url: '/hierarchy',
                        canBePaused: false,
                        elementSelector: selector,
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
                        elementSelector: GuideUtils.getSparqlEditorSelector(),
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
                        elementSelector: GuideUtils.getSparqlResultsSelector(),
                        fileName: options.fileName,
                        scrollToHandler: GuideUtils.scrollToTop,
                        onNextClick: (guide) => {
                            window.history.back();
                            guide.next();
                        }
                    }, options)
                });
            }

            const closeButtonSelector = GuideUtils.getGuideElementSelector('close-info-panel');
            steps.push({
                guideBlockName: 'clickable-element',
                options: angular.extend({}, {
                    content: 'guide.step_plugin.class-hierarchy-instances-side-panel-close.content',
                    url: '/hierarchy',
                    canBePaused: false,
                    elementSelector: closeButtonSelector,
                    placement: 'left',
                    // If we followed the count link we come back here from another view
                    // and the side panel needs time to open
                    beforeShowPromise: options.followCountLink ? GuideUtils.deferredShow(1500) : null,
                    advanceOn: {
                        selector: closeButtonSelector,
                        event: 'click'
                    },
                    onNextClick: () => GuideUtils.waitFor(closeButtonSelector, 3)
                        .then(() => $(closeButtonSelector).trigger('click'))
                }, options)
            });

            return steps;
        }
    }
]);
