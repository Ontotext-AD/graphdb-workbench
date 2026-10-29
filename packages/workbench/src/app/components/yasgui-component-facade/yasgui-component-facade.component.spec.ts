import {ComponentFixture, TestBed} from '@angular/core/testing';
import {NO_ERRORS_SCHEMA} from '@angular/core';
import {YasguiComponentFacadeComponent} from './yasgui-component-facade.component';
import {provideTranslocoForTesting} from '../../../testing-utils/transloco-utils';
import {LanguageContextService, RuntimeConfigurationContextService, ServiceProvider} from '@ontotext/workbench-api';
import {DialogService} from 'primeng/dynamicdialog';

describe('YasguiComponentFacadeComponent', () => {
  let component: YasguiComponentFacadeComponent;
  let fixture: ComponentFixture<YasguiComponentFacadeComponent>;

  beforeEach(async () => {
    // Prevent the immediate theme-change callback from firing when subscribing.
    // The ontotext-yasgui custom element in the test DOM is a bare HTMLElement (because
    // the yasgui custom elements are not registered in tests), so it lacks the setTheme() method that
    // the callback would try to invoke.
    jest.spyOn(ServiceProvider.get(RuntimeConfigurationContextService), 'onThemeModeChanged')
      .mockImplementation(() => () => {
        // No-op subscription that doesn't call the callback immediately.
      });
    jest.spyOn(ServiceProvider.get(LanguageContextService), 'getSelectedLanguage')
      .mockReturnValue('en');
    jest.spyOn(ServiceProvider.get(LanguageContextService), 'getDefaultLanguage')
      .mockReturnValue('en');
    jest.spyOn(ServiceProvider.get(LanguageContextService), 'onSelectedLanguageChanged')
      .mockImplementation(() => () => {
        // No-op subscription that doesn't call the callback immediately.
      });

    await TestBed.configureTestingModule({
      imports: [
        YasguiComponentFacadeComponent,
        provideTranslocoForTesting()
      ],
      providers: [
        DialogService
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
      .compileComponents();

    fixture = TestBed.createComponent(YasguiComponentFacadeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
