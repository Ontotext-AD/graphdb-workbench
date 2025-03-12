import {Component, h, Prop, State, Listen, Element} from '@stencil/core';
import {
  OperationGroup,
  OperationStatus,
  OperationStatusSummary,
  OperationGroupSummaryList, MapperProvider, OperationGroupSummaryListMapper
} from '@ontotext/workbench-api';

const operationGroupToIcon = {
  [OperationGroup.BACKUP]: 'fa-regular fa-archive',
  [OperationGroup.QUERY]: 'fa-regular fa-arrow-right-arrow-left',
  [OperationGroup.CLUSTER]: 'fa-regular fa-sitemap',
  // TODO: change import icon to font awesome one, when available
  [OperationGroup.IMPORT]: 'icon-import'
};

const operationStatusToWarningClass = {
  [OperationStatus.WARNING]: 'status-warning',
  [OperationStatus.INFORMATION]: 'status-information',
  [OperationStatus.CRITICAL]: 'status-critical'
};

const operationStatusToFadeClass = {
  [OperationStatus.WARNING]: 'onto-btn-fade-warning',
  [OperationStatus.CRITICAL]: 'onto-btn-fade-danger'
};

@Component({
  tag: 'onto-operations-notification',
  styleUrl: 'onto-operations-notification.scss'
})
export class OntoOperationsNotification {
  @Element() el: HTMLElement;

  /** The active operations summary. Holds general status and all current operations */
  @Prop() activeOperations: OperationStatusSummary;

  /** Whether the dropdown menu is open or closed */
  @State() isOpen: boolean = false;

  /** Grouped info about operations, to be displayed in the button */
  private operationGroups: OperationGroupSummaryList;

  @Listen('click', {target: 'window'})
  handleOutsideClick() {
    if (this.isOpen) {
      this.isOpen = false;
    }
  }

  render() {
    this.operationGroups = MapperProvider
      .get(OperationGroupSummaryListMapper)
      .mapToModel(this.activeOperations.toOperationsGroupSummary());

    return (
      <section class="operations-statuses">
        <button
          class={`operations-statuses-dropdown-toggle ${this.isOpen ? 'open' : 'closed'} ${operationStatusToFadeClass[this.activeOperations.status] ?? ''}`}
          onClick={this.toggleDropdown}>
          {this.operationGroups.getItems().map((groupSummary) => (
            <section key={groupSummary.id} class="operation-status-header">
              <i
                class={`${operationGroupToIcon[groupSummary.group]} ${operationStatusToWarningClass[groupSummary.status]}`}></i>
              {groupSummary.totalOperations
                ? <sup class="running-operation-count tag-info">{groupSummary.totalOperations}</sup>
                : ''
              }
            </section>
          ))}
          <i class={`fa-regular fa-angle-down ${this.isOpen ? 'fa-rotate-180' : ''}`}></i>
        </button>
        {this.isOpen &&
            <ul class="operations-dropdown">
                <section class="operations-statuses-content">
                  {this.activeOperations.allRunningOperations.getItems().map((operation) => (
                    <li key={operation.id}>
                      <a class={`operation-status-content onto-btn ${operationStatusToWarningClass[operation.status]}`}
                         target="_blank"
                         onClick={(e) => this.onLinkClicked(e, operation.href)}>
                        <i class={operationGroupToIcon[operation.group]}></i>
                        <span class="operation-status-label">
                          <translate-label
                            labelKey={`operations_notification.links.${operation.labelKey}`}>
                          </translate-label>
                        </span>

                        <span class="operation-number">
                          {operation.count
                            ? <span class="operation-status-running-operation-count">{operation.count}</span>
                            : ''
                          }
                        </span>
                      </a>
                    </li>
                  ))}
                </section>
            </ul>}
      </section>
    );
  }

  private toggleDropdown = (event: Event) => {
    event.stopPropagation();
    this.isOpen = !this.isOpen;
  };

  private onLinkClicked(event: Event, href: string) {
    event.preventDefault();
    // Navigate to the license page without reloading.
    // @ts-ignore
    window.singleSpa.navigateToUrl(href);
  }
}
