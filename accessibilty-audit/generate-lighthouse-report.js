/**
 * =============================================
 * Lighthouse Accessibility Audit Automation Script
 * =============================================
 */
import lighthouse, { desktopConfig } from 'lighthouse';
import puppeteer from 'puppeteer';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import PDFMerger from 'pdf-merger-js';
import fetch from 'node-fetch';

// ============================
// Constants
// ============================
// Parse command-line arguments
const argv = yargs(hideBin(process.argv))
    .option('file', {
        alias: 'f',
        description: 'Path to the URLs file',
        type: 'string',
        default: 'urls.txt',
    })
    .option('graphdb', {
        alias: 'g',
        description: 'GraphDB access url',
        type: 'string',
        default: 'http://localhost:7200',
    })
    .option('workbench', {
        alias: 'w',
        description: 'Workbench access url',
        type: 'string',
        default: 'http://localhost:9000',
    })
    .help()
    .alias('help', 'h')
    .argv;

const GRAPHDB_BASE_URL = argv.graphdb;
const WORKBENCH_URL = argv.workbench;
const REPOSITORIES_URL = `${GRAPHDB_BASE_URL}/rest/repositories`;
const OUTPUT_DIRECTORY = 'reports';

// Helper to get __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths & directories
const urlsFilePath = path.isAbsolute(argv.file)
    ? argv.file
    : path.join(__dirname, argv.file);
const outputDir = path.join(__dirname, OUTPUT_DIRECTORY);
const repoTemplate = await readJsonFromFile(path.join(__dirname, 'repo-template.json'));

// ==============================
// Functions
// ==============================
/**
 * Read JSON from a file.
 * @param {string} filePath - Path to the JSON file.
 * @returns {Promise<JSON>} - Parsed JSON.
 */
async function readJsonFromFile(filePath) {
    try {
        const data = await fs.readFile(filePath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        throw new Error(`Failed to read file: ${error.message}`);
    }
}

/**
 * Create a new repository in GraphDB.
 * @param {Object} options - Repository options.
 */
async function createRepository(options = {}) {
    const requestBody = { ...repoTemplate, ...options };
    console.log(`Creating repository: ${requestBody.id}`);

    const response = await fetch(REPOSITORIES_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
    });
    if (!response.ok && response.status !== 201) {
        throw new Error(`Failed to create repository. Server responded with status: ${response.status}`);
    }

    console.log(`Repository "${requestBody.id}" created successfully.`);
}

/**
 * Select a repository in the GraphDB Workbench by setting localStorage.
 * @param {puppeteer.Page} page - Puppeteer Page instance.
 * @param {string} workbenchUrl - URL of the GraphDB Workbench.
 * @param {string} repoId - Repository ID to select.
 */
async function selectRepositoryInWorkbench(page, workbenchUrl, repoId) {
    await page.goto(workbenchUrl, { waitUntil: 'networkidle0' });

    await page.evaluate((id) => {
        localStorage.setItem('ls.repository-id', id);
    }, repoId);

    await page.waitForFunction(
        (id) => localStorage.getItem('ls.repository-id') === id,
        {},
        repoId
    );

    console.log(`presetRepository: localStorage['ls.repository-id'] is now "${repoId}"`);
}

/**
 * Delete a repository from GraphDB.
 * @param {string} repoId - Repository ID to delete.
 */
async function deleteRepository(repoId) {
    console.log(`Deleting repository: ${repoId}`);
    const response = await fetch(`${REPOSITORIES_URL}/${repoId}`, {
        method: 'DELETE',
    });

    if (!response.ok && response.status !== 204) {
        console.error(`Failed to delete repository "${repoId}". Server responded with status: ${response.status}`);
    } else {
        console.log(`Repository "${repoId}" deleted.`);
    }
}

/**
 * Read URLs from a file.
 * @param {string} filePath - Path to the URLs file.
 * @returns {Promise<string[]>} - Array of URLs.
 */
async function readUrls(filePath) {
    try {
        const data = await fs.readFile(filePath, 'utf-8');
        return data
            .split(/\r?\n/)
            .map((line) => `${WORKBENCH_URL}${line.trim()}`)
            .filter((line) => line);
    } catch (error) {
        throw new Error(`Failed to read URLs file: ${error.message}`);
    }
}

