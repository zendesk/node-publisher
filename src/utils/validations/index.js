const fs = require('fs');
const {
  VERSIONS,
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

const validateVersion = (version, env) => {
  if (env.publishClient === 'lerna') return;
  if (VERSIONS.includes(version)) return;

  throw new Error(
    'Version argument is not supported, use either `major`, `minor` or `patch`'
  );
};

const validateLerna = () => {
  if (fs.existsSync(LERNA_JSON_PATH)) return;

  throw new Error(
    'Lerna configuration could not be found. Make sure to bootstrap lerna first.'
  );
};

const isBuildDefined = pkg => pkg.scripts && pkg.scripts.build;

module.exports = {
  validatePkgRoot,
  validateTestRunner,
  validateVersion,
  validateLerna,
  isBuildDefined
};
