const fs = require('fs');
const { packageJson } = require('../package');
const {
  VALID_TEST_RUNNERS,
  GIT_PATH,
  NVM_PATH,
  NVM_CONFIG_PATH,
  PACKAGE_JSON_PATH,
  LERNA_JSON_PATH
} = require('../constants');

const validatePkgRoot = () => {
  if (!fs.existsSync(PACKAGE_JSON_PATH)) {
    throw new Error('Run this script from the root of your package.');
  }
};

const validateTestRunner = testRunner => {
  if (!testRunner) {
    throw new Error(
      'Your package.json must define at least one of the two required scripts: "travis", "ci"'
    );
  }
};

const validateLerna = () => {
  if (fs.existsSync(LERNA_JSON_PATH)) return;

  throw new Error(
    'Lerna configuration could not be found. Make sure to bootstrap lerna first.'
  );
};

const isGitProject = () => fs.existsSync(GIT_PATH);

const isNvmInstalled = () => fs.existsSync(NVM_PATH);

const nvmrcExists = () => fs.existsSync(NVM_CONFIG_PATH);

const hasBuildScript = () => {
  const pkg = packageJson();
  if (!pkg.scripts) {
    return false;
  }

  return 'build' in pkg.scripts;
};

const hasCiScript = () => {
  const pkg = packageJson();
  if (!pkg.scripts) {
    return false;
  }

  return VALID_TEST_RUNNERS.some(testRunner => testRunner in pkg.scripts);
};

module.exports = {
  validatePkgRoot,
  validateTestRunner,
  validateLerna,
  isGitProject,
  isNvmInstalled,
  nvmrcExists,
  hasBuildScript,
  hasCiScript
};
