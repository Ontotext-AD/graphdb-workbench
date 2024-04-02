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
                        },
                        onNextClick: (guide) => {
                            GuideUtils.waitFor(importSettingsButtonSelector)
                                .then(() => guide.next())
                                .catch(() => {
                                    // if we have file uploaded but import dialog is not opened, we have to click the
                                    // import button manually. This can be happened when the guide is started more than one time or
                                    // user was already uploaded rdf file before start the guide.
                                    GuideUtils.clickOnGuideElement('import-file-' + options.resourceFile)();
                                    guide.next();
                                });
                        }
                    }, options)
                },
                // This step is optional and will only appear if the file we want to upload has already been uploaded.
                // If the file is already uploaded, a confirmation dialog will be opened, and this step will display the confirm button of the dialog.
                {
                    guideBlockName: 'clickable-element',
                    options: angular.extend({}, {
                        content: 'guide.step_plugin.import_rdf_file.confirm_duplicate_files_dialog.content',
                        elementSelector: GuideUtils.getElementSelector('.confirm-duplicate-files-dialog .confirm-btn'),
                        url: '/import',
                        placement: 'bottom',
                        class: 'import-file-button-guide-dialog',
                        // Checks whether the confirm dialog is currently open.
                        showOn: () => GuideUtils.isVisible(GuideUtils.getElementSelector('.confirm-duplicate-files-dialog')),
                        onNextClick: () => GuideUtils.clickOnElement('.confirm-duplicate-files-dialog .confirm-btn')(),
                        onPreviousClick: () => {
                            if (GuideUtils.isVisible(GuideUtils.getElementSelector('.confirm-duplicate-files-dialog'))) {
                                return GuideUtils.clickOnElement('.confirm-duplicate-files-dialog .cancel-btn');
                            }
                            return Promise.resolve();
                        }
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
                        beforeShowPromise: () => {
                            const statusInfoElement = GuideUtils.getGuideElementSelector('import-status-info');
                            if (GuideUtils.isVisible(statusInfoElement)) {
                                return Promise.resolve();
                            }
                            return GuideUtils.waitFor(statusInfoElement, 10);
                        },
                        onPreviousClick: () => GuideUtils.clickOnGuideElement('import-file-' + options.resourceFile)()
                    }, options)
                }
            ]);

            return steps;
        }
    }
]);
