import {FunctionalComponent, h} from '@stencil/core';
import {Repository} from '@ontotext/workbench-api';

interface RepositorySelectionProps {
  repository: Repository;
  defaultToggleButtonName: string;
  location: string;
}

/**
 *
 * A StencilJS component that renders a repository selection. The element displays the repository's icon and ID
 * if a repository is selected; otherwise, it shows a translated toggle button name. The component dynamically
 * updates the name when the translation changes.
 *
 * @example
 * <RepositorySelection repository={repository}></>
 *
 */
export const RepositorySelection: FunctionalComponent<RepositorySelectionProps> = ({repository, defaultToggleButtonName, location}) => {
  return (
    <div class="repository-selection">
      {/* TODO: add tooltip with repository info*/}
      {repository && <i class={'button-icon icon-repo-' + repository.type}></i>}&nbsp;{repository?.id ?? defaultToggleButtonName}{location}
    </div>
  );
};

