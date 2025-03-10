const fs = require('fs');
const path = require('path');

const sourceFile = path.join(__dirname, '../license-checker/license-checker-static.json');
const targetDir = path.join(__dirname, '../dist');
const targetFile = path.join(targetDir, 'license-checker-static.json');

function copyFiles() {
    if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
    }

    fs.copyFileSync(sourceFile, targetFile);
    console.log(`Copied ${sourceFile} to ${targetFile}`);
}
copyFiles();
