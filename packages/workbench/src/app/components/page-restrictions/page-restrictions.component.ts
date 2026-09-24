import {
  effect,
  AfterViewInit, Component, computed, ElementRef, inject, input, OnDestroy, OnInit, signal
} from '@angular/core';
import {
  service,
  RepositoryContextService,
  RestrictionContextService,
  Repository,
  SubscriptionList,
  ViewRestriction,
} from '@ontotext/workbench-api';
import {RepositoryPickerListComponent} from '../repository-picker-list/repository-picker-list.component';
import {Message} from 'primeng/message';
import {TranslocoPipe} from '@jsverse/transloco';
import {RouterLink} from '@angular/router';
import {RestrictionResolverService} from '../../services/page-restrictions/restriction-resolver.service';
import {RestrictionContext} from '../../services/page-restrictions/model/restriction-context';

@Component({
  selector: 'app-page-restrictions',
  standalone: true,
  imports: [
    RepositoryPickerListComponent,
    Message,
    TranslocoPipe,
    RouterLink,
  ],
  templateUrl: './page-restrictions.component.html',
  styleUrl: './page-restrictions.component.scss',
})
export class PageRestrictionsComponent implements OnInit, AfterViewInit, OnDestroy {
  private static readonly FOOTER_SELECTOR = '.wb-footer';
  private static readonly MAIN_CONTAINER_SELECTOR = '.main-container';
  private static readonly BOTTOM_MARGIN_PX = 16;

  /**
   * Current page title.
   */
  readonly title = input<string>();

  private readonly restrictionResolverService = inject(RestrictionResolverService);
  private readonly repositoryContextService = service(RepositoryContextService);
  private readonly restrictionContextService = service(RestrictionContextService);
  private readonly elementRef = inject(ElementRef<HTMLElement>);

  private resizeObserver?: ResizeObserver;
  private readonly subscriptions = new SubscriptionList();

  /**
   * The globally selected repository, kept in sync with the repository context.
   */
  private readonly selectedRepository = signal<Repository | undefined>(undefined);

  /**
   * The restriction declared by the current view, kept in sync with the restriction context.
   */
  private readonly viewRestriction = signal<ViewRestriction | undefined>(undefined);

  /**
   * The input for the restriction resolver, shared by the restriction messages and the picker visibility,
   * so both are calculated from the same state.
   */
  private readonly restrictionContext = computed<RestrictionContext>(() => ({
    selectedRepository: this.selectedRepository(),
    viewRestriction: this.viewRestriction(),
    pageTitle: this.title() ?? '',
  }));

  /**
   * Determines whether the view content should be restricted.
   *
   * The view is restricted when a restriction applies or the repository picker is shown.
   * In that case, restriction messages and the repository picker are shown instead of the view content.
   */
  private readonly isViewRestricted = computed(() => this.restrictions().length > 0 || this.isRepositoryPickerShown());

  /**
   * The height, in pixels, that fills the space between the top of this component and the footer.
   * Undefined when the view is not restricted, so the component takes no space.
   */
  readonly availableHeight = signal<number | undefined>(undefined);

  /**
   * The restriction messages to show, in display order.
   */
  readonly restrictions = computed(() => this.restrictionResolverService.resolve(this.restrictionContext()));

  /**
   * Determines whether the repository picker is shown, so the user can pick another repository.
   *
   * It is shown when the page requires a selected repository and none is selected, or when the selected repository
   * can't be used on the page. The repositories it offers are controlled by the page's allowed repository types
   * and required permission.
   */
  readonly isRepositoryPickerShown = computed(() => this.restrictionResolverService.isRepositoryPickerRequired(this.restrictionContext()));

  /**
   * Whether the page requires write access. If so, the picker offers only writable repositories.
   */
  readonly requiresWriteAccess = computed(() => this.viewRestriction()?.requiresWriteAccess() ?? false);

  /**
   * The repository types allowed by the page. If empty, repositories of all types are allowed.
   */
  readonly allowedRepositoryTypes = computed(() => this.viewRestriction()?.allowedRepositoryTypes ?? []);

  /**
   * The repository permission required by the page. If undefined, no repository-specific permission is required.
   */
  readonly requiredRepositoryPermission = computed(() => this.viewRestriction()?.requiredRepositoryPermission);

  constructor() {
    // Recalculate within Angular's own change detection whenever content appears or disappears,
    // rather than solely relying on the body ResizeObserver (which runs outside Angular's normal
    // triggers and can lag behind either transition).
    effect(() => {
      this.updateAvailableHeight();
    });
  }

  ngOnInit(): void {
    this.subscriptions.addAll([
      this.repositoryContextService.onSelectedRepositoryChanged((repo) => this.selectedRepository.set(repo)),
      this.restrictionContextService.onViewRestrictionChanged((viewRestriction) => this.viewRestriction.set(viewRestriction))
    ]
    );
  }

  ngAfterViewInit(): void {
    // Covers layout changes unrelated to content appearing/disappearing, e.g. window resize or
    // the deprecation banner being dismissed; the effect() above handles content transitions.
    this.resizeObserver = new ResizeObserver(() => this.updateAvailableHeight());
    this.resizeObserver.observe(document.body);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribeAll();
    this.resizeObserver?.disconnect();
  }

  private updateAvailableHeight(): void {
    if (!this.isViewRestricted()) {
      // Nothing to show: leave the natural (empty) size instead of reserving space.
      this.availableHeight.set(undefined);
      return;
    }

    const host = this.elementRef.nativeElement;

    // Top of this component already reflects everything rendered above it (shared header,
    // deprecation/cookie banners, page title, main-container's own top padding), so it doesn't
    // need to be derived from individual selectors.
    const top = host.getBoundingClientRect().top;

    // Bottom boundary is the shared footer's own top edge, not window.innerHeight, since the
    // footer stays flush with the bottom of the layout grid regardless of content height.
    const footerTop = document.querySelector(PageRestrictionsComponent.FOOTER_SELECTOR)?.getBoundingClientRect().top ?? window.innerHeight;

    // main-container has its own bottom padding between this component's content and the
    // footer; without subtracting it, content would render underneath that padding.
    const mainContainer = document.querySelector(PageRestrictionsComponent.MAIN_CONTAINER_SELECTOR);
    const mainContainerPaddingBottom = mainContainer ? parseFloat(getComputedStyle(mainContainer).paddingBottom) || 0 : 0;

    // A small safety margin, not a derived layout value: measuring, applying a height, and
    // remeasuring via ResizeObserver is a round trip where sub-pixel rounding can otherwise push
    // content a fraction of a pixel past the boundary, which is enough for the browser to show a
    // scrollbar again.
    const available = footerTop - top - mainContainerPaddingBottom - PageRestrictionsComponent.BOTTOM_MARGIN_PX;
    const newHeight = Math.max(available, 0);

    // Resizing this component changes the size of document.body, which would otherwise re-trigger the body's ResizeObserver.
    // Only update when there is a meaningful size change to avoid a feedback loop.
    if (Math.abs(newHeight - (this.availableHeight() ?? -1)) > 1) {
      this.availableHeight.set(newHeight);
    }
  }
}
