'use strict';

const path = require('path');

const fs = jest.genMockFromModule('fs');

let mockFiles = [];
const __setMockFiles = newMockFiles => {
  mockFiles = [];
  for (const file of newMockFiles) {
    mockFiles.push(path.resolve(process.env.PWD, file));
  }
};

const readFileSyncRetValue = {};
const __setReadFileSyncReturnValue = (file, val) => {
  readFileSyncRetValue[path.resolve(process.env.PWD, file)] = val;
};

const existsSync = path => mockFiles.includes(path);

const readFileSync = path => readFileSyncRetValue[path];

fs.__setMockFiles = __setMockFiles;
fs.__setReadFileSyncReturnValue = __setReadFileSyncReturnValue;
fs.existsSync = existsSync;
fs.readFileSync = readFileSync;

module.exports = fs;
