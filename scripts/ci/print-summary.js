const fs = require("fs");
const path = require("path");
const xml2js = require("xml2js");
const Table = require("cli-table3");

const inputDir = process.argv[2];

if (!fs.existsSync(inputDir)) {
  console.error(`❌ Directory not found: ${inputDir}`);
  process.exit(1);
}

const resultsDir = inputDir;
const parser = new xml2js.Parser();
const table = new Table({
  head: ["Spec", "Time", "Tests", "Passing", "Failing", "Skipped"],
  wordWrap: true,
  wrapOnWordBoundary: false,
  colWidths: [45, 10, 10, 10, 10, 10]
});

const findXmlFiles = (dir) => {
  let xmlFiles = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      xmlFiles = xmlFiles.concat(findXmlFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith(".xml")) {
      xmlFiles.push(fullPath);
    }
  }

  return xmlFiles;
};

let files = findXmlFiles(resultsDir);

let totalTests = 0;
let totalPassing = 0;
let totalFailing = 0;
let totalSkipped = 0;
let totalTime = 0;

const rows = [];

let parseFiles = async () => {
  for (let file of files) {
    const xml = fs.readFileSync(file);
    const result = await parser.parseStringPromise(xml);

    let suites = result.testsuites?.testsuite || result.testsuite || [];
    if (!Array.isArray(suites)) {
      suites = [suites];
    }

    for (let suite of suites) {
      const name = suite.$.file || file;
      const time = parseFloat(suite.$.time || "0");
      const tests = parseInt(suite.$.tests || "0", 10);
      const failures = parseInt(suite.$.failures || "0", 10);
      const skipped = parseInt(suite.$.skipped || "0", 10);
      const passing = tests - failures - skipped;

      rows.push({name, time, tests, passing, failures, skipped});

      totalTests += tests;
      totalPassing += passing;
      totalFailing += failures;
      totalSkipped += skipped;
      totalTime += time;
    }
  }

  rows.sort((a, b) => a.name.localeCompare(b.name));

  for (const row of rows) {
    table.push([row.name,`${row.time.toFixed(2)}s`, row.tests, row.passing, row.failures, row.skipped]);
  }

  table.push([
    { content: `★ Total`, hAlign: "right" },
    `${totalTime.toFixed(2)}s`,
    totalTests,
    totalPassing,
    totalFailing,
    totalSkipped,
  ]);

  console.log(table.toString());
};

parseFiles();
