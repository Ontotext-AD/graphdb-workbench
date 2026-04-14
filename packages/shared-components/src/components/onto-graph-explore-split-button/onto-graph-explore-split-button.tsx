import {Component, Event, EventEmitter, h, Prop, State} from '@stencil/core';

import {DropdownItem} from '../../models/dropdown/dropdown-item';
import {DropdownItemAlignment} from '../../models/dropdown/dropdown-item-alignment';
import {GraphExploreAction, GraphExploreEvent} from './models/graph-explore-types';
import {LoggerProvider} from '../../services/logger-provider';
import {TranslationService} from '../../services/translation.service';
import {OntoTooltipPlacement} from '../onto-tooltip/models/onto-tooltip-placement';

import {GraphConfig, GraphConfigList} from '@ontotext/workbench-api';

/**
 * Split button component for exploring graphs based on available configurations.
 *
 * The component loads graph configurations, presents them as dropdown items, and emits a {@link GraphExploreEvent}
 * when the primary button is clicked or a specific configuration is selected.
 */
@Component({
  tag: 'onto-graph-explore-split-button',
  styleUrl: 'onto-graph-explore-split-button.scss',
  shadow: false,
})
export class OntoGraphExploreSplitButton {
  private readonly logger = LoggerProvider.logger;

  /**
   * Label displayed on the primary action button.
   */
  @Prop() label: string;

  /**
   * Callback invoked when the dropdown is opened to fetch graph configurations.
   *
   */
  @Prop() fetchGraphConfigs: () => Promise<GraphConfigList>;

  /**
   * Dropdown items representing available graph configurations.
   */
  @State() items: DropdownItem<GraphConfig>[] = [];

  /**
   * Flag indicating whether the dropdown is open.
   */
  @State() isDropdownOpen = false;

  /**
   * Emitted when the user triggers a graph exploration action.
   *
   * - `action: 'default' - when the main button is clicked.
   * - `action: 'select' - when a dropdown menu item is selected.
   * - `action: 'create' - when the create graph link is clicked.
   *
   * `graphConfig` is provided when a specific configuration is selected.
   */
  @Event() graphExplore: EventEmitter<GraphExploreEvent>;

  componentWillLoad(): void {
    this.loadGraphConfigItems();
  }

  /**
   * Handles changes to the dropdown open/close state.
   *
   * @param event - Custom event containing the dropdown state (`isOpen` flag)
   */
  private dropdownToggledHandler(event: CustomEvent<boolean>) {
    this.isDropdownOpen = event.detail;
    if (this.isDropdownOpen) {
      this.loadGraphConfigItems();
    }
  }

  /**
   * Emits a graph exploration event based on the user interaction source.
   *
   * @param action - The type of exploration action:
   * - `default`: triggered by primary button click
   * - `select`: triggered by selecting a dropdown menu item
   * - `create`: triggered when navigating to create a graph view
   *
   * @param graphConfig - Optional graph configuration associated with the selected item.
   */
  private emitGraphExplore(action = GraphExploreAction.DEFAULT, graphConfig?: GraphConfig): void {
    this.graphExplore.emit({action, graphConfig});
  }

  /**
   * Fetches graph configurations and maps them to dropdown items. Populates `this.items` with the result
   * or a fallback list if no data is returned or the request fails.
   */
  private loadGraphConfigItems(): void {
    if (typeof this.fetchGraphConfigs === 'function') {
      this.fetchGraphConfigs()
        .then((data) => {
          this.items = data.getItems().map(config =>
            new DropdownItem<GraphConfig>()
              .setName(config.name)
              .setValue(config));
        })
        .catch((error) => {
          this.items = [];
          this.logger.error('Failed to load graph configurations ', error);
        });
    }
  }

  render() {
    return (
      <div class='explore-visual-graph-button-group'>
        <button class='explore-visual-graph-button icon-data'
          onClick={this.handleDefaultClick}
          tooltip-content={TranslationService.translate('graph_explore_split_button.buttons.explore_visual_graph.tooltip')}
          tooltip-placement={OntoTooltipPlacement.TOP}>
          {this.label}
        </button>
        <div class='dropdown-wrapper'>
          <onto-dropdown
            class='explore-visual-graph-dropdown'
            autoClose={true}
            items={this.items}
            onToggle={this.handleToggle}
            onValueChanged={this.handleValueChanged}
            dropdownAlignment={DropdownItemAlignment.RIGHT}
            tooltipPlacement={OntoTooltipPlacement.TOP}
            dropdownButtonTooltip={TranslationService.translate('graph_explore_split_button.buttons.explore_visual_graph_dropdown.tooltip')}>
          </onto-dropdown>
          {this.isDropdownOpen && this.items.length === 0 ? (
            <div class="no-configurations-message">
              <i class="icon-info"></i>
              <div class="message-text">
                <div>
                  <translate-label labelKey={'graph_explore_split_button.messages.missing_graph_configuration'}></translate-label>
                </div>
                <div>
                  <translate-label labelKey={'graph_explore_split_button.messages.create_graph_configuration'}></translate-label>&nbsp;
                  <button class='btn btn-link graph-create-link'
                    onClick={this.handleCreateClick}>
                    <translate-label labelKey={'graph_explore_split_button.messages.create_graph_configuration_link'}></translate-label>
                  </button>
                </div>
              </div>
            </div>
          ) : ''}
        </div>
      </div>
    );
  }

  private readonly handleDefaultClick = () => {
    this.emitGraphExplore();
  };

  private readonly handleToggle = (event: CustomEvent<boolean>) => {
    this.dropdownToggledHandler(event);
  };

  private readonly handleValueChanged = (event: CustomEvent<GraphConfig>) => {
    this.emitGraphExplore(GraphExploreAction.SELECT, event.detail);
  };

  private readonly handleCreateClick = () => {
    this.emitGraphExplore(GraphExploreAction.CREATE);
  };
}
