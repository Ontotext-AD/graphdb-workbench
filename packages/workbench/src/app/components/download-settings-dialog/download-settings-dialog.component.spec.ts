import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { DownloadSettingsDialogComponent } from './download-settings-dialog.component';
import { provideTranslocoForTesting } from '../../../testing-utils/transloco-utils';
import { ApplicationSettingsStorageService, ServiceProvider } from '@ontotext/workbench-api';
import {DynamicDialogConfig, DynamicDialogRef} from 'primeng/dynamicdialog';

describe('DownloadSettingsDialogComponent', () => {
  let component: DownloadSettingsDialogComponent;
  let fixture: ComponentFixture<DownloadSettingsDialogComponent>;
  let dialogRef: jest.Mocked<DynamicDialogRef>;
  let appSettingsService: jest.Mocked<ApplicationSettingsStorageService>;

  beforeEach(async () => {
    dialogRef = {
      close: jest.fn(),
    } as unknown as jest.Mocked<DynamicDialogRef>;

    appSettingsService = {
      getJsonLDExportSettings: jest.fn().mockReturnValue(undefined),
      setJsonLDExportSettings: jest.fn(),
    } as unknown as jest.Mocked<ApplicationSettingsStorageService>;

    jest.spyOn(ServiceProvider, 'get').mockImplementation((serviceClass) => {
      if (serviceClass === ApplicationSettingsStorageService) {
        return appSettingsService;
      }
      throw new Error(`Unknown service: ${(serviceClass as { name: string }).name}`);
    });

    await TestBed.configureTestingModule({
      imports: [DownloadSettingsDialogComponent, provideTranslocoForTesting()],
      providers: [
        { provide: DynamicDialogRef, useValue: dialogRef },
        { provide: DynamicDialogConfig, useValue: {} },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(DownloadSettingsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should default to expanded mode on init when no stored settings exist', () => {
    expect(component['currentMode']).toBe('expanded');
  });

  it('should restore stored mode and link from settings on init', () => {
    appSettingsService.getJsonLDExportSettings.mockReturnValue({
      formName: 'framed',
      formLink: 'http://www.w3.org/ns/json-ld#framed',
      link: 'http://example.org/frame',
    });

    component.ngOnInit();

    expect(component['currentMode']).toBe('framed');
    expect(component['link']).toBe('http://example.org/frame');
  });

  it('should close the dialog with the export result when exportJsonLD is called', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    component['currentMode'] = 'compacted' as any;
    component['link'] = 'http://example.org/context';

    component.exportJsonLD();

    expect(dialogRef.close).toHaveBeenCalledWith({
      formName: 'compacted',
      formLink: 'http://www.w3.org/ns/json-ld#compacted',
      link: 'http://example.org/context',
    });
  });

  it('should reset to default expanded mode and clear link when reset is called', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    component['currentMode'] = 'framed' as any;
    component['link'] = 'http://example.org/frame';

    component.reset();

    expect(component['currentMode']).toBe('expanded');
    expect(component['link']).toBeUndefined();
  });

  it('should clear the link and persist settings when clearLinkInput is called', () => {
    component['link'] = 'http://example.org/context';

    component.clearLinkInput({value: 'compacted'});

    expect(component['link']).toBeUndefined();
    expect(appSettingsService.setJsonLDExportSettings).toHaveBeenCalled();
  });
});
