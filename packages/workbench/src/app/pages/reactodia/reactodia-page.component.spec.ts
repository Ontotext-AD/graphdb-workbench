import {ComponentFixture, TestBed} from '@angular/core/testing';
import {NO_ERRORS_SCHEMA} from '@angular/core';
import {ReactodiaPageComponent} from './reactodia-page.component';
import {provideTranslocoForTesting} from '../../../testing-utils/transloco-utils';
import {LanguageContextService, ServiceProvider} from '@ontotext/workbench-api';
import {provideRouter} from '@angular/router';

jest.mock('graphwise-reactodia/loader', () => ({
  defineCustomElements: jest.fn()
}));

describe('ReactodiaPageComponent', () => {
  let component: ReactodiaPageComponent;
  let fixture: ComponentFixture<ReactodiaPageComponent>;

  beforeEach(async () => {
    jest.spyOn(ServiceProvider.get(LanguageContextService), 'getSelectedLanguage')
      .mockReturnValue('en');
    jest.spyOn(ServiceProvider.get(LanguageContextService), 'onSelectedLanguageChanged')
      .mockImplementation(() => () => {
        // No-op subscription that doesn't call the callback immediately.
      });

    await TestBed.configureTestingModule({
      imports: [
        ReactodiaPageComponent,
        provideTranslocoForTesting()
      ],
      providers: [
        provideRouter([])
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
      .compileComponents();

    fixture = TestBed.createComponent(ReactodiaPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
