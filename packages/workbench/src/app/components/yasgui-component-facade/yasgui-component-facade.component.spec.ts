import {ComponentFixture, TestBed} from '@angular/core/testing';
import {NO_ERRORS_SCHEMA} from '@angular/core';
import {YasguiComponentFacadeComponent} from './yasgui-component-facade.component';
import {provideTranslocoForTesting} from '../../../testing-utils/transloco-utils';
import {RuntimeConfigurationContextService, ServiceProvider} from '@ontotext/workbench-api';

jest.mock('ontotext-yasgui-web-component/loader', () => ({
  defineCustomElements: jest.fn()
}));

describe('YasguiComponentFacadeComponent', () => {
  let component: YasguiComponentFacadeComponent;
  let fixture: ComponentFixture<YasguiComponentFacadeComponent>;

  beforeEach(async () => {
    // Prevent the immediate theme-change callback from firing when subscribing.
    // The ontotext-yasgui custom element in the test DOM is a bare HTMLElement (because
    // defineCustomElements is mocked as a no-op), so it lacks the setTheme() method that
    // the callback would try to invoke.
    jest.spyOn(ServiceProvider.get(RuntimeConfigurationContextService), 'onThemeModeChanged')
      .mockImplementation(() => () => {
        // No-op subscription that doesn't call the callback immediately.
      });

    await TestBed.configureTestingModule({
      imports: [
        YasguiComponentFacadeComponent,
        provideTranslocoForTesting()
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
