import {service} from '../../../providers';
import {RepositoryContextService} from '../../repository';
import {REPOSITORY_ID_PARAM} from '../../../models/repositories';
import {SparqlTemplatesResponse} from '../response';
import {SparqlTemplatesList} from '../../../models/sparql-templates';

export const mapSparqlTemplatesResponseToModel = (data: SparqlTemplatesResponse): SparqlTemplatesList => {
  if (!data) {
    return {items: []};
  }
  const selectedRepository = service(RepositoryContextService).getSelectedRepository();
  let repositoryIdParam = '';
  if (selectedRepository) {
    repositoryIdParam = `${REPOSITORY_ID_PARAM}=${selectedRepository.id}&`;
  }

  return {
    items: data.map((item) => ({
      id: item,
      href: `sparql-template/create?${repositoryIdParam}templateID=${encodeURIComponent(item)}`,
    }))
  };
};
