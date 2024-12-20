import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GraphqlManagementComponent } from './graphql-management.component';

describe('GraphqlManagementComponent', () => {
  let component: GraphqlManagementComponent;
  let fixture: ComponentFixture<GraphqlManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GraphqlManagementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GraphqlManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
