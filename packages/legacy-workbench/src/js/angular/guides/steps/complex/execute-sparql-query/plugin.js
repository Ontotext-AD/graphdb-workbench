const createCopyToEditorListener = (YasguiComponentDirectiveUtil, sparqlDirectiveSelector, query) => {
    return (event) => {
        event.preventDefault();
        YasguiComponentDirectiveUtil.setQuery(sparqlDirectiveSelector, query);
    };
};

const SPARQL_DIRECTIVE_SELECTOR = '#query-editor';
const SPARQL_EDITOR_DEFAULT_TITLE = 'view.sparql-editor.title';

PluginRegistry.add('guide.step', [
    {
        guideBlockName: 'sparql-results-visual-button',
        getSteps: (options, services) => {
            const GuideUtils = services.GuideUtils;
            return [
                {
                    guideBlockName: 'clickable-element',
                    options: {
                        content: 'guide.step_plugin.execute-sparql-query.visual-sparql-results.content',
                        // If mainAction is set the title will be set automatically
                        ...(options.mainAction ? {} : {title: SPARQL_EDITOR_DEFAULT_TITLE}),
                        url: 'sparql',
                        elementSelector: GuideUtils.CSS_SELECTORS.SPARQL_VISUAL_BUTTON_SELECTOR,
                        class: 'visual-sparql-results-button',
                        scrollToHandler: GuideUtils.scrollToTop,
                        onNextClick: () => GuideUtils.clickOnElement(GuideUtils.CSS_SELECTORS.SPARQL_VISUAL_BUTTON_SELECTOR)(),
                        ...options,
                    },
                },
            ];
        },
    },
    {
        guideBlockName: 'sparql-editor-run-button',
        getSteps: (options, services) => {
            const GuideUtils = services.GuideUtils;
            const YasguiComponentDirectiveUtil = services.YasguiComponentDirectiveUtil;
            return [
                {
                    guideBlockName: 'clickable-element',
                    options: {
                        // If mainAction is set the title will be set automatically
                        ...(options.mainAction ? {} : {title: SPARQL_EDITOR_DEFAULT_TITLE}),
                        content: 'guide.step_plugin.execute-sparql-query.run-sparql-query.content',
                        url: 'sparql',
                        elementSelector: GuideUtils.CSS_SELECTORS.SPARQL_RUN_BUTTON_SELECTOR,
                        class: 'yasgui-run-button',
                        onNextClick: (guide) => YasguiComponentDirectiveUtil.getOntotextYasguiElementAsync(SPARQL_DIRECTIVE_SELECTOR)
                            .then((yasgui) => {
                                yasgui.query();
                                guide.next();
                            }),
                        scrollToHandler: GuideUtils.scrollToTop,
                        ...options,
                    },
                },
            ];
        },
    },
    {
        guideBlockName: 'sparql-explain-editor',
        getSteps: (options, services) => {
            const GuideUtils = services.GuideUtils;
            const YasguiComponentDirectiveUtil = services.YasguiComponentDirectiveUtil;
            return [
                {
                    guideBlockName: 'input-element',
                    options: {
                        // If mainAction is set the title will be set automatically
                        ...(options.mainAction ? {} : {title: SPARQL_EDITOR_DEFAULT_TITLE}),
                        url: 'sparql',
                        elementSelector: GuideUtils.CSS_SELECTORS.SPARQL_EDITOR_SELECTOR,
                        class: 'sparql-explain-editor',
                        beforeShowPromise: () => YasguiComponentDirectiveUtil.getOntotextYasguiElementAsync(SPARQL_DIRECTIVE_SELECTOR)
                            .then(() => GuideUtils.waitFor(GuideUtils.CSS_SELECTORS.SPARQL_EDITOR_SELECTOR, 3))
                            .then(() => GuideUtils.deferredShow(500)())
                            .catch((error) => {
                                services.toastr.error(services.$translate.instant('guide.unexpected.error.message'));
                                throw error;
                            }),
                        scrollToHandler: GuideUtils.scrollToTop,
                        extraContent: options.extraContent,
                        ...options,
                    },
                },
            ];
        },
    },
    {
        guideBlockName: 'sparql-editor',
        getSteps: (options, services) => {
            const $translate = services.$translate;
            const GuideUtils = services.GuideUtils;
            const YasguiComponentDirectiveUtil = services.YasguiComponentDirectiveUtil;

            const code = document.createElement('code');
            const copy = document.createElement('button');
            const copyToEditorButtonClass = 'guide-copy-to-editor-query-button';
            copy.className = `btn btn-sm btn-secondary ${copyToEditorButtonClass}`;
            copy.innerText = $translate.instant('guide.step_plugin.execute-sparql-query.copy-to-editor.button');
            const query = options.query;
            const copyToEditorListener = createCopyToEditorListener(YasguiComponentDirectiveUtil, SPARQL_DIRECTIVE_SELECTOR, query);
            code.innerText = query;

            let stepHTMLElement;

            return [
                {
                    guideBlockName: 'input-element',
                    options: {
                        // If mainAction is set the title will be set automatically
                        ...(options.mainAction ? {} : {title: SPARQL_EDITOR_DEFAULT_TITLE}),
                        content: 'guide.step_plugin.execute-sparql-query.query-editor.content',
                        url: 'sparql',
                        elementSelector: GuideUtils.CSS_SELECTORS.SPARQL_EDITOR_SELECTOR,
                        class: 'yasgui-query-editor',
                        queryAsHtmlCodeElement: '<div class="shepherd-code">' + code.outerHTML + copy.outerHTML + '</div>',
                        beforeShowPromise: () => YasguiComponentDirectiveUtil.getOntotextYasguiElementAsync(SPARQL_DIRECTIVE_SELECTOR)
                            .then(() => GuideUtils.waitFor(GuideUtils.CSS_SELECTORS.SPARQL_EDITOR_SELECTOR, 3))
                            .then(() => GuideUtils.deferredShow(500)())
                            .catch((error) => {
                                services.toastr.error(services.$translate.instant('guide.unexpected.error.message'));
                                throw error;
                            }),
                        onNextValidate: () => YasguiComponentDirectiveUtil.getOntotextYasguiElementAsync(SPARQL_DIRECTIVE_SELECTOR)
                            .then((yasgui) => yasgui.getQuery().then((query) => ({yasgui, queryFromEditor: query})))
                            .then(({yasgui, queryFromEditor}) => {
                                yasgui.setQuery(query);
                                return true;
                            }),
                        scrollToHandler: GuideUtils.scrollToTop,
                        extraContent: options.queryExtraContent,
                        show: (_guide) => () => {
                            stepHTMLElement = _guide.currentStep.el.querySelector(`.${copyToEditorButtonClass}`);
                            stepHTMLElement.addEventListener('click', copyToEditorListener);
                        },
                        hide: () => () => {
                            if (stepHTMLElement) {
                                stepHTMLElement.removeEventListener('click', copyToEditorListener);
                            }
                        },
                        ...options,
                    },
                },
            ];
        },
    },
    {
        guideBlockName: 'sparql-results-explain',
        getSteps: (options, services) => {
            const GuideUtils = services.GuideUtils;
            return [
                {
                    guideBlockName: 'read-only-element',
                    options: {
                        // If mainAction is set the title will be set automatically
                        ...(options.mainAction ? {} : {title: SPARQL_EDITOR_DEFAULT_TITLE}),
                        content: 'guide.step_plugin.sparql-results-explain.content',
                        url: 'sparql',
                        placement: 'top',
                        elementSelector: GuideUtils.CSS_SELECTORS.SPARQL_RESULTS_SELECTOR,
                        class: 'yasgui-query-results',
                        fileName: options.fileName,
                        scrollToHandler: GuideUtils.scrollToTop,
                        extraContent: options.resultExtraContent,
                        canBePaused: false,
                        ...options,
                    },
                },
            ];
        },
    },
    {
        guideBlockName: 'execute-sparql-query',
        getSteps: (options, services) => {
            const GuideUtils = services.GuideUtils;
            const YasguiComponentDirectiveUtil = services.YasguiComponentDirectiveUtil;
            const toastr = services.toastr;
            const $translate = services.$translate;
            const $interpolate = services.$interpolate;
            const RoutingUtil = services.RoutingUtil;
            options.mainAction = 'execute-sparql-query';

            const steps = [
                {
                    guideBlockName: 'click-main-menu',
                    options: {
                        menu: 'sparql',
                        showIntro: true,
                        ...options,
                    },
                },
            ];

            const defaultQuery = 'select * where { \n\t?s ?p ?o .\n} limit 100 \n';

            let overwriteQuery = false;
            (options.queries ?? []).forEach((queryDef, index) => {
                const query = queryDef.query;

                steps.push({
                    guideBlockName: 'sparql-editor',
                    options: {
                        query,
                        queryExtraContent: queryDef.queryExtraContent,
                        beforeShowPromise: () => YasguiComponentDirectiveUtil.getOntotextYasguiElementAsync(SPARQL_DIRECTIVE_SELECTOR)
                            .then(() => GuideUtils.waitFor(GuideUtils.CSS_SELECTORS.SPARQL_EDITOR_SELECTOR, 3))
                            .then(() => GuideUtils.deferredShow(500)())
                            .catch((error) => {
                                services.toastr.error(services.$translate.instant('guide.unexpected.error.message'));
                                throw error;
                            }),
                        onNextValidate: () => YasguiComponentDirectiveUtil.getOntotextYasguiElementAsync(SPARQL_DIRECTIVE_SELECTOR)
                            .then((yasgui) => yasgui.getQuery().then((query) => ({yasgui, queryFromEditor: query})))
                            .then(({yasgui, queryFromEditor}) => {
                                const editorQuery = GuideUtils.removeWhiteSpaces(queryFromEditor);
                                const stepQuery = GuideUtils.removeWhiteSpaces(query);
                                if (editorQuery !== stepQuery) {
                                    if (editorQuery === 'select*where{?s?p?o.}limit100' || overwriteQuery) {
                                        // The query is the default query OR we previously overwrote it => we can overwrite it
                                        yasgui.setQuery(query);
                                    } else {
                                        GuideUtils.noNextErrorToast(toastr, $translate, $interpolate,
                                            'guide.step_plugin.execute-sparql-query.query-not-same.error', options);
                                        return false;
                                    }
                                }
                                overwriteQuery = true;
                                return true;
                            }),
                        initPreviousStep: () => {
                            if (index === 0) {
                                return YasguiComponentDirectiveUtil.setQuery(SPARQL_DIRECTIVE_SELECTOR, defaultQuery);
                            }

                            const haveToReload = 'sparql' !== RoutingUtil.getCurrentRoute();

                            if (haveToReload) {
                                RoutingUtil.navigate('/sparql');
                            }

                            return GuideUtils.waitFor(GuideUtils.CSS_SELECTORS.SPARQL_EDITOR_SELECTOR)
                                .then(() => YasguiComponentDirectiveUtil.executeSparqlQuery('#query-editor', query));
                        },
                        ...options,
                    },
                });
                steps.push({
                    guideBlockName: 'sparql-editor-run-button',
                    options: {
                        initPreviousStep: (services, stepId) => {
                            const previousStep = services.ShepherdService.getPreviousStepFromHistory(stepId);
                            return previousStep.options.initPreviousStep(services, previousStep.options.id)
                                .then(() => {
                                    const currentStepId = services.ShepherdService.getCurrentStepId();
                                    // Skip expanding of node if last step is "visual-graph-expand"
                                    if (currentStepId === stepId) {
                                        return Promise.resolve();
                                    }

                                    return YasguiComponentDirectiveUtil.executeSparqlQuery('#query-editor', query);
                                });
                        },
                        ...options,
                    },
                });
                steps.push({
                    guideBlockName: 'sparql-results-explain',
                    options: {
                        extraContent: queryDef.resultExtraContent,
                        initPreviousStep: (services, stepId) => {
                            if ('sparql' !== RoutingUtil.getCurrentRoute()) {
                                RoutingUtil.navigate('/sparql');
                                return GuideUtils.waitFor(GuideUtils.CSS_SELECTORS.SPARQL_EDITOR_SELECTOR)
                                    .then(() => GuideUtils.deferredShow(500)())
                                    .then(() => YasguiComponentDirectiveUtil.executeSparqlQuery('#query-editor', query));
                            }

                            const previousStep = services.ShepherdService.getPreviousStepFromHistory(stepId);
                            return previousStep.options.initPreviousStep(services, previousStep.options.id)
                                .then(() => YasguiComponentDirectiveUtil.setQuery(SPARQL_DIRECTIVE_SELECTOR, query));
                        },
                        ...options,
                    },
                });
            });

            return steps;
        },
    },
    {
        guideBlockName: 'sparql-results-click-on-iri',
        getSteps: (options, services) => {
            const GuideUtils = services.GuideUtils;
            return [
                {
                    guideBlockName: 'clickable-element',
                    options: {
                        content: 'guide.step_plugin.sparql-results-click-on-iri.content',
                        placement: 'top',
                        // If mainAction is set the title will be set automatically
                        ...(options.mainAction ? {} : {title: SPARQL_EDITOR_DEFAULT_TITLE}),
                        ...options,
                        scrollToHandler: GuideUtils.scrollToTop,
                        elementSelector: GuideUtils.getSparqlResultsSelectorForIri(options.iri),
                        class: 'table-graph-instance',
                        url: '/sparql',
                        onNextClick: (guide, step) => {
                            GuideUtils.waitFor(step.elementSelector, 3)
                                .then(() => $(step.elementSelector).trigger('click'))
                                .then(() => guide.next());
                        },
                    },
                },
            ];
        },
    },
    {
        guideBlockName: 'visualise-sparql-query',
        getSteps: (options) => {
            const steps = [];
            if (options.useMainMenuNavigation) {
                steps.push({
                    guideBlockName: 'click-main-menu',
                    options: {
                        menu: 'sparql',
                        mainAction: 'execute-sparql-query',
                        showIntro: true,
                        ...options,
                    },
                });
            }

            steps.push({
                guideBlockName: 'sparql-editor',
                options: {
                    query: options.query,
                    queryExtraContent: options.queryExtraContent,
                    ...options,
                },
            }, {
                guideBlockName: 'sparql-editor-run-button',
                options: {...options},
            }, {
                guideBlockName: 'sparql-results-visual-button',
                options: {...options},
            });

            return steps;
        },
    },
]);