/**
 * Generate a Lighthouse report for a given URL.
 * @param {puppeteer.Browser} browser - Puppeteer Browser instance.
 * @param {string} url - URL to audit.
 * @param {string} date - Current date for naming reports.
 * @returns {Promise<string|null>} - Path to the generated PDF report or null on failure.
 */
async function generateReport(browser, url, date) {
    try {
        console.log(`Starting audit for: ${url}`);

        // Open Puppeteer page to fully load site
        const page = await openPage(browser, url);

        // Extract debugging port from Puppeteer
        const port = extractPort(browser);

        // Run Lighthouse audit
        const { report } = await runLighthouseAudit(url, port);

        // Prepare file paths
        const encodedUrl = encodeURIComponent(url);
        const tempHtmlPath = path.join(outputDir, `temp-accessibility-report-${encodedUrl}-${date}.html`);
        const pdfReportPath = path.join(outputDir, `lighthouse-accessibility-report-${encodedUrl}-${date}.pdf`);

        // Save the Lighthouse HTML report
        await saveReport(report, tempHtmlPath);

        // Process the report to expand sections and save updated HTML
        await processReport(page, tempHtmlPath);

        // Generate PDF from the updated HTML report
        await generatePdf(page, pdfReportPath);

        // Cleanup: Delete temporary HTML report and close the page
        await cleanup(tempHtmlPath, page);

        return pdfReportPath;
    } catch (error) {
        console.log(`Error auditing ${url}: ${error.message}`, LOG_LEVELS.ERROR);
        return null;
    }
}

/**
 * Open a new Puppeteer page and navigate to the specified URL.
 * @param {puppeteer.Browser} browser - Puppeteer Browser instance.
 * @param {string} url - URL to navigate to.
 * @returns {Promise<puppeteer.Page>} - The opened Puppeteer page.
 */
async function openPage(browser, url) {
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle0' });
    return page;
}

/**
 * Extract the debugging port from the Puppeteer browser instance.
 * @param {puppeteer.Browser} browser - Puppeteer Browser instance.
 * @returns {string} - The debugging port.
 */
function extractPort(browser) {
    const wsEndpoint = browser.wsEndpoint();
    return new URL(wsEndpoint).port;
}

/**
 * Run Lighthouse audit and return the report.
 * @param {string} url - URL to audit.
 * @param {string} port - Debugging port.
 * @returns {Promise<Object>} - Lighthouse report object.
 */
async function runLighthouseAudit(url, port) {
    const { report } = await lighthouse(
        url,
        {
            port,
            output: 'html',
            logLevel: 'info',
            onlyCategories: ['accessibility'],
            settings: {
                emulatedFormFactor: 'desktop',
                throttlingMethod: 'simulate',
                screenEmulation: {
                    width: 1350,
                    height: 940,
                    deviceScaleFactor: 1,
                    mobile: false,
                },
            },
        },
        desktopConfig
    );
    return { report };
}

/**
 * Save the Lighthouse HTML report to a temporary file.
 * @param {string} report - Lighthouse HTML report.
 * @param {string} tempHtmlPath - Path to save the HTML report.
 */
async function saveReport(report, tempHtmlPath) {
    await fs.writeFile(tempHtmlPath, report, 'utf-8');
    console.log(`Saved HTML report: ${tempHtmlPath}`);
}

/**
 * Process the Lighthouse report by expanding all sections and saving the updated HTML.
 * @param {puppeteer.Page} page - Puppeteer Page instance.
 * @param {string} tempHtmlPath - Path to the temporary HTML report.
 */
async function processReport(page, tempHtmlPath) {
    // Open the generated HTML report
    const fileUrl = pathToFileURL(tempHtmlPath).href;
    console.log(`Navigating to file URL: ${fileUrl}`);
    await page.goto(fileUrl, { waitUntil: 'networkidle0' });

    // Expand all sections
    await page.evaluate(() => {
        const expandButtons = document.querySelectorAll(
            '.lh-categories-details > summary, .lh-expandable-details > summary'
        );
        expandButtons.forEach((btn) => btn.click());
    });
    console.log('Expanded all sections in the report.');

    // Save updated HTML
    const modifiedHtml = await page.content();
    await fs.writeFile(tempHtmlPath, modifiedHtml, 'utf-8');
    console.log(`Updated HTML report saved: ${tempHtmlPath}`);
}

