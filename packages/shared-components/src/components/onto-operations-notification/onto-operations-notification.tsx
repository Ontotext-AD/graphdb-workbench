import {Component, h, Prop, State, Listen, Element} from '@stencil/core';
import {
  OperationGroup,
  OperationStatus,
  OperationStatusSummary,
  OperationGroupSummaryList
} from '@ontotext/workbench-api';

const operationGroupToIcon = {
  [OperationGroup.BACKUP]: 'ri-archive-line',
  [OperationGroup.QUERY]: 'ri-arrow-left-right-line',
  [OperationGroup.CLUSTER]: 'ri-organization-chart',
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
  @State() isOpen = false;

  /** Grouped info about operations, to be displayed in the button */
  private operationGroups: OperationGroupSummaryList;
  private toggleButton: HTMLButtonElement;
  private readonly DROPDOWN_ID = 'onto-operations-dropdown';

  @Listen('click', {target: 'window'})
  handleOutsideClick() {
    if (this.isOpen) {
      this.isOpen = false;
    }
  }

  render() {
    this.operationGroups = this.activeOperations.toOperationGroupSummaryList();

    return (
      <section class="operations-statuses">
        <button
          class={`operations-statuses-dropdown-toggle ${this.isOpen ? 'open' : 'closed'} ${operationStatusToFadeClass[this.activeOperations.status] ?? ''}`}
          ref={(el) => this.toggleButton = el}
          aria-expanded={this.isOpen ? 'true' : 'false'}
          aria-controls={this.DROPDOWN_ID}
          onClick={this.toggleDropdown}>
          {/* Not aria-label, because it would hide the operation counts from the screen readers */}
          <span class="screen-reader-only"><translate-label labelKey={'operations_notification.toggle_label'}></translate-label></span>
          {this.operationGroups.getItems().map((groupSummary) => (
            <section key={groupSummary.id} class="operation-status-header">
              <i aria-hidden="true"
                class={`operation-status-icon icon-1-33x ${operationGroupToIcon[groupSummary.group]} ${operationStatusToWarningClass[groupSummary.status]}`}></i>
              {groupSummary.totalOperations
                ? <sup class="running-operation-count">{groupSummary.totalOperations}</sup>
                : ''
              }
            </section>
          ))}
          <i class={`ri-arrow-down-s-line ${this.isOpen ? 'rotate-180' : ''}`} aria-hidden="true"></i>
        </button>
        {this.isOpen &&
            <div class="operations-dropdown" id={this.DROPDOWN_ID}>
              <ul class="operations-statuses-content">
                {this.activeOperations.allRunningOperations.getItems().map((operation) => (
                  <li key={operation.id}>
                    <a class={`operation-status-content onto-btn no-underline ${operationStatusToWarningClass[operation.status]}`}
                      href={operation.href}
                      target="_blank"
                      rel="noopener noreferrer">
                      <i class={operationGroupToIcon[operation.group]} aria-hidden="true"></i>
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
                      <span class="screen-reader-only"> <translate-label labelKey={'common.label.opens_in_new_window'}></translate-label></span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>}
      </section>
    );
  }

  private toggleDropdown = (event: Event) => {
    event.stopPropagation();
    this.isOpen = !this.isOpen;
  };

  /**
   * Closes the dropdown on Escape and returns the focus to the toggle button.
   */
  @Listen('keydown')
  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape' && this.isOpen) {
      this.isOpen = false;
      this.toggleButton?.focus();
    }
  }
}
