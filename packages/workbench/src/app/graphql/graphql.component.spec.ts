import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GraphqlComponent } from './graphql.component';

describe('GraphqlComponent', () => {
  let component: GraphqlComponent;
  let fixture: ComponentFixture<GraphqlComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GraphqlComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GraphqlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
