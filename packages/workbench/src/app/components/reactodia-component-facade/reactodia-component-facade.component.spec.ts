import {ComponentFixture, TestBed} from '@angular/core/testing';
import {NO_ERRORS_SCHEMA} from '@angular/core';
import {ReactodiaComponentFacadeComponent} from './reactodia-component-facade.component';
import {provideTranslocoForTesting} from '../../../testing-utils/transloco-utils';

jest.mock('graphwise-reactodia/loader', () => ({
  defineCustomElements: jest.fn()
}));

describe('ReactodiaComponentFacadeComponent', () => {
  let component: ReactodiaComponentFacadeComponent;
  let fixture: ComponentFixture<ReactodiaComponentFacadeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ReactodiaComponentFacadeComponent,
        provideTranslocoForTesting()
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
      .compileComponents();

    fixture = TestBed.createComponent(ReactodiaComponentFacadeComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('currentRepository', 'test-repo');
    fixture.componentRef.setInput('language', 'en');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
