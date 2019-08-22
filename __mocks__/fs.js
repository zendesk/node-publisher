'use strict';

const path = require('path');

const fs = jest.genMockFromModule('fs');

let mockFiles = [];
const __setMockFiles = newMockFiles => {
  mockFiles = [];
  // eslint-disable-next-line no-unused-vars
  for (const file of newMockFiles) {
    mockFiles.push(normalizePath(file));
  }
};

const readFileSyncRetValue = {};
const __setReadFileSyncReturnValue = (file, val) => {
  readFileSyncRetValue[normalizePath(file)] = val;
};

const existsSync = path => mockFiles.includes(path);

const readFileSync = path => readFileSyncRetValue[path];

const normalizePath = p =>
  path.isAbsolute(p) ? p : path.resolve(process.env.PWD, p);

fs.__setMockFiles = __setMockFiles;
fs.__setReadFileSyncReturnValue = __setReadFileSyncReturnValue;
fs.existsSync = existsSync;
fs.readFileSync = readFileSync;

module.exports = fs;
