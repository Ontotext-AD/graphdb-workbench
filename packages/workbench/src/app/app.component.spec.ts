import {TestBed} from '@angular/core/testing';
import {AppComponent} from './app.component';
import {ActivatedRoute} from '@angular/router';
import {ConfirmationService} from 'primeng/api';
import {TranslocoService} from '@jsverse/transloco';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        ConfirmationService,
        {provide: TranslocoService, useValue: {translate: (key: string) => key}},
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { params: {}, queryParams: {} },
            paramMap: {
              get: () => null,
            },
          },
        },
      ]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
});
