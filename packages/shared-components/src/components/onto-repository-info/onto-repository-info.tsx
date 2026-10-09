import {Component, h, Host, Prop, State, VNode} from '@stencil/core';
import {
  LanguageContextService,
  LanguageService,
  Repository,
  RepositoryPermissionType,
  RepositorySizeInfo,
  RepositoryState,
  service,
  SubscriptionList
} from '@ontotext/workbench-api';
import {LoggerProvider} from '../../services/logger-provider';
import {parseJsonIfString} from '../../utils/object-utils';

const TRANSLATION_PREFIX = 'repository-info';

/**
 * A StencilJS component that renders the information about a repository: its id and state, description, location,
 * type, the permissions of the current user and the statement counts.
 *
 * The component is for presentation only. It does not load anything; the consumer loads the statement counts and
 * passes them in. The <code>repository</code> and <code>sizeInfo</code> properties accept an object, or the same
 * data as JSON text for consumers that can only write the component as a tag in an HTML string.
 *
 * @example
 *  <onto-repository-info
 *             repository={this.repository}
 *             permission={this.permission}
 *             loading={this.loading}
 *             sizeInfo={this.sizeInfo}>
 *   </onto-repository-info>
 */
@Component({
  tag: 'onto-repository-info',
  styleUrl: 'onto-repository-info.scss',
  shadow: false
})
export class OntoRepositoryInfo {
  private readonly languageContextService = service(LanguageContextService);
  private readonly languageService = service(LanguageService);
  private readonly subscriptions = new SubscriptionList();

  /**
   * Formatter for the statement counts. It is recreated when the language changes.
   */
  @State() private totalStatementsFormatter: Intl.NumberFormat;

  /**
   * Formatter for the expansion ratio. It is recreated when the language changes.
   */
  @State() private expansionRatioFormatter: Intl.NumberFormat;

  /**
   * The repository to display, provided as a `Repository` object or a JSON string representing a repository.
   */
  @Prop() repository: Repository | string;

  /**
   * The permission of the current user for the repository. The permissions row shows a dash without it.
   */
  @Prop() permission: RepositoryPermissionType;

  /**
   * Whether the statement counts are being loaded. A spinner is shown in their place.
   */
  @Prop() loading = false;

  /**
   * The statement counts to display, provided as a `RepositorySizeInfo` object or a JSON string representing a repository size info.
   */
  @Prop() sizeInfo?: RepositorySizeInfo | string;

  connectedCallback(): void {
    // The formatters are created here, so that they do not depend on the first notification of the subscription.
    this.setupFormatters();
    this.subscriptions.add(this.languageContextService.onSelectedLanguageChanged((language) => {
      this.setupFormatters(language);
    }));
  }

  disconnectedCallback(): void {
    this.subscriptions.unsubscribeAll();
  }

  render(): VNode {
    const repository = this.parseProperty<Repository>(this.repository, 'repository');
    if (!repository) {
      return <Host></Host>;
    }

    return (
      <Host>
        <div class="repository-info-title" data-test="repository-info-title">
          {this.renderHeading(repository)}
        </div>
        {repository.title &&
          <div class="repository-info-description" data-test="repository-info-description">{repository.title}</div>}
        <div class="repository-info-content">
          {this.renderRow('location', 'location', repository.location ? repository.location : this.renderLabel('local'))}
          {this.renderRow('type', 'type', this.renderLabel(`types.${repository.type || 'unknown'}`))}
          {this.renderRow('permissions', 'permissions_label', this.renderPermission())}
          {this.renderStatements(repository)}
        </div>
      </Host>
    );
  }

  private renderPermission(): VNode | string {
    if (!this.permission) {
      return '-';
    }
    return this.renderLabel(`permissions.${this.permission.toLowerCase()}`);
  }

