import {SecurityConfig} from '../../../../models/security';
import {SecurityConfigMapper} from '../security-config.mapper';
import {SecurityConfigDto} from '../../../../models/security/security-config-dto';
import {AuthSettings} from '../../../../models/security/auth-settings';

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
    const mappedSecurityConfig = new SecurityConfigMapper().mapToModel(newSecurityConfig);

    // Then I expect the mapped model to be an instance of SecurityConfig
    expect(mappedSecurityConfig).toBeInstanceOf(SecurityConfig);
    // And the mapped model should have the same properties as the raw data
    expect(mappedSecurityConfig).toEqual(new SecurityConfig(newSecurityConfig));
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
