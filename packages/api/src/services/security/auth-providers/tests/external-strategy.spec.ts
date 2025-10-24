import {ExternalStrategy} from '../external-strategy';
import {service} from '../../../../providers';
import {SecurityContextService} from '../../security-context.service';
import {AuthenticatedUser} from '../../../../models/security';

describe('External strategy Auth Provider', () => {
  let strategy: ExternalStrategy;
  const securityContextService = service(SecurityContextService);

  beforeEach(() => {
    strategy = new ExternalStrategy();
    securityContextService.updateAuthenticatedUser(undefined as unknown as AuthenticatedUser);
  });

  test('initialize should resolve to true', async () => {
    await expect(strategy.initialize()).resolves.toEqual(true);
  });

  test('isAuthenticated should return true when there is an authenticated user, false if not', () => {
    expect(strategy.isAuthenticated()).toEqual(false);
    securityContextService.updateAuthenticatedUser(new AuthenticatedUser());
    expect(strategy.isAuthenticated()).toEqual(true);
  });
});
