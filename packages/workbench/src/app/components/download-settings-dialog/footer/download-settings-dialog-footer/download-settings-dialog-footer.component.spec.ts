import {ComponentFixture, TestBed} from '@angular/core/testing';

import {DownloadSettingsDialogFooterComponent} from './download-settings-dialog-footer.component';
import {DynamicDialogConfig, DynamicDialogRef} from 'primeng/dynamicdialog';
import {provideTranslocoForTesting} from '../../../../../testing-utils/transloco-utils';

describe('DownloadSettingsDialogFooterComponent', () => {
  let component: DownloadSettingsDialogFooterComponent;
  let fixture: ComponentFixture<DownloadSettingsDialogFooterComponent>;

  beforeEach(async () => {
    const dialogRef = {
    } as unknown as jest.Mocked<DynamicDialogRef>;

    await TestBed.configureTestingModule({
      imports: [DownloadSettingsDialogFooterComponent, provideTranslocoForTesting()],
      providers: [
        { provide: DynamicDialogRef, useValue: dialogRef },
        { provide: DynamicDialogConfig, useValue: {} },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DownloadSettingsDialogFooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
