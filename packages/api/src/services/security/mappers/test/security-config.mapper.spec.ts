import {SecurityConfig} from '../../../../models/security';
import {SecurityConfigMapper} from '../security-config.mapper';
import {SecurityConfigDto, SecurityConfigInit} from '../../../../models/security/security-config-dto';
import {AuthSettings} from '../../../../models/security/auth-settings';
import {AuthSettingsMapper} from '../auth-settings.mapper';

describe('SecurityConfigMapper', () => {
  test('should map raw data to SecurityConfig model', () => {
    // Given I have a raw security config object
    const newSecurityConfig: SecurityConfigDto = {
      freeAccess: {},
      overrideAuth: {},
      appSettings: {},
      methodSettings: {},
      passwordLoginEnabled: true,
      hasExternalAuth: false,
      hasExternalAuthUser: false,
      authImplementation: 'Local',
      openIdEnabled: false,
    };

    // When I map the raw data to a SecurityConfig model
    const mappedSecurityConfig = new SecurityConfigMapper().mapToModel(newSecurityConfig);
    const authSettingsMapper = new AuthSettingsMapper();
    const expected = new SecurityConfig({
      authImplementation: 'Local',
      enabled: undefined,
      passwordLoginEnabled: true,
      freeAccess: authSettingsMapper.mapToModel({}),
      overrideAuth: authSettingsMapper.mapToModel({}),
      openIdEnabled: false,
      userLoggedIn: undefined,
      freeAccessActive: undefined,
      hasExternalAuthUser: false,
    } as SecurityConfigInit);

    expect(mappedSecurityConfig).toEqual(expected);
    // Then I expect the mapped model to be an instance of SecurityConfig
    expect(mappedSecurityConfig).toBeInstanceOf(SecurityConfig);
    expect(mappedSecurityConfig.freeAccess).toBeInstanceOf(AuthSettings);
    expect(mappedSecurityConfig.overrideAuth).toBeInstanceOf(AuthSettings);
  });

  test('should map raw security config to model', () => {
    const raw: SecurityConfigDto = {
      authImplementation: 'BASIC',
      enabled: true,
      passwordLoginEnabled: false,
      freeAccess: { enabled: true },
      overrideAuth: { enabled: false },
    };

    const mapper = new SecurityConfigMapper();
    const result = mapper.mapToModel(raw);

    expect(result).toBeInstanceOf(SecurityConfig);
    expect(result.authImplementation).toBe('BASIC');
    expect(result.enabled).toBe(true);
    expect(result.passwordLoginEnabled).toBe(false);
    expect(result.freeAccess).toBeInstanceOf(AuthSettings);
    expect(result.overrideAuth).toBeInstanceOf(AuthSettings);
  });
});
