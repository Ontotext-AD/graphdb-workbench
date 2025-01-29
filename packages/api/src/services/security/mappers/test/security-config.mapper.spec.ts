import {SecurityConfig} from '../../../../models/security';
import {SecurityConfigMapper} from '../security-config.mapper';

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
});
