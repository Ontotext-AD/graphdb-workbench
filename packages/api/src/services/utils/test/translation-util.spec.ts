import {TranslationUtil} from '../translation-util';

describe('TranslationUtil', () => {
  describe('translate', () => {
    test('should return a translation from the provided bundle', () => {
      // GIVEN: I have a bundle containing the requested translation.
      const bundle = {
        language: 'en',
        greeting: 'Hello',
      };

      // WHEN: I translate the key using the bundle.
      const result = TranslationUtil.translate(bundle, 'greeting');
      // THEN: I expect the translation from the bundle.
      expect(result).toBe('Hello');
    });

    test('should return undefined when no bundle is provided', () => {
      // GIVEN: I have no translation bundle.
      const bundle = undefined;

      // WHEN: I try to translate a key.
      const result = TranslationUtil.translate(bundle, 'greeting');
      // THEN: I expect no translation to be returned.
      expect(result).toBeUndefined();
    });

    test('should return undefined when the key is missing from the bundle', () => {
      // GIVEN: I have a bundle without the requested translation.
      const bundle = {
        language: 'en',
        greeting: 'Hello',
      };

      // WHEN: I try to translate a missing key.
      const result = TranslationUtil.translate(bundle, 'missing-key');
      // THEN: I expect no translation to be returned.
      expect(result).toBeUndefined();
    });

    test('should return undefined when the value is not a string', () => {
      // GIVEN: I have a bundle in which the requested key contains a nested bundle.
      const bundle = {
        language: 'root',
        en: {
          language: 'en',
          greeting: 'Hello',
        },
      };

      // WHEN: I try to translate the nested-bundle key directly.
      const result = TranslationUtil.translate(bundle, 'en');
      // THEN: I expect no translation to be returned.
      expect(result).toBeUndefined();
    });

    test('should replace a single placeholder in the translation', () => {
      // GIVEN: I have a translation containing a placeholder.
      const bundle = {
        language: 'en',
        greeting: 'Hello {{name}}',
      };

      // WHEN: I translate the key with a replacement value.
      const result = TranslationUtil.translate(bundle, 'greeting', {name: 'Alice'});
      // THEN: I expect the placeholder to be replaced.
      expect(result).toBe('Hello Alice');
    });

    test('should replace multiple placeholders in the translation', () => {
      // GIVEN: I have a translation containing multiple placeholders.
      const bundle = {
        language: 'en',
        introduction: '{{name}} is {{age}} years old',
      };

      // WHEN: I translate the key with the replacement values.
      const result = TranslationUtil.translate(bundle, 'introduction', {name: 'Alice', age: '30',});
      // THEN: I expect all matching placeholders to be replaced.
      expect(result).toBe('Alice is 30 years old');
    });

    test('should replace all occurrences of the same placeholder', () => {
      // GIVEN: I have a translation containing the same placeholder multiple times.
      const bundle = {
        language: 'en',
        greeting: 'Hello {{name}}, goodbye {{name}}',
      };

      // WHEN: I translate the key with a replacement value.
      const result = TranslationUtil.translate(bundle, 'greeting', {name: 'Alice'},);
      // THEN: I expect every occurrence of the placeholder to be replaced.
      expect(result).toBe('Hello Alice, goodbye Alice');
    });

    test('should leave placeholders without matching parameters unchanged', () => {
      // GIVEN: I have a translation containing two placeholders and a replacement value for only one of them.
      const bundle = {
        language: 'en',
        greeting: 'Hello {{firstName}} {{lastName}}',
      };

      // WHEN: I translate the key with the available parameter.
      const result = TranslationUtil.translate(bundle, 'greeting', {firstName: 'Alice'});
      // THEN: I expect only the matching placeholder to be replaced.
      expect(result).toBe('Hello Alice {{lastName}}');
    });

    test('should return the translation unchanged when parameters are not provided', () => {
      // GIVEN: I have a translation containing a placeholder.
      const bundle = {
        language: 'en',
        greeting: 'Hello {{name}}',
      };

      // WHEN: I translate the key without parameters.
      const result = TranslationUtil.translate(bundle, 'greeting');
      // THEN: I expect the original translation to be returned.
      expect(result).toBe('Hello {{name}}');
    });

    test('should sanitize the translated value', () => {
      // GIVEN: I have a translation containing unsafe HTML.
      const bundle = {
        language: 'en',
        content: '<script>alert("unsafe")</script><strong>Hello</strong>',
      };

      // WHEN: I translate the key.
      const result = TranslationUtil.translate(bundle, 'content');
      // THEN: I expect the unsafe HTML to be removed.
      expect(result).not.toContain('<script>');
      expect(result).toContain('<strong>Hello</strong>');
    });
  });

  describe('applyParameters', () => {
    test('should replace a single placeholder', () => {
      // GIVEN: I have a translation with one placeholder.
      const translation = 'Hello {{name}}';

      // WHEN: I apply a matching parameter.
      const result = TranslationUtil.applyParameters(translation, {name: 'Alice'});
      // THEN: I expect the placeholder to be replaced.
      expect(result).toBe('Hello Alice');
    });

    test('should replace multiple placeholders', () => {
      // GIVEN: I have a translation with multiple placeholders.
      const translation = '{{first}} and {{second}}';

      // WHEN: I apply matching parameters.
      const result = TranslationUtil.applyParameters(translation, {first: 'foo', second: 'bar',});
      // THEN: I expect all matching placeholders to be replaced.
      expect(result).toBe('foo and bar');
    });

    test('should replace every occurrence of the same placeholder', () => {
      // GIVEN: I have a translation containing the same placeholder multiple times.
      const translation = '{{value}} {{value}}';

      // WHEN: I apply the matching parameter.
      const result = TranslationUtil.applyParameters(translation, {value: 'hello'});
      // THEN: I expect every occurrence to be replaced.
      expect(result).toBe('hello hello');
    });

    test('should leave unknown placeholders unchanged', () => {
      // GIVEN: I have a translation with a placeholder that has no matching parameter.
      const translation = 'Hello {{firstName}} {{lastName}}';

      // WHEN: I apply only one matching parameter.
      const result = TranslationUtil.applyParameters(translation, {firstName: 'Alice'});
      // THEN: I expect the unknown placeholder to remain unchanged.
      expect(result).toBe('Hello Alice {{lastName}}');
    });

    test('should return the original translation when parameters are empty', () => {
      // GIVEN: I have a translation and no replacement parameters.
      const translation = 'Hello {{name}}';

      // WHEN: I apply the empty parameters.
      const result = TranslationUtil.applyParameters(translation);
      // THEN: I expect the original translation to be returned.
      expect(result).toBe(translation);
    });
  });

  describe('replaceAll', () => {
    test('should replace every occurrence of a placeholder', () => {
      // GIVEN: I have a translation containing the same placeholder multiple times.
      const translation = '{{name}} says hello to {{name}}';

      // WHEN: I replace every occurrence of the placeholder.
      const result = TranslationUtil.replaceAll(translation, 'name', 'Alice');
      // THEN: I expect every occurrence to be replaced.
      expect(result).toBe('Alice says hello to Alice');
    });

    test('should return the original translation when the placeholder is absent', () => {
      // GIVEN: I have a translation without the specified placeholder.
      const translation = 'Hello world';

      // WHEN: I try to replace the missing placeholder.
      const result = TranslationUtil.replaceAll(translation, 'name', 'Alice');
      // THEN: I expect the original translation to be returned.
      expect(result).toBe(translation);
    });

    test('should treat the key as plain text', () => {
      // GIVEN: I have a placeholder whose name contains regular-expression characters.
      const translation = 'Value: {{item.key[0]}}';

      // WHEN: I replace the placeholder.
      const result = TranslationUtil.replaceAll(translation, 'item.key[0]', 'first');
      // THEN: I expect the placeholder to be replaced literally.
      expect(result).toBe('Value: first');
    });
  });
});
