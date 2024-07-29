// import {NavbarService} from "../navbar-service";
// import {ExternalMenuModel} from "../menu-model";
//
// describe('NavbarService', () => {
//   let navbarService: NavbarService;
//   let mockNavbarPlugins: ExternalMenuModel;
//
//   beforeEach(() => {
//     mockNavbarPlugins = [
//       {
//         "items": [
//           { "label": "Setup", "labelKey": "menu.setup.label", "href": "#", "order": 5, "role": "IS_AUTHENTICATED_FULLY", "icon": "icon-settings", "guideSelector": "menu-setup" },
//           { "label": "ACL Management", "labelKey": "menu.aclmanagement.label", "href": "aclmanagement", "order": 6, "parent": "Setup", "role": "ROLE_ADMIN", "guideSelector": "sub-menu-aclmanagement" } ]
//       },
//       {
//         "items": [
//           { "label": "Setup", "labelKey": "menu.setup.label", "href": "#", "order": 5, "role": "IS_AUTHENTICATED_FULLY", "icon": "icon-settings", "guideSelector": "menu-setup" },
//           { "label": "Autocomplete", "labelKey": "menu.autocomplete.label", "href": "autocomplete", "order": 40, "parent": "Setup", "role": "IS_AUTHENTICATED_FULLY", "guideSelector": "sub-menu-autocomplete" }
//         ]
//       },
//       {
//         "items": [
//           { "label": "Lab", "labelKey": "menu.lab.label", "href": "#", "order": 6, "role": "IS_AUTHENTICATED_FULLY", "icon": "fa fa-flask", "guideSelector": "menu-lab" },
//           { "label": "Talk to Your Graph", "labelKey": "menu.ttyg.label", "href": "chatgpt", "order": 20, "role": "ROLE_USER", "parent": "Lab", "guideSelector": "sub-menu-ttyg" }
//         ]
//       },
//     ];
//     navbarService = new NavbarService(mockNavbarPlugins);
//   });
//
//   it('should build a menu model from provided plugins', () => {
//     const menuModel = navbarService.buildMenuModel();
//     console.log(`model`, JSON.stringify(menuModel));
//     const actual = [{"label":"Setup","labelKey":"menu.setup.label","href":"#","order":5,"role":"IS_AUTHENTICATED_FULLY","icon":"icon-settings","guideSelector":"menu-setup","children":[{"label":"ACL Management","labelKey":"menu.aclmanagement.label","href":"aclmanagement","order":6,"role":"ROLE_ADMIN","guideSelector":"sub-menu-aclmanagement","children":[],"hasParent":true},{"label":"Autocomplete","labelKey":"menu.autocomplete.label","href":"autocomplete","order":40,"role":"IS_AUTHENTICATED_FULLY","guideSelector":"sub-menu-autocomplete","children":[],"hasParent":true}],"hasParent":false},{"label":"Lab","labelKey":"menu.lab.label","href":"#","order":6,"role":"IS_AUTHENTICATED_FULLY","icon":"fa fa-flask","guideSelector":"menu-lab","children":[{"label":"Talk to Your Graph","labelKey":"menu.ttyg.label","href":"chatgpt","order":20,"role":"ROLE_USER","guideSelector":"sub-menu-ttyg","children":[],"hasParent":true}],"hasParent":false}];
//     expect(menuModel).toEqual(actual);
//   });
//
//   it('should not duplicate items if added multiple times', () => {
//     mockNavbarPlugins[1].items.push({ "label": "Autocomplete", "labelKey": "menu.autocomplete.label", "href": "autocomplete2", "order": 40, "parent": "Setup" });
//     const menuModel = navbarService.buildMenuModel();
//     expect(menuModel[0].children.length).toBe(2);
//     expect(menuModel[0].children.filter(item => item.label === 'Autocomplete').length).toBe(1);
//   });
// });
