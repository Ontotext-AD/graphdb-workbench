
# Lighthouse Accessibility Audit Automation Script

## Purpose
This script automates the process of performing accessibility audits on a list of URLs using [Lighthouse](https://github.com/GoogleChrome/lighthouse). It leverages Puppeteer to control a headless browser, generates detailed accessibility reports in HTML and PDF formats, and manages a GraphDB repository for storing and retrieving data. The final output is a merged PDF report consolidating all individual audits.

## Key Features
- **Lighthouse Integration:** Conducts accessibility audits on specified URLs.
- **Puppeteer Automation:** Automates browser interactions to generate and process Lighthouse reports.
- **GraphDB Management:** Creates and deletes repositories in GraphDB to store audit data.
- **PDF Generation & Merging:** Generates individual PDF reports for each URL and merges them into a single comprehensive document.
- **Command-Line Interface:** Allows customization of input files, GraphDB url and Workbench url via command-line arguments.

## Module Imports and Their Purposes

```javascript
import lighthouse, { desktopConfig } from 'lighthouse';
```
- **lighthouse:** Lighthouse is an open-source, automated tool for improving the quality of web pages. It can be run against any web page, public or requiring authentication. The `desktopConfig` is a predefined configuration tailored for desktop environments.

```javascript
import puppeteer from 'puppeteer';
```
- **puppeteer:** Puppeteer is a Node library that provides a high-level API to control Chrome or Chromium over the DevTools Protocol. It is used here to automate browser actions required for generating Lighthouse reports.

```javascript
import fs from 'fs/promises';
```
- **fs (File System):** The `fs/promises` module provides promise-based APIs for interacting with the file system, enabling reading from and writing to files asynchronously.

```javascript
import path from 'path';
```
- **path:** This module provides utilities for working with file and directory paths, ensuring cross-platform compatibility.

```javascript
import { fileURLToPath, pathToFileURL } from 'url';
```
- **url:** These functions convert between file URLs and file paths, which is useful for handling local file navigation in Puppeteer.

```javascript
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
```
- **yargs:** Yargs is a powerful command-line argument parser that helps in building interactive command-line tools by parsing arguments and generating help menus.

```javascript
import PDFMerger from 'pdf-merger-js';
```
- **PDFMerger:** This module facilitates the merging of multiple PDF files into a single document, which is used to consolidate individual accessibility reports.

```javascript
import fetch from 'node-fetch';
```
- **node-fetch:** A lightweight module that brings the `fetch` API to Node.js, allowing HTTP requests to be made easily, such as interacting with the GraphDB REST API.

## Setup and Installation

### Prerequisites
- **Node.js:** Ensure that Node.js (version 14 or higher) is installed on your system.
- **GraphDB:** A running instance of GraphDB should be accessible. Adjust the `GRAPHDB_BASE_URL` constant to match your setup.
- **Workbench:** A running instance of GraphDB Workbench should be accessible. Adjust the `WORKBENCH_URL` constant to match your setup.


### Install Dependencies
Use npm to install the required packages.
```bash
npm install
```

### Prepare URLs File
Create a `urls.txt` file in the root directory (or specify a different path using the `--file` or `-f` command-line option). List each relative URL to audit on a separate line.
```
/
/graphs
/sparql
```

## Usage

Run the script using Node.js with optional command-line arguments to specify the input file, GraphDB url and Workbench url.

```bash
node generate-lighthouse-report.js --file=path/to/urls.txt --graphdb=http://localhost:9876 --workbench=http://localhost:5432
```

### Command-Line Options
- `--file` or `-f`: Path to the file containing URLs to audit. Defaults to `urls.txt` in the current directory.
- `--graphdb` or `-g`: Path to the file graphdb URL. Defaults to `http://localhost:7200`.
- `--workbench` or `-w`: Path to the file workbench URL. Defaults to `http://localhost:9000`.
- `--help` or `-h`: Prints help information.

### Example
You can also use the predefined npm script:
```bash
npm run generate -- --file=./data/urls.txt --graphdb=http://localhost:7201 --workbench=http://localhost:9001
```
Or use it with the defaults:
```bash
npm run generate
```

## Output
- **Reports Directory:** All generated reports are saved in the `reports` directory within the script's root folder.
    - Individual PDF Reports: Named as `lighthouse-accessibility-report-<encoded_url>-<date>.pdf`.
    - Merged PDF Report: Named as `lighthouse-accessibility-report-all-<date>.pdf`.

## GraphDB Repository Management

- **Creation:** A new repository is created in GraphDB with a unique ID based on the current timestamp.
- **Selection:** The repository is selected in the GraphDB Workbench by setting the `ls.repository-id` in `localStorage`.
- **Deletion:** After the audit process completes (whether successfully or due to an error), the repository is deleted to clean up resources.

## Error Handling

- The script includes robust error handling to catch and log issues during file reading, repository management, audit generation, and PDF merging.
- In case of fatal errors, the script exits gracefully after attempting to clean up resources.

## Customization

- **Repository Configuration:** Modify the `repoTemplate` object to adjust repository settings as needed.
- **Lighthouse Settings:** Adjust Lighthouse audit settings within the `runLighthouseAudit` function to customize the audit categories, emulation settings, and more.
- **Output Formatting:** Customize the PDF generation settings in the `generatePdf` function to change page size, margins, and other formatting options.

## Notes

- Ensure that GraphDB and Workbench are running and accessible before executing the script.
- The script runs Puppeteer in headless mode. To debug or view browser actions, set `headless: false` in the Puppeteer launch options.
- The script currently focuses on accessibility audits. To include other Lighthouse categories (e.g., performance, SEO), modify the `onlyCategories` array in the `runLighthouseAudit` function.
