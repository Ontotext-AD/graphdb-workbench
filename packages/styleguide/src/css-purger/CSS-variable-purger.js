/**
 * @fileoverview CSS Variable Purger - Removes unused CSS custom properties from stylesheets
 * This tool scans project files to identify which CSS variables are actually used
 * and creates a purged CSS file containing only the necessary variables.
 */

/* eslint-env node */

const fs = require('fs');
const path = require('path');
const glob = require('glob');
const { DEFAULT_CONFIG } = require('./css-purger-default-config');

/**
 * @typedef {Object} PurgeResult
 * @property {number} totalVariables - Total number of variables found in input
 * @property {number} usedVariables - Number of variables kept in output
 * @property {number} removedVariables - Number of variables removed
 * @property {string} outputFilePath - Path to the generated purged CSS file
 */

/**
 * @typedef {Object} VariableUsagePattern
 * @property {RegExp} pattern - Regex pattern to match variable usage
 * @property {Function} extractor - Function to extract variable name from match
 * @property {string} description - Description of this usage pattern
 */

/**
 * CSS Variable Purger
 * Analyzes CSS files and project source code to identify and remove unused CSS custom properties
 */
class CSSVariablePurger {
  /**
   * Creates a new CSS Variable Purger instance
   * @param {Partial<import('./css-purger-config').CSSPurgerConfig>} options - Configuration options
   */
  constructor(options = {}) {
    this.config = {
      ...DEFAULT_CONFIG,
      ...options,
    };

    // Patterns for finding CSS variable usage in different contexts
    this.usagePatterns = this._initializeUsagePatterns();
  }

