import {AuthSettings} from '../../../../models/security/auth-settings';
import {AuthSettingsResponseModel} from '../../../../models/security/response-models/auth-settings-response-model';
import {AuthorityList} from '../../../../models/security';
import {AppSettings} from '../../../../models/users/app-settings';
import {mapAuthSettingsResponseToModel} from '../auth-settings.mapper';

describe('AuthSettingsMapper', () => {
  test('should map raw data to AuthSettings model', () => {
    // Given I have a raw AuthSettings object
    const rawAuthSettings = {
      enabled: true,
      authorities: [
        'WRITE_REPO_user-access-repo2-1760009301458',
        'READ_REPO_user-access-repo2-1760009301458',
        'READ_REPO_user-access-repo1-1760009301458'
      ],
      appSettings: {
        DEFAULT_INFERENCE: false,
        DEFAULT_VIS_GRAPH_SCHEMA: true,
        DEFAULT_SAMEAS: false,
        IGNORE_SHARED_QUERIES: false,
        EXECUTE_COUNT: false
      }
    } as AuthSettingsResponseModel;

    // When I map the raw data to an AuthSettings model
    const authSettings = mapAuthSettingsResponseToModel(rawAuthSettings);

    const expected = new AuthSettings({});
    expected.enabled = rawAuthSettings.enabled;
    expected.authorities = new AuthorityList(rawAuthSettings.authorities);
    expected.appSettings = new AppSettings(rawAuthSettings.appSettings);

    // Then I expect the AuthSettings model to have the same properties as the raw data
    expect(authSettings).toEqual(expected);
  });
});
