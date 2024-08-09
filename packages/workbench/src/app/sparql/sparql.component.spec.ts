import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SparqlComponent } from './sparql.component';

describe('SparqlComponent', () => {
  let component: SparqlComponent;
  let fixture: ComponentFixture<SparqlComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SparqlComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(SparqlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
