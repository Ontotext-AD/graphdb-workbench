/**
 * @fileoverview Comprehensive tests for CSSVariablePurger
 */

const fs = require('fs');
const path = require('path');
const CSSVariablePurger = require('./CSS-variable-purger');

// Mock dependencies
jest.mock('fs');
jest.mock('glob');
jest.mock('./css-purger-default-config', () => ({
  DEFAULT_CONFIG: {
    inputFile: 'test-variables.css',
    outputFile: 'test-output.css',
    searchPaths: ['test/**/*.{js,css,html}'],
    ignorePaths: ['**/node_modules/**'],
    safelist: ['--safe-var'],
    safelistPatterns: [/^--safe-/],
    debug: false,
    includeStringReferences: true,
    includeDependencies: true,
  },
}));

const mockFs = fs;
const mockGlob = require('glob');

describe('CSSVariablePurger', () => {
  let purger;
  let consoleSpy;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Mock console methods
    consoleSpy = {
      log: jest.spyOn(console, 'log').mockImplementation(() => {}),
      warn: jest.spyOn(console, 'warn').mockImplementation(() => {}),
      error: jest.spyOn(console, 'error').mockImplementation(() => {}),
    };

    // Create fresh purger instance
    purger = new CSSVariablePurger();
  });

  afterEach(() => {
    // Restore console methods
    Object.values(consoleSpy).forEach(spy => spy.mockRestore());
  });

  describe('Constructor', () => {
    it('should initialize with default config', () => {
      const purger = new CSSVariablePurger();
      expect(purger.config.inputFile).toBe('test-variables.css');
      expect(purger.config.outputFile).toBe('test-output.css');
      expect(purger.config.debug).toBe(false);
    });

    it('should merge custom options with default config', () => {
      const customOptions = {
        inputFile: 'custom-input.css',
        debug: true,
        customOption: 'test',
      };

      const purger = new CSSVariablePurger(customOptions);

      expect(purger.config.inputFile).toBe('custom-input.css');
      expect(purger.config.debug).toBe(true);
      expect(purger.config.customOption).toBe('test');
      expect(purger.config.outputFile).toBe('test-output.css'); // Should keep default
    });

    it('should initialize usage patterns', () => {
      expect(purger.usagePatterns).toHaveLength(4);
      expect(purger.usagePatterns[0].description).toBe('CSS var() function usage');
      expect(purger.usagePatterns[1].description).toBe('String literal references');
      expect(purger.usagePatterns[2].description).toBe('JavaScript getPropertyValue calls');
      expect(purger.usagePatterns[3].description).toBe('JavaScript setProperty calls');
    });
  });

  describe('_readInputFile', () => {
    it('should read input file successfully', () => {
      const mockContent = ':root { --test-var: red; }';
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(mockContent);

      const result = purger._readInputFile();

      expect(mockFs.existsSync).toHaveBeenCalledWith(path.resolve('test-variables.css'));
      expect(mockFs.readFileSync).toHaveBeenCalledWith(path.resolve('test-variables.css'), 'utf8');
      expect(result).toBe(mockContent);
    });

    it('should throw error when input file doesn\'t exist', () => {
      mockFs.existsSync.mockReturnValue(false);

      expect(() => purger._readInputFile()).toThrow('Input file not found:');
    });
  });

  describe('_extractAllCSSVariables', () => {
    it('should extract CSS variables from content', () => {
      const cssContent = `
        :root {
          --primary-color: blue;
          --secondary-color: red;
          --font-size: 16px;
        }
        /* Comment */
        .class { color: var(--primary-color); }
      `;

      const result = purger._extractAllCSSVariables(cssContent);

      expect(result).toBeInstanceOf(Set);
      expect(result.size).toBe(3);
      expect(result.has('--primary-color')).toBe(true);
      expect(result.has('--secondary-color')).toBe(true);
      expect(result.has('--font-size')).toBe(true);
    });

    it('should handle empty content', () => {
      const result = purger._extractAllCSSVariables('');
      expect(result.size).toBe(0);
    });

    it('should handle content without CSS variables', () => {
      const cssContent = '.class { color: red; font-size: 16px; }';
      const result = purger._extractAllCSSVariables(cssContent);
      expect(result.size).toBe(0);
    });
  });

  describe('_extractVariablesFromFileContent', () => {
    let usedVariables;

    beforeEach(() => {
      usedVariables = new Set();
    });

    it('should extract variables from var() function usage', () => {
      const content = 'color: var(--primary-color); background: var(--bg-color);';

      purger._extractVariablesFromFileContent(content, usedVariables);

      expect(usedVariables.has('--primary-color')).toBe(true);
      expect(usedVariables.has('--bg-color')).toBe(true);
      expect(usedVariables.size).toBe(2);
    });

    it('should extract variables from string literals', () => {
      const content = 'const varName = "--theme-color"; document.style.setProperty("--dynamic-var", value);';

      purger._extractVariablesFromFileContent(content, usedVariables);

      expect(usedVariables.has('--theme-color')).toBe(true);
      expect(usedVariables.has('--dynamic-var')).toBe(true);
    });

    it('should extract variables from getPropertyValue calls', () => {
      const content = 'const value = getComputedStyle(el).getPropertyValue("--computed-var");';

      purger._extractVariablesFromFileContent(content, usedVariables);

      expect(usedVariables.has('--computed-var')).toBe(true);
    });

    it('should extract variables from setProperty calls', () => {
      const content = 'element.style.setProperty("--runtime-var", "value");';

      purger._extractVariablesFromFileContent(content, usedVariables);

      expect(usedVariables.has('--runtime-var')).toBe(true);
    });

    it('should ignore invalid variable names', () => {
      const content = 'var(invalid-var) "not-css-var" getPropertyValue("not-var")';

      purger._extractVariablesFromFileContent(content, usedVariables);

      expect(usedVariables.size).toBe(0);
    });

    it('should handle extractor errors gracefully', () => {
      // Mock an extractor that throws an error
      const originalPatterns = purger.usagePatterns;
      purger.usagePatterns = [{
        pattern: /error-pattern/g,
        extractor: () => { throw new Error('Test error'); },
        description: 'Error pattern'
      }];

      const content = 'error-pattern';

      expect(() => purger._extractVariablesFromFileContent(content, usedVariables)).not.toThrow();
      expect(usedVariables.size).toBe(0);

      purger.usagePatterns = originalPatterns;
    });
  });

  describe('_scanFilesForVariableUsage', () => {
    let usedVariables;

    beforeEach(() => {
      usedVariables = new Set();
      process.cwd = jest.fn().mockReturnValue('/test/cwd');
    });

    it('should scan files and extract variables', () => {
      const mockFiles = ['file1.css', 'file2.js'];
      const mockContent = 'color: var(--found-var);';

      mockGlob.sync.mockReturnValue(mockFiles);
      mockFs.readFileSync.mockReturnValue(mockContent);

      const result = purger._scanFilesForVariableUsage(usedVariables);

      expect(mockGlob.sync).toHaveBeenCalledWith('test/**/*.{js,css,html}', {
        cwd: '/test/cwd',
        ignore: ['**/node_modules/**'],
      });
      expect(mockFs.readFileSync).toHaveBeenCalledTimes(2);
      expect(result.totalFiles).toBe(2);
      expect(result.processedFiles).toBe(2);
      expect(usedVariables.has('--found-var')).toBe(true);
    });

    it('should handle file read errors gracefully', () => {
      const mockFiles = ['file1.css', 'file2.js'];

      mockGlob.sync.mockReturnValue(mockFiles);
      mockFs.readFileSync
        .mockReturnValueOnce('color: var(--good-var);')
        .mockImplementationOnce(() => { throw new Error('File read error'); });

      const result = purger._scanFilesForVariableUsage(usedVariables);

      expect(result.totalFiles).toBe(2);
      expect(result.processedFiles).toBe(1);
      expect(usedVariables.has('--good-var')).toBe(true);
    });

    it('should handle glob pattern errors gracefully', () => {
      mockGlob.sync.mockImplementation(() => { throw new Error('Glob error'); });

      const result = purger._scanFilesForVariableUsage(usedVariables);

      expect(result.totalFiles).toBe(0);
      expect(result.processedFiles).toBe(0);
    });
  });

  describe('_applySafelistPatterns', () => {
    it('should apply safelist patterns to variables', () => {
      const usedVariables = new Set(['--safe-var', '--other-var', '--safe-theme']);

      purger._applySafelistPatterns(usedVariables);

      // Original variables should still be there
      expect(usedVariables.has('--safe-var')).toBe(true);
      expect(usedVariables.has('--other-var')).toBe(true);
      expect(usedVariables.has('--safe-theme')).toBe(true);

      // Should not add new variables in this case since they already exist
      expect(usedVariables.size).toBe(3);
    });

    it('should not modify variables that don\'t match patterns', () => {
      const usedVariables = new Set(['--unsafe-var', '--other-var']);
      const originalSize = usedVariables.size;

      purger._applySafelistPatterns(usedVariables);

      expect(usedVariables.size).toBe(originalSize);
    });
  });

  describe('_generatePurgedCSS', () => {
    it('should generate purged CSS with used variables', () => {
      const originalCSS = `
/**
 * Test CSS
 */
:root {
  --used-var: red;
  --unused-var: blue;
  --another-used: green;
}
      `.trim();

      const usedVariables = new Set(['--used-var', '--another-used']);

      const result = purger._generatePurgedCSS(originalCSS, usedVariables);

      expect(result.content).toContain('--used-var: red;');
      expect(result.content).toContain('--another-used: green;');
      expect(result.content).not.toContain('--unused-var: blue;');
      expect(result.actualVariableCount).toBe(2);
      expect(result.content).toContain('/**'); // Should preserve comments
    });

    it('should handle single-line :root declarations', () => {
      const originalCSS = ':root { --test-var: value; }';
      const usedVariables = new Set(['--test-var']);

      const result = purger._generatePurgedCSS(originalCSS, usedVariables);

      expect(result.content).toContain('--test-var: value;');
      expect(result.actualVariableCount).toBe(1);
    });

    it('should preserve content outside :root', () => {
      const originalCSS = `
body { margin: 0; }
:root {
  --used-var: red;
  --unused-var: blue;
}
.class { color: var(--used-var); }
      `.trim();

      const usedVariables = new Set(['--used-var']);

      const result = purger._generatePurgedCSS(originalCSS, usedVariables);

      expect(result.content).toContain('body { margin: 0; }');
      expect(result.content).toContain('.class { color: var(--used-var); }');
      expect(result.content).toContain('--used-var: red;');
      expect(result.content).not.toContain('--unused-var: blue;');
    });

    it('should handle nested braces correctly', () => {
      const originalCSS = `
:root {
  --var1: red;
  --var2: blue;
}
@media (max-width: 768px) {
  :root {
    --var3: green;
  }
}
      `.trim();

      const usedVariables = new Set(['--var1', '--var3']);

      const result = purger._generatePurgedCSS(originalCSS, usedVariables);

      expect(result.content).toContain('--var1: red;');
      expect(result.content).toContain('--var3: green;');
      expect(result.content).not.toContain('--var2: blue;');
      expect(result.actualVariableCount).toBe(2);
    });
  });

  describe('_isVariableSafelisted', () => {
    it('should return true for safelisted variables', () => {
      expect(purger._isVariableSafelisted('--safe-var')).toBe(true);
    });

    it('should return true for variables matching safelist patterns', () => {
      expect(purger._isVariableSafelisted('--safe-theme')).toBe(true);
      expect(purger._isVariableSafelisted('--safe-color')).toBe(true);
    });

    it('should return false for non-safelisted variables', () => {
      expect(purger._isVariableSafelisted('--random-var')).toBe(false);
      expect(purger._isVariableSafelisted('--unsafe-var')).toBe(false);
    });
  });

  describe('_buildVariableDependencyMap', () => {
    it('should build dependency map for variables referencing other variables', () => {
      const cssContent = `
:root {
  --primary: #blue;
  --secondary: var(--primary);
  --tertiary: var(--secondary);
  --complex: calc(var(--primary) + var(--base-size));
  --independent: red;
}
      `;

      const dependencyMap = purger._buildVariableDependencyMap(cssContent);

      expect(dependencyMap.get('--primary')).toEqual(new Set());
      expect(dependencyMap.get('--secondary')).toEqual(new Set(['--primary']));
      expect(dependencyMap.get('--tertiary')).toEqual(new Set(['--secondary']));
      expect(dependencyMap.get('--complex')).toEqual(new Set(['--primary', '--base-size']));
      expect(dependencyMap.get('--independent')).toEqual(new Set());
    });

    it('should handle variables without dependencies', () => {
      const cssContent = ':root { --simple: red; --another: blue; }';

      const dependencyMap = purger._buildVariableDependencyMap(cssContent);

      expect(dependencyMap.get('--simple')).toEqual(new Set());
      expect(dependencyMap.get('--another')).toEqual(new Set());
    });
  });

  describe('_expandUsedVariablesWithDependencies', () => {
    it('should expand used variables to include their dependencies', () => {
      const usedVariables = new Set(['--tertiary']);
      const dependencyMap = new Map([
        ['--primary', new Set()],
        ['--secondary', new Set(['--primary'])],
        ['--tertiary', new Set(['--secondary'])],
      ]);

      purger._expandUsedVariablesWithDependencies(usedVariables, dependencyMap);

      expect(usedVariables.has('--tertiary')).toBe(true);
      expect(usedVariables.has('--secondary')).toBe(true);
      expect(usedVariables.has('--primary')).toBe(true);
      expect(usedVariables.size).toBe(3);
    });

    it('should handle circular dependencies', () => {
      const usedVariables = new Set(['--var1']);
      const dependencyMap = new Map([
        ['--var1', new Set(['--var2'])],
        ['--var2', new Set(['--var1'])], // Circular dependency
      ]);

      purger._expandUsedVariablesWithDependencies(usedVariables, dependencyMap);

      expect(usedVariables.has('--var1')).toBe(true);
      expect(usedVariables.has('--var2')).toBe(true);
      expect(usedVariables.size).toBe(2);
    });

    it('should handle variables without dependencies in map', () => {
      const usedVariables = new Set(['--unknown-var']);
      const dependencyMap = new Map();

      expect(() => {
        purger._expandUsedVariablesWithDependencies(usedVariables, dependencyMap);
      }).not.toThrow();

      expect(usedVariables.size).toBe(1);
    });
  });

  describe('_writeOutputFile', () => {
    it('should write content to output file', () => {
      const content = ':root { --test: red; }';

      purger._writeOutputFile(content);

      expect(mockFs.writeFileSync).toHaveBeenCalledWith(
        path.resolve('test-output.css'),
        content,
        'utf8'
      );
    });
  });

  describe('_generatePurgeResults', () => {
    it('should generate correct purge results', () => {
      const allVariables = new Set(['--var1', '--var2', '--var3', '--var4']);
      const actualVariableCount = 2;

      const result = purger._generatePurgeResults(allVariables, actualVariableCount);

      expect(result).toEqual({
        totalVariables: 4,
        usedVariables: 2,
        removedVariables: 2,
        outputFilePath: path.resolve('test-output.css'),
      });
    });
  });

  describe('Logging methods', () => {
    describe('_logInfo', () => {
      it('should log info messages', () => {
        purger._logInfo('Test message', 'arg2');
        expect(consoleSpy.log).toHaveBeenCalledWith('Test message', 'arg2');
      });
    });

    describe('_logDebug', () => {
      it('should log debug messages when debug is enabled', () => {
        purger.config.debug = true;
        purger._logDebug('Debug message');
        expect(consoleSpy.log).toHaveBeenCalledWith('Debug message');
      });

      it('should not log debug messages when debug is disabled', () => {
        purger.config.debug = false;
        purger._logDebug('Debug message');
        expect(consoleSpy.warn).not.toHaveBeenCalled();
      });
    });

    describe('_logDebugResults', () => {
      it('should log debug results with variable lists', () => {
        const allVariables = new Set(Array.from({ length: 15 }, (_, i) => `--var${i}`));
        const usedVariables = new Set(Array.from({ length: 12 }, (_, i) => `--used${i}`));

        purger._logDebugResults(allVariables, usedVariables);

        expect(consoleSpy.log).toHaveBeenCalledWith('\n📋 Kept variables:');
        expect(consoleSpy.log).toHaveBeenCalledWith('  ... and 2 more');
        expect(consoleSpy.log).toHaveBeenCalledWith('\n📋 Removed variables:');
      });
    });
  });

  describe('purgeUnusedVariables (Integration)', () => {
    beforeEach(() => {
      // Mock file system and glob for integration test
      const inputCSS = `
/**
 * Test variables
 */
:root {
  --used-var: red;
  --unused-var: blue;
  --safe-var: green;
  --dependency-var: purple;
  --dependent-var: var(--dependency-var);
}
      `.trim();

      const projectFiles = [
        'file1.css',
        'file2.js'
      ];

      const file1Content = 'color: var(--used-var);';
      const file2Content = 'element.style.setProperty("--dependent-var", "value");';

      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockImplementation((filePath) => {
        if (filePath.includes('test-variables.css')) {return inputCSS;}
        if (filePath.includes('file1.css')) {return file1Content;}
        if (filePath.includes('file2.js')) {return file2Content;}
        return '';
      });

      mockGlob.sync.mockReturnValue(projectFiles);
      process.cwd = jest.fn().mockReturnValue('/test/cwd');
    });

    it('should complete full purge operation successfully', async () => {
      const result = await purger.purgeUnusedVariables();

      expect(result).toEqual({
        missedCSSVariables: [],
        totalVariables: 5,
        usedVariables: 4, // --used-var, --safe-var, --dependent-var, --dependency-var
        removedVariables: 1, // --unused-var
        outputFilePath: path.resolve('test-output.css'),
      });

      expect(mockFs.writeFileSync).toHaveBeenCalled();
      const writtenContent = mockFs.writeFileSync.mock.calls[0][1];
      expect(writtenContent).toContain('--used-var: red;');
      expect(writtenContent).toContain('--safe-var: green;');
      expect(writtenContent).toContain('--dependency-var: purple;');
      expect(writtenContent).toContain('--dependent-var: var(--dependency-var);');
      expect(writtenContent).not.toContain('--unused-var: blue;');
    });

    it('should not complete full purge operation successfully', async () => {
      const originalReadFileSync = mockFs.readFileSync.getMockImplementation();

      mockFs.readFileSync.mockImplementation((filePath) => {
        if (filePath.includes('file1.css')) {
          return 'color: var(--used-var); background-color: var(--undeclared-css-variable);';
        } else if (filePath.includes('file2.js')) {
          return 'element.style.setProperty("--dependent-var", "value");element.style.setProperty("--undeclared-css-variable-2", "value")';
        }
        return originalReadFileSync(filePath);
      });

      const result = await purger.purgeUnusedVariables();

      expect(result).toEqual({
        missedCSSVariables: ['--undeclared-css-variable', '--undeclared-css-variable-2'],
        totalVariables: 5,
        usedVariables: 4, // --used-var, --safe-var, --dependent-var, --dependency-var
        removedVariables: 1, // --unused-var
        outputFilePath: path.resolve('test-output.css'),
      });

      expect(mockFs.writeFileSync).toHaveBeenCalled();
      const writtenContent = mockFs.writeFileSync.mock.calls[0][1];
      expect(writtenContent).toContain('--used-var: red;');
      expect(writtenContent).toContain('--safe-var: green;');
      expect(writtenContent).toContain('--dependency-var: purple;');
      expect(writtenContent).toContain('--dependent-var: var(--dependency-var);');
      expect(writtenContent).not.toContain('--unused-var: blue;');
    });

    it('should handle purge with dependencies disabled', async () => {
      purger.config.includeDependencies = false;

      const result = await purger.purgeUnusedVariables();

      expect(result.usedVariables).toBe(3); // Should not include --dependency-var
      expect(result.removedVariables).toBe(2);
    });

    it('should handle file read errors gracefully', async () => {
      mockFs.existsSync.mockReturnValue(false);

      await expect(purger.purgeUnusedVariables()).rejects.toThrow('Input file not found:');
    });
  });

  describe('Edge cases and error handling', () => {
    it('should handle empty CSS content', () => {
      const result = purger._generatePurgedCSS('', new Set());
      expect(result.content).toBe('');
      expect(result.actualVariableCount).toBe(0);
    });

    it('should handle CSS without :root rule', () => {
      const css = '.class { color: red; }';
      const result = purger._generatePurgedCSS(css, new Set());
      expect(result.content).toBe(css);
      expect(result.actualVariableCount).toBe(0);
    });

    it('should handle malformed CSS gracefully', () => {
      const malformedCSS = ':root { --var: ; broken css }';
      const usedVariables = new Set(['--var']);

      expect(() => {
        purger._generatePurgedCSS(malformedCSS, usedVariables);
      }).not.toThrow();
    });

    it('should handle variables with complex values', () => {
      const cssContent = `
:root {
  --gradient: linear-gradient(90deg, var(--start), var(--end));
  --calc-value: calc(100% - var(--offset));
  --start: #fff;
  --end: #000;
  --offset: 20px;
}
      `;

      const dependencyMap = purger._buildVariableDependencyMap(cssContent);

      expect(dependencyMap.get('--gradient')).toEqual(new Set(['--start', '--end']));
      expect(dependencyMap.get('--calc-value')).toEqual(new Set(['--offset']));
    });
  });

  describe('Performance considerations', () => {
    it('should handle large numbers of variables efficiently', () => {
      const largeVariableSet = new Set();
      for (let i = 0; i < 10000; i++) {
        largeVariableSet.add(`--var-${i}`);
      }

      const startTime = Date.now();
      purger._applySafelistPatterns(largeVariableSet);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
    });

    it('should handle large CSS content efficiently', () => {
      const largeCSSContent = Array.from({ length: 1000 }, (_, i) =>
        `:root { --var-${i}: value${i}; }`
      ).join('\n');

      const startTime = Date.now();
      const result = purger._extractAllCSSVariables(largeCSSContent);
      const endTime = Date.now();

      expect(result.size).toBe(1000);
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
    });
  });
});
