const reloadAndOpenInfoPanel = (services, clasInstanceSelector) => {
    services.RoutingUtil.navigate('/hierarchy');
    return services.GuideUtils.waitFor(clasInstanceSelector, 3)
        .then(() => {
            services.GuideUtils.classHierarchyFocus(clasInstanceSelector);
            // Wait a little time animation to complete.
            return services.GuideUtils.deferredShow(500)();
        });
};

const disableAllRDFClasses = () => {
    document.querySelectorAll('.rdf-class')
        .forEach(el => {
            el.classList.add('disable-rdf-class');
        });
};

const enableAllRDFClasses = () => {
    document.querySelectorAll('.rdf-class')
        .forEach(el => {
            el.classList.remove('disable-rdf-class');
        });
};

const CLASS_HIERARCHY_DEFAULT_TITLE = 'view.class.hierarchy.title';
const CLASS_HIERARCHY_RDF_INSTANCES_DEFAULT_TITLE = 'guide.step_plugin.class-hierarchy-instances.title';

PluginRegistry.add('guide.step', [
    {
        guideBlockName: 'class-hierarchy-intro',
        getSteps: (options) => {
            return [
                {
                    guideBlockName: 'read-only-element',
                    options: {
                        content: 'guide.step_plugin.class-hierarchy-intro.content',
                        url: 'hierarchy',
                        elementSelector: '#classChart',
                        placement: 'left',
                        class: 'clas-hierarchy-intro',
                        // If mainAction is set the title will be set automatically
                        ...(options.mainAction ? {} : {title: CLASS_HIERARCHY_DEFAULT_TITLE}),
                        ...options
                    }
                }
            ];
        }
    },
    {
        guideBlockName: 'class-hierarchy-dataset-intro',
        getSteps: (options) => {
            return [
                {
                    guideBlockName: 'read-only-element',
                    options: {
                        url: 'hierarchy',
                        elementSelector: '#classChart #main-group',
                        placement: 'left',
                        class: 'class-hierarchy-dataset-intro',
                        // If mainAction is set the title will be set automatically
                        ...(options.mainAction ? {} : {title: CLASS_HIERARCHY_DEFAULT_TITLE}),
                        ...options
                    }
                }
            ];
        }
    },
    {
        guideBlockName: 'class-hierarchy-zoom-class',
        getSteps: (options, services) => {
            const GuideUtils = services.GuideUtils;
            const selector = GuideUtils.getGuideElementSelector('class-' + options.iri);
            return [
                {
                    guideBlockName: 'clickable-element',
                    options: {
                        url: 'hierarchy',
                        placement: 'left',
                        elementSelector: selector,
                        content: 'guide.step_plugin.class-hierarchy-zoom-class.content',
                        class: 'class-hierarchy-zoom-class',
                        // If mainAction is set the title will be set automatically
                        ...(options.mainAction ? {} : {title: CLASS_HIERARCHY_DEFAULT_TITLE}),
                        onNextClick: (guide, step) => {
                            GuideUtils.classHierarchyZoom(step.elementSelector);
                            guide.next();
                        },
                        ...options
                    }
                }
            ];
        }
    },
    {
        guideBlockName: 'class-hierarchy-explain-class',
        getSteps: (options, services) => {
            const GuideUtils = services.GuideUtils;
            const selector = GuideUtils.getGuideElementSelector('class-' + options.iri);
            return [
                {
                    guideBlockName: 'read-only-element',
                    options: {
                        url: 'hierarchy',
                        placement: 'left',
                        elementSelector: selector,
                        class: 'class-hierarchy-explain-class',
                        // If mainAction is set the title will be set automatically
                        ...(options.mainAction ? {} : {title: CLASS_HIERARCHY_DEFAULT_TITLE}),
                        show: () => disableAllRDFClasses,
                        hide: () => enableAllRDFClasses,
                        ...options
                    }
                }
            ]
        }
    },
    {
        guideBlockName: 'class-hierarchy-open-rdf-instances-side-panel',
        getSteps: (options, services) => {
            let element;
            const GuideUtils = services.GuideUtils;
            const selector = GuideUtils.getGuideElementSelector('class-' + options.iri);
            const RoutingUtil = services.RoutingUtil;
            const handleDoubleClick = () => (event) => {
                event.preventDefault();
                event.stopPropagation();
                // Ensure the side panel always appears
                return reloadAndOpenInfoPanel({RoutingUtil, GuideUtils}, selector);
            };
            return [
                {
                    guideBlockName: 'clickable-element',
                    options: {
                        content: 'guide.step_plugin.class-hierarchy-open-rdf-instances-side-panel.content',
                        url: 'hierarchy',
                        elementSelector: selector,
                        class: 'class-hierarchy-open-rdf-instances-side-panel',
                        placement: 'top',
                        // If mainAction is set the title will be set automatically
                        ...(options.mainAction ? {} : {title: CLASS_HIERARCHY_DEFAULT_TITLE}),
                        onNextClick: (guide) => {
                            GuideUtils.classHierarchyFocus(selector);
                            guide.next();
                        },
                        show: () => () => {
                            // Add a "dblclick" listener to the element.
                            // We have to open side panel info manually when a selected node is clicked.
                            element = document.querySelector(selector);
                            if (element) {
                                element.addEventListener('dblclick', handleDoubleClick, true);
                            }
                        },
                        hide: () => () => {
                            if (element) {
                                element.removeEventListener('dblclick', handleDoubleClick);
                                element = null;
                            }
                        },
                        ...options
                    }
                }
            ];
        }
    },
    {
        guideBlockName: 'class-hierarchy-close-rdf-instances-side-panel',
        getSteps: (options, services) => {
            const GuideUtils = services.GuideUtils;
            const closeButtonSelector = GuideUtils.getGuideElementSelector('close-info-panel');
            return [
                {
                    guideBlockName: 'clickable-element',
                    options: {
                        content: 'guide.step_plugin.class-hierarchy-close-rdf-instances-side-panel.content',
                        url: 'hierarchy',
                        canBePaused: false,
                        elementSelector: closeButtonSelector,
                        class: 'class-hierarchy-close-rdf-instances-side-panel',
                        placement: 'left',
                        // If mainAction is set the title will be set automatically
                        ...(options.mainAction ? {} : {title: CLASS_HIERARCHY_RDF_INSTANCES_DEFAULT_TITLE}),
                        onNextClick: () => GuideUtils.waitFor(closeButtonSelector, 3)
                            .then(() => GuideUtils.clickOnElement(closeButtonSelector)()),
                        ...options
                    }
                }
            ];
        }
    },
    {
        guideBlockName: 'class-hierarchy-rdf-instances-side-panel-intro',
        getSteps: (options) => {
            return [
                {
                    guideBlockName: 'read-only-element',
                    options: {
                        content: 'guide.step_plugin.class-hierarchy-rdf-instances-side-panel-intro.content',
                        url: 'hierarchy',
                        elementSelector: '.rdf-info-side-panel div',
                        class: 'class-hierarchy-rdf-instances-side-panel-intro',
                        canBePaused: false,
                        placement: 'left',
                        // If mainAction is set the title will be set automatically
                        ...(options.mainAction ? {} : {title: CLASS_HIERARCHY_DEFAULT_TITLE}),
                        ...options
                    }
                }
            ];
        }
    },
    {
        guideBlockName: 'class-hierarchy-rdf-instances-side-panel-open-all-instances-in-sparql',
        getSteps: (options, services) => {
            const GuideUtils = services.GuideUtils;
            return [
                {
                    guideBlockName: 'clickable-element',
                    options: {
                        content: 'guide.step_plugin.class-hierarchy-rdf-instances-side-panel-open-all-instances-in-sparql.content',
                        url: 'hierarchy',
                        canBePaused: false,
                        elementSelector: GuideUtils.getGuideElementSelector('instances-count'),
                        class: 'class-hierarchy-rdf-instances-side-panel-open-all-instances-in-sparql',
                        onNextClick: GuideUtils.clickOnGuideElement('instances-count'),
                        // If mainAction is set the title will be set automatically
                        ...(options.mainAction ? {} : {title: CLASS_HIERARCHY_DEFAULT_TITLE}),
                        ...options
                    }
                }
            ]
        }
    },
    {
        guideBlockName: "class-hierarchy-explain-rdf-instance",
        getSteps: (options, services) => {
            const GuideUtils = services.GuideUtils;
            return [
                {
                    guideBlockName: 'read-only-element',
                    options: {
                        content: 'guide.step_plugin.class-hierarchy-explain-rdf-instance.content',
                        url: 'hierarchy',
                        canBePaused: false,
                        elementSelector: GuideUtils.getGuideElementSelector('instance-' + options.instance),
                        class: 'class-hierarchy-explain-rdf-instance',
                        focusInstance: options.instance,
                        extraContent: options.extraContent,
                        // If mainAction is set the title will be set automatically
                        ...(options.mainAction ? {} : {title: CLASS_HIERARCHY_DEFAULT_TITLE}),
                        ...options
                    }
                }
            ]
        }
    },
    {
        guideBlockName: 'class-hierarchy-toggle-prefixes',
        getSteps: (options, services) => {
            const GuideUtils = services.GuideUtils;
            return [
                {
                    guideBlockName: 'clickable-element',
                    options: {
                        // If mainAction is set the title will be set automatically
                        ...(options.mainAction ? {} : {title: CLASS_HIERARCHY_DEFAULT_TITLE}),
                        content: 'guide.step_plugin.class-hierarchy-toggle-prefixes.content',
                        url: 'hierarchy',
                        elementSelector: '.prefix-toggle-btn',
                        class: 'class-hierarchy-toggle-prefixes',
                        scrollToHandler: GuideUtils.scrollToTop,
                        onNextClick: (guide) => {
                            GuideUtils.clickOnElement('.prefix-toggle-btn')();
                        },
                        ...options
                    }
                }
            ]
        }
    },
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
                    guideBlockName: 'class-hierarchy-intro',
                    options: {...options}
                }
            ];

            if (options.introExtraContent) {
                steps.push({
                    guideBlockName: 'class-hierarchy-dataset-intro',
                    options: {
                        content: options.introExtraContent,
                        ...options
                    }
                });
            }

            if (Array.isArray(options.zoomIris)) {
                options.zoomIris.forEach((zoomIri) => {
                    steps.push({
                        guideBlockName: 'class-hierarchy-zoom-class',
                        options: {
                            iri: zoomIri.iri,
                            ...options,
                        }
                    });
                    if (zoomIri.postExtraContent) {
                        steps.push({
                            guideBlockName: 'class-hierarchy-explain-class',
                            options: {
                                content: zoomIri.postExtraContent,
                                beforeShowPromise: GuideUtils.deferredShow(800),
                                iri: zoomIri.iri,
                                ...options
                            }
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
            const RoutingUtil = services.RoutingUtil;
            // If mainAction is set the title will be set automatically
            options.title = CLASS_HIERARCHY_RDF_INSTANCES_DEFAULT_TITLE;
            const closeButtonSelector = GuideUtils.getGuideElementSelector('close-info-panel');
            const clasInstanceSelector = GuideUtils.getGuideElementSelector('class-' + options.iri);
            const instanceCountSelector = GuideUtils.getGuideElementSelector('instances-count');
            const steps = [
                {
                    guideBlockName: 'class-hierarchy-open-rdf-instances-side-panel',
                    options: {
                        initPreviousStep: () => {
                            if (!GuideUtils.isVisible(closeButtonSelector)) {
                                return reloadAndOpenInfoPanel({RoutingUtil, GuideUtils}, clasInstanceSelector);
                            }

                            return Promise.resolve();
                        },
                        ...options
                    }
                },
                {
                    guideBlockName: 'class-hierarchy-rdf-instances-side-panel-intro',
                    options: {
                        skipPoint: true,
                        beforeShowPromise: GuideUtils.deferredShow(800),
                        onPreviousClick: () => new Promise(function (resolve) {
                            GuideUtils.waitFor(closeButtonSelector, 1)
                                .then(() => $(closeButtonSelector).trigger('click'));
                            resolve();
                        }),
                        ...options
                    }
                }
            ];

            if (angular.isArray(options.focusInstances)) {
                options.focusInstances.forEach((focusInstance) => {
                    if (!GuideUtils.isObject(focusInstance)) {
                        focusInstance = {
                            instance: focusInstance
                        };
                    }
                    steps.push({
                        guideBlockName: 'class-hierarchy-explain-rdf-instance',
                        options: {
                            instance: focusInstance.instance,
                            extraContent: focusInstance.message,
                            ...options
                        }
                    });
                });
            }


            if (options.followCountLink) {
                steps.push({
                    guideBlockName: 'class-hierarchy-rdf-instances-side-panel-open-all-instances-in-sparql',
                    options: {...options}
                });

                steps.push({
                    guideBlockName: 'sparql-explain-editor',
                    options: {
                        content: 'guide.step_plugin.class-hierarchy-instances-query.content',
                        ...options
                    }
                });
                steps.push({
                    guideBlockName: 'sparql-results-explain',
                    options: angular.extend({}, {
                        content: 'guide.step_plugin.class-hierarchy-instances-results.content',
                        extraContent: options.showExtraCommentSparql !== false ? 'guide.step_plugin.class-hierarchy-instances-results.extraContent' : null,
                        onNextClick: (guide) => {
                            window.history.back();
                            guide.next();
                        },
                        initPreviousStep: () => Promise.resolve()
                    }, options)
                });
            }

            steps.push({
                guideBlockName: 'class-hierarchy-close-rdf-instances-side-panel',
                options: {
                    // If we followed the count link we come back here from another view
                    // and the side panel needs time to open
                    beforeShowPromise: options.followCountLink ? GuideUtils.deferredShow(1500) : Promise.resolve(),
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
                        return reloadAndOpenInfoPanel({RoutingUtil, GuideUtils}, clasInstanceSelector);
                    },
                    ...options
                }
            });

            return steps;
        }
    }
]);
