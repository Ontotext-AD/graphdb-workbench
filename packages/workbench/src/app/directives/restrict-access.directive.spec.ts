import {Component, TemplateRef, ViewChild} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {ViewPermissions, RestrictAccessDirective, PermissionType} from './restrict-access.directive';
import {
  AppSettings,
  AuthenticatedUser,
  Authority,
  AuthorityList,
  Repository,
  RepositoryContextService,
  RepositoryList,
  RepositoryType,
  SecurityConfig,
  SecurityContextService,
  ServiceProvider
} from '@ontotext/workbench-api';

@Component({
  standalone: true,
  imports: [RestrictAccessDirective],
  template: `
    <div *appRestrictAccess="permissions; else elseTemplate">
      <span class="restricted-content">Restricted Content</span>
    </div>
    <ng-template #elseTemplate>
      <span class="else-content">Else Content</span>
    </ng-template>
  `
})
class TestComponent {
  @ViewChild('elseTemplate') elseTemplate!: TemplateRef<unknown>;
  permissions: PermissionType[] = [];
}

const getSecurityConfig = (isEnabled: boolean) => {
  return new SecurityConfig({
    enabled: isEnabled,
    overrideAuth: {appSettings: {}},
    freeAccess: {appSettings: {}}
  } as unknown as SecurityConfig);
};

