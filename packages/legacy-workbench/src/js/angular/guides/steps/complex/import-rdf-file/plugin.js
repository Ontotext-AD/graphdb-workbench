const IMPORT_FILE_DEFAULT_STEP_TITLE = "guide.step-action.import-file";

PluginRegistry.add('guide.step', [
    {
        guideBlockName: 'import-upload-rdf-file',
        getSteps: (options, services) => {
            const GuideUtils = services.GuideUtils;
            const toastr = services.toastr;
            const $translate = services.$translate;
            const $interpolate = services.$interpolate;
            const EventEmitterService = services.EventEmitterService;
            const importSettingsButtonSelector = GuideUtils.getGuideElementSelector('import-settings-import-button');
            let filesForUploadSelectedSubscription;
            return [
                {
                    guideBlockName: 'clickable-element',
                    options: {
                        content: 'guide.step_plugin.import_rdf_file.content',
                        class: 'upload-rdf-file-button',
                        // If mainAction is set the title will be set automatically
                        ...(options.mainAction ? {} : {title: IMPORT_FILE_DEFAULT_STEP_TITLE}),
                        ...options,
                        url: 'import',
                        elementSelector: GuideUtils.getGuideElementSelector('uploadRdfFileButton'),
                        // Disable default behavior of service when element is clicked.
                        advanceOn: undefined,
                        show: (guide) => () => {
                            // Subscribes to event "filesForUploadSelected", when the step is showing, this will give opportunity
                            // to canceling uploading if user not choose correct file.
                            filesForUploadSelectedSubscription = EventEmitterService.subscribe('filesForUploadSelected', ((eventData) => {
                                const uploadedFiles = eventData.files || [];
                                if (uploadedFiles.some((uploadedFile) => uploadedFile.name === options.resourceFile)) {
                                    // When tha correct file is selected, the guide can continue.

                                    // Check for duplicated name, if import button for guide rdf data exist.
                                    if (GuideUtils.isVisible(GuideUtils.getGuideElementSelector('import-file-' + options.resourceFile))) {
                                        GuideUtils.getOrWaitFor('.confirm-duplicate-files-dialog')
                                            .then(() => guide.next());
                                    } else {
                                        GuideUtils.getOrWaitFor(importSettingsButtonSelector)
                                            .then(() => guide.next());
                                    }
                                } else {
                                    // Canceling the automatic uploading of files
                                    // because the guide rdf file is not selected.
                                    GuideUtils.noNextErrorToast(toastr, $translate, $interpolate, 'guide.step_plugin.import_rdf_file.unexpected-file', options);
                                    eventData.cancel = true;
                                }
                            }));
                        },
                        hide: () => () => {
                            if (filesForUploadSelectedSubscription) {
                                filesForUploadSelectedSubscription();
                            }
                        },
                        onNextValidate: () => {
                            return Promise.allSettled([GuideUtils.getOrWaitFor('.confirm-duplicate-files-dialog'), GuideUtils.getOrWaitFor(GuideUtils.getGuideElementSelector('import-file-' + options.resourceFile))])
                                .then(([confirmDialogPromise, importButtonPromise]) => {
                                    // There are two ways to exit this step:
                                    // if the duplication dialog is opened
                                    // or if the import button for the guide file is displayed.
                                    // The first scenario indicates that the user is trying to upload the same file,
                                    // while the second scenario suggests
                                    // that the guide has been started more than once.
                                    if ('rejected' === confirmDialogPromise.status && 'rejected' === importButtonPromise.status) {
                                        GuideUtils.noNextErrorToast(toastr, $translate, $interpolate, 'guide.step_plugin.import_rdf_file.file-must-be-uploaded', options);
                                        return false;
                                    }
                                    return true;
                                });
                        },
                        onNextClick: (guide) => {
                            GuideUtils.getOrWaitFor(GuideUtils.getGuideElementSelector('import-file-' + options.resourceFile))
                                .then((element) => {
                                    // If we have file import button for the guide rdf file,
                                    // this indicates that we go through this step for the second time.
                                    // This can happen if the user starts the guide for the second time.
                                    element.click();
                                })
                                .catch((error) => {
                                    // This shouldn't be happening.
                                    console.error(error);
                                })
                                .finally(() => guide.next());
                        },
                    },
                },
            ];
        },
    },
    {
        guideBlockName: 'import-confirm-duplicate-files',
        getSteps: (options, services) => {
            const GuideUtils = services.GuideUtils;
            return [
                {
                    guideBlockName: 'clickable-element',
                    options: {
                        content: 'guide.step_plugin.import_rdf_file.confirm_duplicate_files_dialog.content',
                        // If mainAction is set the title will be set automatically
                        ...(options.mainAction ? {} : {title: IMPORT_FILE_DEFAULT_STEP_TITLE}),
                        placement: 'bottom',
                        class: 'import-file-button',
                        ...options,
                        url: 'import',
                        elementSelector: GuideUtils.getElementSelector('.confirm-duplicate-files-dialog .confirm-overwrite-btn'),
                        skipFromHistory: true,
                        // Checks whether the confirm dialog is currently open.
                        showOn: () => GuideUtils.isVisible(GuideUtils.getElementSelector('.confirm-duplicate-files-dialog')),
                        onNextClick: () => GuideUtils.clickOnElement('.confirm-duplicate-files-dialog .confirm-overwrite-btn')(),
                        onPreviousClick: () => {
                            if (GuideUtils.isVisible(GuideUtils.getElementSelector('.confirm-duplicate-files-dialog'))) {
                                return GuideUtils.clickOnElement('.confirm-duplicate-files-dialog .cancel-btn');
                            }
                            return Promise.resolve();
                        },
                    },
                },
            ];
        },
    },
    {
      guideBlockName: 'import-click-on-import-button',
      getSteps: (options, services) => {
          const GuideUtils = services.GuideUtils;
          const importSettingsButtonSelector = GuideUtils.getGuideElementSelector('import-settings-import-button');
          return [
              {
                  guideBlockName: 'clickable-element',
                  options: {
                      content: 'guide.step_plugin.import_rdf_file.import-settings.import.button.content',
                      // If mainAction is set the title will be set automatically
                      ...(options.mainAction ? {} : {title: IMPORT_FILE_DEFAULT_STEP_TITLE}),
                      placement: 'top',
                      class: 'import-settings-import-file-button',
                      ...options,
                      elementSelector: importSettingsButtonSelector,
                      onPreviousClick: () => new Promise(function(resolve) {
                          GuideUtils.clickOnGuideElement('import-settings-cancel-button')()
                              .then(() => resolve());
                      }),
                      beforeShowPromise: () => services.GuideUtils.deferredShow(300)()
                          .then(() => GuideUtils.getOrWaitFor(importSettingsButtonSelector, 3)
                              .catch((error) => {
                                  services.toastr.error(services.$translate.instant('guide.unexpected.error.message'));
                                  return Promise.reject(error);
                              }),
                          ),
                      onNextClick: () => GuideUtils.clickOnGuideElement('import-settings-import-button')(),
                      canBePaused: false,
                  },
              },
          ];
      },
    },
    {
      guideBlockName: 'import-show-progress',
      getSteps: (options, services) => {
          const GuideUtils = services.GuideUtils;
          return [
              {
                  guideBlockName: 'read-only-element',
                  options: {
                      content: 'guide.step_plugin.import_status_info.content',
                      // If mainAction is set the title will be set automatically
                      ...(options.mainAction ? {} : {title: IMPORT_FILE_DEFAULT_STEP_TITLE}),
                      class: 'import-status-info',
                      ...options,
                      url: 'import',
                      elementSelector: '.import-resource-message',
                      beforeShowPromise: () => {
                          if (GuideUtils.isVisible('.import-resource-message')) {
                              return Promise.resolve();
                          }
                          return GuideUtils.waitFor('.import-resource-message', 10);
                      },
                      onPreviousClick: () => GuideUtils.getOrWaitFor(GuideUtils.getGuideElementSelector('import-file-' + options.resourceFile), 10)
                          .then((element) => {
                              element.click();
                          }),
                  },
              },
          ];
      },
    },
    {
        guideBlockName: 'import-rdf-file',
        getSteps: (options, services) => {
            options.mainAction = 'import-file';

            const steps = [
                {
                    guideBlockName: 'click-main-menu',
                    options: angular.extend({}, {
                        menu: 'import',
                        showIntro: true,
                    }, options),
                },
            ];

            if (options.resourcePath) {
                steps.push(
                    {
                        guideBlockName: 'download-guide-resource',
                        options: angular.extend({}, {
                            title: '',
                        }, options),
                    },
                );
            }

            steps.push(...[
                {
                    guideBlockName: 'import-upload-rdf-file', options: {
                        disablePreviousFlow: false,
                        ...options,
                    },
                },
                // This step is optional and will only appear if the file we want to upload has already been uploaded.
                // If the file is already uploaded, a confirmation dialog will be opened, and this step will display the confirm button of the dialog.
                {
                    guideBlockName: 'import-confirm-duplicate-files', options: {...options},
                },
                {
                    guideBlockName: 'import-click-on-import-button', options: {...options},
                },
                {
                    guideBlockName: 'import-show-progress', options: {...options},
                },
            ]);

            return steps;
        },
    },
]);
