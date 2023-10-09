PluginRegistry.add('guide.step', [
    {
        guideBlockName: 'execute-sparql-query',
        getSteps: (options, services) => {
            const SPARQL_DIRECTIVE_SELECTOR = '#query-editor';
            const GuideUtils = services.GuideUtils;
            const YasguiComponentDirectiveUtil = services.YasguiComponentDirectiveUtil;
            const toastr = services.toastr;
            const $translate = services.$translate;
            const $interpolate = services.$interpolate;
            const $location = services.$location;
            const $route = services.$route;
            options.mainAction = 'execute-sparql-query';

            const code = document.createElement('code');
            const copy = document.createElement('button');
            copy.className = 'btn btn-sm btn-secondary';
            copy.innerText = $translate.instant('guide.step_plugin.execute-sparql-query.copy-to-editor.button');
            copy.setAttribute('ng-click', 'copyQuery()');

            const steps = [
                {
                    guideBlockName: 'click-main-menu',
                    options: angular.extend({}, {
                        menu: 'sparql',
                        showIntro: true
                    }, options)
                }
            ];

            const defaultQuery = 'select * where { \n\t?s ?p ?o .\n} limit 100 \n';
            const queries = {};
            queries[-1] = 'PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\nselect * where { \n\t?s ?p ?o .\n?o rdf:type ""\n} limit 100 ';

            let overwriteQuery = false;
            options.queries.forEach((queryDef, index) => {
                const query = queryDef.query;
                queries[index] = query;
                code.innerText = query;
                options.queryAsHtmlCodeElement = '<div class="shepherd-code">' + code.outerHTML + copy.outerHTML + '</div>';

                steps.push({
                    guideBlockName: 'input-element',
                    options: angular.extend({}, {
                        content: 'guide.step_plugin.execute-sparql-query.query-editor.content',
                        url: '/sparql',
                        elementSelector: GuideUtils.CONSTANTS.SPARQL_EDITOR_SELECTOR,
                        class: 'yasgui-query-editor-guide-dialog',
                        beforeShowPromise: () => {
                            return YasguiComponentDirectiveUtil.getOntotextYasguiElementAsync(SPARQL_DIRECTIVE_SELECTOR)
                                .then(() => GuideUtils.waitFor(GuideUtils.CONSTANTS.SPARQL_EDITOR_SELECTOR, 3))
                                .catch((error) => {
                                    services.toastr.error(services.$translate.instant('guide.unexpected.error.message'));
                                    throw error;
                                });
                        },
                        onNextValidate: () => {
                            return YasguiComponentDirectiveUtil.getOntotextYasguiElementAsync(SPARQL_DIRECTIVE_SELECTOR)
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
                                });
                        },
                        initPreviousStep: () => new Promise((resolve, reject) => {
                            if (index === 0) {
                                YasguiComponentDirectiveUtil.setQuery(SPARQL_DIRECTIVE_SELECTOR, defaultQuery)
                                    .then(() => resolve());
                            } else {
                                const haveToReload = '/sparql' !== $location.url();

                                if (haveToReload) {
                                    $location.url('/sparql');
                                    $route.reload();
                                }
                                GuideUtils.waitFor(GuideUtils.CONSTANTS.SPARQL_EDITOR_SELECTOR)
                                    .then(() => {
                                        YasguiComponentDirectiveUtil.executeSparqlQuery("#query-editor", query)
                                            .then(() => {
                                                resolve();
                                            })
                                            .catch((error) => reject(error));
                                    });
                            }
                        }),
                        scrollToHandler: GuideUtils.scrollToTop,
                        extraContent: queryDef.queryExtraContent,
                        onScope: (scope) => {
                            scope.copyQuery = () => YasguiComponentDirectiveUtil.setQuery(SPARQL_DIRECTIVE_SELECTOR, query).then(() => {});
                        }
                    }, options)
                });
                steps.push({
                    guideBlockName: 'clickable-element',
                    options: angular.extend({}, {
                        content: 'guide.step_plugin.execute-sparql-query.run-sparql-query.content',
                        url: '/sparql',
                        elementSelector: GuideUtils.CONSTANTS.SPARQL_RUN_BUTTON_SELECTOR,
                        class: 'yasgui-run-button-guide-dialog',
                        onNextClick: (guide) => YasguiComponentDirectiveUtil.getOntotextYasguiElementAsync(SPARQL_DIRECTIVE_SELECTOR)
                                .then((yasgui) => {
                                    yasgui.query();
                                    guide.next();
                                }),
                        scrollToHandler: GuideUtils.scrollToTop,
                        canBePaused: false,
                        initPreviousStep: (services, stepId) => new Promise((resolve, reject) => {
                            const previousStep = services.ShepherdService.getPreviousStepFromHistory(stepId);
                            previousStep.options.initPreviousStep(services, previousStep.options.id)
                                .then(() => {
                                    const currentStepId = services.ShepherdService.getCurrentStepId();
                                    // Skip expanding of node if last step is "visual-graph-expand"
                                    if (currentStepId === stepId) {
                                        resolve();
                                    } else {
                                        YasguiComponentDirectiveUtil.executeSparqlQuery("#query-editor", query)
                                            .then(() => resolve())
                                            .catch((error) => reject(error));
                                    }
                                })
                                .catch((error) => reject(error));
                        })
                    }, options)
                });
                steps.push({
                    guideBlockName: 'read-only-element',
                    options: angular.extend({}, {
                        content: 'guide.step_plugin.execute-sparql-query.result-explain.content',
                        url: '/sparql',
                        placement: 'top',
                        elementSelector: GuideUtils.CONSTANTS.SPARQL_RESULTS_SELECTOR,
                        class: 'yasgui-query-results-guide-dialog',
                        fileName: options.fileName,
                        scrollToHandler: GuideUtils.scrollToTop,
                        extraContent: queryDef.resultExtraContent,
                        canBePaused: false,
                        initPreviousStep: (services, stepId) => new Promise((resolve, reject) => {
                            if ('/sparql' !== $location.url()) {
                                $location.url('/sparql');
                                $route.reload();
                                GuideUtils.waitFor(GuideUtils.CONSTANTS.SPARQL_EDITOR_SELECTOR)
                                    .then(() => {
                                        YasguiComponentDirectiveUtil.executeSparqlQuery("#query-editor", query)
                                            .then(() => {
                                                resolve();
                                            })
                                            .catch((error) => reject(error));
                                    });
                            } else {
                                const previousStep = services.ShepherdService.getPreviousStepFromHistory(stepId);
                                previousStep.options.initPreviousStep(services, previousStep.options.id)
                                    .then(() => {
                                        YasguiComponentDirectiveUtil.setQuery(SPARQL_DIRECTIVE_SELECTOR, query).then(() => resolve());
                                    })
                                    .catch((error) => reject(error));
                            }
                        })
                    }, options)
                });
            });

            return steps;
        }
    }
]);
