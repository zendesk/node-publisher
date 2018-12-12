const path = require('path');
const os = require('os');

const DEFAULT_TEST_RUNNER = 'travis';
const VALID_TEST_RUNNERS = [DEFAULT_TEST_RUNNER, 'ci'];
const DEFAULT_BRANCH = 'master';
const DEFAULT_CONFIG_PATH = '.release.yml';
const PACKAGE_JSON_PATH = path.resolve(process.env.PWD, 'package.json');
const LERNA_JSON_PATH = path.resolve(process.env.PWD, 'lerna.json');
const DEFAULT_RELEASE_CONFIG_PATH = path.resolve(
  process.env.PWD,
  '.release.yml'
);
const GIT_PATH = path.resolve(process.env.PWD, '.git');
const NVM_PATH = path.resolve(os.homedir(), '.nvm');
const NVM_CONFIG_PATH = path.resolve(process.env.PWD, '.nvmrc');

module.exports = {
  DEFAULT_TEST_RUNNER,
  VALID_TEST_RUNNERS,
  DEFAULT_BRANCH,
  DEFAULT_CONFIG_PATH,
  PACKAGE_JSON_PATH,
  LERNA_JSON_PATH,
  DEFAULT_RELEASE_CONFIG_PATH,
  GIT_PATH,
  NVM_PATH,
  NVM_CONFIG_PATH
};
