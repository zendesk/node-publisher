const path = require('path');

const VERSIONS = ['major', 'minor', 'patch'];
const DEFAULT_TEST_RUNNER = 'travis';
const VALID_TEST_RUNNERS = [DEFAULT_TEST_RUNNER, 'ci'];
const DEFAULT_BRANCH = 'master';
const DEFAULT_CONFIG_PATH = '.release.yml';
const PACKAGE_JSON_PATH = path.resolve(process.env.PWD, 'package.json');
const LERNA_JSON_PATH = path.resolve(process.env.PWD, 'lerna.json');

module.exports = {
  VERSIONS,
  DEFAULT_TEST_RUNNER,
  VALID_TEST_RUNNERS,
  DEFAULT_BRANCH,
  DEFAULT_CONFIG_PATH,
  PACKAGE_JSON_PATH,
  LERNA_JSON_PATH
};
