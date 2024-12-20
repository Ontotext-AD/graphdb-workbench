import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GraphqlPlaygroundComponent } from './graphql-playground.component';

describe('GraphqlPlaygroundComponent', () => {
  let component: GraphqlPlaygroundComponent;
  let fixture: ComponentFixture<GraphqlPlaygroundComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GraphqlPlaygroundComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GraphqlPlaygroundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
