import {AuthSettings} from '../../../../models/security/auth-settings';
import {AuthSettingsMapper} from '../auth-settings.mapper';

describe('AuthSettingsMapper', () => {
  test('should map raw data to AuthSettings model', () => {
    // Given I have a raw AuthSettings object
    const rawAuthSettings = {
      authImplementation: 'BASIC',
      enabled: true,
      passwordLoginEnabled: false,
      freeAccess: {},
      overrideAuth: {},
    } as unknown as AuthSettings;

    // When I map the raw data to an AuthSettings model
    const authSettings = new AuthSettingsMapper().mapToModel(rawAuthSettings);

    // Then I expect the AuthSettings model to have the same properties as the raw data
    expect(authSettings).toEqual(new AuthSettings(rawAuthSettings));
  });
});
