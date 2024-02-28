PluginRegistry.add('guide.step', [
    {
        guideBlockName: 'import-rdf-file',
        getSteps: (options, services) => {
            const GuideUtils = services.GuideUtils;
            const toastr = services.toastr;
            const $translate = services.$translate;
            const $interpolate = services.$interpolate;
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

            const importSettingsButtonSelector = GuideUtils.getGuideElementSelector('import-settings-import-button');
            steps.push(...[
                {
                    guideBlockName: 'clickable-element',
                    options: angular.extend({}, {
                        content: 'guide.step_plugin.import_rdf_file.content',
                        url: '/import',
                        elementSelector: GuideUtils.getGuideElementSelector('uploadRdfFileButton'),
                        class: 'upload-rdf-file-button-guide-dialog',
                        // Disable default behavior of service when element is clicked.
                        advanceOn: undefined,
                        show: (guide) => () => {
                            // Add "change" listener to the file upload input, it will be triggered when a file is selected.
                            $('#ngf-wb-import-uploadFile')
                                .on('change.importRdfFile', function () {
                                    // Check if expected file is selected, then process to the next step.
                                    GuideUtils.waitFor(GuideUtils.getGuideElementSelector('import-file-' + options.resourceFile), 2)
                                        .then(() => guide.next());
                                });
                        },
                        hide: () => () => {
                            // Remove ths listener from element. It is important when step is hided.
                            $('#ngf-wb-import-uploadFile').off('change.importRdfFile');
                        },
                        onNextValidate: () => {
                            if (!$(GuideUtils.getGuideElementSelector('import-file-' + options.resourceFile)).length) {
                                GuideUtils.noNextErrorToast(toastr, $translate, $interpolate,
                                    'guide.step_plugin.import_rdf_file.file-must-be-uploaded', options);
                                return Promise.resolve(false);
                            }

                            return Promise.resolve(true);
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
                        class: 'import-file-button-guide-dialog',
                        onNextClick: () => GuideUtils.clickOnGuideElement('import-file-' + options.resourceFile)()
                    }, options)
                },
                {
                    guideBlockName: 'clickable-element',
                    options: angular.extend({}, {
                        content: 'guide.step_plugin.import_rdf_file.import-settings.import.button.content',
                        elementSelector: importSettingsButtonSelector,
                        placement: 'top',
                        class: 'import-settings-import-file-button-guide-dialog',
                        onPreviousClick: () => new Promise(function (resolve) {
                            GuideUtils.clickOnGuideElement('import-settings-cancel-button')()
                                .then(() => resolve());
                        }),
                        beforeShowPromise: () => services.GuideUtils.deferredShow(300)()
                            .then(() => services.GuideUtils.waitFor(importSettingsButtonSelector, 3)
                                .catch((error) => {
                                    services.toastr.error(services.$translate.instant('guide.unexpected.error.message'));
                                    return Promise.reject(error);
                                    })),
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
                        class: 'import-status-info-guide-dialog',
                        onPreviousClick: () => GuideUtils.clickOnGuideElement('import-file-' + options.resourceFile)()
                    }, options)
                }
            ]);

            return steps;
        }
    }
]);
