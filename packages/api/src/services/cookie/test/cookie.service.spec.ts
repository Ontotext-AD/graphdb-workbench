import {CookieService} from '../cookie.service';
import {InMemoryCookieStore} from './in-memory-cookie-store';

describe('CookieService', () => {
  let cookieService: CookieService;
  let store: InMemoryCookieStore;

  beforeEach(() => {
    store = new InMemoryCookieStore();
    cookieService = new CookieService(store);
  });

  describe('set', () => {
    it('should write an encoded key=value pair to the store', () => {
      cookieService.set('username', 'alice');
      expect(store.read()).toMatch(/^username=alice(;|$)/);
    });

    it('should overwrite an existing cookie with the same key', () => {
      cookieService.set('username', 'alice');
      cookieService.set('username', 'bob');
      expect(store.read()).toMatch(/^username=bob(;|$)/);
      expect(store.read()).not.toContain('alice');
    });

    it('should URL-encode special characters in the key and value', () => {
      cookieService.set('my key', 'hello world');
      expect(store.read()).toContain(
        `${encodeURIComponent('my key')}=${encodeURIComponent('hello world')}`
      );
    });

    it('should store multiple distinct cookies independently', () => {
      cookieService.set('cookie1', 'value1');
      cookieService.set('cookie2', 'value2');
      expect(store.read()).toContain('cookie1=value1');
      expect(store.read()).toContain('cookie2=value2');
    });
  });

  describe('get', () => {
    it('should return the value of an existing cookie', () => {
      store.write('session=abc123');
      expect(cookieService.get('session')).toBe('abc123');
    });

    it('should return undefined for a non-existent cookie', () => {
      store.write('other=value');
      expect(cookieService.get('nonExistent')).toBeUndefined();
    });

    it('should return undefined when there are no cookies', () => {
      expect(cookieService.get('anything')).toBeUndefined();
    });

    it('should correctly decode URL-encoded cookie values', () => {
      store.write(`${encodeURIComponent('my key')}=${encodeURIComponent('hello world')}`);
      expect(cookieService.get('my key')).toBe('hello world');
    });
  });

  describe('remove', () => {
    it('should delete an existing cookie', () => {
      cookieService.set('session', 'abc123');
      cookieService.remove('session');
      expect(cookieService.get('session')).toBeUndefined();
    });

    it('should not throw when removing a non-existent cookie', () => {
      expect(() => cookieService.remove('nonExistent')).not.toThrow();
    });

    it('should only remove the specified cookie and leave others intact', () => {
      cookieService.set('cookie1', 'value1');
      cookieService.set('cookie2', 'value2');
      cookieService.remove('cookie1');
      expect(cookieService.get('cookie1')).toBeUndefined();
      expect(cookieService.get('cookie2')).toBe('value2');
    });
  });

  describe('getAll', () => {
    it('should return all cookies as a key-value object', () => {
      store.write('name=alice');
      store.write('role=admin');
      expect(cookieService.getAll()).toEqual({name: 'alice', role: 'admin'});
    });

    it('should return an empty object when there are no cookies', () => {
      expect(cookieService.getAll()).toEqual({});
    });

    it('should decode URL-encoded keys and values', () => {
      store.write(`${encodeURIComponent('my key')}=${encodeURIComponent('hello world')}`);
      expect(cookieService.getAll()).toEqual({'my key': 'hello world'});
    });
  });

  describe('parseCookies', () => {
    it('should parse a single cookie', () => {
      store.write('token=xyz');
      expect(cookieService.parseCookies()).toEqual({token: 'xyz'});
    });

    it('should parse multiple cookies', () => {
      store.write('a=1');
      store.write('b=2');
      store.write('c=3');
      expect(cookieService.parseCookies()).toEqual({a: '1', b: '2', c: '3'});
    });

    it('should ignore malformed entries without a value', () => {
      // Seed the store's raw string directly via a second store instance used as a fixture
      const raw = new InMemoryCookieStore();
      raw.write('valid=yes');
      // Manually craft a broken entry by using a store that can expose internals via read()
      // Instead, test parseCookies behaviour by constructing a service around a store whose read() returns the raw string
      const brokenStore: import('../cookie-store').CookieStore = {
        read: () => 'valid=yes; broken',
        write: () => {
          // No-op
        }
      };
      const svc = new CookieService(brokenStore);
      const result = svc.parseCookies();
      expect(result).toEqual({valid: 'yes'});
      expect(result['broken']).toBeUndefined();
    });

    it('should return an empty object when cookie string is empty', () => {
      expect(cookieService.parseCookies()).toEqual({});
    });

    it('should decode URL-encoded keys and values', () => {
      store.write(`${encodeURIComponent('sp ace')}=${encodeURIComponent('val ue')}`);
      expect(cookieService.parseCookies()).toEqual({'sp ace': 'val ue'});
    });
  });
});

