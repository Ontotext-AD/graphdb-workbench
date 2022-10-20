PluginRegistry.add('guide.step', [
    {
        guideBlockName: 'execute-sparql-query',
        getSteps: (options, services) => {
            const GuideUtils = services.GuideUtils;
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

                const queryEditorSelector = GuideUtils.getSparqlEditorSelector();
                steps.push({
                    guideBlockName: 'input-element',
                    options: angular.extend({}, {
                        content: 'guide.step_plugin.execute-sparql-query.query-editor.content',
                        url: '/sparql',
                        elementSelector: queryEditorSelector,
                        beforeShowPromise: () => new Promise(function (resolve, reject) {
                            GuideUtils.deferredShow(10)()
                                .then(() => {
                                    GuideUtils.waitFor(queryEditorSelector, 3)
                                        .then(() => resolve())
                                        .catch((error) => {
                                            services.toastr.error(services.$translate.instant('guide.unexpected.error.message'));
                                            reject(error);
                                        });
                                });
                        }),
                        onNextValidate: () => {
                            const editorQuery = GuideUtils.removeWhiteSpaces(window.editor.getValue());
                            const stepQuery = GuideUtils.removeWhiteSpaces(query);
                            if (editorQuery !== stepQuery) {
                                if (editorQuery === 'select*where{?s?p?o.}limit100' || overwriteQuery) {
                                    // The query is the default query OR we previously overwrote it => we can overwrite it
                                    window.editor.setValue(query);
                                } else {
                                    GuideUtils.noNextErrorToast(toastr, $translate, $interpolate,
                                        'guide.step_plugin.execute-sparql-query.query-not-same.error', options);
                                    return false;
                                }
                            }
                            overwriteQuery = true;
                            return true;
                        },
                        initPreviousStep: () => new Promise((resolve, reject) => {
                            if (index === 0) {
                                window.editor.setValue(defaultQuery);
                                resolve();
                            } else {
                                if ('/sparql' !== $location.url()) {
                                    $location.url('/sparql');
                                    $route.reload();
                                }
                                GuideUtils.waitFor(GuideUtils.getSparqlEditorSelector(), 3)
                                    .then(() => {
                                        window.editor.setValue(queries[index - 1]);
                                        resolve();
                                    })
                                    .catch((error) => reject(error));
                            }
                        }),
                        scrollToHandler: GuideUtils.scrollToTop,
                        extraContent: queryDef.queryExtraContent,
                        onScope: (scope) => {
                            scope.copyQuery = () => {
                                window.editor.setValue(query);
                            };
                        }
                    }, options)
                });
                steps.push({
                    guideBlockName: 'clickable-element',
                    options: angular.extend({}, {
                        content: 'guide.step_plugin.execute-sparql-query.run-sparql-query.content',
                        url: '/sparql',
                        elementSelector: GuideUtils.getGuideElementSelector('runSparqlQuery'),
                        onNextClick: (guide) => GuideUtils.clickOnGuideElement('runSparqlQuery')().then(() => guide.next()),
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
                                        GuideUtils.clickOnGuideElement('runSparqlQuery')().then(() => resolve()).catch((error) => reject(error));
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
                        elementSelector: GuideUtils.getSparqlResultsSelector(),
                        fileName: options.fileName,
                        scrollToHandler: GuideUtils.scrollToTop,
                        extraContent: queryDef.resultExtraContent,
                        canBePaused: false,
                        initPreviousStep: (services, stepId) => new Promise((resolve, reject) => {
                            if ('/sparql' !== $location.url()) {
                                $location.url('/sparql');
                                $route.reload();
                                GuideUtils.waitFor(GuideUtils.getSparqlEditorSelector())
                                    .then(() => {
                                        window.editor.setValue(query);
                                        GuideUtils.clickOnGuideElement('runSparqlQuery')().then(() => resolve()).catch((error) => reject(error));
                                    })
                                    .catch((error) => reject(error));
                            } else {
                                const previousStep = services.ShepherdService.getPreviousStepFromHistory(stepId);
                                previousStep.options.initPreviousStep(services, previousStep.options.id)
                                    .then(() => {
                                        window.editor.setValue(query);
                                        resolve();
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
