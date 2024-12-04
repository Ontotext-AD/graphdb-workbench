import {FunctionalComponent, h} from '@stencil/core';
import { Repository} from '@ontotext/workbench-api';

interface SelectorButtonProps {
  repository: Repository;
  defaultToggleButtonName: string;
  location: string;
}

/**
 *
 * A StencilJS component that renders a repository selector button. The button displays the repository's icon and ID
 * if a repository is selected; otherwise, it shows a translated toggle button name. The component dynamically
 * updates the button name when the translation changes.
 *
 * @example
 * <SelectorToggleButton repository={repository}></>
 *
 */
export const SelectorButton: FunctionalComponent<SelectorButtonProps> = ({repository, defaultToggleButtonName, location}) => {
  return (
    <div class="selector-button">
      {/* TODO: add tooltip with repository info*/}
      {repository && <i class={'button-icon icon-repo-' + repository.type}></i>}
      {repository?.id ?? defaultToggleButtonName}{location}
    </div>
  );
};

