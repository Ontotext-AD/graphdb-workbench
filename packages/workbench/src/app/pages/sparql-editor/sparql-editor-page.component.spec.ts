import {ComponentFixture, TestBed} from '@angular/core/testing';
import {provideNoopAnimations} from '@angular/platform-browser/animations';
import {SparqlEditorPageComponent} from './sparql-editor-page.component';
import {provideTranslocoForTesting} from '../../../testing-utils/transloco-utils';
import {provideRouter} from '@angular/router';

describe('SparqlEditorPageComponent', () => {
  let component: SparqlEditorPageComponent;
  let fixture: ComponentFixture<SparqlEditorPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        SparqlEditorPageComponent,
        provideTranslocoForTesting(),
      ],
      providers: [
        provideNoopAnimations(),
        provideRouter([])
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(SparqlEditorPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