/**
 * Generate a PDF from the Puppeteer page.
 * @param {puppeteer.Page} page - Puppeteer Page instance.
 * @param {string} pdfReportPath - Path to save the PDF report.
 */
async function generatePdf(page, pdfReportPath) {
    await page.pdf({
        path: pdfReportPath,
        format: 'A4',
        printBackground: true,
        margin: {
            top: '20px',
            bottom: '20px',
            left: '20px',
            right: '20px',
        },
    });
    console.log(`Generated PDF report: ${pdfReportPath}`);
}

/**
 * Cleanup by deleting the temporary HTML report and closing the Puppeteer page.
 * @param {string} tempHtmlPath - Path to the temporary HTML report.
 * @param {puppeteer.Page} page - Puppeteer Page instance.
 */
async function cleanup(tempHtmlPath, page) {
    await fs.unlink(tempHtmlPath);
    await page.close();
    console.log(`Deleted temporary HTML report: ${tempHtmlPath}`);
}

/**
 * Merge multiple PDF files into one.
 * @param {string[]} pdfPaths - Array of PDF file paths to merge.
 * @param {string} mergedPdfPath - Path to save the merged PDF.
 */
async function mergePdfs(pdfPaths, mergedPdfPath) {
    try {
        const merger = new PDFMerger();
        for (const pdfPath of pdfPaths) {
            if (pdfPath) {
                await merger.add(pdfPath);
            }
        }
        await merger.save(mergedPdfPath);
        console.log(`Merged PDF report saved at: ${mergedPdfPath}`);
    } catch (error) {
        const errorMessage = `Error merging PDFs: ${error.message}`;
        console.error(errorMessage);
    }
}

//
// ======================
// MAIN SCRIPT
// ======================
(async () => {
    let repositoryId;
    let browser;

    try {
        // Read URL list
        const urls = await readUrls(urlsFilePath);
        if (!urls.length) {
            console.error('No URLs found in the specified URLs file.');
            process.exit(1);
        }
        console.log(`Found ${urls.length} URLs to audit.`);

        // Ensure output directory
        await fs.mkdir(outputDir, { recursive: true });

        // Create the new repository
        repositoryId = 'server-import-' + Date.now();
        await createRepository({ id: repositoryId });

        // Launch Puppeteer
        browser = await puppeteer.launch({
            headless: true,
        });
        console.log('Puppeteer launched.');

        // Select the repository in Workbench
        const page = await browser.newPage();
        await selectRepositoryInWorkbench(page, WORKBENCH_URL, repositoryId);

        // Run Lighthouse audits
        const date = new Date().toISOString().split('T')[0];
        const successfulPdfPaths = [];

        for (const url of urls) {
            const pdfPath = await generateReport(browser, url, date);
            if (pdfPath) {
                successfulPdfPaths.push(pdfPath);
            }
        }

        // Close Puppeteer
        await browser.close();
        console.log('Puppeteer browser closed.');

        // If no PDF was created successfully
        if (!successfulPdfPaths.length) {
            console.error('No PDF reports were successfully generated.');
            process.exit(1);
        }

        // Merge PDFs
        const mergedPdfPath = path.join(outputDir, `lighthouse-accessibility-report-all-${date}.pdf`);
        await mergePdfs(successfulPdfPaths, mergedPdfPath);
        console.log(`Merged PDF saved to: ${mergedPdfPath}`);
    } catch (error) {
        console.error(`Fatal error: ${error.message}`);
        process.exit(1);
    } finally {
        // Delete the repository on exit (success or error)
        if (repositoryId) {
            await deleteRepository(repositoryId);
        }
        // Close the browser
        if (browser) {
            try {
                await browser.close();
            } catch {
                // ignore errors
            }
        }
    }
})();
