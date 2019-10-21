'use strict';

const path = require('path');

const libPath = path.resolve('src/js/lib');
const srcPath = path.resolve(__dirname, 'src');

console.log('----PATH: ', __dirname, srcPath);

module.exports = {
    "extension": [".js"],
    "reporter": "lcov",
    "excludeAfterRemap": false,
    "all": true,
    "cwd": __dirname,
    "include": [
        "**/src/js/angular/**"
    ],
    "exclude": [
        "**/src/js/lib/**"
    ]
};
