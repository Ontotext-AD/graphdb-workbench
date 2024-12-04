import {FunctionalComponent, h} from '@stencil/core';
import {Repository} from '@ontotext/workbench-api';

interface SelectorItemProps {
  repository: Repository
}

/**
 *
 * A StencilJS functional component that renders a repository item in the repository selector dropdown. It displays the repository's
 * icon, ID, and location. If no location is specified, it shows "Local" as the default. This component also allows for
 * dynamic rendering of repository details as part of a list of selectable items.
 *
 * @example
 * <SelectorItemButton repository={repository}></>
 *
 */
export const SelectorItemButton: FunctionalComponent<SelectorItemProps> = ({repository}) => {
  return (
    <div class="repository-selector-dropdown-item">
      {/* TODO: add tooltip with repository info*/}
      <i class={"item-icon icon-repo-" + repository.type}></i>
      <div class="item-label">
        <div class="repository-id">
          {repository.id}
        </div>
        {/* TODO: Check the legacy Workbench `template.html`. There are checks for when the location should be displayed. This depends on GDB-10442.*/}
        <div class="repository-location">
          {repository.location ? repository.location : 'Local'}
        </div>
      </div>
    </div>
  );
};

