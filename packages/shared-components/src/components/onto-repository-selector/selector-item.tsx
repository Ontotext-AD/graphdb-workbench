import {FunctionalComponent, h} from '@stencil/core';
import {Repository} from '@ontotext/workbench-api';

interface SelectorItemProps {
  repository: Repository
}

/**
 *
 * A StencilJS functional component that renders a repository item in the repository selector dropdown. It displays the repository's
 * icon, ID, and location. If no location is specified, it shows "Local" as the default. This component also allows for
 * dynamic rendering of repository details as part of a list of selectable items. A FedX repository is marked as deprecated.
 *
 * @example
 * <SelectorItemButton repository={repository}></>
 *
 */
export const SelectorItemButton: FunctionalComponent<SelectorItemProps> = ({repository}) => {
  return (
    <div class="repository-selector-dropdown-item">
      <i class={'item-icon icon-repo-' + repository.type}></i>
      <div class="item-label">
        <div class="repository-id-row">
          <div class="repository-id">
            {repository.id}
          </div>
          {repository.isFedx() &&
            <span class="deprecated-tag" data-test="repository-selector-fedx-deprecated-tag">
              <translate-label labelKey="repository-selector.deprecated"></translate-label>
            </span>}
        </div>
        {/* TODO: Check the legacy Workbench `template.html`. There are checks for when the location should be displayed. This depends on GDB-10442.*/}
        <div class="repository-location body-xs-light">
          {repository.location ? repository.location : 'Local'}
        </div>
      </div>
    </div>
  );
};

