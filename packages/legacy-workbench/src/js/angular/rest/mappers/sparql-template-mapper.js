import {
    service,
    RepositoryContextService,
    REPOSITORY_ID_PARAM,
} from '@ontotext/workbench-api';

export const sparqlTemplateMapper = (data) => {
    if (!data) {
        return [];
    }
    const selectedRepository = service(RepositoryContextService).getSelectedRepository();
    let repositoryIdParam = '';
    if (selectedRepository) {
        repositoryIdParam = `&${REPOSITORY_ID_PARAM}=${selectedRepository.getRepositoryIdentifier()}`;
    }
    return data.map((item) => ({
        id: item,
        href: `sparql-template/create?templateID=${item}${repositoryIdParam}`,
    }));
};