  /**
   * Renders the heading: the state icon and the id of the repository. The <code>title</code> of the repository is
   * its description and is rendered separately.
   */
  private renderHeading(repository: Repository): VNode {
    let stateIndicatorIconClass: string;
    let stateIndicatorClass = 'inactive';

    if (repository.state === RepositoryState.RUNNING) {
      stateIndicatorIconClass = 'ri-checkbox-blank-circle-fill';
      stateIndicatorClass = '';
    } else if (repository.state === RepositoryState.INACTIVE) {
      stateIndicatorIconClass = 'ri-stop-large-fill';
    } else {
      stateIndicatorIconClass = 'ri-loop-left-fill';
    }

    return (
      <h6 class={`title ${stateIndicatorClass}`}>
        <i class={stateIndicatorIconClass}></i>
        <span>{repository.id}</span>
      </h6>
    );
  }

  private renderStatements(repository: Repository): VNode | (VNode | false)[] {
    if (repository.state !== RepositoryState.RUNNING) {
      return this.renderInactiveRepositoryMessage();
    }

    if (this.loading) {
      return (
        <div class="repository-info-row repository-size-loading" data-test="repository-info-loading">
          <onto-loader loading={true} size={25}></onto-loader>
        </div>
      );
    }

    return this.renderSizeInfo(this.parseProperty<RepositorySizeInfo>(this.sizeInfo, 'sizeInfo'));
  }

  private renderSizeInfo(sizeInfo?: RepositorySizeInfo): VNode | (VNode | false)[] {
    if (!sizeInfo || sizeInfo.total < 0) {
      return (
        <div data-test="repository-info-not-available">
          {this.renderLabel('repository-size.repository-info-not-available')}
        </div>
      );
    }

    return [
      this.renderRow('total', 'repository-size.total', this.totalStatementsFormatter.format(sizeInfo.total)),
      sizeInfo.explicit >= 0
      && this.renderRow('explicit', 'repository-size.explicit', this.totalStatementsFormatter.format(sizeInfo.explicit)),
      sizeInfo.inferred >= 0
      && this.renderRow('inferred', 'repository-size.inferred', this.totalStatementsFormatter.format(sizeInfo.inferred)),
      sizeInfo.explicit >= 0
      && this.renderRow('expansion-ratio', 'repository-size.expansion_ratio', this.formatExpansionRatio(sizeInfo))
    ];
  }

  private renderInactiveRepositoryMessage(): VNode {
    return (
      <div class="repository-info-row inactive-repo-message" data-test="repository-info-inactive">
        <div class="icon">
          <i class="ri-information-2-line"></i>
        </div>
        <div class="message">
          <p>{this.renderLabel('repository-size.repository_inactive')}</p>
        </div>
      </div>
    );
  }

  /**
   * Renders a row with a label and a value.
   *
   * @param rowName The name of the row. It is the CSS class of the row and the end of its test id.
   * @param labelKey The translation key of the label, without the prefix of the component.
   * @param value The value to show.
   */
  private renderRow(rowName: string, labelKey: string, value: unknown): VNode {
    return (
      <div class={`repository-info-row ${rowName}`} data-test={`repository-info-${rowName}`}>
        <div class="label">{this.renderLabel(labelKey)}:</div>
        <div class="value">{value}</div>
      </div>
    );
  }

  private renderLabel(labelKey: string): VNode {
    const key = `${TRANSLATION_PREFIX}.${labelKey}`;
    return <translate-label key={key} labelKey={key}></translate-label>;
  }

  private formatExpansionRatio(sizeInfo: RepositorySizeInfo): string {
    if (sizeInfo.explicit > 0) {
      return this.expansionRatioFormatter.format(sizeInfo.total / sizeInfo.explicit);
    }
    return '-';
  }

  private setupFormatters(language?: string): void {
    const formatterLanguage = language || this.languageService.getDefaultLanguage();
    this.totalStatementsFormatter = new Intl.NumberFormat(formatterLanguage, {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
    this.expansionRatioFormatter = new Intl.NumberFormat(formatterLanguage, {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  /**
   * Returns the value of a property that accepts an object or JSON text. A text that is not a valid JSON is
   * logged and treated as a missing value.
   */
  private parseProperty<T>(value: T | string | undefined, propertyName: string): T | undefined {
    try {
      return parseJsonIfString<T>(value);
    } catch (error) {
      LoggerProvider.logger.error(`The "${propertyName}" property of onto-repository-info is not a valid JSON: "${value}"`, error);
      return undefined;
    }
  }
}
