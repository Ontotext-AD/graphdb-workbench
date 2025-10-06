// import {RoutingService} from '../routing.service';
// import {WindowService} from '../../window/window.service';
// import {RoutePlugin} from '../../../models/plugins/plugins/unordered/route-plugin';
//
// describe('RoutingService', () => {
//   let routingService: RoutingService;
//   const windowMock = {
//     PluginRegistry: {
//       get: jest.fn()
//     }
//   } as unknown as Window;
//
//   beforeEach(() => {
//     jest.spyOn(WindowService, 'getWindow').mockReturnValue(windowMock);
//   });
//
//   test('should return undefined when no route matches the given path', () => {
//     jest.spyOn(windowMock.PluginRegistry, 'get').mockReturnValue([]);
//
//     routingService = new RoutingService();
//
//     const result = routingService.getActiveRoute('/non-existent-path');
//
//     expect(result).toBeUndefined();
//   });
//
//   test('should resolve home page route', () => {
//     const expectedRoute = {
//       url: '/',
//       module: 'home',
//       path: '',
//       chunk: 'home',
//       controller: 'HomeComponent',
//       templateUrl: 'home.component.html',
//       title: 'Home'
//     };
//     jest.spyOn(windowMock.PluginRegistry, 'get').mockReturnValue([
//       expectedRoute, {
//         url: '/aclmanagement',
//         module: 'graphdb.framework.aclmanagement',
//         path: 'aclmanagement/app',
//         chunk: 'aclmanagement',
//         controller: 'AclManagementCtrl',
//         templateUrl: 'pages/aclmanagement.html',
//         title: 'view.aclmanagement.title',
//         helpInfo: 'view.aclmanagement.helpInfo',
//         documentationUrl: 'managing-fgac-workbench.html',
//         allowAuthorities: [
//           'READ_REPO_{repoId}'
//         ]
//       }]);
//
//     routingService = new RoutingService();
//     const result = routingService.getActiveRoute('/');
//     expect(result).toEqual(new RoutePlugin(expectedRoute));
//   });
//
//   test('should resolve route with parameters', () => {
//     const expectedRoute = {
//       url: '/repository/edit/:repositoryId',
//       module: 'graphdb.framework.repositories',
//       path: 'repositories/app',
//       chunk: 'repositories',
//       controller: 'EditRepositoryCtrl',
//       templateUrl: 'pages/repository.html',
//       title: 'Edit Repository',
//       allowAuthorities: [
//         'READ_REPO_{repoId}'
//       ]
//     };
//     jest.spyOn(windowMock.PluginRegistry, 'get').mockReturnValue([
//       expectedRoute, {
//         url: '/aclmanagement',
//         module: 'graphdb.framework.aclmanagement',
//         path: 'aclmanagement/app',
//         chunk: 'aclmanagement',
//         controller: 'AclManagementCtrl',
//         templateUrl: 'pages/aclmanagement.html',
//         title: 'view.aclmanagement.title',
//         helpInfo: 'view.aclmanagement.helpInfo',
//         documentationUrl: 'managing-fgac-workbench.html',
//         allowAuthorities: [
//           'READ_REPO_{repoId}'
//         ]
//       }
//     ]);
//
//     routingService = new RoutingService();
//     const result = routingService.getActiveRoute('/repository/edit/123');
//     expect(result).toEqual(new RoutePlugin(expectedRoute));
//   });
//
//   test('should resolve route with optional parameters', () => {
//     const expectedRoute = {
//       url: '/repository/edit/:repositoryId?',
//       module: 'graphdb.framework.repositories',
//       path: 'repositories/app',
//       chunk: 'repositories',
//       controller: 'EditRepositoryCtrl',
//       templateUrl: 'pages/repository.html',
//       title: 'Edit Repository',
//       allowAuthorities: [
//         'READ_REPO_{repoId}'
//       ]
//     };
//     jest.spyOn(windowMock.PluginRegistry, 'get').mockReturnValue([
//       expectedRoute, {
//         url: '/aclmanagement',
//         module: 'graphdb.framework.aclmanagement',
//         path: 'aclmanagement/app',
//         chunk: 'aclmanagement',
//         controller: 'AclManagementCtrl',
//         templateUrl: 'pages/repository.html',
//         title: 'Edit Repository',
//         allowAuthorities: [
//           'READ_REPO_{repoId}'
//         ]
//       }]);
//     routingService = new RoutingService();
//     const result = routingService.getActiveRoute('/repository/edit');
//     expect(result).toEqual(new RoutePlugin(expectedRoute));
//   });
//
//   test('should resolve route with parameter and wildcard', () => {
//     const expectedRoute = {
//       url: '/resource/:any*',
//       module: 'graphdb.framework.explore',
//       chunk: 'explore',
//       path: 'explore/app',
//       controller: 'ExploreCtrl',
//       templateUrl: 'pages/explore.html',
//       title: 'view.resource.title',
//       allowAuthorities: [
//         'READ_REPO_{repoId}'
//       ]
//     };
//     jest.spyOn(windowMock.PluginRegistry, 'get').mockReturnValue([
//       expectedRoute, {
//         url: '/aclmanagement',
//         module: 'graphdb.framework.aclmanagement',
//         path: 'aclmanagement/app',
//         chunk: 'aclmanagement',
//         controller: 'AclManagementCtrl',
//         templateUrl: 'pages/aclmanagement.html',
//         title: 'view.aclmanagement.title',
//         helpInfo: 'view.aclmanagement.helpInfo',
//         documentationUrl: 'managing-fgac-workbench.html',
//         allowAuthorities: [
//           'READ_REPO_{repoId}'
//         ]
//       }]);
//     routingService = new RoutingService();
//     const result = routingService.getActiveRoute('/resource/test/path/here');
//     expect(result).toEqual(new RoutePlugin(expectedRoute));
//   });
// });
