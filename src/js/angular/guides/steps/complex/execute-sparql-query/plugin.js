PluginRegistry.add('guide.step', [
    {
        guideBlockName: 'execute-sparql-query',
        getSteps: (options, services) => {
            const GuideUtils = services.GuideUtils;
            const toastr = services.toastr;
            const $translate = services.$translate;
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

            let overwriteQuery = false;
            options.queries.forEach(queryDef => {
                const query = queryDef.query;
                code.innerText = query;
                options.queryAsHtmlCodeElement = '<div class="shepherd-code">' + code.outerHTML + copy.outerHTML + '</div>';
                steps.push({
                    guideBlockName: 'input-element',
                    options: angular.extend({}, {
                        content: 'guide.step_plugin.execute-sparql-query.query-editor.content',
                        url: '/sparql',
                        elementSelector: GuideUtils.getGuideElementSelector('queryEditor', ' .CodeMirror-code'),
                        onNextValidate: (step) => {
                            const editorQuery = GuideUtils.removeWhiteSpaces(window.editor.getValue());
                            const stepQuery = GuideUtils.removeWhiteSpaces(query);
                            if (editorQuery !== stepQuery) {
                                if (editorQuery === 'select*where{?s?p?o.}limit100' || overwriteQuery) {
                                    // The query is the default query OR we previously overwrote it => we can overwrite it
                                    window.editor.setValue(query);
                                } else {
                                    GuideUtils.noNextErrorToast(toastr, $translate,
                                        'guide.step_plugin.execute-sparql-query.query-not-same.error', options);
                                    return false;
                                }
                            }
                            overwriteQuery = true;
                            return true;
                        },
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
                    }, options)
                });
                steps.push({
                    guideBlockName: 'read-only-element',
                    options: angular.extend({}, {
                        content: 'guide.step_plugin.execute-sparql-query.result-explain.content',
                        url: '/sparql',
                        placement: 'top',
                        elementSelector: GuideUtils.getGuideElementSelector('yasrРesults'),
                        fileName: options.fileName,
                        scrollToHandler: GuideUtils.scrollToTop,
                        extraContent: queryDef.resultExtraContent
                    }, options)
                });
            });

            return steps;
        }
    }
]);
