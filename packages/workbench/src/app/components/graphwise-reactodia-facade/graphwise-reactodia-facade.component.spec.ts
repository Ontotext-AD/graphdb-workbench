import {ComponentFixture, TestBed} from '@angular/core/testing';
import {NO_ERRORS_SCHEMA} from '@angular/core';
import {GraphwiseReactodiaFacadeComponent} from './graphwise-reactodia-facade.component';
import {provideTranslocoForTesting} from '../../../testing-utils/transloco-utils';

jest.mock('graphwise-reactodia/loader', () => ({
  defineCustomElements: jest.fn()
}));

describe('GraphwiseReactodiaFacadeComponent', () => {
  let component: GraphwiseReactodiaFacadeComponent;
  let fixture: ComponentFixture<GraphwiseReactodiaFacadeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        GraphwiseReactodiaFacadeComponent,
        provideTranslocoForTesting()
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
      .compileComponents();

    fixture = TestBed.createComponent(GraphwiseReactodiaFacadeComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('currentRepository', 'test-repo');
    fixture.componentRef.setInput('language', 'en');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
