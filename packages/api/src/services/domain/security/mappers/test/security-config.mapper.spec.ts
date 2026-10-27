import {SecurityConfig} from '../../../../../models/security';
import {mapSecurityConfigResponseToModel} from '../security-config.mapper';

describe('SecurityConfigMapper', () => {
  test('should map raw data to SecurityConfig model', () => {
    // Given I have a raw security config object
    const newSecurityConfig = {
      freeAccess: {},
      overrideAuth: {},
      appSettings: {},
      methodSettings: {},
      passwordLoginEnabled: true,
      hasExternalAuth: false,
      hasExternalAuthUser: false,
      authImplementation: 'Local',
      openIdEnabled: false,
    } as unknown as SecurityConfig;

    // When I map the raw data to a SecurityConfig model
    const mappedSecurityConfig = mapSecurityConfigResponseToModel(newSecurityConfig);

    // Then I expect the mapped model to be an instance of SecurityConfig
    expect(mappedSecurityConfig).toBeInstanceOf(SecurityConfig);
    // And the mapped model should have the same properties as the raw data
    expect(mappedSecurityConfig).toEqual(new SecurityConfig(newSecurityConfig));
  });

  test('should map the OpenID localLogoutOnly setting', () => {
    // Given I have a raw security config with localLogoutOnly enabled for OpenID
    const rawSecurityConfig = {
      freeAccess: {},
      overrideAuth: {},
      methodSettings: {openid: {localLogoutOnly: true}}
    } as unknown as SecurityConfig;

    // When I map the raw data to a SecurityConfig model
    const mappedSecurityConfig = mapSecurityConfigResponseToModel(rawSecurityConfig);

    // Then I expect localLogoutOnly to be enabled in the OpenID config
    expect(mappedSecurityConfig.openidSecurityConfig?.localLogoutOnly).toBe(true);
  });

  test('should default the OpenID localLogoutOnly setting to false when missing', () => {
    // Given I have a raw security config without localLogoutOnly for OpenID
    const rawSecurityConfig = {
      freeAccess: {},
      overrideAuth: {},
      methodSettings: {openid: {}}
    } as unknown as SecurityConfig;

    // When I map the raw data to a SecurityConfig model
    const mappedSecurityConfig = mapSecurityConfigResponseToModel(rawSecurityConfig);

    // Then I expect localLogoutOnly to be disabled in the OpenID config
    expect(mappedSecurityConfig.openidSecurityConfig?.localLogoutOnly).toBe(false);
  });
});
