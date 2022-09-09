PluginRegistry.add('guide.step', [
    {
        guideBlockName: 'execute-sparql-query',
        getSteps: (options, services) => {
            options.queryAsHtml = options.query.replace(/\r?\n|\r/g, '<br>');
            const GuideUtils = services.GuideUtils;
            const toastr = services.toastr;
            const $translate = services.$translate;
            options.queryExplainMessageTranslated = GuideUtils.translateLocalMessage($translate, options.queryExplainMessage);
            options.resultExplainMessageTranslated = GuideUtils.translateLocalMessage($translate, options.resultExplainMessage);

            return [
                {
                    guideBlockName: 'click-main-menu',
                    options: angular.extend({}, {
                        label: 'menu_sparql',
                        menuSelector: 'menu-sparql'
                    }, options)
                },
                {
                    guideBlockName: 'read-only-element',
                    options: angular.extend({}, {
                        title: 'guide.step_plugin.execute-sparql-query.query-editor.title',
                        content: 'guide.step_plugin.execute-sparql-query.query-editor.content',
                        url: '/sparql',
                        elementSelector: GuideUtils.getGuideElementSelector('queryEditor', ' .CodeMirror-sizer'),
                        onNextValidate: (step) => {
                            const editorQuery = GuideUtils.removeWhiteSpaces(window.editor.getValue());
                            const stepQuery = GuideUtils.removeWhiteSpaces(step.query);
                            if (editorQuery !== stepQuery) {
                                GuideUtils.noNextErrorToast(toastr, $translate,
                                    'guide.step_plugin.execute-sparql-query.query-not-same.error', options);
                                return false;
                            }
                            return true;
                        },
                        scrollToHandler: GuideUtils.scrollToTop,
                    }, options)
                },
                {
                    guideBlockName: 'clickable-element',
                    options: angular.extend({}, {
                        title: 'guide.step_plugin.execute-sparql-query.run-sparql-query.title',
                        content: 'guide.step_plugin.execute-sparql-query.run-sparql-query.content',
                        url: '/sparql',
                        elementSelector: GuideUtils.getGuideElementSelector('runSparqlQuery'),
                        onNextClick: (guide) => {
                            GuideUtils.clickOnGuideElement('runSparqlQuery')();
                            guide.next();

                        },
                        scrollToHandler: GuideUtils.scrollToTop,
                    }, options)
                },
                {
                    guideBlockName: 'read-only-element',
                    options: angular.extend({}, {
                        title: 'guide.step_plugin.execute-sparql-query.result-explain.title',
                        content: 'guide.step_plugin.execute-sparql-query.result-explain.content',
                        url: '/sparql',
                        placement: 'top',
                        elementSelector: GuideUtils.getGuideElementSelector('yasrРesults'),
                        fileName: options.fileName,
                        scrollToHandler: GuideUtils.scrollToTop
                    }, options)
                }
            ];
        }
    }
]);
