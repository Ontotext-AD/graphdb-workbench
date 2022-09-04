PluginRegistry.add('guide.step', [
    {
        'guideBlockName': 'import-rdf-file',
        'getSteps': (options, GuideUtils) => {
            return [
                {
                    'guideBlockName': 'click-main-menu',
                    'options': angular.extend({}, {
                        'label': 'menu_import',
                        'menuSelector': 'menu-import'
                    }, options)
                },
                {
                    'guideBlockName': 'read-only-element',
                    'options': angular.extend({}, {
                        'title': 'guide.step_plugin.import_rdf_file.title',
                        'content': 'guide.step_plugin.import_rdf_file.content',
                        'url': '/import',
                        'elementSelector': GuideUtils.getGuideElementSelector('uploadRdfFileButton'),
                        'fileName': options.fileName,
                        'onNextValidate': (step, toastr, $translate) => {
                            if (!$(GuideUtils.getGuideElementSelector('import-file-' + options.fileName)).length) {
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
                    'guideBlockName': 'clickable-element',
                    'options': angular.extend({}, {
                        'title': 'guide.step_plugin.import_rdf_file.import-file.button.title',
                        'content': 'guide.step_plugin.import_rdf_file.import-file.button.content',
                        'elementSelector': GuideUtils.getGuideElementSelector('import-file-' + options.fileName),
                        'url': '/import',
                        placement: 'left',
                        onNextClick: () => {
                            GuideUtils.clickOnGuideElement('import-file-' + options.fileName)();
                        }
                    }, options)
                },
                {
                    'guideBlockName': 'clickable-element',
                    'options': angular.extend({}, {
                        'title': 'guide.step_plugin.import_rdf_file.import-settings.import.button.title',
                        'content': 'guide.step_plugin.import_rdf_file.import-settings.import.button.content',
                        'elementSelector': GuideUtils.getGuideElementSelector('import-settings-import-button'),
                        'placement': 'top',
                        onPreviousClick: (guide) => {
                            GuideUtils.clickOnGuideElement('import-settings-cancel-button')();
                            guide.back();
                        },
                        onNextClick: () => {
                            GuideUtils.clickOnGuideElement('import-settings-import-button')();
                        },
                        canBePaused: false
                    }, options)
                },
                {
                    'guideBlockName': 'read-only-element',
                    'options': angular.extend({}, {
                        'title': 'guide.step_plugin.import_status_info.title',
                        'content': 'guide.step_plugin.import_status_info.content',
                        'url': '/import',
                        'elementSelector': GuideUtils.getGuideElementSelector('import-status-info'),
                        onPreviousClick: (guide) => {
                            GuideUtils.clickOnGuideElement('import-file-' + options.fileName)();
                            guide.back();
                        },
                    }, options)
                }
            ]
        }
    }
]);
