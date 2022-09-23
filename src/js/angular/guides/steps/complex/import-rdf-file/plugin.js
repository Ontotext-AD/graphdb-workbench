PluginRegistry.add('guide.step', [
    {
        guideBlockName: 'import-rdf-file',
        getSteps: (options, services) => {
            const GuideUtils = services.GuideUtils;
            const toastr = services.toastr;
            const $translate = services.$translate;
            options.mainAction = 'import-file';

            const steps = [
                {
                    guideBlockName: 'click-main-menu',
                    options: angular.extend({}, {
                        menu: 'import',
                        showIntro: true
                    }, options)
                }
            ];

            if (options.resourcePath) {
                steps.push(
                    {
                        guideBlockName: 'download-guide-resource',
                        options: angular.extend({}, {
                            title: ''
                        }, options)
                    }
                );
            }

            steps.push(...[
                {
                    guideBlockName: 'clickable-element',
                    options: angular.extend({}, {
                        content: 'guide.step_plugin.import_rdf_file.content',
                        url: '/import',
                        elementSelector: GuideUtils.getGuideElementSelector('uploadRdfFileButton'),
                        onNextValidate: () => {
                            if (!$(GuideUtils.getGuideElementSelector('import-file-' + options.resourceFile)).length) {
                                GuideUtils.noNextErrorToast(toastr, $translate,
                                    'guide.step_plugin.import_rdf_file.file-must-be-uploaded', options);
                                return false;
                            } else {
                                return true;
                            }
                        }
                    }, options)
                },
                {
                    guideBlockName: 'clickable-element',
                    options: angular.extend({}, {
                        content: 'guide.step_plugin.import_rdf_file.import-file.button.content',
                        elementSelector: GuideUtils.getGuideElementSelector('import-file-' + options.resourceFile),
                        url: '/import',
                        placement: 'left',
                        onNextClick: () => GuideUtils.clickOnGuideElement('import-file-' + options.resourceFile)()
                    }, options)
                },
                {
                    guideBlockName: 'clickable-element',
                    options: angular.extend({}, {
                        content: 'guide.step_plugin.import_rdf_file.import-settings.import.button.content',
                        elementSelector: GuideUtils.getGuideElementSelector('import-settings-import-button'),
                        placement: 'top',
                        onPreviousClick: (guide) => GuideUtils.clickOnGuideElement('import-settings-cancel-button')().then(() => guide.back()),
                        onNextClick: () => GuideUtils.clickOnGuideElement('import-settings-import-button')(),
                        canBePaused: false
                    }, options)
                },
                {
                    guideBlockName: 'read-only-element',
                    options: angular.extend({}, {
                        content: 'guide.step_plugin.import_status_info.content',
                        url: '/import',
                        elementSelector: GuideUtils.getGuideElementSelector('import-status-info'),
                        onPreviousClick: (guide) => GuideUtils.clickOnGuideElement('import-file-' + options.resourceFile)().then(() => guide.back())
                    }, options)
                }
            ]);

            return steps;
        }
    }
]);
