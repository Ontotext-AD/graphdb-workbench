import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GraphqlComponent } from './graphql.component';
import { AuthenticationService, RepositoryService, ServiceProvider } from '@ontotext/workbench-api';

class MockAuthenticationService {
  login() {
    return 'mockLoginToken';
  }
}

class MockRepositoryService {
  getRepositories() {
    return Promise.resolve({
      json: () => Promise.resolve([{ id: 1, name: 'Repo1' }, { id: 2, name: 'Repo2' }])
    });
  }
}

jest.mock('@ontotext/workbench-api', () => ({
  ServiceProvider: {
    get: jest.fn((service) => {
      if (service === AuthenticationService) {
        return new MockAuthenticationService();
      } else if (service === RepositoryService) {
        return new MockRepositoryService();
      }
      throw new Error('Unknown service');
    })
  },
  AuthenticationService: jest.fn(),
  RepositoryService: jest.fn()
}));

describe('GraphqlComponent', () => {
  let component: GraphqlComponent;
  let fixture: ComponentFixture<GraphqlComponent>;

  describe('GraphqlComponent', () => {
    let component: GraphqlComponent;
    let fixture: ComponentFixture<GraphqlComponent>;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [GraphqlComponent], // Use imports instead of declarations
        providers: [
          {provide: AuthenticationService, useClass: MockAuthenticationService},
          {provide: RepositoryService, useClass: MockRepositoryService},
          {provide: ServiceProvider, useValue: ServiceProvider}
        ]
      }).compileComponents();

      jest.spyOn(console, 'log').mockImplementation(() => {
      });

      fixture = TestBed.createComponent(GraphqlComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should log in and fetch repositories', async () => {
      await fixture.whenStable();

      expect(console.log).toHaveBeenCalledWith('GraphqlComponent login', 'mockLoginToken');
      expect(console.log).toHaveBeenCalledWith('GraphqlComponent repositories', [{id: 1, name: 'Repo1'}, {
        id: 2,
        name: 'Repo2'
      }]);
    });
  });
});