describe('RestrictAccessDirective', () => {
  let component: TestComponent;
  let fixture: ComponentFixture<TestComponent>;
  let repositoryContextService: RepositoryContextService;
  let securityContextService: SecurityContextService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RestrictAccessDirective, TestComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;

    // Get actual service instances
    repositoryContextService = ServiceProvider.get(RepositoryContextService);
    securityContextService = ServiceProvider.get(SecurityContextService);
  });

  afterEach(() => {
    // Clear context after each test
    securityContextService.updateAuthenticatedUser(undefined as unknown as AuthenticatedUser);
    securityContextService.updateSecurityConfig(undefined as unknown as SecurityConfig);
    repositoryContextService.updateSelectedRepository(undefined);
    repositoryContextService.updateRepositoryList(undefined as unknown as RepositoryList);
  });

  describe('IS_ADMIN permission', () => {
    it('should show content when user is admin', () => {
      // Setup admin user
      const adminUser = new AuthenticatedUser();
      adminUser.username = 'admin';
      adminUser.setAuthorities(new AuthorityList([Authority.ROLE_ADMIN]));
      adminUser.setAppSettings(new AppSettings());
      securityContextService.updateAuthenticatedUser(adminUser);

      const securityConfig = getSecurityConfig(true);
      securityContextService.updateSecurityConfig(securityConfig);

      component.permissions = [ViewPermissions.IS_ADMIN];
      fixture.detectChanges();

      const restrictedContent = fixture.nativeElement.querySelector('.restricted-content');
      const elseContent = fixture.nativeElement.querySelector('.else-content');

      expect(restrictedContent).toBeTruthy();
      expect(restrictedContent?.textContent).toContain('Restricted Content');
      expect(elseContent).toBeFalsy();
    });

    it('should hide content when user is not admin', () => {
      // Setup non-admin user
      const user = new AuthenticatedUser();
      user.username = 'user';
      user.setAuthorities(new AuthorityList([Authority.ROLE_USER]));
      securityContextService.updateAuthenticatedUser(user);

      const securityConfig = getSecurityConfig(true);
      securityContextService.updateSecurityConfig(securityConfig);

      component.permissions = [ViewPermissions.IS_ADMIN];
      fixture.detectChanges();

      const restrictedContent = fixture.nativeElement.querySelector('.restricted-content');
      const elseContent = fixture.nativeElement.querySelector('.else-content');

      expect(restrictedContent).toBeFalsy();
      expect(elseContent).toBeTruthy();
      expect(elseContent?.textContent).toContain('Else Content');
    });
  });

  describe('IS_NOT_ADMIN permission', () => {
    it('should show content when user is not admin', () => {
      const user = new AuthenticatedUser();
      user.username = 'user';
      user.setAuthorities(new AuthorityList([Authority.ROLE_USER]));
      securityContextService.updateAuthenticatedUser(user);

      const securityConfig = getSecurityConfig(true);
      securityContextService.updateSecurityConfig(securityConfig);

      component.permissions = [ViewPermissions.IS_NOT_ADMIN];
      fixture.detectChanges();

      const restrictedContent = fixture.nativeElement.querySelector('.restricted-content');
      expect(restrictedContent).toBeTruthy();
    });

    it('should hide content when user is admin', () => {
      const adminUser = new AuthenticatedUser();
      adminUser.username = 'admin';
      adminUser.setAuthorities(new AuthorityList([Authority.ROLE_ADMIN]));
      securityContextService.updateAuthenticatedUser(adminUser);

      const securityConfig = getSecurityConfig(true);
      securityContextService.updateSecurityConfig(securityConfig);

      component.permissions = [ViewPermissions.IS_NOT_ADMIN];
      fixture.detectChanges();

      const restrictedContent = fixture.nativeElement.querySelector('.restricted-content');
      expect(restrictedContent).toBeFalsy();
    });
  });

  describe('CAN_READ_ACTIVE_REPO permission', () => {
    it('should show content when user can read active repository', async () => {
      const user = new AuthenticatedUser();
      user.username = 'user';
      user.setAuthorities(new AuthorityList(['READ_REPO_test']));
      securityContextService.updateAuthenticatedUser(user);

      const securityConfig = getSecurityConfig(true);
      securityContextService.updateSecurityConfig(securityConfig);
      fixture.detectChanges();

      const repository = new Repository({
        id: 'test',
        title: 'Test Repo',
        location: '',
        uri: 'http://test',
        readable: true,
        writable: false
      });
      repositoryContextService.updateRepositoryList(new RepositoryList([repository]));
      repositoryContextService.updateSelectedRepository(repository);

      component.permissions = [ViewPermissions.CAN_READ_ACTIVE_REPO];
      fixture.detectChanges();
      await fixture.whenStable();

      const restrictedContent = fixture.nativeElement.querySelector('.restricted-content');
      expect(restrictedContent).toBeTruthy();
    });

    it('should hide content when no repository is selected', () => {
      const user = new AuthenticatedUser();
      user.username = 'user';
      user.setAuthorities(new AuthorityList([Authority.ROLE_USER]));
      securityContextService.updateAuthenticatedUser(user);

      const securityConfig = getSecurityConfig(true);
      securityContextService.updateSecurityConfig(securityConfig);

      component.permissions = [ViewPermissions.CAN_READ_ACTIVE_REPO];
      fixture.detectChanges();

      const restrictedContent = fixture.nativeElement.querySelector('.restricted-content');
      expect(restrictedContent).toBeFalsy();
    });
  });

  describe('CAN_WRITE_ACTIVE_REPO permission', () => {
    it('should show content when user can write to active repository', async () => {
      const user = new AuthenticatedUser();
      user.username = 'user';
      user.setAuthorities(new AuthorityList(['WRITE_REPO_test']));
      securityContextService.updateAuthenticatedUser(user);

      const securityConfig = getSecurityConfig(true);
      securityContextService.updateSecurityConfig(securityConfig);

      const repository = new Repository({
        id: 'test',
        title: 'Test Repo',
        location: '',
        uri: 'http://test',
        readable: true,
        writable: true
      });
      repositoryContextService.updateRepositoryList(new RepositoryList([repository]));
      repositoryContextService.updateSelectedRepository(repository);

      component.permissions = [ViewPermissions.CAN_WRITE_ACTIVE_REPO];
      fixture.detectChanges();
      await fixture.whenStable();

      const restrictedContent = fixture.nativeElement.querySelector('.restricted-content');
      expect(restrictedContent).toBeTruthy();
    });

    it('should hide content when user cannot write to repository', () => {
      const user = new AuthenticatedUser();
      user.username = 'user';
      user.setAuthorities(new AuthorityList(['READ_REPO_test']));
      securityContextService.updateAuthenticatedUser(user);

      const securityConfig = getSecurityConfig(true);
      securityContextService.updateSecurityConfig(securityConfig);

      const repository = new Repository({
        id: 'test',
        title: 'Test Repo',
        location: '',
        uri: 'http://test',
        readable: true,
        writable: false
      });
      repositoryContextService.updateRepositoryList(new RepositoryList([repository]));
      repositoryContextService.updateSelectedRepository(repository);

      component.permissions = [ViewPermissions.CAN_WRITE_ACTIVE_REPO];
      fixture.detectChanges();

      const restrictedContent = fixture.nativeElement.querySelector('.restricted-content');
      expect(restrictedContent).toBeFalsy();
    });
  });

  describe('IS_FEDEX_REPO permission', () => {
    it('should show content when active repository is FedX', async () => {
      const repository = new Repository({
        id: 'fedex-repo',
        title: 'FedX Repo',
        location: '',
        uri: 'http://fedex',
        sesameType: 'graphdb:FedXRepository'
      });
      repositoryContextService.updateRepositoryList(new RepositoryList([repository]));
      repositoryContextService.updateSelectedRepository(repository);

      component.permissions = [ViewPermissions.IS_FEDEX_REPO];
      fixture.detectChanges();
      await fixture.whenStable();

      const restrictedContent = fixture.nativeElement.querySelector('.restricted-content');
      expect(restrictedContent).toBeTruthy();
    });

    it('should hide content when active repository is not FedX', () => {
      const repository = new Repository({
        id: 'normal-repo',
        title: 'Normal Repo',
        location: '',
        uri: 'http://normal',
        type: RepositoryType.GRAPH_DB
      });
      repositoryContextService.updateRepositoryList(new RepositoryList([repository]));
      repositoryContextService.updateSelectedRepository(repository);

      component.permissions = [ViewPermissions.IS_FEDEX_REPO];
      fixture.detectChanges();

      const restrictedContent = fixture.nativeElement.querySelector('.restricted-content');
      expect(restrictedContent).toBeFalsy();
    });
  });

  describe('IS_ONTOP_REPO permission', () => {
    it('should show content when active repository is Ontop', async () => {
      const repository = new Repository({
        id: 'ontop-repo',
        title: 'Ontop Repo',
        location: '',
        uri: 'http://ontop',
        sesameType: 'graphdb:OntopRepository'
      });
      repositoryContextService.updateRepositoryList(new RepositoryList([repository]));
      repositoryContextService.updateSelectedRepository(repository);

      component.permissions = [ViewPermissions.IS_ONTOP_REPO];
      fixture.detectChanges();
      await fixture.whenStable();

      const restrictedContent = fixture.nativeElement.querySelector('.restricted-content');
      expect(restrictedContent).toBeTruthy();
    });

    it('should hide content when active repository is not Ontop', () => {
      const repository = new Repository({
        id: 'normal-repo',
        title: 'Normal Repo',
        location: '',
        uri: 'http://normal',
        type: RepositoryType.GRAPH_DB
      });
      repositoryContextService.updateRepositoryList(new RepositoryList([repository]));
      repositoryContextService.updateSelectedRepository(repository);

      component.permissions = [ViewPermissions.IS_ONTOP_REPO];
      fixture.detectChanges();

      const restrictedContent = fixture.nativeElement.querySelector('.restricted-content');
      expect(restrictedContent).toBeFalsy();
    });
  });

  describe('Multiple permissions', () => {
    it('should show content when all permissions are satisfied', async () => {
      const adminUser = new AuthenticatedUser();
      adminUser.username = 'admin';
      adminUser.setAuthorities(new AuthorityList([Authority.ROLE_ADMIN, 'WRITE_REPO_test']));
      securityContextService.updateAuthenticatedUser(adminUser);

      const securityConfig = getSecurityConfig(true);
      securityContextService.updateSecurityConfig(securityConfig);

      const repository = new Repository({
        id: 'test',
        title: 'Test Repo',
        location: '',
        uri: 'http://test',
        readable: true,
        writable: true
      });
      repositoryContextService.updateRepositoryList(new RepositoryList([repository]));
      repositoryContextService.updateSelectedRepository(repository);

      component.permissions = [ViewPermissions.IS_ADMIN, ViewPermissions.CAN_WRITE_ACTIVE_REPO];
      fixture.detectChanges();
      await fixture.whenStable();

      const restrictedContent = fixture.nativeElement.querySelector('.restricted-content');
      expect(restrictedContent).toBeTruthy();
    });

    it('should hide content when any permission is not satisfied', () => {
      const adminUser = new AuthenticatedUser();
      adminUser.username = 'admin';
      adminUser.setAuthorities(new AuthorityList([Authority.ROLE_ADMIN]));
      securityContextService.updateAuthenticatedUser(adminUser);

      const securityConfig = getSecurityConfig(true);
      securityContextService.updateSecurityConfig(securityConfig);

      const repository = new Repository({
        id: 'test',
        title: 'Test Repo',
        location: '',
        uri: 'http://test',
        readable: true,
        writable: false
      });
      repositoryContextService.updateRepositoryList(new RepositoryList([repository]));
      repositoryContextService.updateSelectedRepository(repository);

      component.permissions = [ViewPermissions.IS_ADMIN, ViewPermissions.CAN_WRITE_ACTIVE_REPO];
      fixture.detectChanges();

      const restrictedContent = fixture.nativeElement.querySelector('.restricted-content');
      expect(restrictedContent).toBeFalsy();
    });
  });

  describe('Context changes', () => {
    it('should update view when repository changes', async () => {
      const repository1 = new Repository({
        id: 'repo1',
        title: 'Repo 1',
        location: '',
        uri: 'http://repo1',
        type: RepositoryType.GRAPH_DB
      });
      repositoryContextService.updateRepositoryList(new RepositoryList([repository1]));
      repositoryContextService.updateSelectedRepository(repository1);

      component.permissions = [ViewPermissions.IS_FEDEX_REPO];
      fixture.detectChanges();

      let restrictedContent = fixture.nativeElement.querySelector('.restricted-content');
      expect(restrictedContent).toBeFalsy();

      // Change to FedX repository
      const repository2 = new Repository({
        id: 'repo2',
        title: 'Repo 2',
        location: '',
        uri: 'http://repo2',
        sesameType: 'graphdb:FedXRepository'
      });
      repositoryContextService.updateRepositoryList(new RepositoryList([repository1, repository2]));
      repositoryContextService.updateSelectedRepository(repository2);
      fixture.detectChanges();
      await fixture.whenStable();

      restrictedContent = fixture.nativeElement.querySelector('.restricted-content');
      expect(restrictedContent).toBeTruthy();
    });

    it('should update view when user changes', () => {
      const user = new AuthenticatedUser();
      user.username = 'user';
      user.setAuthorities(new AuthorityList([Authority.ROLE_USER]));
      securityContextService.updateAuthenticatedUser(user);

      const securityConfig = getSecurityConfig(true);
      securityContextService.updateSecurityConfig(securityConfig);

      component.permissions = [ViewPermissions.IS_ADMIN];
      fixture.detectChanges();

      let restrictedContent = fixture.nativeElement.querySelector('.restricted-content');
      expect(restrictedContent).toBeFalsy();

      // Change to admin user
      const adminUser = new AuthenticatedUser();
      adminUser.username = 'admin';
      adminUser.setAuthorities(new AuthorityList([Authority.ROLE_ADMIN]));
      securityContextService.updateAuthenticatedUser(adminUser);
      fixture.detectChanges();

      restrictedContent = fixture.nativeElement.querySelector('.restricted-content');
      expect(restrictedContent).toBeTruthy();
    });
  });

  describe('Unsupported permission', () => {
    it('should throw error for unsupported permission', () => {
      component.permissions = ['unsupportedPermission'] as unknown as PermissionType[];

      expect(() => {
        fixture.detectChanges();
      }).toThrow('unsupportedPermission permission is not supported');
    });
  });
});

