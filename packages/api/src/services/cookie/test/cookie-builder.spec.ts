import {CookieBuilder} from '../cookie-builder';
import {DateUtil} from '../../utils/date-util';

describe('CookieBuilder', () => {
  describe('constructor', () => {
    it('should encode the key and value', () => {
      const builder = new CookieBuilder('my key', 'my value');
      expect(builder.key).toBe(encodeURIComponent('my key'));
      expect(builder.value).toBe(encodeURIComponent('my value'));
    });

    it('should set default path to "/"', () => {
      const builder = new CookieBuilder('key', 'value');
      expect(builder.path).toBe('/');
    });

    it('should apply provided options', () => {
      const builder = new CookieBuilder('key', 'value', {path: '/app', secure: true});
      expect(builder.path).toBe('/app');
      expect(builder.secure).toBe(true);
    });

    it('should use empty options by default', () => {
      const builder = new CookieBuilder('key', 'value');
      expect(builder.expires).toBeUndefined();
      expect(builder.domain).toBeUndefined();
      expect(builder.secure).toBeUndefined();
      expect(builder.httpOnly).toBeUndefined();
      expect(builder.sameSite).toBeUndefined();
    });
  });

  describe('setExpiration', () => {
    const FIXED_NOW = new Date('2026-02-25T12:00:00.000Z').getTime();
    const MS_PER_DAY = 24 * 60 * 60 * 1000;

    beforeEach(() => {
      jest.spyOn(DateUtil, 'now').mockReturnValue(FIXED_NOW);
    });

    it('should set expires to a UTC string in the future for a positive number of days', () => {
      const builder = new CookieBuilder('key', 'value');
      builder.setExpiration(1);

      const expectedDate = new Date(FIXED_NOW + MS_PER_DAY);
      expect(builder.expires).toBe(expectedDate.toUTCString());
    });

    it('should set expires to a date in the past for a negative number of days', () => {
      const builder = new CookieBuilder('key', 'value');
      builder.setExpiration(-1);

      const expectedDate = new Date(FIXED_NOW - MS_PER_DAY);
      expect(builder.expires).toBe(expectedDate.toUTCString());
    });

    it('should throw an error when expiration is Infinity', () => {
      const builder = new CookieBuilder('key', 'value');
      expect(() => builder.setExpiration(Infinity)).toThrow('Invalid expiration value: Infinity');
    });

    it('should throw an error when expiration is NaN', () => {
      const builder = new CookieBuilder('key', 'value');
      expect(() => builder.setExpiration(Number.NaN)).toThrow('Invalid expiration value: NaN');
    });

    it('should return the builder instance for chaining', () => {
      const builder = new CookieBuilder('key', 'value');
      expect(builder.setExpiration(7)).toBe(builder);
    });
  });

  describe('setPath', () => {
    it('should set the given path', () => {
      const builder = new CookieBuilder('key', 'value');
      builder.setPath('/custom');
      expect(builder.path).toBe('/custom');
    });

    it('should default to "/" when path is undefined', () => {
      const builder = new CookieBuilder('key', 'value');
      builder.setPath(undefined);
      expect(builder.path).toBe('/');
    });

    it('should return the builder instance for chaining', () => {
      const builder = new CookieBuilder('key', 'value');
      expect(builder.setPath('/test')).toBe(builder);
    });
  });

  describe('setDomain', () => {
    it('should set the domain', () => {
      const builder = new CookieBuilder('key', 'value');
      builder.setDomain('example.com');
      expect(builder.domain).toBe('example.com');
    });

    it('should return the builder instance for chaining', () => {
      const builder = new CookieBuilder('key', 'value');
      expect(builder.setDomain('example.com')).toBe(builder);
    });
  });

  describe('setSecure', () => {
    it('should set secure to true', () => {
      const builder = new CookieBuilder('key', 'value');
      builder.setSecure();
      expect(builder.secure).toBe(true);
    });

    it('should return the builder instance for chaining', () => {
      const builder = new CookieBuilder('key', 'value');
      expect(builder.setSecure()).toBe(builder);
    });
  });

  describe('setHttpOnly', () => {
    it('should set httpOnly to true', () => {
      const builder = new CookieBuilder('key', 'value');
      builder.setHttpOnly();
      expect(builder.httpOnly).toBe(true);
    });

    it('should return the builder instance for chaining', () => {
      const builder = new CookieBuilder('key', 'value');
      expect(builder.setHttpOnly()).toBe(builder);
    });
  });

  describe('setSameSite', () => {
    it('should set sameSite attribute', () => {
      const builder = new CookieBuilder('key', 'value');
      builder.setSameSite('Strict');
      expect(builder.sameSite).toBe('Strict');
    });

    it('should return the builder instance for chaining', () => {
      const builder = new CookieBuilder('key', 'value');
      expect(builder.setSameSite('Lax')).toBe(builder);
    });
  });

  describe('setOptions', () => {
    it('should set all provided options', () => {
      const builder = new CookieBuilder('key', 'value');
      builder.setOptions({
        path: '/app',
        domain: 'example.com',
        secure: true,
        httpOnly: true,
        sameSite: 'None'
      });
      expect(builder.path).toBe('/app');
      expect(builder.domain).toBe('example.com');
      expect(builder.secure).toBe(true);
      expect(builder.httpOnly).toBe(true);
      expect(builder.sameSite).toBe('None');
    });

    it('should not set domain when not provided', () => {
      const builder = new CookieBuilder('key', 'value');
      builder.setOptions({});
      expect(builder.domain).toBeUndefined();
    });

    it('should not set secure when not provided', () => {
      const builder = new CookieBuilder('key', 'value');
      builder.setOptions({});
      expect(builder.secure).toBeUndefined();
    });

    it('should not set httpOnly when not provided', () => {
      const builder = new CookieBuilder('key', 'value');
      builder.setOptions({});
      expect(builder.httpOnly).toBeUndefined();
    });

    it('should not set sameSite when not provided', () => {
      const builder = new CookieBuilder('key', 'value');
      builder.setOptions({});
      expect(builder.sameSite).toBeUndefined();
    });

    it('should return the builder instance for chaining', () => {
      const builder = new CookieBuilder('key', 'value');
      expect(builder.setOptions({})).toBe(builder);
    });
  });

  describe('build', () => {
    it('should build a minimal cookie string with key, value and default path', () => {
      const cookieStr = new CookieBuilder('name', 'alice').build();
      expect(cookieStr).toBe('name=alice; path=/');
    });

    it('should include expires when set', () => {
      const builder = new CookieBuilder('name', 'alice');
      builder.expires = 'Wed, 25 Feb 2026 12:00:00 GMT';
      expect(builder.build()).toBe('name=alice; expires=Wed, 25 Feb 2026 12:00:00 GMT; path=/');
    });

    it('should include domain when set', () => {
      const cookieStr = new CookieBuilder('name', 'alice', {domain: 'example.com'}).build();
      expect(cookieStr).toContain('; domain=example.com');
    });

    it('should include "secure" flag when set', () => {
      const cookieStr = new CookieBuilder('name', 'alice', {secure: true}).build();
      expect(cookieStr).toContain('; secure');
    });

    it('should include "HttpOnly" flag when set', () => {
      const cookieStr = new CookieBuilder('name', 'alice', {httpOnly: true}).build();
      expect(cookieStr).toContain('; HttpOnly');
    });

    it('should include SameSite attribute when set', () => {
      const cookieStr = new CookieBuilder('name', 'alice', {sameSite: 'Strict'}).build();
      expect(cookieStr).toContain('; SameSite=Strict');
    });

    it('should use custom path when provided', () => {
      const cookieStr = new CookieBuilder('name', 'alice', {path: '/app'}).build();
      expect(cookieStr).toContain('; path=/app');
    });

    it('should encode special characters in key and value', () => {
      const cookieStr = new CookieBuilder('my key', 'hello world').build();
      expect(cookieStr).toMatch(new RegExp(`^${encodeURIComponent('my key')}=${encodeURIComponent('hello world')}`));
    });

    it('should build a full cookie string with all attributes', () => {
      const builder = new CookieBuilder('session', 'abc123', {
        path: '/app',
        domain: 'example.com',
        secure: true,
        httpOnly: true,
        sameSite: 'Lax'
      });
      builder.expires = 'Wed, 25 Feb 2026 12:00:00 GMT';

      const cookieStr = builder.build();
      expect(cookieStr).toBe(
        'session=abc123; expires=Wed, 25 Feb 2026 12:00:00 GMT; path=/app; domain=example.com; secure; HttpOnly; SameSite=Lax'
      );
    });
  });
});

