import {SecurityConfig, SecurityConfigResponse} from '../../../../models/security';
import {SecurityConfigMapper} from '../security-config.mapper';
import {AuthSettings} from '../../../../models/security/auth-settings';
import {AuthSettingsMapper} from '../auth-settings.mapper';

describe('SecurityConfigMapper', () => {
  test('should map raw data to SecurityConfig model', () => {
    // Given I have a raw security config object
    const newSecurityConfig: SecurityConfigResponse = {
      freeAccess: {
        enabled: false,
        authorities: [],
        appSettings: {},
      },
      overrideAuth: {
        enabled: false,
        authorities: [],
        appSettings: {},
      },
      methodSettings: {},
      passwordLoginEnabled: true,
      hasExternalAuth: false,
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
      freeAccess: authSettingsMapper.mapToModel({
        enabled: false,
        authorities: [],
        appSettings: {},
      }),
      overrideAuth: authSettingsMapper.mapToModel({
        enabled: false,
        authorities: [],
        appSettings: {},
      }),
      openIdEnabled: false,
      freeAccessActive: false,
      hasExternalAuth: false,
    });

    expect(mappedSecurityConfig).toEqual(expected);
    // Then I expect the mapped model to be an instance of SecurityConfig
    expect(mappedSecurityConfig).toBeInstanceOf(SecurityConfig);
    expect(mappedSecurityConfig.freeAccess).toBeInstanceOf(AuthSettings);
    expect(mappedSecurityConfig.overrideAuth).toBeInstanceOf(AuthSettings);
  });

  test('should map raw security config to model', () => {
    const raw: SecurityConfigResponse = {
      authImplementation: 'BASIC',
      enabled: true,
      passwordLoginEnabled: false,
      freeAccess: {
        enabled: true,
        authorities: [],
        appSettings: {},
      },
      overrideAuth: {
        enabled: false,
        authorities: [],
        appSettings: {},
      },
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
