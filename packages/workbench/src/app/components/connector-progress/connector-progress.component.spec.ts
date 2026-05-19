import {ComponentFixture, TestBed} from '@angular/core/testing';
import {ConnectorProgressComponent} from './connector-progress.component';
import {ConnectorsService, RepositoryStorageService} from '@ontotext/workbench-api';
import {provideTranslocoForTesting} from '../../../testing-utils/transloco-utils';

describe('ConnectorProgressComponent', () => {
  let component: ConnectorProgressComponent;
  let fixture: ComponentFixture<ConnectorProgressComponent>;

  beforeEach(async () => {
    jest.spyOn(RepositoryStorageService.prototype, 'getActiveRepositoryId').mockReturnValue('test-repo');
    jest.spyOn(ConnectorsService.prototype, 'getConnectorBuildStatus').mockResolvedValue(null);

    await TestBed.configureTestingModule({
      imports: [ConnectorProgressComponent, provideTranslocoForTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(ConnectorProgressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    jest.restoreAllMocks();
    component.ngOnDestroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