  /**
   * Initialize patterns for detecting CSS variable usage
   * @private
   * @returns {VariableUsagePattern[]} Array of usage patterns
   */
  _initializeUsagePatterns() {
    return [
      {
        pattern: /var\(\s*(--[\w-]+)/g,
        extractor: (match) =>
          match.replace(/var\(\s*/, '').replace(/\).*$/, ''),
        description: 'CSS var() function usage',
      },
      {
        pattern: /['"`](--[\w-]+)['"`]/g,
        extractor: (match) => match.replace(/['"`]/g, ''),
        description: 'String literal references',
      },
      {
        pattern: /getPropertyValue\s*\(\s*['"`](--[\w-]+)['"`]\s*\)/g,
        extractor: (match) => match.match(/['"`](--[\w-]+)['"`]/)[1],
        description: 'JavaScript getPropertyValue calls',
      },
      {
        pattern: /setProperty\s*\(\s*['"`](--[\w-]+)['"`]/g,
        extractor: (match) => match.match(/['"`](--[\w-]+)['"`]/)[1],
        description: 'JavaScript setProperty calls',
      },
    ];
  }

  /**
   * Main purge operation - removes unused CSS variables from the input file
   * @async
   * @returns {Promise<PurgeResult>} Statistics about the purge operation
   * @throws {Error} When input file is not found or processing fails
   */
  async purgeUnusedVariables() {
    this._logInfo('🔍 Starting CSS variable purge...');

    // Read and validate input file
    const cssContent = this._readInputFile();
    this._logInfo(`📖 Read input file: ${path.resolve(this.config.inputFile)}`);

    // Extract all variables and build dependency map
    const allVariables = this._extractAllCSSVariables(cssContent);
    const dependencyMap = this._buildVariableDependencyMap(cssContent);
    this._logInfo(`📊 Found ${allVariables.size} total CSS variables`);

    // Find variables that are actually used
    const usedVariables = this._findUsedCSSVariables();
    this._logInfo(`✅ Found ${usedVariables.size} directly used CSS variables`);

    // Include dependencies if enabled
    if (this.config.includeDependencies) {
      this._expandUsedVariablesWithDependencies(usedVariables, dependencyMap);
      this._logInfo(
        `🔗 Expanded to ${usedVariables.size} variables including dependencies`
      );
    }

    // Generate purged CSS content and get actual count
    const { content: purgedContent, actualVariableCount } =
      this._generatePurgedCSS(cssContent, usedVariables);

    // Log the actual count that was written
    this._logInfo(
      `💾 Actually wrote ${actualVariableCount} variables to output file`
    );

    // Write output file
    this._writeOutputFile(purgedContent);

    // Generate and log results using actual counts
    const result = this._generatePurgeResults(
      allVariables,
      actualVariableCount,
      this._fetchMissedCssVariables(usedVariables, purgedContent)
    );
    this._logPurgeResults(result, allVariables, usedVariables);

    return result;
  }

  /**
   * Finds CSS variables that are used but not declared in the provided content.
   *
   * @param {Set<string>} usedCssVariables - A set containing all CSS variable names that were detected as used.
   * @param {string} contentWithDeclaredCssVariables - The CSS content containing only used variables.
   * @returns {string[]} An array of CSS variable names that are used but not found in the <code>contentWithDeclaredCssVariables</code>.
   */
  _fetchMissedCssVariables(usedCssVariables, contentWithDeclaredCssVariables) {
    return Array.from(usedCssVariables).filter(variableName => !contentWithDeclaredCssVariables.includes(variableName));
  }

  /**
   * Read and validate the input CSS file
   * @private
   * @returns {string} Content of the input CSS file
   * @throws {Error} When input file doesn't exist
   */
  _readInputFile() {
    const inputPath = path.resolve(this.config.inputFile);
    if (!fs.existsSync(inputPath)) {
      throw new Error(`Input file not found: ${inputPath}`);
    }
    return fs.readFileSync(inputPath, 'utf8');
  }

  /**
   * Extract all CSS custom properties from the CSS content
   * @private
   * @param {string} cssContent - Raw CSS content
   * @returns {Set<string>} Set of all CSS variable names found
   */
  _extractAllCSSVariables(cssContent) {
    const variables = new Set();

    // Match CSS variable declarations: --variable-name: value;
    const variableDeclarationRegex = /(--[\w-]+)\s*:/g;
    let match;

    while ((match = variableDeclarationRegex.exec(cssContent)) !== null) {
      variables.add(match[1]);
    }

    return variables;
  }

  /**
   * Scan project files to find CSS variables that are actually used
   * @private
   * @returns {Set<string>} Set of CSS variable names that are used
   */
  _findUsedCSSVariables() {
    const usedVariables = new Set();

    // Add explicitly safelisted variables
    this.config.safelist.forEach((variable) => {
      usedVariables.add(variable);
    });

    // Scan files for variable usage
    const { totalFiles, processedFiles } =
      this._scanFilesForVariableUsage(usedVariables);
    this._logInfo(`🔍 Scanned ${processedFiles}/${totalFiles} files`);

    // Apply safelist patterns to found variables
    this._applySafelistPatterns(usedVariables);

    return usedVariables;
  }

  /**
   * Scan files matching search patterns for CSS variable usage
   * @private
   * @param {Set<string>} usedVariables - Set to populate with found variables
   * @returns {Object} Statistics about file scanning
   */
  _scanFilesForVariableUsage(usedVariables) {
    let totalFiles = 0;
    let processedFiles = 0;

    this.config.searchPaths.forEach((searchPattern) => {
      try {
        const files = glob.sync(searchPattern, {
          cwd: process.cwd(),
          ignore: this.config.ignorePaths,
        });

        totalFiles += files.length;

        files.forEach((file) => {
          try {
            const filePath = path.resolve(process.cwd(), file);
            const fileContent = fs.readFileSync(filePath, 'utf8');
            processedFiles++;

            // Apply all usage patterns to find variables
            this._extractVariablesFromFileContent(fileContent, usedVariables);
          } catch (error) {
            this._logDebug(`Could not read file ${file}:`, error.message);
          }
        });
      } catch (error) {
        this._logDebug(
          `Search pattern ${searchPattern} failed:`,
          error.message
        );
      }
    });

    return { totalFiles, processedFiles };
  }

  /**
   * Extract CSS variables from file content using all defined usage patterns
   * @private
   * @param {string} content - File content to analyze
   * @param {Set<string>} usedVariables - Set to add found variables to
   */
  _extractVariablesFromFileContent(content, usedVariables) {
    this.usagePatterns.forEach(({ pattern, extractor }) => {
      const matches = content.match(pattern) || [];
      matches.forEach((match) => {
        try {
          const variable = extractor(match);
          if (variable && variable.startsWith('--')) {
            usedVariables.add(variable);
          }
        } catch (error) {
          this._logDebug(
            `Failed to extract variable from match: ${match}`,
            error.message
          );
        }
      });
    });
  }

  /**
   * Apply safelist patterns to include additional variables
   * @private
   * @param {Set<string>} usedVariables - Set of variables to expand
   */
  _applySafelistPatterns(usedVariables) {
    const foundVariables = Array.from(usedVariables);
    foundVariables.forEach((variable) => {
      if (
        this.config.safelistPatterns.some((pattern) => pattern.test(variable))
      ) {
        usedVariables.add(variable);
      }
    });
  }

  /**
   * Generate the purged CSS content containing only used variables
   * @private
   * @param {string} originalCSS - Original CSS content
   * @param {Set<string>} usedVariables - Set of variables to keep
   * @returns {Object} Object containing purged CSS content and count of actually written variables
   */
  _generatePurgedCSS(originalCSS, usedVariables) {
    const lines = originalCSS.split('\n');
    const outputLines = [];
    let insideRootRule = false;
    let braceDepth = 0;
    let actuallyWrittenVariables = 0; // Track variables actually written to output

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Track when we enter/exit :root rule
      if (!insideRootRule && line.includes(':root')) {
        insideRootRule = true;

        // Count braces on the same line as :root declaration
        const openBraces = (line.match(/{/g) || []).length;
        const closeBraces = (line.match(/}/g) || []).length;
        braceDepth = openBraces - closeBraces;

        // For single-line :root declarations, process variables on the same line
        if (braceDepth <= 0) {
          // This is a single-line :root declaration
          // Extract and process variables from this line
          const variableMatches = line.matchAll(/(--[\w-]+)\s*:/g);
          let processedLine = line;
          let hasVariables = false;

          for (const match of variableMatches) {
            const variableName = match[1];
            const shouldKeepVariable =
              usedVariables.has(variableName) ||
              this._isVariableSafelisted(variableName);

            if (shouldKeepVariable) {
              actuallyWrittenVariables++;
              hasVariables = true;
            } else {
              // Remove the variable declaration from the line
              const varRegex = new RegExp(`\\s*${variableName}\\s*:[^;]*;?`, 'g');
              processedLine = processedLine.replace(varRegex, '');
            }
          }

          // Clean up the line and add it if it has variables or is just the :root declaration
          if (hasVariables || !variableMatches.length) {
            outputLines.push(processedLine);
          }

          insideRootRule = false;
          continue;
        } else {
          // Multi-line :root declaration
          outputLines.push(line);
          continue;
        }
      }

      // Update brace depth for multi-line :root rules
      if (insideRootRule) {
        const openBraces = (line.match(/{/g) || []).length;
        const closeBraces = (line.match(/}/g) || []).length;
        braceDepth += openBraces - closeBraces;
      }

      if (insideRootRule) {
        // Check if this line is a CSS variable declaration
        const variableMatch = line.match(/(^|\s)(--[\w-]+)\s*:/);

        if (variableMatch) {
          const variableName = variableMatch[2];

          // Keep variable if it's used or explicitly safelisted
          const shouldKeepVariable =
            usedVariables.has(variableName) ||
            this._isVariableSafelisted(variableName);

          if (shouldKeepVariable) {
            outputLines.push(line);
            actuallyWrittenVariables++; // Count variables actually written
          }
          // Variable is dropped here if not used (this is the actual purging)
        } else {
          // Keep non-variable lines (comments, whitespace, etc.)
          outputLines.push(line);
        }

        // Exit :root rule when braces are balanced
        if (braceDepth <= 0) {
          insideRootRule = false;
        }
      } else {
        // Keep all lines outside :root rule
        outputLines.push(line);
      }
    }

    return {
      content: outputLines.join('\n'),
      actualVariableCount: actuallyWrittenVariables,
    };
  }

  /**
   * Check if a variable is explicitly safelisted
   * @private
   * @param {string} variableName - CSS variable name to check
   * @returns {boolean} True if variable should be preserved
   */
  _isVariableSafelisted(variableName) {
    return (
      this.config.safelist.includes(variableName) ||
      this.config.safelistPatterns.some((pattern) => pattern.test(variableName))
    );
  }

  /**
   * Build a map of variable dependencies (variables that reference other variables)
   * @private
   * @param {string} cssContent - CSS content to analyze
   * @returns {Map<string, Set<string>>} Map of variable name to its dependencies
   */
  _buildVariableDependencyMap(cssContent) {
    const dependencyMap = new Map();

    // Find all variable declarations and their values
    const declarationRegex = /(--[\w-]+)\s*:\s*([^;{}]+);/g;
    let match;

    while ((match = declarationRegex.exec(cssContent)) !== null) {
      const variableName = match[1];
      const variableValue = match[2];
      const dependencies = new Set();

      // Find var() references in the value
      const referenceRegex = /var\(\s*(--[\w-]+)/g;
      let referenceMatch;

      while ((referenceMatch = referenceRegex.exec(variableValue)) !== null) {
        dependencies.add(referenceMatch[1]);
      }

      dependencyMap.set(variableName, dependencies);
    }

    return dependencyMap;
  }

  /**
   * Expand the set of used variables to include their dependencies
   * @private
   * @param {Set<string>} usedVariables - Set of directly used variables
   * @param {Map<string, Set<string>>} dependencyMap - Variable dependency map
   */
  _expandUsedVariablesWithDependencies(usedVariables, dependencyMap) {
    const processingQueue = [...usedVariables];
    const processedVariables = new Set(usedVariables);

    while (processingQueue.length > 0) {
      const currentVariable = processingQueue.shift();
      const dependencies = dependencyMap.get(currentVariable);

      if (!dependencies) {continue;}

      for (const dependency of dependencies) {
        if (!processedVariables.has(dependency)) {
          processedVariables.add(dependency);
          usedVariables.add(dependency);
          processingQueue.push(dependency);
        }
      }
    }
  }

  /**
   * Write the purged CSS content to the output file
   * @private
   * @param {string} content - Purged CSS content
   */
  _writeOutputFile(content) {
    const outputPath = path.resolve(this.config.outputFile);
    fs.writeFileSync(outputPath, content, 'utf8');
    this._logInfo(`💾 Wrote purged CSS to: ${outputPath}`);
  }

  /**
   * Generate result statistics for the purge operation
   * @private
   * @param {Set<string>} allVariables - All variables found in input
   * @param {number} actualVariableCount - Actual number of variables written to output
   * @returns {PurgeResult} Result statistics
   */
  _generatePurgeResults(allVariables, actualVariableCount, missedCSSVariables) {
    const removedCount = allVariables.size - actualVariableCount;

    return {
      totalVariables: allVariables.size,
      usedVariables: actualVariableCount,
      removedVariables: removedCount,
      outputFilePath: path.resolve(this.config.outputFile),
      missedCSSVariables
    };
  }

  /**
   * Log detailed results of the purge operation
   * @private
   * @param {PurgeResult} result - Purge result statistics
   * @param {Set<string>} allVariables - All variables found
   * @param {Set<string>} usedVariables - Variables kept
   */
  _logPurgeResults(result, allVariables, usedVariables) {
    this._logInfo(`🗑️  Removed ${result.removedVariables} unused variables`);
    this._logInfo(`📦 Kept ${result.usedVariables} used variables`);

    if (this.config.debug) {
      this._logDebugResults(allVariables, usedVariables);
    }
  }

  /**
   * Log detailed debug information about kept and removed variables
   * @private
   * @param {Set<string>} allVariables - All variables found
   * @param {Set<string>} usedVariables - Variables kept
   */
  _logDebugResults(allVariables, usedVariables) {
    // Log kept variables
    // eslint-disable-next-line no-console
    console.log('\n📋 Kept variables:');
    const keptArray = Array.from(usedVariables);
    keptArray
      .slice(0, 10)
      // eslint-disable-next-line no-console
      .forEach((variable) => console.log(`  ✅ ${variable}`));
    if (keptArray.length > 10) {
      // eslint-disable-next-line no-console
      console.log(`  ... and ${keptArray.length - 10} more`);
    }

    // Log removed variables
    // eslint-disable-next-line no-console
    console.log('\n📋 Removed variables:');
    const removedVariables = Array.from(allVariables).filter(
      (variable) => !usedVariables.has(variable)
    );
    removedVariables
      .slice(0, 10)
      // eslint-disable-next-line no-console
      .forEach((variable) => console.log(`  ❌ ${variable}`));
    if (removedVariables.length > 10) {
      // eslint-disable-next-line no-console
      console.log(`  ... and ${removedVariables.length - 10} more`);
    }
  }

  /**
   * Log informational messages
   * @private
   * @param {...any} args - Arguments to log
   */
  _logInfo(...args) {
    // eslint-disable-next-line no-console
    console.log(...args);
  }

  /**
   * Log debug messages (only when debug mode is enabled)
   * @private
   * @param {...any} args - Arguments to log
   */
  _logDebug(...args) {
    if (this.config.debug) {
      // eslint-disable-next-line no-console
      console.log(...args);
    }
  }
}

module.exports = CSSVariablePurger;
