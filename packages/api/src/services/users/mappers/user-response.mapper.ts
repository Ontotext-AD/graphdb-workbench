import {AppSettings, User} from '../../../models/users';
import {UserResponse} from '../response/user-response';
import {AuthorityList} from '../../../models/security';
import {CookieConsent} from '../../../models/cookie';
import {MapperFn} from '../../../providers/mapper/mapper-fn';

export const mapUserResponseToModel: MapperFn<UserResponse, User> = (data) => {
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
};

