const path = require('path');

const VERSIONS = ['major', 'minor', 'patch'];
const PACKAGE_JSON_PATH = path.resolve(process.env.PWD, 'package.json');
const LERNA_JSON_PATH = path.resolve(process.env.PWD, 'lerna.json');

module.exports = {
  VERSIONS,
  PACKAGE_JSON_PATH,
  LERNA_JSON_PATH
};
