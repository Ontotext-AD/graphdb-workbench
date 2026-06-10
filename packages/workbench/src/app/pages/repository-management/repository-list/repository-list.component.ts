import {Component, DestroyRef, inject, OnDestroy, OnInit, signal} from '@angular/core';
import {PageLayoutComponent} from '../../../components/page-layout/page-layout.component';
import {
  RepositoryContextService,
  RepositoryService,
  Location,
  LocationContextService,
  LocationService,
  RepositoryReference,
  service,
  SubscriptionList,
  ProductInfoService,
  RepositoryList,
  LocationList,
  navigate
} from '@ontotext/workbench-api';
import {Button} from 'primeng/button';
import {timer} from 'rxjs';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-repository-list',
  imports: [
    PageLayoutComponent,
    Button
  ],
  templateUrl: './repository-list.component.html',
  styleUrl: './repository-list.component.scss',
})
export class RepositoryListComponent implements OnInit, OnDestroy {

  // ================================
  // API DI
  // ================================
  private readonly repositoryService = service(RepositoryService);
  private readonly repositoryContextService = service(RepositoryContextService);
  private readonly locationContextService = service(LocationContextService);
  private readonly locationService = service(LocationService);
  private readonly productInfoService = service(ProductInfoService);

  // ================================
  // Private variables
  // ================================
  private readonly subscriptions = new SubscriptionList();
  private destroyRef = inject(DestroyRef);
  private locationsAbortController?: AbortController;
  private repositoriesAbortController?: AbortController;

  // ================================
  // Public variables
  // ================================
  selectedRepository = signal(this.repositoryContextService.getSelectedRepository());
  repositories = signal<RepositoryList | undefined>(this.repositoryContextService.getRepositoryList());
  locations = signal<LocationList | undefined>(undefined);

  constructor() {
    this.locationService.getLocations()
      .then((locations) => this.locations.set(locations));
  }

  ngOnInit(): void {
    this.subscriptions.addAll([
      this.repositoryContextService.onRepositoryListChanged((repositories) => this.repositories.set(repositories)),
      this.locationContextService.onLocationsChanged((locations) => {
        this.locations.set(locations);
      })
    ]);

    timer(0, 3000)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.refreshRepositories();
        this.refreshLocations();
        this.refreshLocationVersion();
      });
  }

  refreshLocationVersion(): void {
    this.locations()?.getItems().forEach((location) => {
      this.productInfoService.getProductInfo(location.uri)
        .then((productInfo) => {
          console.log(productInfo);
        });
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribeAll();
    this.locationsAbortController?.abort();
    this.repositoriesAbortController?.abort();
  }

  deleteRepository(repository: RepositoryReference): void {
    this.repositoryService.deleteRepository(repository)
      .then(() => this.refreshRepositories());
  }

  restartRepository(repository: RepositoryReference): void {
    this.repositoryService.restartRepository(repository)
      .then(() => {
        // Check if this is need
        this.refreshRepositories();
      });
  }

  setDefaultRepository(repository: RepositoryReference): void {
    this.locationService.setDefaultRepository(repository)
      .then(() => this.refreshRepositories());
  }

  deleteLocation(location: Location): void {
    this.locationService
      .deleteLocation(location.uri)
      .then(() => this.refreshLocations());
  }

  createRepository(): void {
    navigate('repository/create');
  }

  // TODO: Consider if this can be moved in repository service so this pattern be used in other controllers if needed.
  private refreshRepositories(): void {
    this.repositoriesAbortController?.abort();
    this.repositoriesAbortController = new AbortController();
    this.repositoryService.getRepositories(this.repositoriesAbortController.signal)
      .then((repositories) => {
        this.repositoryContextService.updateRepositoryList(repositories);
      });
  }

  // TODO: Consider if this can be moved in location service so this pattern be used in other controllers if needed.
  private refreshLocations(): void {
    this.locationsAbortController?.abort();
    this.locationsAbortController = new AbortController();
    this.locationService.getLocations(this.locationsAbortController.signal)
      .then((locations) => {
        this.locationContextService.updateLocations(locations);
      });
  }
}
