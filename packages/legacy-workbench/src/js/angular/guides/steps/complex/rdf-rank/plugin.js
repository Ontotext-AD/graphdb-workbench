const RDF_RANK_DEFAULT_TITLE = 'view.rdf.rank.title'

PluginRegistry.add('guide.step', [
    {
        guideBlockName: 'rdf-rank-compute-fill',
        getSteps: (options, services) => {
            const GuideUtils = services.GuideUtils;
            const computeRDFRankButtonSelector = GuideUtils.getGuideElementSelector('compute-rdf-rank-btn');
            return [{
                guideBlockName: 'clickable-element',
                options: {
                    url: 'rdfrank',
                    content: 'guide.step_plugin.rdf-rank-compute-fill.content',
                    elementSelector: computeRDFRankButtonSelector,
                    // If mainAction is set the title will be set automatically
                    ...(options.mainAction ? {} : {title: RDF_RANK_DEFAULT_TITLE}),
                    onNextClick: computeRDFRankButtonSelector,
                    ...options
                }
            }]
        }
    }
]);

