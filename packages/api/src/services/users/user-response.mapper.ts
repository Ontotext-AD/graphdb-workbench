import {Mapper} from '../../providers/mapper/mapper';
import {User} from '../../models/users/user';
import {UserResponse} from '../../models/users/response-models/user-response';
import {AuthorityList} from '../../models/security';
import {AppSettings} from '../../models/users/app-settings';
import {CookieConsent} from '../../models/cookie';

export class UserResponseMapper extends Mapper<User> {
  mapToModel(data: UserResponse): User {
    return new User({
      username: data.username,
      authorities: new AuthorityList(data.grantedAuthorities),
      appSettings: new AppSettings({
        EXECUTE_COUNT: data.appSettings.EXECUTE_COUNT,
        DEFAULT_INFERENCE: data.appSettings.DEFAULT_INFERENCE,
        DEFAULT_SAMEAS: data.appSettings.DEFAULT_SAMEAS,
        DEFAULT_VIS_GRAPH_SCHEMA: data.appSettings.DEFAULT_VIS_GRAPH_SCHEMA,
        IGNORE_SHARED_QUERIES: data.appSettings.IGNORE_SHARED_QUERIES,
        COOKIE_CONSENT: data.appSettings.COOKIE_CONSENT ? new CookieConsent(data.appSettings.COOKIE_CONSENT) : undefined
      }),
      dateCreated: new Date(data.dateCreated),
      gptThreads: data.gptThreads,
      external: data.external
    });
  }
}
