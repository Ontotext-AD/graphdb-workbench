import {ComponentFixture, TestBed} from '@angular/core/testing';
import {NO_ERRORS_SCHEMA} from '@angular/core';
import {YasguiComponentFacadeComponent} from './yasgui-component-facade.component';
import {provideTranslocoForTesting} from '../../../testing-utils/transloco-utils';

jest.mock('ontotext-yasgui-web-component/loader', () => ({
  defineCustomElements: jest.fn()
}));

describe('YasguiComponentFacadeComponent', () => {
  let component: YasguiComponentFacadeComponent;
  let fixture: ComponentFixture<YasguiComponentFacadeComponent>;

  beforeEach(async () => {
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
